import { 
  Droplets,
  Calendar,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useTranslation } from '@/contexts/AuthContext';

const orders = [
  { 
    id: 'ORD-2024-0125', 
    date: 'Jan 15, 2024', 
    items: '2x 20L Jars', 
    status: 'Delivered', 
    amount: 80,
    deliveredAt: '10:45 AM'
  },
  { 
    id: 'ORD-2024-0118', 
    date: 'Jan 12, 2024', 
    items: '1x 20L Jar', 
    status: 'Delivered', 
    amount: 40,
    deliveredAt: '11:30 AM'
  },
  { 
    id: 'ORD-2024-0110', 
    date: 'Jan 10, 2024', 
    items: '3x 10L Jars', 
    status: 'Delivered', 
    amount: 75,
    deliveredAt: '9:15 AM'
  },
  { 
    id: 'ORD-2024-0105', 
    date: 'Jan 5, 2024', 
    items: '2x 20L Jars', 
    status: 'Delivered', 
    amount: 80,
    deliveredAt: '10:00 AM'
  },
  { 
    id: 'ORD-2024-0101', 
    date: 'Jan 1, 2024', 
    items: '1x Bottles Pack', 
    status: 'Delivered', 
    amount: 120,
    deliveredAt: '2:30 PM'
  },
];

const stats = {
  totalOrders: 45,
  thisMonth: 8,
  totalSpent: 3600,
};

export default function OrderHistory() {
  const t = useTranslation();

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('orderHistory')}</h1>
            <p className="text-muted-foreground mt-1">
              View all your past water orders
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">₹{stats.totalSpent}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Droplets className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{order.items}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{order.date}</span>
                      <span>•</span>
                      <span>{order.deliveredAt}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{order.amount}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                      {order.status}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" className="gap-2">
            Load More Orders
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
