import { useState, useEffect } from 'react';
import {
  Package, 
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Edit,
  Save,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VendorLayout } from '@/components/layouts/VendorLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorByUid, updateVendorDocument, getOrdersByVendor, updateOrderDocument, subscribeToDeliveryPersonsForVendorArea, subscribeToOrdersByVendor, subscribeToVendors } from '@/lib/firebase/firestore';
import { Vendor, Order, FirestoreUser } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Truck, MapPin, Phone, User, Navigation } from 'lucide-react';
import {
  cityKeyForMatching,
  deriveCityTokenFromAddress,
  distanceMetersShopToPerson,
  formatKmNumber,
} from '@/utils/geo';

const statusColors = {
  pending: 'bg-warning/10 text-warning',
  accepted: 'bg-primary/10 text-primary',
  out_for_delivery: 'bg-secondary/10 text-secondary',
  delivered: 'bg-success/10 text-success',
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [priceForm, setPriceForm] = useState({
    jar20L: '',
    jar10L: '',
    bottles: '',
  });
  const [savingPrices, setSavingPrices] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<FirestoreUser[]>([]);
  const [loadingDeliveryPersons, setLoadingDeliveryPersons] = useState(false);
  const [showDeliveryPersonDialog, setShowDeliveryPersonDialog] = useState(false);
  const [orderToAccept, setOrderToAccept] = useState<Order | null>(null);

  // Real-time listener for vendor data to sync stock updates from backend
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToVendors((vendors) => {
      const currentVendor = vendors.find(v => v.uid === user.id);
      if (currentVendor) {
        setVendor(currentVendor);
        if (currentVendor.prices) {
          setPriceForm({
            jar20L: currentVendor.prices.jar20L?.toString() || '',
            jar10L: currentVendor.prices.jar10L?.toString() || '',
            bottles: currentVendor.prices.bottles?.toString() || '',
          });
        }
        setLoading(false);
        console.log('🟢 Real-time vendor stock update:', {
          jar20L: currentVendor.stock?.jar20L,
          jar10L: currentVendor.stock?.jar10L,
        });
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Initial fetch for vendor data
  useEffect(() => {
    const fetchVendorData = async () => {
      if (user?.id) {
        try {
          const vendorData = await getVendorByUid(user.id);
          setVendor(vendorData);
          if (vendorData?.prices) {
            setPriceForm({
              jar20L: vendorData.prices.jar20L?.toString() || '',
              jar10L: vendorData.prices.jar10L?.toString() || '',
              bottles: vendorData.prices.bottles?.toString() || '',
            });
          }
          console.log('✅ Vendor data loaded:', {
            shopName: vendorData.shopName,
            hasShopImage: !!vendorData.shopImage,
            stock: vendorData.stock,
          });
        } catch (error) {
          console.error('Error fetching vendor data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [user?.id]);

  // Real-time listener for vendor orders
  useEffect(() => {
    if (!user?.id || vendor?.status !== 'approved') {
      setOrdersLoading(false);
      setOrders([]);
      return;
    }

    try {
      setOrdersLoading(true);
      console.log('🔴 Setting up real-time listener for vendor orders:', user.id);
      
      // Set up real-time listener for orders
      const unsubscribe = subscribeToOrdersByVendor(
        user.id,
        (vendorOrders) => {
          console.log('🟢 Real-time orders update received in VendorDashboard:', {
            count: vendorOrders.length,
            orders: vendorOrders.map(o => ({
              id: o.id,
              orderId: o.orderId,
              customerName: o.customerName,
              status: o.status,
            }))
          });
          
          setOrders(vendorOrders);
          setOrdersLoading(false);
          console.log('✅ Vendor orders updated in real-time:', vendorOrders.length);
        },
        (error) => {
          console.error('❌ Error in vendor orders listener:', error);
          setOrdersLoading(false);
          toast({
            title: 'Error',
            description: error.message || 'Failed to load orders. Please try again.',
            variant: 'destructive',
          });
        }
      );

      // Cleanup: Unsubscribe when component unmounts or dependencies change
      return () => {
        console.log('🔴 Unsubscribing from vendor orders listener');
        unsubscribe();
        setOrders([]); // Clear state on cleanup
      };
    } catch (error: any) {
      console.error('❌ Error setting up vendor orders listener:', error);
      setOrdersLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up orders listener. Please refresh the page.',
        variant: 'destructive',
      });
    }
  }, [user?.id, vendor?.status, toast]);

  // Stock is deducted directly in handleAssignDeliveryPerson function
  // No need for separate useEffect to avoid double-processing and conflicts

  // Real-time listener: same city as shop (or pincode-only legacy), distance-sorted when GPS set
  useEffect(() => {
    const hasArea =
      vendor?.status === 'approved' &&
      (!!cityKeyForMatching(vendor.city, vendor.address) || !!(vendor.pincode || '').toString().trim());

    if (!hasArea || !vendor) {
      setDeliveryPersons([]);
      setLoadingDeliveryPersons(false);
      return;
    }

    try {
      setLoadingDeliveryPersons(true);
      const unsubscribe = subscribeToDeliveryPersonsForVendorArea(
        {
          pincode: vendor.pincode,
          city: vendor.city,
          state: vendor.state,
          address: vendor.address,
          latitude: vendor.latitude,
          longitude: vendor.longitude,
        },
        (persons) => {
          setDeliveryPersons(persons);
          setLoadingDeliveryPersons(false);
        },
        false
      );

      return () => {
        unsubscribe();
        setDeliveryPersons([]);
      };
    } catch (error: any) {
      console.error('❌ Error setting up delivery persons listener:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up delivery persons listener. Please refresh the page.',
        variant: 'destructive',
      });
      setLoadingDeliveryPersons(false);
      setDeliveryPersons([]);
    }
  }, [
    vendor?.pincode,
    vendor?.city,
    vendor?.state,
    vendor?.address,
    vendor?.latitude,
    vendor?.longitude,
    vendor?.status,
    toast,
  ]);

  const handleSavePrices = async () => {
    if (!vendor) return;

    try {
      setSavingPrices(true);
      const prices = {
        jar20L: priceForm.jar20L ? parseFloat(priceForm.jar20L) : undefined,
        jar10L: priceForm.jar10L ? parseFloat(priceForm.jar10L) : undefined,
        bottles: priceForm.bottles ? parseFloat(priceForm.bottles) : undefined,
      };

      await updateVendorDocument(vendor.uid, { prices });
      
      // Update local state
      setVendor({ ...vendor, prices });
      setIsEditingPrices(false);
      
      toast({
        title: 'Prices Updated',
        description: 'Your jar prices have been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error saving prices:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save prices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingPrices(false);
    }
  };

  const handleAcceptOrder = (order: Order) => {
    // Show delivery person selection dialog
    setOrderToAccept(order);
    setShowDeliveryPersonDialog(true);
  };

  const handleAssignDeliveryPerson = async (deliveryPerson: FirestoreUser) => {
    if (!orderToAccept?.id || !vendor) return;

    // Check if delivery person is available
    if (deliveryPerson.isAvailable === false) {
      toast({
        title: 'Cannot Assign',
        description: 'This delivery person is currently unavailable. Please select an available delivery person.',
        variant: 'destructive',
      });
      return;
    }

    // Check stock availability before assigning delivery
    if (orderToAccept.items && orderToAccept.items.length > 0) {
      for (const item of orderToAccept.items) {
        if (item.jarType === '20L') {
          const currentStock = vendor.stock?.jar20L || 0;
          if (currentStock === 0) {
            toast({
              title: 'Insufficient Stock',
              description: 'Cannot assign delivery. You have 0 20L jars in stock. Please add stock from Inventory section.',
              variant: 'destructive',
            });
            return;
          }
          if (currentStock < item.quantity) {
            toast({
              title: 'Insufficient Stock',
              description: `Cannot assign delivery. You have only ${currentStock} 20L jar(s) in stock, but ${item.quantity} are required. Please add more stock.`,
              variant: 'destructive',
            });
            return;
          }
        } else if (item.jarType === '10L') {
          const currentStock = vendor.stock?.jar10L || 0;
          if (currentStock === 0) {
            toast({
              title: 'Insufficient Stock',
              description: 'Cannot assign delivery. You have 0 10L jars in stock. Please add stock from Inventory section.',
              variant: 'destructive',
            });
            return;
          }
          if (currentStock < item.quantity) {
            toast({
              title: 'Insufficient Stock',
              description: `Cannot assign delivery. You have only ${currentStock} 10L jar(s) in stock, but ${item.quantity} are required. Please add more stock.`,
              variant: 'destructive',
            });
            return;
          }
        }
      }
    }

    try {
      setUpdatingOrderId(orderToAccept.id);
      console.log('✅ Accepting order and assigning delivery person:', {
        orderId: orderToAccept.id,
        deliveryPersonUid: deliveryPerson.uid,
        deliveryPersonName: deliveryPerson.name,
        isAvailable: deliveryPerson.isAvailable,
      });
      
      const updateData = {
        status: 'accepted' as const,
        deliveryPersonUid: deliveryPerson.uid,
        deliveryPersonName: deliveryPerson.name,
        deliveryPersonPhone: deliveryPerson.phone,
      };
      
      // Only update vendor details if not already set
      if (!orderToAccept.vendorAddress && vendor.address) {
        (updateData as any).vendorAddress = vendor.address;
      }
      if (!orderToAccept.vendorPhone && vendor.phone) {
        (updateData as any).vendorPhone = vendor.phone;
      }
      
      console.log('📦 Updating order with data:', updateData);
      await updateOrderDocument(orderToAccept.id, updateData);
      
      // Deduct stock immediately when order is accepted and assigned
      if (orderToAccept.items && orderToAccept.items.length > 0 && vendor.stock) {
        let stockUpdateNeeded = false;
        const currentStock20L = vendor.stock.jar20L || 0;
        const currentStock10L = vendor.stock.jar10L || 0;
        let updatedStock20L = currentStock20L;
        let updatedStock10L = currentStock10L;

        for (const item of orderToAccept.items) {
          if (item.jarType === '20L') {
            updatedStock20L = Math.max(0, updatedStock20L - item.quantity);
            stockUpdateNeeded = true;
          } else if (item.jarType === '10L') {
            updatedStock10L = Math.max(0, updatedStock10L - item.quantity);
            stockUpdateNeeded = true;
          }
        }

        if (stockUpdateNeeded) {
          // Update stock in Firestore immediately
          await updateVendorDocument(user.id, {
            stock: {
              jar20L: updatedStock20L,
              jar10L: updatedStock10L,
            },
          });

          console.log('✅ Stock deducted immediately after order acceptance:', {
            orderId: orderToAccept.orderId,
            items: orderToAccept.items,
            previousStock: { jar20L: currentStock20L, jar10L: currentStock10L },
            newStock: { jar20L: updatedStock20L, jar10L: updatedStock10L },
          });
        }
      }
      
      // Real-time listener will automatically update the orders and vendor stock
      // No need to manually refresh
      
      setShowDeliveryPersonDialog(false);
      setOrderToAccept(null);
      
      toast({
        title: 'Order Accepted',
        description: `Order has been accepted and assigned to ${deliveryPerson.name}. Stock has been deducted.`,
      });
    } catch (error: any) {
      console.error('❌ Error accepting order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (updatingOrderId) return;

    try {
      setUpdatingOrderId(orderId);
      console.log('❌ Rejecting order:', orderId);
      
      await updateOrderDocument(orderId, { status: 'rejected' });
      
      // Real-time listener will automatically update the orders
      // No need to manually refresh
      
      toast({
        title: 'Order Rejected',
        description: 'Order has been rejected.',
      });
    } catch (error: any) {
      console.error('❌ Error rejecting order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Format order items for display
  const formatOrderItems = (order: Order): string => {
    return order.items.map(item => {
      const jarName = item.jarType === '20L' ? '20L Jar' : item.jarType === '10L' ? '10L Jar' : 'Bottles';
      return `${item.quantity}x ${jarName}`;
    }).join(', ');
  };

  // Get time ago string
  const getTimeAgo = (order: Order): string => {
    if (!order.createdAt) return 'Unknown time';
    try {
      return formatDistanceToNow(order.createdAt.toDate(), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };


  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </VendorLayout>
    );
  }

  // Show pending approval message if vendor is not approved
  if (vendor?.status === 'pending') {
  return (
    <VendorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your orders and deliveries
          </p>
        </div>

          <Card className="card-shadow border-2 border-warning/50 bg-warning/5">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Awaiting Admin Approval</h2>
              <p className="text-muted-foreground">
                Your vendor account is pending approval. You'll be able to access the dashboard once an admin approves your registration.
              </p>
              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-left max-w-md mx-auto">
                <p className="font-semibold mb-2">Registration Details:</p>
                <p className="text-sm"><span className="font-medium">Shop Name:</span> {vendor.shopName}</p>
                <p className="text-sm"><span className="font-medium">Owner:</span> {vendor.ownerName}</p>
                <p className="text-sm"><span className="font-medium">Phone:</span> {vendor.phone}</p>
                <p className="text-sm"><span className="font-medium">Address:</span> {vendor.address}</p>
                {vendor.state && <p className="text-sm"><span className="font-medium">State:</span> {vendor.state}</p>}
                {vendor.pincode && <p className="text-sm"><span className="font-medium">Pincode:</span> {vendor.pincode}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </VendorLayout>
    );
  }

  // Show rejection message if vendor is rejected
  if (vendor?.status === 'rejected') {
    return (
      <VendorLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Vendor Dashboard</h1>
          </div>
          
          <Card className="card-shadow border-2 border-destructive/50 bg-destructive/5">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Registration Rejected</h2>
              <p className="text-muted-foreground">
                Your vendor registration has been rejected. Please contact support for more information.
              </p>
            </CardContent>
          </Card>
        </div>
      </VendorLayout>
    );
  }

  // Get recent orders (last 5) - only for approved vendors
  const recentOrders = vendor?.status === 'approved' ? orders.slice(0, 5) : [];

  // Show full dashboard if approved (or if no vendor data exists yet, show dashboard anyway)
  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Vendor Dashboard</h1>
          {vendor?.shopName && (
            <p className="text-muted-foreground mt-1">
              Welcome, {vendor.shopName}
            </p>
          )}
          <p className="text-muted-foreground">
            Manage your orders and deliveries
          </p>
        </div>

        {/* Stats Grid - Calculate from real orders */}
        {(() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayOrders = orders.filter(order => {
            const orderDate = order.createdAt?.toDate();
            if (!orderDate) return false;
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          });
          
          const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing');
          const completedToday = todayOrders.filter(o => o.status === 'delivered');
          const todayEarnings = completedToday.reduce((sum, order) => sum + order.total, 0);
          
          return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                      <p className="text-2xl font-bold">{todayOrders.length}</p>
                  <p className="text-sm text-muted-foreground">Today's Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                      <p className="text-2xl font-bold">{pendingOrders.length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <IndianRupee className="h-6 w-6 text-success" />
                </div>
                <div>
                      <p className="text-2xl font-bold">₹{todayEarnings}</p>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <div>
                      <p className="text-2xl font-bold">{completedToday.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          );
        })()}

        {/* Price Management */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jar Prices</CardTitle>
            {!isEditingPrices ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPrices(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Prices
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingPrices(false);
                    // Reset form to original values
                    if (vendor?.prices) {
                      setPriceForm({
                        jar20L: vendor.prices.jar20L?.toString() || '',
                        jar10L: vendor.prices.jar10L?.toString() || '',
                        bottles: vendor.prices.bottles?.toString() || '',
                      });
                    }
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePrices}
                  disabled={savingPrices}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingPrices ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isEditingPrices ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jar20L">20L Jar Price (₹)</Label>
                  <Input
                    id="jar20L"
                    type="number"
                    placeholder="40"
                    value={priceForm.jar20L}
                    onChange={(e) => setPriceForm({ ...priceForm, jar20L: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jar10L">10L Jar Price (₹)</Label>
                  <Input
                    id="jar10L"
                    type="number"
                    placeholder="25"
                    value={priceForm.jar10L}
                    onChange={(e) => setPriceForm({ ...priceForm, jar10L: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bottles">Bottles (Pack of 12) Price (₹)</Label>
                  <Input
                    id="bottles"
                    type="number"
                    placeholder="120"
                    value={priceForm.bottles}
                    onChange={(e) => setPriceForm({ ...priceForm, bottles: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">20L Jar</p>
                  <p className="text-2xl font-bold mt-1">
                    {vendor?.prices?.jar20L ? `₹${vendor.prices.jar20L}` : 'Not set'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">10L Jar</p>
                  <p className="text-2xl font-bold mt-1">
                    {vendor?.prices?.jar10L ? `₹${vendor.prices.jar10L}` : 'Not set'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Bottles (Pack of 12)</p>
                  <p className="text-2xl font-bold mt-1">
                    {vendor?.prices?.bottles ? `₹${vendor.prices.bottles}` : 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Nearby Delivery Persons - All with Status */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Nearby Delivery Persons
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Availability and distance from your shop in kilometers when both you and the driver have GPS location saved.
              Only available delivery persons can be assigned to orders.
            </p>
          </CardHeader>
          <CardContent>
            {vendor &&
              (vendor.latitude == null ||
                vendor.longitude == null ||
                Number.isNaN(vendor.latitude) ||
                Number.isNaN(vendor.longitude)) && (
              <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900 dark:text-amber-100">Set your shop GPS to see distances</AlertTitle>
                <AlertDescription className="text-amber-900/90 dark:text-amber-100/90">
                  Open{' '}
                  <Link to="/vendor/settings" className="underline font-medium">
                    Shop Settings
                  </Link>{' '}
                  and tap &quot;Set shop location from GPS&quot;. Distances to each driver use your shop coordinates and
                  the driver&apos;s live location (updated when they use the delivery app with location on).
                </AlertDescription>
              </Alert>
            )}
            {loadingDeliveryPersons ? (
              <p className="text-center text-muted-foreground py-4">Loading delivery persons...</p>
            ) : deliveryPersons.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No delivery persons match your shop area yet.
                <br />
                They must be in the same city as your shop (set city in Shop Settings), with compatible state when both
                have state saved. Pincode is only used if city is not set on the shop.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliveryPersons.map((person) => {
                  const isAvailable = person.isAvailable !== false; // Default to true for backward compatibility
                  const distM = distanceMetersShopToPerson(
                    vendor?.latitude,
                    vendor?.longitude,
                    person.latitude,
                    person.longitude
                  );
                  return (
                    <div
                      key={person.uid}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        isAvailable
                          ? 'border-success/50 bg-success/5 hover:border-success'
                          : 'border-muted-foreground/30 bg-muted/30 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isAvailable ? 'bg-success/10' : 'bg-muted-foreground/10'
                        }`}>
                          <User className={`h-5 w-5 ${
                            isAvailable ? 'text-success' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className={`font-semibold ${!isAvailable ? 'text-muted-foreground' : ''}`}>
                              {person.name}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isAvailable
                                ? 'bg-success/20 text-success'
                                : 'bg-muted-foreground/20 text-muted-foreground'
                            }`}>
                              {isAvailable ? '✓ Available' : '✗ Unavailable'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Navigation className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <span>
                              <span className="text-muted-foreground">Distance from shop:</span>{' '}
                              {distM != null ? (
                                <span className="font-semibold tabular-nums text-foreground">
                                  {formatKmNumber(distM)} km
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  not available — set shop GPS (Shop Settings) and driver location
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{person.phone}</span>
                            </div>
                            {person.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{person.address}</span>
                              </div>
                            )}
                            {person.pincode && (
                              <div className="text-xs">Pincode: {person.pincode}</div>
                            )}
                          </div>
                          {!isAvailable && (
                            <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                              <p className="text-xs text-muted-foreground italic">
                                This delivery person is currently unavailable and cannot be assigned to orders.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Management - Real-time Orders */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Management</CardTitle>
            {orders.length > 5 && (
            <Link to="/vendor/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                  View All ({orders.length})
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {ordersLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading orders...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No orders yet. Orders will appear here when customers place them.</p>
            ) : (
              recentOrders.map((order) => {
                // Determine order type label
                const orderTypeLabel = order.deliveryType === 'subscription' 
                  ? 'Subscription' 
                  : order.deliveryType === 'today' 
                  ? 'Quick Order' 
                  : order.deliveryType === 'schedule'
                  ? 'Scheduled Order'
                  : 'Order';
                const orderTypeColor = order.deliveryType === 'subscription'
                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                  : order.deliveryType === 'today'
                  ? 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                  : 'bg-gray-500/10 text-gray-600 border-gray-500/30';
                
                return (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors border-2 border-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold">{order.customerName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${orderTypeColor}`}>
                        {orderTypeLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatOrderItems(order)}</p>
                    <p className="text-xs text-muted-foreground">{getTimeAgo(order)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.customerAddress}
                      {order.customerPincode && ` - ${order.customerPincode}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                      <p className="font-bold">₹{order.total}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' 
                          ? 'bg-warning/10 text-warning'
                          : order.status === 'accepted' || order.status === 'preparing'
                          ? 'bg-primary/10 text-primary'
                          : order.status === 'out_for_delivery'
                          ? 'bg-secondary/10 text-secondary'
                          : order.status === 'delivered'
                          ? 'bg-success/10 text-success'
                          : order.status === 'rejected' || order.status === 'cancelled'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => order.id && handleRejectOrder(order.id)}
                          disabled={updatingOrderId === order.id || !!updatingOrderId}
                        >
                          {updatingOrderId === order.id ? 'Rejecting...' : 'Reject'}
                      </Button>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90"
                          onClick={() => order.id && handleAcceptOrder(order)}
                          disabled={updatingOrderId === order.id || !!updatingOrderId}
                        >
                          {updatingOrderId === order.id ? 'Accepting...' : 'Accept'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              );
              })
            )}
          </CardContent>
        </Card>

        {/* Delivery Person Selection Dialog for Orders */}
        <Dialog open={showDeliveryPersonDialog} onOpenChange={setShowDeliveryPersonDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Delivery Person for Order</DialogTitle>
              <DialogDescription>
                Choose an available delivery person. Each row shows availability and approximate distance in kilometers from your shop when GPS is set for the shop and the driver.
              </DialogDescription>
            </DialogHeader>
            
            {/* Order Summary */}
            {orderToAccept && (
              <Card className="mt-4 bg-muted/50">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm mb-2">Order Summary:</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Order ID:</span> {orderToAccept.orderId}</p>
                    <p><span className="font-medium">Customer:</span> {orderToAccept.customerName}</p>
                    <p><span className="font-medium">Items:</span> {orderToAccept.items.map(item => 
                      `${item.quantity}x ${item.jarType === '20L' ? '20L Jar' : item.jarType === '10L' ? '10L Jar' : 'Bottles'}`
                    ).join(', ')}</p>
                    <p><span className="font-medium">Total:</span> ₹{orderToAccept.total}</p>
                    <p><span className="font-medium">Delivery Address:</span> {orderToAccept.customerAddress}{orderToAccept.customerPincode ? ` - ${orderToAccept.customerPincode}` : ''}</p>
                  </div>
          </CardContent>
        </Card>
            )}
            
            <div className="space-y-4 mt-4">
              {loadingDeliveryPersons ? (
                <p className="text-center text-muted-foreground py-4">Loading delivery persons...</p>
              ) : deliveryPersons.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No delivery persons available</p>
                  <p className="text-sm text-muted-foreground">
                    Same-city drivers appear here. Shop city:{' '}
                    {(vendor?.city || deriveCityTokenFromAddress(vendor?.address) || '').trim() ||
                      'not set — add in Shop Settings'}
                    {vendor?.pincode ? ` · Pincode: ${vendor.pincode}` : ''}.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowDeliveryPersonDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  {/* Filter: Show available or all */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>
                      Showing {deliveryPersons.filter(p => p.isAvailable !== false).length} available out of {deliveryPersons.length} delivery persons
                    </span>
                  </div>
                  <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                    {deliveryPersons.map((person) => {
                      const isAvailable = person.isAvailable !== false; // Default to true for backward compatibility
                      const distM = distanceMetersShopToPerson(
                        vendor?.latitude,
                        vendor?.longitude,
                        person.latitude,
                        person.longitude
                      );
                      
                      return (
                        <button
                          key={person.uid}
                          onClick={() => {
                            if (isAvailable && !updatingOrderId) {
                              handleAssignDeliveryPerson(person);
                            }
                          }}
                          disabled={!isAvailable || updatingOrderId === orderToAccept?.id}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isAvailable
                              ? 'border-border hover:border-primary bg-muted/30 hover:bg-muted cursor-pointer'
                              : 'border-muted-foreground/30 bg-muted/30 opacity-60 cursor-not-allowed'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              isAvailable ? 'bg-primary/10' : 'bg-muted-foreground/10'
                            }`}>
                              <User className={`h-5 w-5 ${
                                isAvailable ? 'text-primary' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className={`font-semibold ${!isAvailable ? 'text-muted-foreground' : ''}`}>
                                  {person.name}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  isAvailable
                                    ? 'bg-success/20 text-success'
                                    : 'bg-muted-foreground/20 text-muted-foreground'
                                }`}>
                                  {isAvailable ? '✓ Available' : '✗ Unavailable'}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-sm">
                                <Navigation className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                                <span>
                                  <span className="text-muted-foreground">Distance from shop:</span>{' '}
                                  {distM != null ? (
                                    <span className="font-semibold tabular-nums text-foreground">
                                      {formatKmNumber(distM)} km
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      not available — set shop GPS and driver location
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{person.phone}</span>
                                </div>
                                {person.address && (
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{person.address}</span>
                                  </div>
                                )}
                                {person.pincode && (
                                  <div className="text-xs">Pincode: {person.pincode}</div>
                                )}
                              </div>
                              {!isAvailable && (
                                <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                                  <p className="text-xs text-muted-foreground italic">
                                    Currently unavailable - cannot be assigned
                                  </p>
                                </div>
                              )}
                            </div>
                            {updatingOrderId === orderToAccept?.id ? (
                              <div className="text-sm text-muted-foreground shrink-0">Assigning...</div>
                            ) : isAvailable ? (
                              <Button 
                                size="sm" 
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignDeliveryPerson(person);
                                }}
                              >
                                Assign
                              </Button>
                            ) : (
                              <div className="text-xs text-muted-foreground shrink-0 px-2 py-1">
                                Unavailable
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeliveryPersonDialog(false);
                        setOrderToAccept(null);
                      }}
                      disabled={updatingOrderId === orderToAccept?.id}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </VendorLayout>
  );
}