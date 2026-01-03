import { useState } from 'react';
import { 
  Package, 
  MapPin,
  Phone,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorLayout } from '@/components/layouts/VendorLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const orders = [
  { 
    id: 'ORD-001', 
    customer: 'Rahul Kumar', 
    phone: '+91 98765 43210',
    address: '123, Building A, Mumbai - 400001',
    items: '2x 20L Jars', 
    status: 'pending',
    time: '10:30 AM',
    amount: 80,
  },
  { 
    id: 'ORD-002', 
    customer: 'Priya Sharma', 
    phone: '+91 98765 43211',
    address: '456, Building B, Mumbai - 400002',
    items: '1x 20L Jar', 
    status: 'pending',
    time: '10:45 AM',
    amount: 40,
  },
  { 
    id: 'ORD-003', 
    customer: 'Amit Singh', 
    phone: '+91 98765 43212',
    address: '789, Building C, Mumbai - 400003',
    items: '3x 10L Jars', 
    status: 'accepted',
    time: '11:00 AM',
    amount: 75,
  },
  { 
    id: 'ORD-004', 
    customer: 'Neha Patel', 
    phone: '+91 98765 43213',
    address: '321, Building D, Mumbai - 400004',
    items: '2x 20L Jars', 
    status: 'out_for_delivery',
    time: '11:15 AM',
    amount: 80,
  },
  { 
    id: 'ORD-005', 
    customer: 'Vikram Reddy', 
    phone: '+91 98765 43214',
    address: '654, Building E, Mumbai - 400005',
    items: '1x Bottles Pack', 
    status: 'delivered',
    time: '9:30 AM',
    amount: 120,
  },
];

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/50',
  accepted: 'bg-primary/10 text-primary border-primary/50',
  out_for_delivery: 'bg-secondary/10 text-secondary border-secondary/50',
  delivered: 'bg-success/10 text-success border-success/50',
};

export default function VendorOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const handleAccept = (orderId: string) => {
    toast({
      title: 'Order Accepted',
      description: `Order ${orderId} has been accepted`,
    });
  };

  const handleReject = (orderId: string) => {
    toast({
      title: 'Order Rejected',
      description: `Order ${orderId} has been rejected`,
      variant: 'destructive',
    });
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground mt-1">
              Accept, reject, and manage customer orders
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className={`card-shadow border-2 ${statusColors[order.status as keyof typeof statusColors]}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-lg">{order.id}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="font-semibold">{order.customer}</p>
                          <p className="text-muted-foreground">{order.items}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {order.phone}
                            </span>
                          </div>
                          <div className="flex items-start gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{order.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{order.amount}</p>
                          <p className="text-sm text-muted-foreground">{order.time}</p>
                        </div>
                        
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => handleReject(order.id)}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="gap-1 bg-success hover:bg-success/90"
                              onClick={() => handleAccept(order.id)}
                            >
                              <Check className="h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredOrders.length === 0 && (
                <Card className="card-shadow">
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold">No orders found</p>
                    <p className="text-muted-foreground">
                      No orders in this category
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
}
