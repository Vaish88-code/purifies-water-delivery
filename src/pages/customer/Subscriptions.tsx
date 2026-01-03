import { useState } from 'react';
import { 
  Package, 
  Calendar,
  Pause,
  Play,
  Edit,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useTranslation } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const subscription = {
  id: 'SUB001',
  active: true,
  paused: false,
  jarType: '20L Jar',
  quantity: 1,
  frequency: 'Daily',
  startDate: '2024-01-01',
  nextDelivery: '2024-01-16',
  monthlyAmount: 1200,
  savings: 240,
};

const frequencyOptions = [
  { value: 'daily', label: 'Daily', description: 'Every day', discount: '20% off' },
  { value: 'alternate', label: 'Alternate Days', description: 'Every 2nd day', discount: '15% off' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week', discount: '10% off' },
];

export default function Subscriptions() {
  const [isPaused, setIsPaused] = useState(subscription.paused);
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const { toast } = useToast();
  const t = useTranslation();

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? 'Subscription Resumed' : 'Subscription Paused',
      description: isPaused 
        ? 'Your deliveries will continue as scheduled'
        : 'Your deliveries are paused. Resume anytime.',
    });
  };

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('subscriptions')}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your water delivery subscription
          </p>
        </div>

        {/* Current Subscription */}
        <Card className={`card-shadow ${isPaused ? 'border-warning/50' : 'border-success/50'} border-2`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isPaused ? 'bg-warning/10' : 'water-gradient'}`}>
                <Package className={`h-6 w-6 ${isPaused ? 'text-warning' : 'text-primary-foreground'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Active Subscription</CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isPaused 
                    ? 'bg-warning/10 text-warning'
                    : 'bg-success/10 text-success'
                }`}>
                  {isPaused ? 'Paused' : 'Active'}
                </span>
              </div>
            </div>
            <Button
              variant={isPaused ? 'default' : 'outline'}
              onClick={handlePauseToggle}
              className="gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Jar Type</p>
                <p className="font-semibold text-lg">{subscription.quantity}x {subscription.jarType}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-semibold text-lg">{subscription.frequency}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Next Delivery</p>
                <p className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {subscription.nextDelivery}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent">
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="font-semibold text-lg">
                  ₹{subscription.monthlyAmount}
                  <span className="text-sm text-success ml-2">Save ₹{subscription.savings}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Frequency */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Delivery Frequency</span>
              <Button variant="ghost" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                Modify
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFrequency(option.value)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedFrequency === option.value
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedFrequency === option.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedFrequency === option.value && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                    {option.discount}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Summary */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Monthly Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">1x 20L Jar × 30 days</span>
                <span>₹1,200</span>
              </div>
              <div className="flex justify-between py-2 text-success">
                <span>Subscription Discount (20%)</span>
                <span>-₹240</span>
              </div>
              <div className="flex justify-between py-2 text-success">
                <span>Free Delivery</span>
                <span>₹0</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Monthly Total</span>
                  <span className="text-primary">₹960</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create New Subscription CTA */}
        <Card className="card-shadow border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Add Another Subscription</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set up delivery for a different location or jar type
            </p>
            <Button className="mt-4 gap-2">
              Create Subscription
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
