import { Users, Package, TrendingUp, Store, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const stats = { users: 1250, orders: 8456, subscriptions: 420, revenue: 245000 };
const vendors = [
  { id: 1, name: 'AquaPure Suppliers', status: 'pending', rating: 4.5 },
  { id: 2, name: 'ClearWater Co.', status: 'approved', rating: 4.8 },
];
const issues = [
  { id: 1, type: 'Failed Order', customer: 'Rahul K.', description: 'Delivery partner unavailable' },
  { id: 2, type: 'Complaint', customer: 'Priya S.', description: 'Water quality issue reported' },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
              {vendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div><p className="font-semibold">{v.name}</p><p className="text-sm text-muted-foreground">Rating: ⭐ {v.rating}</p></div>
                  {v.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-destructive"><XCircle className="h-4 w-4" /></Button>
                      <Button size="sm" className="bg-success hover:bg-success/90"><CheckCircle className="h-4 w-4" /></Button>
                    </div>
                  ) : <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Approved</span>}
                </div>
              ))}
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
