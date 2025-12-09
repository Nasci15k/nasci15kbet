import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// User Pages
import Profile from "./pages/user/Profile";
import Wallet from "./pages/user/Wallet";
import Deposit from "./pages/user/Deposit";
import Withdraw from "./pages/user/Withdraw";
import Transactions from "./pages/user/Transactions";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Games from "./pages/admin/Games";
import Providers from "./pages/admin/Providers";
import Categories from "./pages/admin/Categories";
import ApiSettings from "./pages/admin/ApiSettings";
import Appearance from "./pages/admin/Appearance";
import Withdrawals from "./pages/admin/Withdrawals";
import Deposits from "./pages/admin/Deposits";
import Bonuses from "./pages/admin/Bonuses";
import VIP from "./pages/admin/VIP";
import Affiliates from "./pages/admin/Affiliates";
import AffiliateSettings from "./pages/admin/AffiliateSettings";
import Commissions from "./pages/admin/Commissions";
import Promotions from "./pages/admin/Promotions";
import Support from "./pages/admin/Support";
import AdminNotifications from "./pages/admin/Notifications";
import Pages from "./pages/admin/Pages";
import Popups from "./pages/admin/Popups";
import AdminTransactions from "./pages/admin/Transactions";
import PaymentMethods from "./pages/admin/PaymentMethods";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* User Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/transactions" element={<Transactions />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/games" element={<Games />} />
            <Route path="/admin/providers" element={<Providers />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/api-settings" element={<ApiSettings />} />
            <Route path="/admin/appearance" element={<Appearance />} />
            <Route path="/admin/withdrawals" element={<Withdrawals />} />
            <Route path="/admin/deposits" element={<Deposits />} />
            <Route path="/admin/bonuses" element={<Bonuses />} />
            <Route path="/admin/vip" element={<VIP />} />
            <Route path="/admin/affiliates" element={<Affiliates />} />
            <Route path="/admin/affiliate-settings" element={<AffiliateSettings />} />
            <Route path="/admin/commissions" element={<Commissions />} />
            <Route path="/admin/promotions" element={<Promotions />} />
            <Route path="/admin/support" element={<Support />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/pages" element={<Pages />} />
            <Route path="/admin/popups" element={<Popups />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/payment-methods" element={<PaymentMethods />} />
            <Route path="/admin/settings" element={<Settings />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;