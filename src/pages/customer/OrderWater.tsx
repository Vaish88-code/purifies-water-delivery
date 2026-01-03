import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  Plus, 
  Minus, 
  Calendar,
  Clock,
  Package,
  Check,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useTranslation } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type JarType = '20L' | '10L' | 'bottles';
type DeliveryType = 'today' | 'schedule' | 'subscription';

const jarOptions: { type: JarType; name: string; price: number; image: string }[] = [
  { type: '20L', name: '20 Liter Jar', price: 40, image: '🫙' },
  { type: '10L', name: '10 Liter Jar', price: 25, image: '🏺' },
  { type: 'bottles', name: '1L Bottles (Pack of 12)', price: 120, image: '🍶' },
];

const deliveryOptions: { type: DeliveryType; name: string; description: string; icon: any }[] = [
  { type: 'today', name: 'Today', description: 'Delivery within 2 hours', icon: Truck },
  { type: 'schedule', name: 'Schedule', description: 'Pick a date & time', icon: Calendar },
  { type: 'subscription', name: 'Subscription', description: 'Regular delivery plan', icon: Package },
];

export default function OrderWater() {
  const [selectedJar, setSelectedJar] = useState<JarType>('20L');
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('today');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = useTranslation();

  const selectedJarInfo = jarOptions.find(j => j.type === selectedJar)!;
  const subtotal = selectedJarInfo.price * quantity;
  const deliveryFee = deliveryType === 'today' ? 20 : 0;
  const total = subtotal + deliveryFee;

  const handleProceed = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      toast({
        title: 'Order placed successfully!',
        description: `Your order of ${quantity}x ${selectedJarInfo.name} has been confirmed.`,
      });
      navigate('/customer/tracking');
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('orderWater')}</h1>
          <p className="text-muted-foreground mt-1">
            Choose your preferred water jars and delivery option
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { num: 1, label: t('selectJarType') },
            { num: 2, label: t('selectQuantity') },
            { num: 3, label: t('deliveryType') },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
                  step >= s.num
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </span>
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < 2 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Jar Type Selection */}
            {step >= 1 && (
              <Card className={`card-shadow ${step === 1 ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full water-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
                      1
                    </span>
                    {t('selectJarType')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {jarOptions.map((jar) => (
                      <button
                        key={jar.type}
                        onClick={() => setSelectedJar(jar.type)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          selectedJar === jar.type
                            ? 'border-primary bg-accent'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-4xl">{jar.image}</span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold">{jar.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Fresh purified water
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{jar.price}</p>
                          <p className="text-xs text-muted-foreground">per unit</p>
                        </div>
                        {selectedJar === jar.type && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Quantity Selection */}
            {step >= 2 && (
              <Card className={`card-shadow animate-slide-up ${step === 2 ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full water-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
                      2
                    </span>
                    {t('selectQuantity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-6">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <div className="text-center">
                      <span className="text-5xl font-bold">{quantity}</span>
                      <p className="text-muted-foreground mt-1">{selectedJarInfo.name}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Delivery Type */}
            {step >= 3 && (
              <Card className={`card-shadow animate-slide-up ${step === 3 ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full water-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
                      3
                    </span>
                    {t('deliveryType')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {deliveryOptions.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setDeliveryType(option.type)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          deliveryType === option.type
                            ? 'border-primary bg-accent'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${
                          deliveryType === option.type ? 'water-gradient' : 'bg-muted'
                        }`}>
                          <option.icon className={`h-5 w-5 ${
                            deliveryType === option.type ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold">{option.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                        {option.type === 'today' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">
                            +₹20
                          </span>
                        )}
                        {deliveryType === option.type && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-shadow sticky top-24">
              <CardHeader>
                <CardTitle>{t('priceBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {selectedJarInfo.name} × {quantity}
                    </span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  {deliveryType === 'today' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Express Delivery</span>
                      <span className="font-medium">₹{deliveryFee}</span>
                    </div>
                  )}
                  {deliveryType !== 'today' && (
                    <div className="flex justify-between text-success">
                      <span>Free Delivery</span>
                      <span>₹0</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>

                <Button
                  onClick={handleProceed}
                  className="w-full water-gradient text-primary-foreground font-semibold"
                  size="lg"
                >
                  {step < 3 ? 'Continue' : t('proceed')}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>

                {step > 1 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep(step - 1)}
                  >
                    Go Back
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
