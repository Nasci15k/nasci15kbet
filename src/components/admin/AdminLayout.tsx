import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  CreditCard,
  Gift,
  Settings,
  Palette,
  FileText,
  Bell,
  MessageSquare,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Wallet,
  Crown,
  Link2,
  Database,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Usuários",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Jogos",
    icon: Gamepad2,
    items: [
      { title: "Todos os Jogos", href: "/admin/games" },
      { title: "Provedores", href: "/admin/providers" },
      { title: "Categorias", href: "/admin/categories" },
    ],
  },
  {
    title: "Financeiro",
    icon: CreditCard,
    items: [
      { title: "Depósitos", href: "/admin/deposits" },
      { title: "Saques", href: "/admin/withdrawals" },
      { title: "Transações", href: "/admin/transactions" },
      { title: "Métodos de Pagamento", href: "/admin/payment-methods" },
    ],
  },
  {
    title: "Bônus",
    icon: Gift,
    href: "/admin/bonuses",
  },
  {
    title: "VIP",
    icon: Crown,
    href: "/admin/vip",
  },
  {
    title: "Afiliados",
    icon: Link2,
    items: [
      { title: "Afiliados", href: "/admin/affiliates" },
      { title: "Comissões", href: "/admin/commissions" },
      { title: "Configurações", href: "/admin/affiliate-settings" },
    ],
  },
  {
    title: "Promoções",
    icon: TrendingUp,
    href: "/admin/promotions",
  },
  {
    title: "Suporte",
    icon: MessageSquare,
    href: "/admin/support",
  },
  {
    title: "Notificações",
    icon: Bell,
    href: "/admin/notifications",
  },
  {
    title: "Páginas",
    icon: FileText,
    items: [
      { title: "Páginas Customizadas", href: "/admin/pages" },
      { title: "Popups", href: "/admin/popups" },
    ],
  },
  {
    title: "Aparência",
    icon: Palette,
    href: "/admin/appearance",
  },
  {
    title: "Configurações",
    icon: Settings,
    items: [
      { title: "Geral", href: "/admin/settings" },
      { title: "API Playfivers", href: "/admin/api-settings" },
    ],
  },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground">Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="p-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href
                ? location.pathname === item.href
                : item.items?.some((sub) => location.pathname === sub.href);
              const isExpanded = expandedItems.includes(item.title);

              if (item.items) {
                return (
                  <div key={item.title}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive && "bg-primary/10 text-primary"
                      )}
                      onClick={() => toggleExpanded(item.title)}
                    >
                      <Icon className="h-5 w-5" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </>
                      )}
                    </Button>
                    {sidebarOpen && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.items.map((subItem) => (
                          <Link key={subItem.href} to={subItem.href}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start",
                                location.pathname === subItem.href &&
                                  "bg-primary/10 text-primary"
                              )}
                            >
                              {subItem.title}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link key={item.title} to={item.href!}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.title}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-foreground">
            Painel Administrativo
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                Ver Site
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{profile?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};
