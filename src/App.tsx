import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FirebaseStatus } from "@/components/FirebaseStatus";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import SelectShop from "./pages/customer/SelectShop";
import OrderWater from "./pages/customer/OrderWater";
import Subscriptions from "./pages/customer/Subscriptions";
import OrderTracking from "./pages/customer/OrderTracking";
import OrderHistory from "./pages/customer/OrderHistory";
import CustomerProfile from "./pages/customer/CustomerProfile";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorInventory from "./pages/vendor/VendorInventory";
import VendorEarnings from "./pages/vendor/VendorEarnings";
import VendorShopSettings from "./pages/vendor/VendorShopSettings";
import VendorSubscriptionRequests from "./pages/vendor/VendorSubscriptionRequests";
import VendorSubscriptions from "./pages/vendor/VendorSubscriptions";

// Delivery Pages
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <FirebaseStatus />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/select-shop" element={<SelectShop />} />
            <Route path="/customer/order" element={<OrderWater />} />
            <Route path="/customer/subscriptions" element={<Subscriptions />} />
            <Route path="/customer/tracking" element={<OrderTracking />} />
            <Route path="/customer/tracking/:orderId" element={<OrderTracking />} />
            <Route path="/customer/history" element={<OrderHistory />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />

            {/* Vendor Routes */}
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
            <Route path="/vendor/subscription-requests" element={<VendorSubscriptionRequests />} />
            <Route path="/vendor/subscriptions" element={<VendorSubscriptions />} />
            <Route path="/vendor/settings" element={<VendorShopSettings />} />
            <Route path="/vendor/inventory" element={<VendorInventory />} />
            <Route path="/vendor/earnings" element={<VendorEarnings />} />

            {/* Delivery Routes */}
            <Route path="/delivery" element={<DeliveryDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
