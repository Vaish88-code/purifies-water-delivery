import { useState, useEffect } from 'react';
import { Users, Package, TrendingUp, Store, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllVendors, updateVendorDocument } from '@/lib/firebase/firestore';
import { Vendor } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const stats = { users: 1250, orders: 8456, subscriptions: 420, revenue: 245000 };

const issues = [
  { id: 1, type: 'Failed Order', customer: 'Rahul K.', description: 'Delivery partner unavailable' },
  { id: 2, type: 'Complaint', customer: 'Priya S.', description: 'Water quality issue reported' },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingVendorId, setUpdatingVendorId] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const allVendors = await getAllVendors();
      setVendors(allVendors);
      console.log('✅ Vendors loaded:', allVendors.length);
    } catch (error: any) {
      console.error('❌ Error fetching vendors:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load vendors. Please check your Firebase connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApproveVendor = async (vendorUid: string, shopName: string) => {
    if (updatingVendorId) {
      console.warn('⚠️  Another update operation in progress');
      return;
    }

    try {
      setUpdatingVendorId(vendorUid);
      console.log('✅ Approving vendor:', { vendorUid, shopName });
      
      await updateVendorDocument(vendorUid, { status: 'approved' });
      
      // Refresh vendors list to get updated data from Firestore
      await fetchVendors();
      
      toast({
        title: 'Vendor Approved ✅',
        description: `${shopName} has been approved successfully.`,
      });
      
      console.log('✅ Vendor approved successfully');
    } catch (error: any) {
      console.error('❌ Error approving vendor:', error);
      console.error('❌ Error details:', { vendorUid, shopName, error: error.message, code: error.code });
      
      let errorMessage = 'Failed to approve vendor.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules allow vendor updates.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error Approving Vendor',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdatingVendorId(null);
    }
  };

  const handleRejectVendor = async (vendorUid: string, shopName: string) => {
    if (updatingVendorId) {
      console.warn('⚠️  Another update operation in progress');
      return;
    }

    try {
      setUpdatingVendorId(vendorUid);
      console.log('❌ Rejecting vendor:', { vendorUid, shopName });
      
      await updateVendorDocument(vendorUid, { status: 'rejected' });
      
      // Refresh vendors list to get updated data from Firestore
      await fetchVendors();
      
      toast({
        title: 'Vendor Rejected',
        description: `${shopName} has been rejected.`,
      });
      
      console.log('✅ Vendor rejected successfully');
    } catch (error: any) {
      console.error('❌ Error rejecting vendor:', error);
      console.error('❌ Error details:', { vendorUid, shopName, error: error.message, code: error.code });
      
      let errorMessage = 'Failed to reject vendor.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules allow vendor updates.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error Rejecting Vendor',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdatingVendorId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium">Admin</span>
            <LanguageSelector />
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-shadow"><CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.users.toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Users</p></div>
          </CardContent></Card>
          <Card className="card-shadow"><CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/10"><Package className="h-6 w-6 text-secondary" /></div>
            <div><p className="text-2xl font-bold">{stats.orders.toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Orders</p></div>
          </CardContent></Card>
          <Card className="card-shadow"><CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10"><TrendingUp className="h-6 w-6 text-success" /></div>
            <div><p className="text-2xl font-bold">{stats.subscriptions}</p><p className="text-sm text-muted-foreground">Subscriptions</p></div>
          </CardContent></Card>
          <Card className="card-shadow"><CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10"><Store className="h-6 w-6 text-warning" /></div>
            <div><p className="text-2xl font-bold">₹{(stats.revenue/1000).toFixed(0)}k</p><p className="text-sm text-muted-foreground">Revenue</p></div>
          </CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="card-shadow">
            <CardHeader><CardTitle>Vendor Approvals</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading vendors...</p>
              ) : vendors.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No vendors registered yet.</p>
              ) : (
                vendors.map((v) => (
                  <div key={v.uid} className="flex flex-col gap-3 p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-semibold text-lg">{v.shopName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Owner:</span> {v.ownerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Phone:</span> {v.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Address:</span> {v.address}
                      </p>
                      {v.state && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">State:</span> {v.state}
                        </p>
                      )}
                      {v.pincode && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Pincode:</span> {v.pincode}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        v.status === 'approved' 
                          ? 'bg-success/10 text-success' 
                          : v.status === 'rejected'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </span>
                      {v.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive"
                            onClick={() => handleRejectVendor(v.uid, v.shopName)}
                            disabled={updatingVendorId === v.uid || !!updatingVendorId}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {updatingVendorId === v.uid ? 'Rejecting...' : 'Reject'}
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleApproveVendor(v.uid, v.shopName)}
                            disabled={updatingVendorId === v.uid || !!updatingVendorId}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {updatingVendorId === v.uid ? 'Approving...' : 'Approve'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader><CardTitle>Issues & Complaints</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {issues.map((i) => (
                <div key={i.id} className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/30">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <div><p className="font-semibold">{i.type}</p><p className="text-sm text-muted-foreground">{i.customer}: {i.description}</p></div>
                  </div>
                  <Button size="sm" variant="outline">Resolve</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}