import { 
  Package, 
  Truck,
  CheckCircle,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';

const order = {
  id: 'ORD-2024-0125',
  items: '2x 20L Jars',
  amount: 80,
  status: 'out_for_delivery',
  estimatedTime: '10:30 AM - 11:00 AM',
  deliveryPartner: {
    name: 'Amit Singh',
    phone: '+91 98765 43212',
    rating: 4.8,
  },
  address: '123, Building Name, Street Name, Area, Mumbai - 400001',
};

const timeline = [
  { 
    status: 'confirmed', 
    label: 'Order Confirmed', 
    time: '9:00 AM',
    completed: true 
  },
  { 
    status: 'out_for_delivery', 
    label: 'Out for Delivery', 
    time: '10:15 AM',
    completed: true,
    current: true
  },
  { 
    status: 'delivered', 
    label: 'Delivered', 
    time: 'Expected by 11:00 AM',
    completed: false 
  },
];

export default function OrderTracking() {
  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Order Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track your water delivery in real-time
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="card-shadow border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl water-gradient">
                  <Package className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-bold text-lg">{order.id}</p>
                  <p className="text-muted-foreground">{order.items}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl">₹{order.amount}</p>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  <Truck className="h-3 w-3" />
                  On the way
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {timeline.map((step, index) => (
                <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                  {/* Line */}
                  {index < timeline.length - 1 && (
                    <div className={`absolute left-[15px] top-8 w-0.5 h-12 ${
                      step.completed ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? step.current 
                        ? 'water-gradient animate-pulse-slow' 
                        : 'bg-primary'
                      : 'bg-muted'
                  }`}>
                    {step.completed ? (
                      step.current ? (
                        <Truck className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-primary-foreground" />
                      )
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      step.current ? 'text-primary' : step.completed ? '' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.time}</p>
                    {step.current && (
                      <p className="text-sm text-primary mt-1">
                        Your delivery partner is on the way!
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Partner */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Delivery Partner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full water-gradient flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {order.deliveryPartner.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{order.deliveryPartner.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>⭐ {order.deliveryPartner.rating}</span>
                    <span>•</span>
                    <span>Delivery Partner</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Delivery Address</p>
                <p className="text-muted-foreground mt-1">{order.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Time */}
        <Card className="card-shadow bg-accent/50 border-accent">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Estimated Delivery</p>
            <p className="text-2xl font-bold text-primary">{order.estimatedTime}</p>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
