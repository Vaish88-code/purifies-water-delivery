import { useState } from 'react';
import { 
  Warehouse, 
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorLayout } from '@/components/layouts/VendorLayout';
import { useToast } from '@/hooks/use-toast';

const inventory = [
  { 
    id: 1, 
    name: '20L Water Jar', 
    quantity: 45, 
    minStock: 10,
    price: 40,
    status: 'healthy',
  },
  { 
    id: 2, 
    name: '10L Water Jar', 
    quantity: 5, 
    minStock: 15,
    price: 25,
    status: 'low',
  },
  { 
    id: 3, 
    name: '1L Bottles Pack (12)', 
    quantity: 20, 
    minStock: 8,
    price: 120,
    status: 'healthy',
  },
];

export default function VendorInventory() {
  const [items, setItems] = useState(inventory);
  const { toast } = useToast();

  const updateQuantity = (id: number, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          status: newQty < item.minStock ? 'low' : 'healthy',
        };
      }
      return item;
    }));
    toast({
      title: 'Inventory Updated',
      description: `Stock quantity has been ${delta > 0 ? 'increased' : 'decreased'}`,
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.status === 'low').length;

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your water jar stock levels
            </p>
          </div>
          <Button className="gap-2 water-gradient text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Warehouse className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`card-shadow ${lowStockItems > 0 ? 'border-2 border-warning/50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${lowStockItems > 0 ? 'bg-warning/10' : 'bg-success/10'}`}>
                  {lowStockItems > 0 ? (
                    <AlertCircle className="h-6 w-6 text-warning" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-success" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowStockItems}</p>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory List */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 ${
                  item.status === 'low' 
                    ? 'border-warning/50 bg-warning/5' 
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className={`p-3 rounded-xl ${
                    item.status === 'low' ? 'bg-warning/10' : 'bg-primary/10'
                  }`}>
                    <Warehouse className={`h-6 w-6 ${
                      item.status === 'low' ? 'text-warning' : 'text-primary'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price} per unit</p>
                    {item.status === 'low' && (
                      <div className="flex items-center gap-1 text-warning text-sm mt-1">
                        <AlertCircle className="h-4 w-4" />
                        Low stock - Min: {item.minStock}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-2xl font-bold w-16 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
