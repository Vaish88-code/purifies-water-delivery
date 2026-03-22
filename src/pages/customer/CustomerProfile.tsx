import {
  User,
  MapPin,
  Phone,
  Globe,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Edit,
  Plus,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useAuth, useTranslation } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CustomerProfile() {
  const { user, language, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [addressInput, setAddressInput] = useState(user?.address || '');
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');
  const [cityInput, setCityInput] = useState(user?.city || '');
  const [stateInput, setStateInput] = useState(user?.state || '');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const baseAddress = addressInput.trim();
      const cityPart = cityInput.trim();
      const fullAddress =
        cityPart && baseAddress && !baseAddress.toLowerCase().includes(cityPart.toLowerCase())
          ? `${baseAddress}, ${cityPart}`
          : baseAddress || user.address;
      await updateProfile({
        name: nameInput.trim() || user.name,
        address: fullAddress || undefined,
        pincode: pincodeInput.trim() || undefined,
        city: cityInput.trim() || undefined,
        state: stateInput.trim() || undefined,
      });
      setEditing(false);
    } catch (error) {
      // log only; UI stays simple
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const languageLabels = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    mr: 'मराठी (Marathi)',
  };

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('profile')}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings
          </p>
        </div>

        {/* Profile Card + Basic Info Edit */}
        <Card className="card-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full water-gradient flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Phone: +91 {user?.phone}
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
                    <p className="text-muted-foreground">+91 {user?.phone}</p>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing((prev) => !prev);
                  setNameInput(user?.name || '');
                  setAddressInput(user?.address || '');
                  setPincodeInput(user?.pincode || '');
                  setStateInput(user?.state || '');
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            {/* Address fields when editing */}
            {editing && (
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="House / Flat, Street, Area"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="e.g. Kolhapur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={stateInput}
                      onChange={(e) => setStateInput(e.target.value)}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      placeholder="e.g. 400001"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Address (read-only from profile) */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t('address')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {user?.address ? (
              <>
                <p className="text-sm text-muted-foreground">{user.address}</p>
                <p className="text-sm text-muted-foreground">
                  {user.city && <>{user.city}</>}
                  {user.state && (
                    <>
                      {user.city ? ', ' : ''}
                      {user.state}
                    </>
                  )}
                  {user.pincode && (
                    <>
                      {(user.city || user.state) ? ', ' : ''}
                      {user.pincode}
                    </>
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No address saved yet. Click the edit icon above to add your address.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Language Preference */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Language Preference</p>
                  <p className="text-sm text-muted-foreground">{languageLabels[language]}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods (placeholder, non-editable) */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Payment methods management will be available in a future update.
            </p>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card className="card-shadow cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Help & Support</p>
                  <p className="text-sm text-muted-foreground">Get help or file a complaint</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('logout')}
        </Button>
      </div>
    </CustomerLayout>
  );
}
