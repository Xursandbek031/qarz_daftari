import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, History, Menu, X, LogOut, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { role, signOut, user } = useAuth();

  const navItems = role === "super_admin"
    ? [{ to: "/", icon: Store, label: "Do'konlar" }]
    : [
        { to: "/", icon: LayoutDashboard, label: "Bosh sahifa" },
        { to: "/clients", icon: Users, label: "Mijozlar" },
        { to: "/history", icon: History, label: "Tarix" },
      ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 gradient-hero border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            <span className="text-sidebar-primary">Qarz</span> Daftari
          </h1>
          <p className="text-xs text-sidebar-foreground/50 mt-1">
            {role === "super_admin" ? "Super Admin" : "Do'kon boshqaruvi"}
          </p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                location.pathname === item.to
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 px-4 mb-2 truncate">{user?.email}</p>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all w-full"
          >
            <LogOut className="h-5 w-5" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full gradient-hero animate-slide-in flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-xl font-bold text-sidebar-foreground">
                <span className="text-sidebar-primary">Qarz</span> Daftari
              </h1>
              <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/70">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    location.pathname === item.to
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="p-3 border-t border-sidebar-border">
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full"
              >
                <LogOut className="h-5 w-5" />
                Chiqish
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} className="text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">
            <span className="text-primary">Qarz</span> Daftari
          </h1>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
