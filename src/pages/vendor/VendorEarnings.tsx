import { 
  IndianRupee, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorLayout } from '@/components/layouts/VendorLayout';

const earningsData = {
  today: 2400,
  thisWeek: 16800,
  thisMonth: 72000,
  pending: 4800,
};

const payouts = [
  { id: 1, date: 'Jan 15, 2024', amount: 15000, status: 'paid' },
  { id: 2, date: 'Jan 8, 2024', amount: 14500, status: 'paid' },
  { id: 3, date: 'Jan 1, 2024', amount: 16200, status: 'paid' },
];

const dailyEarnings = [
  { day: 'Mon', amount: 2400 },
  { day: 'Tue', amount: 2800 },
  { day: 'Wed', amount: 2200 },
  { day: 'Thu', amount: 3000 },
  { day: 'Fri', amount: 2600 },
  { day: 'Sat', amount: 3200 },
  { day: 'Sun', amount: 2100 },
];

export default function VendorEarnings() {
  const maxEarning = Math.max(...dailyEarnings.map(d => d.amount));

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings and payout history
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
                  <p className="text-2xl font-bold">₹{earningsData.today.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">₹{earningsData.thisWeek.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">₹{earningsData.thisMonth.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">₹{earningsData.pending.toLocaleString()}</p>
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
                  <span className="text-xs font-medium">₹{(day.amount / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payout History</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold">Weekly Payout</p>
                    <p className="text-sm text-muted-foreground">{payout.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{payout.amount.toLocaleString()}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
