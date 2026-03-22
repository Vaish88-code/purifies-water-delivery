import { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorLayout } from '@/components/layouts/VendorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { subscribeToOrdersByVendor, Order } from '@/lib/firebase/firestore';

export default function VendorEarnings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for vendor orders
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      console.log('🔴 Setting up real-time listener for vendor earnings:', user.id);
      
      const unsubscribe = subscribeToOrdersByVendor(
        user.id,
        (vendorOrders) => {
          console.log('🟢 Real-time orders update received in VendorEarnings:', {
            count: vendorOrders.length,
          });
          
          // Sort orders by createdAt (newest first)
          const sortedOrders = vendorOrders.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return bTime - aTime;
          });
          
          setOrders(sortedOrders);
          setLoading(false);
        },
        (error) => {
          console.error('❌ Error in vendor orders listener:', error);
          setLoading(false);
          toast({
            title: 'Error',
            description: error.message || 'Failed to load earnings data. Please try again.',
            variant: 'destructive',
          });
        }
      );

      return () => {
        console.log('🔴 Unsubscribing from vendor orders listener in VendorEarnings');
        unsubscribe();
        setOrders([]);
      };
    } catch (error: any) {
      console.error('❌ Error setting up vendor orders listener:', error);
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up earnings listener. Please refresh the page.',
        variant: 'destructive',
      });
    }
  }, [user?.id, toast]);

  // Calculate earnings from real orders
  const calculateEarnings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Filter orders by date and status
    const todayOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate();
      if (!orderDate) return false;
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const weekOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate();
      if (!orderDate) return false;
      orderDate.setHours(0, 0, 0, 0);
      return orderDate >= startOfWeek;
    });

    const monthOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate();
      if (!orderDate) return false;
      orderDate.setHours(0, 0, 0, 0);
      return orderDate >= startOfMonth;
    });

    // Calculate earnings from delivered orders only
    const todayDelivered = todayOrders.filter(o => o.status === 'delivered');
    const weekDelivered = weekOrders.filter(o => o.status === 'delivered');
    const monthDelivered = monthOrders.filter(o => o.status === 'delivered');
    const pendingOrders = orders.filter(o => 
      o.status === 'accepted' || o.status === 'out_for_delivery' || o.status === 'preparing'
    );

    const todayEarnings = todayDelivered.reduce((sum, order) => sum + (order.total || 0), 0);
    const weekEarnings = weekDelivered.reduce((sum, order) => sum + (order.total || 0), 0);
    const monthEarnings = monthDelivered.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingEarnings = pendingOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      today: todayEarnings,
      thisWeek: weekEarnings,
      thisMonth: monthEarnings,
      pending: pendingEarnings,
    };
  };

  // Calculate daily earnings for this week's chart
  const calculateDailyEarnings = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyEarnings = days.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      dayDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      const dayOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate();
        if (!orderDate) return false;
        orderDate.setHours(0, 0, 0, 0);
        return orderDate >= dayDate && orderDate < nextDay && order.status === 'delivered';
      });

      const amount = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      return { day, amount };
    });

    return dailyEarnings;
  };

  const earnings = calculateEarnings();
  const dailyEarnings = calculateDailyEarnings();
  const maxEarning = Math.max(...dailyEarnings.map(d => d.amount), 1); // Avoid division by zero

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings and payout history from real orders
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <IndianRupee className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{earnings.today.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{earnings.thisWeek.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{earnings.thisMonth.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow border-2 border-warning/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{earnings.pending.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>This Week's Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {maxEarning > 0 ? (
              <div className="flex items-end justify-between gap-2 h-48">
                {dailyEarnings.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-t-lg water-gradient transition-all duration-500"
                      style={{ 
                        height: `${(day.amount / maxEarning) * 100}%`,
                        minHeight: '20px'
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                    <span className="text-xs font-medium">
                      {day.amount >= 1000 ? `₹${(day.amount / 1000).toFixed(1)}k` : `₹${day.amount}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">No earnings data for this week yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completed Orders Summary */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Recent Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.filter(o => o.status === 'delivered').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium mb-2">No completed orders yet</p>
                <p className="text-sm text-muted-foreground">
                  Completed orders will appear here once they are delivered.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .filter(o => o.status === 'delivered')
                  .slice(0, 10)
                  .map((order) => {
                    const orderDate = order.createdAt?.toDate();
                    const formattedDate = orderDate 
                      ? orderDate.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A';

                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-success/10">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold">{order.orderId || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{order.total?.toLocaleString() || 0}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                            Delivered
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
