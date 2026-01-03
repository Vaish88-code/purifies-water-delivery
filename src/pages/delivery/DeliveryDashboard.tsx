import { 
  Truck, 
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Package,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const deliveries = [
  { 
    id: 'DEL-001', 
    customer: 'Rahul Kumar',
    phone: '+91 98765 43210',
    address: '123, Building A, Street Name, Mumbai - 400001',
    items: '2x 20L Jars',
    status: 'assigned',
    amount: 80,
    paymentMode: 'COD',
  },
  { 
    id: 'DEL-002', 
    customer: 'Priya Sharma',
    phone: '+91 98765 43211',
    address: '456, Building B, Street Name, Mumbai - 400002',
    items: '1x 20L Jar',
    status: 'out_for_delivery',
    amount: 40,
    paymentMode: 'Online',
  },
  { 
    id: 'DEL-003', 
    customer: 'Amit Singh',
    phone: '+91 98765 43212',
    address: '789, Building C, Street Name, Mumbai - 400003',
    items: '3x 10L Jars',
    status: 'assigned',
    amount: 75,
    paymentMode: 'COD',
  },
];

const stats = { assigned: 5, completed: 12, earnings: 340 };

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMarkDelivered = (id: string) => {
    toast({ title: 'Marked as Delivered', description: `Delivery ${id} completed` });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium">Delivery</span>
            <LanguageSelector />
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Delivery Dashboard</h1>

        <div className="grid grid-cols-3 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.assigned}</p>
              <p className="text-xs text-muted-foreground">Assigned</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">₹{stats.earnings}</p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </CardContent>
          </Card>
        </div>

        <Card className="card-shadow">
          <CardHeader><CardTitle>Assigned Deliveries</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {deliveries.map((del) => (
              <div key={del.id} className="p-4 rounded-xl border-2 border-border bg-muted/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{del.customer}</p>
                    <p className="text-sm text-muted-foreground">{del.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{del.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${del.paymentMode === 'COD' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {del.paymentMode}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{del.address}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1"><Phone className="h-4 w-4" />Call</Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1"><Navigation className="h-4 w-4" />Navigate</Button>
                  <Button size="sm" className="flex-1 gap-1 bg-success hover:bg-success/90" onClick={() => handleMarkDelivered(del.id)}>
                    <CheckCircle className="h-4 w-4" />Delivered
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
