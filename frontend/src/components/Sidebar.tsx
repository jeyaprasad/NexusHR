import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getUser, logout } from "../lib/auth";

import { LayoutDashboard, Users, Calendar, Plane, Wallet, BarChart3, Sparkles, MessageSquare } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Attendance", href: "/attendance", icon: Calendar },
  { label: "Leaves", href: "/leaves", icon: Plane },
  { label: "Payroll", href: "/payroll", icon: Wallet, roles: ["ADMIN", "HR"] },
  { label: "Performance", href: "/performance", icon: BarChart3 },
  { label: "AI Insights", href: "/ai-insights", icon: Sparkles, roles: ["ADMIN", "HR"] },
  { label: "HR Assistant", href: "/hr-assistant", icon: MessageSquare },
];

export function Sidebar() {
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  useEffect(() => {
    setUser(getUser());
  }, []);
  return (
    <>
    <aside className="w-56 min-h-screen border-r border-border flex flex-col bg-background sticky top-0">
      <div className="px-6 py-5 border-b border-border">
        <Link to="/dashboard" className="font-display text-lg font-extrabold tracking-tighter">
          INSII<span className="text-primary">HR</span>
        </Link>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.filter(
          (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
        ).map((item) => (
          <Link
            key={item.href}
            to={item.href}
            activeProps={{ className: "text-primary bg-primary/10 font-semibold shadow-sm" }}
            inactiveProps={{
              className: "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all"
          >
            <span className="text-xs"><item.icon className="w-4 h-4" /></span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border bg-secondary/30 mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {user?.fullName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-foreground truncate">{user?.fullName}</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5 truncate">
              {user?.role}
            </div>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={logout}
          className="w-full text-left px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer flex items-center justify-between"
        >
          Sign out <span>→</span>
        </button>
      </div>
    </aside>
    <Link
      to="/hr-assistant"
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-50"
      title="Open HR Assistant"
    >
      <MessageSquare className="w-6 h-6" />
    </Link>
    </>
  );
}
