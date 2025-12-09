import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Games from "./pages/admin/Games";
import ApiSettings from "./pages/admin/ApiSettings";
import Appearance from "./pages/admin/Appearance";
import Withdrawals from "./pages/admin/Withdrawals";
import Deposits from "./pages/admin/Deposits";
import Bonuses from "./pages/admin/Bonuses";

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
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/games" element={<Games />} />
            <Route path="/admin/api-settings" element={<ApiSettings />} />
            <Route path="/admin/appearance" element={<Appearance />} />
            <Route path="/admin/withdrawals" element={<Withdrawals />} />
            <Route path="/admin/deposits" element={<Deposits />} />
            <Route path="/admin/bonuses" element={<Bonuses />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
