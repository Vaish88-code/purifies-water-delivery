import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'customer' | 'vendor' | 'delivery' | 'admin';
export type Language = 'en' | 'hi' | 'mr';

interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  language: Language;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (phone: string, password: string) => Promise<{ success: boolean; role: UserRole }>;
  register: (phone: string, password: string, language: Language) => Promise<{ success: boolean }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, { password: string; user: User }> = {
  '9876543210': {
    password: 'customer123',
    user: { id: '1', phone: '9876543210', name: 'Rahul Kumar', role: 'customer', language: 'en' }
  },
  '9876543211': {
    password: 'vendor123',
    user: { id: '2', phone: '9876543211', name: 'Priya Sharma', role: 'vendor', language: 'hi' }
  },
  '9876543212': {
    password: 'delivery123',
    user: { id: '3', phone: '9876543212', name: 'Amit Singh', role: 'delivery', language: 'en' }
  },
  '9876543213': {
    password: 'admin123',
    user: { id: '4', phone: '9876543213', name: 'Admin User', role: 'admin', language: 'en' }
  },
};

export const translations: Record<Language, Record<string, string>> = {
  en: {
    login: 'Login',
    register: 'Register',
    phone: 'Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    newUser: 'New user?',
    existingUser: 'Already have an account?',
    selectLanguage: 'Select Language',
    dashboard: 'Dashboard',
    orders: 'Orders',
    subscriptions: 'Subscriptions',
    orderHistory: 'Order History',
    quickOrder: 'Quick Order',
    orderWater: 'Order Water',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    today: 'Today',
    schedule: 'Schedule',
    subscription: 'Subscription',
    proceed: 'Proceed to Payment',
    selectJarType: 'Select Jar Type',
    selectQuantity: 'Select Quantity',
    deliveryType: 'Delivery Type',
    priceBreakdown: 'Price Breakdown',
    total: 'Total',
    welcome: 'Welcome',
    address: 'Address',
    earnings: 'Earnings',
    inventory: 'Inventory',
    deliveries: 'Deliveries',
    pending: 'Pending',
    completed: 'Completed',
    activeSubscriptions: 'Active Subscriptions',
    totalOrders: 'Total Orders',
    totalUsers: 'Total Users',
    revenue: 'Revenue',
    vendors: 'Vendors',
  },
  hi: {
    login: 'लॉग इन',
    register: 'रजिस्टर',
    phone: 'फ़ोन नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड पुष्टि करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    newUser: 'नए उपयोगकर्ता?',
    existingUser: 'पहले से खाता है?',
    selectLanguage: 'भाषा चुनें',
    dashboard: 'डैशबोर्ड',
    orders: 'ऑर्डर',
    subscriptions: 'सब्सक्रिप्शन',
    orderHistory: 'ऑर्डर इतिहास',
    quickOrder: 'त्वरित ऑर्डर',
    orderWater: 'पानी ऑर्डर करें',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    today: 'आज',
    schedule: 'शेड्यूल',
    subscription: 'सब्सक्रिप्शन',
    proceed: 'भुगतान के लिए आगे बढ़ें',
    selectJarType: 'जार प्रकार चुनें',
    selectQuantity: 'मात्रा चुनें',
    deliveryType: 'डिलीवरी प्रकार',
    priceBreakdown: 'कीमत विवरण',
    total: 'कुल',
    welcome: 'स्वागत है',
    address: 'पता',
    earnings: 'कमाई',
    inventory: 'इन्वेंटरी',
    deliveries: 'डिलीवरी',
    pending: 'लंबित',
    completed: 'पूर्ण',
    activeSubscriptions: 'सक्रिय सब्सक्रिप्शन',
    totalOrders: 'कुल ऑर्डर',
    totalUsers: 'कुल उपयोगकर्ता',
    revenue: 'राजस्व',
    vendors: 'विक्रेता',
  },
  mr: {
    login: 'लॉगिन',
    register: 'नोंदणी करा',
    phone: 'फोन नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड पुष्टी करा',
    forgotPassword: 'पासवर्ड विसरलात?',
    newUser: 'नवीन वापरकर्ता?',
    existingUser: 'आधीच खाते आहे?',
    selectLanguage: 'भाषा निवडा',
    dashboard: 'डॅशबोर्ड',
    orders: 'ऑर्डर',
    subscriptions: 'सदस्यता',
    orderHistory: 'ऑर्डर इतिहास',
    quickOrder: 'जलद ऑर्डर',
    orderWater: 'पाणी ऑर्डर करा',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्ज',
    logout: 'लॉग आउट',
    today: 'आज',
    schedule: 'वेळापत्रक',
    subscription: 'सदस्यता',
    proceed: 'पेमेंटसाठी पुढे जा',
    selectJarType: 'जार प्रकार निवडा',
    selectQuantity: 'प्रमाण निवडा',
    deliveryType: 'डिलिव्हरी प्रकार',
    priceBreakdown: 'किंमत तपशील',
    total: 'एकूण',
    welcome: 'स्वागत आहे',
    address: 'पत्ता',
    earnings: 'कमाई',
    inventory: 'इन्व्हेंटरी',
    deliveries: 'डिलिव्हरी',
    pending: 'प्रलंबित',
    completed: 'पूर्ण',
    activeSubscriptions: 'सक्रिय सदस्यता',
    totalOrders: 'एकूण ऑर्डर',
    totalUsers: 'एकूण वापरकर्ते',
    revenue: 'महसूल',
    vendors: 'विक्रेते',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const login = async (phone: string, password: string): Promise<{ success: boolean; role: UserRole }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = mockUsers[phone];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      setLanguage(mockUser.user.language);
      return { success: true, role: mockUser.user.role };
    }
    
    // For demo: any phone with password "demo123" logs in as customer
    if (password === 'demo123') {
      const newUser: User = {
        id: Date.now().toString(),
        phone,
        name: 'Demo User',
        role: 'customer',
        language,
      };
      setUser(newUser);
      return { success: true, role: 'customer' };
    }
    
    return { success: false, role: 'customer' };
  };

  const register = async (phone: string, password: string, lang: Language): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now().toString(),
      phone,
      name: 'New User',
      role: 'customer',
      language: lang,
    };
    setUser(newUser);
    setLanguage(lang);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        language,
        setLanguage,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useTranslation() {
  const { language } = useAuth();
  return (key: string) => translations[language][key] || key;
}
