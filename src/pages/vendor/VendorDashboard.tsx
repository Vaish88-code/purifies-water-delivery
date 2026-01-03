import { 
  Package, 
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorLayout } from '@/components/layouts/VendorLayout';
import { Link } from 'react-router-dom';

const stats = {
  todayOrders: 24,
  pendingDeliveries: 8,
  todayEarnings: 2400,
  completedToday: 16,
};

const recentOrders = [
  { 
    id: 'ORD-001', 
    customer: 'Rahul Kumar', 
    items: '2x 20L Jars', 
    status: 'pending',
    time: '10 mins ago',
    amount: 80,
  },
  { 
    id: 'ORD-002', 
    customer: 'Priya Sharma', 
    items: '1x 20L Jar', 
    status: 'accepted',
    time: '25 mins ago',
    amount: 40,
  },
  { 
    id: 'ORD-003', 
    customer: 'Amit Singh', 
    items: '3x 10L Jars', 
    status: 'out_for_delivery',
    time: '45 mins ago',
    amount: 75,
  },
];

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
  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your orders and deliveries
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayOrders}</p>
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
                  <p className="text-2xl font-bold">{stats.pendingDeliveries}</p>
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
                  <p className="text-2xl font-bold">₹{stats.todayEarnings}</p>
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
                  <p className="text-2xl font-bold">{stats.completedToday}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        <Card className="card-shadow border-2 border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-warning" />
              <div className="flex-1">
                <p className="font-semibold">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  10L Jars running low - Only 5 units left
                </p>
              </div>
              <Link to="/vendor/inventory">
                <Button variant="outline" size="sm">
                  Update Inventory
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link to="/vendor/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.items}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">₹{order.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-destructive">
                        Reject
                      </Button>
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
