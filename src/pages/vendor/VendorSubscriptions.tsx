import { useState, useEffect } from 'react';
import {
  Package,
  IndianRupee,
  MapPin,
  Phone,
  Store,
  Truck,
  Calendar,
  User as UserIcon,
  CheckCircle,
  Trash2,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VendorLayout } from '@/components/layouts/VendorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getVendorByUid,
  getOrdersByVendor,
  getSubscriptionsByVendor,
  updateSubscriptionDocument,
  updateSubscriptionPaymentDocument,
  createOrderDocument,
  updateVendorDocument,
  subscribeToDeliveryPersonsForVendorArea,
  subscribeToOrdersByVendor,
  subscribeToSubscriptionPaymentsByVendor,
  Subscription,
  SubscriptionPayment,
  Vendor,
  Order,
  FirestoreUser,
} from '@/lib/firebase/firestore';
import {
  cityKeyForMatching,
  deriveCityTokenFromAddress,
  distanceMetersShopToPerson,
  formatKmNumber,
} from '@/utils/geo';

export default function VendorSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryPersons, setDeliveryPersons] = useState<FirestoreUser[]>([]);
  const [loadingDeliveryPersons, setLoadingDeliveryPersons] = useState(false);
  const [subscriptionToDeliver, setSubscriptionToDeliver] = useState<Subscription | null>(null);
  const [subscriptionsToDeliver, setSubscriptionsToDeliver] = useState<Subscription[]>([]);
  const [showSubscriptionDeliveryDialog, setShowSubscriptionDeliveryDialog] = useState(false);
  const [deliveringSubscriptionId, setDeliveringSubscriptionId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState<Set<string>>(new Set());
  const [isBulkDelivery, setIsBulkDelivery] = useState(false);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPayment[]>([]);
  const [removingSubscriptionId, setRemovingSubscriptionId] = useState<string | null>(null);

  // Real-time listener for subscription payments (Bill column + Mark Paid)
  useEffect(() => {
    if (!user?.id) {
      setSubscriptionPayments([]);
      return;
    }
    const unsubscribe = subscribeToSubscriptionPaymentsByVendor(user.id, setSubscriptionPayments);
    return () => unsubscribe();
  }, [user?.id]);

  // Fetch vendor data and subscriptions (initial load and refresh)
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const vendorData = await getVendorByUid(user.id);
        setVendor(vendorData);
        
        const vendorSubscriptions = await getSubscriptionsByVendor(user.id);
        // Filter to only show active subscriptions
        const activeSubs = vendorSubscriptions.filter(
          sub => sub.isActive === true && sub.isPaused === false
        );
        setSubscriptions(activeSubs);
        console.log(`✅ Loaded ${activeSubs.length} active subscriptions`);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscriptions. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh subscriptions every 10 seconds to catch newly accepted subscriptions
    const refreshInterval = setInterval(() => {
      if (user?.id) {
        getSubscriptionsByVendor(user.id).then(vendorSubscriptions => {
          const activeSubs = vendorSubscriptions.filter(
            sub => sub.isActive === true && sub.isPaused === false
          );
          setSubscriptions(activeSubs);
        }).catch(err => console.error('Error refreshing subscriptions:', err));
      }
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, [user?.id, toast]);

  // Real-time listener for vendor orders - updates "Jars Delivered" column automatically
  useEffect(() => {
    if (!user?.id || vendor?.status !== 'approved') {
      setOrders([]);
      return;
    }

    try {
      console.log('🔴 Setting up real-time listener for vendor orders in VendorSubscriptions:', user.id);
      
      // Set up real-time listener for orders
      const unsubscribe = subscribeToOrdersByVendor(
        user.id,
        (vendorOrders) => {
          console.log('🟢 Real-time orders update received in VendorSubscriptions:', {
            count: vendorOrders.length,
            deliveredOrders: vendorOrders.filter(o => o.status === 'delivered').length,
          });
          
          // Sort orders by createdAt (newest first)
          const sortedOrders = vendorOrders.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return bTime - aTime;
          });
          
          setOrders(sortedOrders);
          console.log('✅ Vendor orders updated in real-time - "Jars Delivered" column will update automatically');
        },
        (error) => {
          console.error('❌ Error in vendor orders listener:', error);
          toast({
            title: 'Error',
            description: error.message || 'Failed to load orders. Please try again.',
            variant: 'destructive',
          });
        }
      );

      // Cleanup: Unsubscribe when component unmounts or dependencies change
      return () => {
        console.log('🔴 Unsubscribing from vendor orders listener in VendorSubscriptions');
        unsubscribe();
        setOrders([]); // Clear state on cleanup
      };
    } catch (error: any) {
      console.error('❌ Error setting up vendor orders listener:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up orders listener. Please refresh the page.',
        variant: 'destructive',
      });
    }
  }, [user?.id, vendor?.status, toast]);


  useEffect(() => {
    const hasArea =
      vendor?.status === 'approved' &&
      (!!cityKeyForMatching(vendor.city, vendor.address) || !!(vendor.pincode || '').toString().trim());

    if (!hasArea || !vendor) {
      setDeliveryPersons([]);
      setLoadingDeliveryPersons(false);
      return;
    }

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
    };
  }, [
    vendor?.pincode,
    vendor?.city,
    vendor?.state,
    vendor?.address,
    vendor?.latitude,
    vendor?.longitude,
    vendor?.status,
  ]);

  const handleDeliverSubscription = (subscription: Subscription) => {
    setSubscriptionToDeliver(subscription);
    setSubscriptionsToDeliver([subscription]);
    setIsBulkDelivery(false);
    setShowSubscriptionDeliveryDialog(true);
  };

  const handleBulkDeliver = () => {
    if (selectedSubscriptionIds.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one subscription to deliver.',
        variant: 'destructive',
      });
      return;
    }

    const selectedSubs = activeSubscriptions.filter(sub => 
      sub.id && selectedSubscriptionIds.has(sub.id)
    );

    // Filter out completed subscriptions
    const deliverableSubs = selectedSubs.filter(sub => {
      const stats = getSubscriptionDeliveryStats(sub);
      return !(stats.expectedJars > 0 && stats.deliveredJars >= stats.expectedJars);
    });

    if (deliverableSubs.length === 0) {
      toast({
        title: 'No Deliverable Subscriptions',
        description: 'Selected subscriptions are already completed. Please select active subscriptions.',
        variant: 'destructive',
      });
      return;
    }

    setSubscriptionsToDeliver(deliverableSubs);
    setSubscriptionToDeliver(null);
    setIsBulkDelivery(true);
    setShowSubscriptionDeliveryDialog(true);
  };

  const handleAssignDeliveryPersonForSubscription = async (deliveryPerson: FirestoreUser) => {
    if (!user?.id || !vendor) return;

    if (deliveryPerson.isAvailable === false) {
      toast({
        title: 'Cannot Assign',
        description: 'This delivery person is currently unavailable. Please select an available delivery person.',
        variant: 'destructive',
      });
      return;
    }

    const subscriptionsToProcess = isBulkDelivery ? subscriptionsToDeliver : 
      (subscriptionToDeliver ? [subscriptionToDeliver] : []);

    if (subscriptionsToProcess.length === 0) return;

    // Check stock availability for all subscriptions
    let totalRequired20L = 0;
    let totalRequired10L = 0;

    for (const subscription of subscriptionsToProcess) {
      const requiredQuantity = subscription.quantity;
      
      if (subscription.jarType === 'jar20L') {
        totalRequired20L += requiredQuantity;
      } else if (subscription.jarType === 'jar10L') {
        totalRequired10L += requiredQuantity;
      }
    }

    // Check stock
    const currentStock20L = vendor.stock?.jar20L || 0;
    const currentStock10L = vendor.stock?.jar10L || 0;

    if (totalRequired20L > 0 && currentStock20L < totalRequired20L) {
      toast({
        title: 'Insufficient Stock',
        description: `Cannot assign delivery. You have only ${currentStock20L} 20L jar(s) in stock, but ${totalRequired20L} are required.`,
        variant: 'destructive',
      });
      return;
    }

    if (totalRequired10L > 0 && currentStock10L < totalRequired10L) {
      toast({
        title: 'Insufficient Stock',
        description: `Cannot assign delivery. You have only ${currentStock10L} 10L jar(s) in stock, but ${totalRequired10L} are required.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isBulkDelivery) {
        setDeliveringSubscriptionId('bulk');
      } else if (subscriptionToDeliver?.id) {
        setDeliveringSubscriptionId(subscriptionToDeliver.id);
      }

      const shopName = vendor?.shopName || 'Shop';
      const shopAddress = vendor?.address || '';
      const shopPhone = vendor?.phone || '';

      // Create orders for all subscriptions
      const createdOrders: string[] = [];
      let updatedStock20L = currentStock20L;
      let updatedStock10L = currentStock10L;

      for (const subscription of subscriptionsToProcess) {
        if (!subscription.id) continue;

        const jarTypeForOrder = subscription.jarType === 'jar20L' ? '20L' : 
          subscription.jarType === 'jar10L' ? '10L' : 'bottles';
        
        const orderData: Omit<Order, 'id' | 'orderId' | 'createdAt' | 'updatedAt'> = {
          customerUid: subscription.customerUid,
          customerName: subscription.customerName,
          customerPhone: subscription.customerPhone,
          customerAddress: subscription.customerAddress,
          customerPincode: subscription.customerPincode,
          vendorUid: subscription.vendorUid || user.id,
          vendorShopName: shopName,
          vendorAddress: shopAddress,
          vendorPhone: shopPhone,
          deliveryPersonUid: deliveryPerson.uid,
          deliveryPersonName: deliveryPerson.name,
          deliveryPersonPhone: deliveryPerson.phone,
          items: [{
            jarType: jarTypeForOrder as '20L' | '10L' | 'bottles',
            quantity: subscription.quantity,
            pricePerUnit: subscription.pricePerUnit,
          }],
          subtotal: subscription.quantity * subscription.pricePerUnit,
          deliveryFee: 0,
          total: subscription.quantity * subscription.pricePerUnit,
          deliveryType: 'subscription',
          subscriptionId: subscription.id,
          status: 'accepted',
        };

        await createOrderDocument(orderData);
        createdOrders.push(subscription.customerName);

        // Deduct stock
        if (subscription.jarType === 'jar20L') {
          updatedStock20L = Math.max(0, updatedStock20L - subscription.quantity);
        } else if (subscription.jarType === 'jar10L') {
          updatedStock10L = Math.max(0, updatedStock10L - subscription.quantity);
        }

        // Calculate next delivery date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let nextDeliveryDate = new Date(today);
        
        switch (subscription.frequency) {
          case 'daily':
            nextDeliveryDate.setDate(today.getDate() + 1);
            break;
          case 'alternate':
            nextDeliveryDate.setDate(today.getDate() + 2);
            break;
          case 'weekly':
            nextDeliveryDate.setDate(today.getDate() + 7);
            break;
          case 'biweekly':
            nextDeliveryDate.setDate(today.getDate() + 14);
            break;
          case 'monthly':
            nextDeliveryDate.setMonth(today.getMonth() + 1);
            break;
        }

        await updateSubscriptionDocument(subscription.id, {
          nextDeliveryDate: nextDeliveryDate.toISOString().split('T')[0],
        });
      }

      // Update stock once for all orders
      if (totalRequired20L > 0 || totalRequired10L > 0) {
        await updateVendorDocument(user.id, {
          stock: {
            ...vendor.stock,
            jar20L: updatedStock20L,
            jar10L: updatedStock10L,
          },
        });
      }

      // Refresh subscriptions list
      const updatedSubscriptions = await getSubscriptionsByVendor(user.id);
      setSubscriptions(updatedSubscriptions);

      // Clear selections
      setSelectedSubscriptionIds(new Set());
      setShowSubscriptionDeliveryDialog(false);
      setSubscriptionToDeliver(null);
      setSubscriptionsToDeliver([]);
      setIsBulkDelivery(false);
      
      toast({
        title: isBulkDelivery ? 'Bulk Delivery Scheduled' : 'Delivery Scheduled',
        description: isBulkDelivery 
          ? `${createdOrders.length} orders created and assigned to ${deliveryPerson.name}. Stock has been deducted.`
          : `Order created and assigned to ${deliveryPerson.name}. Stock has been deducted.`,
      });
    } catch (error: any) {
      console.error('Error creating subscription delivery:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create delivery. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeliveringSubscriptionId(null);
    }
  };

  // Real-time accurate jar counting - ONLY counts orders created when "Deliver Jars" button is clicked
  // Starts at 0 when subscription is accepted, only updates when orders are actually created
  const getSubscriptionDeliveryStats = (subscription: Subscription) => {
    // Get current month's start and end dates
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    currentMonthStart.setHours(0, 0, 0, 0);
    
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    currentMonthEnd.setHours(23, 59, 59, 999);

    // Count ONLY orders that belong to THIS specific subscription:
    // 1. Order has subscriptionId === subscription.id (so jar count is per-subscription, not per-customer)
    // 2. Or legacy: no subscriptionId but same customer+vendor+subscription type (backward compat)
    // 3. Created in current month, assigned to delivery, valid status
    const subscriptionDocId = subscription.id;
    const deliveryOrdersThisMonth = orders.filter(
      o => {
        // Must have createdAt and deliveryPersonUid
        if (!o.createdAt || !o.deliveryPersonUid) return false;
        
        // Get order date
        const orderDate = o.createdAt.toDate();
        const orderYear = orderDate.getFullYear();
        const orderMonth = orderDate.getMonth();
        
        // Must be in current month (exact year and month match)
        if (orderYear !== currentYear || orderMonth !== currentMonth) return false;
        
        if (o.deliveryType !== 'subscription') return false;
        
        // Must match this subscription: prefer subscriptionId so each subscription's jars are counted separately
        if (o.subscriptionId) {
          if (o.subscriptionId !== subscriptionDocId) return false;
        } else {
          // Legacy orders without subscriptionId: only count if customer+vendor match (can over-count if same customer has multiple subscriptions)
          if (o.customerUid !== subscription.customerUid) return false;
          if (o.vendorUid !== subscription.vendorUid) return false;
        }
        
        // Must have valid status (order was assigned to delivery person)
        const hasValidStatus = o.status === 'accepted' || 
                              o.status === 'delivered' || 
                              o.status === 'out_for_delivery';
        if (!hasValidStatus) return false;
        
        return true;
      }
    );

    // Calculate total jars delivered this month
    // Start at 0, only add jars from orders created this month
    const deliveredJarsThisMonth = deliveryOrdersThisMonth.reduce((sum, order) => {
      if (!order.items || order.items.length === 0) return sum;
      return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
    }, 0);


    // Calculate total jars needed per month based on frequency
    let deliveriesPerMonth = 0;
    switch (subscription.frequency) {
      case 'daily':
        deliveriesPerMonth = 30;
        break;
      case 'alternate':
        deliveriesPerMonth = 15;
        break;
      case 'weekly':
        deliveriesPerMonth = 4;
        break;
      case 'biweekly':
        deliveriesPerMonth = 2;
        break;
      case 'monthly':
        deliveriesPerMonth = 1;
        break;
      default:
        deliveriesPerMonth = 1;
    }

    // Total monthly jars = deliveries per month × quantity per delivery
    const totalMonthlyJars = deliveriesPerMonth * subscription.quantity;

    return { 
      deliveredJars: deliveredJarsThisMonth, 
      expectedJars: totalMonthlyJars 
    };
  };

  const getMonthKey = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const currentMonthKey = getMonthKey(new Date());

  const getMonthlyBillTotal = (subscription: Subscription, expectedJars: number): number => {
    return Math.max(0, expectedJars) * (subscription.pricePerUnit || 0);
  };

  const getLatestPaymentForSubscription = (subscription: Subscription): SubscriptionPayment | null => {
    const list = subscriptionPayments
      .filter((p) => p.subscriptionId === subscription.id && p.month === currentMonthKey)
      .sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
    return list[0] ?? null;
  };

  const isBillPaidForCurrentMonth = (subscription: Subscription): boolean => {
    if (subscription.billingPaid === true && subscription.billingMonth === currentMonthKey) return true;
    const payment = getLatestPaymentForSubscription(subscription);
    return payment?.status === 'PAID';
  };

  const hasCustomerPaid = (subscription: Subscription): boolean => {
    const payment = getLatestPaymentForSubscription(subscription);
    return payment?.status === 'PAYMENT_REQUESTED' || payment?.status === 'SUCCESS';
  };

  const handleMarkBillPaid = async (subscription: Subscription) => {
    if (!subscription.id || !user?.id) return;
    const payment = getLatestPaymentForSubscription(subscription);
    if (!payment?.id) {
      toast({
        title: 'No payment record',
        description: 'Customer has not paid yet. Bill column will show Paid when customer pays.',
        variant: 'destructive',
      });
      return;
    }
    if (payment.status === 'PAID') {
      toast({ title: 'Already confirmed', description: 'This payment was already marked as received.' });
      return;
    }
    try {
      setMarkingPaidId(subscription.id);
      await updateSubscriptionPaymentDocument(payment.id, { status: 'PAID' });
      await updateSubscriptionDocument(subscription.id, {
        billingMonth: currentMonthKey,
        billingPaid: true,
      });

      toast({
        title: 'Payment confirmed',
        description: 'Customer will see confirmation and can now order jars.',
      });
    } catch (error: any) {
      console.error('Error marking bill paid:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark bill as paid. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleRemoveSubscription = async (subscription: Subscription) => {
    if (!subscription.id || !user?.id) return;
    try {
      setRemovingSubscriptionId(subscription.id);
      await updateSubscriptionDocument(subscription.id, {
        isActive: false,
        isPaused: true,
      });
      setSubscriptions((prev) => prev.filter((s) => s.id !== subscription.id));
      toast({
        title: 'Removed',
        description: 'Subscription removed from active list.',
      });
    } catch (error: any) {
      console.error('Error removing subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRemovingSubscriptionId(null);
    }
  };

  // Get formatted next delivery date
  const getNextDeliveryDateDisplay = (subscription: Subscription): string => {
    if (!subscription.nextDeliveryDate) {
      return 'Not scheduled';
    }

    const nextDate = new Date(subscription.nextDeliveryDate);
    nextDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (nextDate <= today) {
      return 'Due now';
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return nextDate.toLocaleDateString('en-US', options);
  };

  // Get frequency display text
  const getFrequencyDisplay = (frequency: string): string => {
    const frequencyMap: Record<string, string> = {
      daily: 'Daily',
      alternate: 'Alternate Days',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
    };
    return frequencyMap[frequency] || frequency;
  };

  // Show all active subscriptions - don't filter out completed ones until they're paid
  const activeSubscriptions = subscriptions.filter(
    sub => sub.isActive === true && sub.isPaused === false
  );

  // Handle checkbox selection
  const handleSelectSubscription = (subscriptionId: string, checked: boolean) => {
    const newSelected = new Set(selectedSubscriptionIds);
    if (checked) {
      newSelected.add(subscriptionId);
    } else {
      newSelected.delete(subscriptionId);
    }
    setSelectedSubscriptionIds(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = activeSubscriptions
        .filter(sub => {
          const stats = getSubscriptionDeliveryStats(sub);
          return !(stats.expectedJars > 0 && stats.deliveredJars >= stats.expectedJars);
        })
        .map(sub => sub.id)
        .filter((id): id is string => !!id);
      setSelectedSubscriptionIds(new Set(allIds));
    } else {
      setSelectedSubscriptionIds(new Set());
    }
  };

  const isAllSelected = activeSubscriptions.length > 0 && 
    activeSubscriptions.filter(sub => {
      const stats = getSubscriptionDeliveryStats(sub);
      return !(stats.expectedJars > 0 && stats.deliveredJars >= stats.expectedJars);
    }).every(sub => sub.id && selectedSubscriptionIds.has(sub.id));

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Active Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your active subscription customers and deliveries
          </p>
        </div>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Active Subscriptions ({activeSubscriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium mb-2">No active subscriptions</p>
                <p className="text-sm text-muted-foreground">
                  Active subscriptions will appear here once you accept subscription requests.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Customer Name & Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Quantity per Delivery</TableHead>
                      <TableHead>Next Delivery Date</TableHead>
                      <TableHead>Jars Delivered</TableHead>
                      <TableHead>Bill</TableHead>
                      <TableHead className="text-center">Deliver Jars</TableHead>
                      <TableHead className="text-center">Mark Paid</TableHead>
                      <TableHead className="text-center">Remove</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSubscriptions.map((subscription) => {
                      const stats = getSubscriptionDeliveryStats(subscription);
                      const nextDeliveryDateDisplay = getNextDeliveryDateDisplay(subscription);
                      const monthlyBill = getMonthlyBillTotal(subscription, stats.expectedJars);
                      const completed = stats.expectedJars > 0 && stats.deliveredJars >= stats.expectedJars;
                      const paid = isBillPaidForCurrentMonth(subscription);
                      const isSelected = subscription.id ? selectedSubscriptionIds.has(subscription.id) : false;
                      
                      return (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                subscription.id && handleSelectSubscription(subscription.id, checked as boolean)
                              }
                              disabled={completed}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold">{subscription.customerName}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{subscription.customerPhone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-1 text-sm">
                              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{subscription.customerAddress}</p>
                                {subscription.customerPincode && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Pincode: {subscription.customerPincode}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{getFrequencyDisplay(subscription.frequency)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold">
                                {subscription.quantity}x {subscription.jarType === 'jar20L' ? '20L' : subscription.jarType === 'jar10L' ? '10L' : 'Bottles'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                per delivery
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className={nextDeliveryDateDisplay === 'Due now' ? 'font-semibold text-primary' : ''}>
                                {nextDeliveryDateDisplay}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {completed ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-success" />
                                  <div>
                                    <p className="font-semibold text-success">
                                      Completed
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {stats.deliveredJars} / {stats.expectedJars} jars delivered
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-semibold text-xl">
                                    {stats.deliveredJars} / {stats.expectedJars}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Jars delivered this month
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold flex items-center gap-1">
                                <IndianRupee className="h-3 w-3" />
                                {monthlyBill}
                              </p>
                              <p className={`text-xs font-medium ${paid ? 'text-success' : hasCustomerPaid(subscription) ? 'text-amber-600 dark:text-amber-400' : 'text-warning'}`}>
                                {paid ? 'Paid (confirmed)' : hasCustomerPaid(subscription) ? 'Paid (verify & confirm)' : 'Unpaid'}
                              </p>
                              {completed && !paid && !hasCustomerPaid(subscription) && (
                                <p className="text-xs text-muted-foreground">
                                  Deliveries complete — awaiting payment
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {!completed ? (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 gap-2"
                                onClick={() => handleDeliverSubscription(subscription)}
                                disabled={!!deliveringSubscriptionId}
                              >
                                <Package className="h-4 w-4" />
                                Deliver Jars
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">Completed</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {hasCustomerPaid(subscription) && !paid ? (
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90 gap-2"
                                onClick={() => handleMarkBillPaid(subscription)}
                                disabled={!!markingPaidId || !!deliveringSubscriptionId}
                              >
                                <CheckCircle className="h-4 w-4" />
                                {markingPaidId === subscription.id ? 'Marking...' : 'Mark Paid'}
                              </Button>
                            ) : paid ? (
                              <span className="text-sm text-success font-medium flex items-center justify-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Confirmed
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => handleRemoveSubscription(subscription)}
                              disabled={!!removingSubscriptionId}
                            >
                              <Trash2 className="h-4 w-4" />
                              {removingSubscriptionId === subscription.id ? 'Removing...' : 'Remove'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {selectedSubscriptionIds.size > 0 && (
              <div className="mt-4 pt-4 border-t flex justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 gap-2"
                  onClick={handleBulkDeliver}
                  disabled={!!deliveringSubscriptionId}
                >
                  <Package className="h-5 w-5" />
                  Deliver Jars for {selectedSubscriptionIds.size} Selected {selectedSubscriptionIds.size === 1 ? 'Customer' : 'Customers'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Delivery Dialog */}
        <Dialog open={showSubscriptionDeliveryDialog} onOpenChange={setShowSubscriptionDeliveryDialog}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isBulkDelivery ? 'Bulk Deliver Subscription Orders' : 'Deliver Subscription Order'}
              </DialogTitle>
              <DialogDescription>
                {isBulkDelivery 
                  ? `Choose an available delivery person to assign for ${subscriptionsToDeliver.length} subscription deliveries.`
                  : 'Choose an available delivery person to assign for this subscription delivery.'}{' '}
                Distance from your shop is in kilometers when GPS is set. Unavailable drivers cannot be assigned.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {/* Pickup Location (Shop) */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    Pickup From (Your Shop):
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Shop Name:</p>
                      <p className="font-semibold">{vendor?.shopName || 'Shop'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shop Address:</p>
                      <p className="font-medium">{vendor?.address || 'N/A'}</p>
                      {vendor?.pincode && (
                        <p className="text-xs text-muted-foreground mt-1">Pincode: {vendor.pincode}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shop Phone:</p>
                      <p className="font-medium">{vendor?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Locations (All Customers) */}
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-success" />
                    Deliver To ({isBulkDelivery ? `${subscriptionsToDeliver.length} Customers` : 'Customer'}):
                  </p>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {isBulkDelivery ? (
                      subscriptionsToDeliver.map((subscription, index) => (
                        <div key={subscription.id || index} className="p-3 rounded-lg bg-background border border-success/20">
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Customer Name:</p>
                              <p className="font-semibold">{subscription.customerName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Delivery Address:</p>
                              <p className="font-medium">{subscription.customerAddress}</p>
                              {subscription.customerPincode && (
                                <p className="text-xs text-muted-foreground mt-1">Pincode: {subscription.customerPincode}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-muted-foreground">Customer Phone:</p>
                              <p className="font-medium">{subscription.customerPhone}</p>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-muted-foreground">Items:</p>
                              <p className="font-semibold">
                                {subscription.quantity}x {subscription.jarType === 'jar20L' ? '20L Jar' : subscription.jarType === 'jar10L' ? '10L Jar' : 'Bottles'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : subscriptionToDeliver ? (
                      <div className="p-3 rounded-lg bg-background border border-success/20">
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Customer Name:</p>
                            <p className="font-semibold">{subscriptionToDeliver.customerName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Delivery Address:</p>
                            <p className="font-medium">{subscriptionToDeliver.customerAddress}</p>
                            {subscriptionToDeliver.customerPincode && (
                              <p className="text-xs text-muted-foreground mt-1">Pincode: {subscriptionToDeliver.customerPincode}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-muted-foreground">Customer Phone:</p>
                            <p className="font-medium">{subscriptionToDeliver.customerPhone}</p>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-muted-foreground">Items:</p>
                            <p className="font-semibold">
                              {subscriptionToDeliver.quantity}x {subscriptionToDeliver.jarType === 'jar20L' ? '20L Jar' : subscriptionToDeliver.jarType === 'jar10L' ? '10L Jar' : 'Bottles'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
            
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
                    onClick={() => {
                      setShowSubscriptionDeliveryDialog(false);
                      setSubscriptionToDeliver(null);
                      setSubscriptionsToDeliver([]);
                      setIsBulkDelivery(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>
                      {deliveryPersons.filter((p) => p.isAvailable !== false).length} available ·{' '}
                      {deliveryPersons.length} total (unavailable shown but cannot be assigned)
                    </span>
                  </div>
                  <div className="grid gap-3 max-h-[300px] overflow-y-auto">
                    {deliveryPersons.map((person) => {
                      const isAvailable = person.isAvailable !== false;
                      const distM = distanceMetersShopToPerson(
                        vendor?.latitude,
                        vendor?.longitude,
                        person.latitude,
                        person.longitude
                      );
                      let etaLabel: string | null = null;
                      if (distM != null) {
                        const distanceKm = distM / 1000;
                        const speedKmph = 20;
                        const etaMinutes = Math.max(3, Math.round((distanceKm / speedKmph) * 60));
                        etaLabel = `~${etaMinutes} min to reach shop`;
                      }

                      return (
                        <div
                          key={person.uid}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isAvailable && !deliveringSubscriptionId
                              ? 'border-border hover:border-primary bg-muted/30 hover:bg-muted cursor-pointer'
                              : 'border-muted-foreground/30 bg-muted/30 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <UserIcon className="h-4 w-4 text-primary" />
                                <p className="font-semibold">{person.name}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  isAvailable
                                    ? 'bg-success/20 text-success'
                                    : 'bg-muted-foreground/20 text-muted-foreground'
                                }`}>
                                  {isAvailable ? '✓ Available' : '✗ Unavailable'}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-sm">
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
                                      {person.pincode && vendor?.pincode
                                        ? person.pincode === vendor.pincode
                                          ? ' · same pincode'
                                          : ' · different pincode'
                                        : ''}
                                    </span>
                                  )}
                                </span>
                              </div>
                              {etaLabel && (
                                <p className="mt-1 text-xs text-muted-foreground">{etaLabel}</p>
                              )}
                              <div className="space-y-1 text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{person.phone}</span>
                                </div>
                                {person.address && (
                                  <div className="flex items-start gap-1">
                                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
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
                            {deliveringSubscriptionId ? (
                              <div className="text-sm text-muted-foreground shrink-0">Assigning...</div>
                            ) : isAvailable ? (
                              <Button 
                                size="sm" 
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignDeliveryPersonForSubscription(person);
                                }}
                                disabled={!!deliveringSubscriptionId}
                              >
                                Assign
                              </Button>
                            ) : (
                              <div className="text-xs text-muted-foreground shrink-0 px-2 py-1">
                                Unavailable
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSubscriptionDeliveryDialog(false);
                        setSubscriptionToDeliver(null);
                        setSubscriptionsToDeliver([]);
                        setIsBulkDelivery(false);
                      }}
                      disabled={!!deliveringSubscriptionId}
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
