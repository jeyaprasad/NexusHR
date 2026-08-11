import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getUser } from "../lib/auth";
import { LayoutDashboard, Users, Calendar, Plane, Wallet, BarChart3, Sparkles, MessageSquare, Moon, Sun } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Employees", href: "/employees", icon: Users },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Attendance", href: "/attendance", icon: Calendar },
      { label: "Leaves", href: "/leaves", icon: Plane },
      { label: "Payroll", href: "/payroll", icon: Wallet, roles: ["ADMIN", "HR"] },
      { label: "Performance", href: "/performance", icon: BarChart3 },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "AI Insights", href: "/ai-insights", icon: Sparkles, roles: ["ADMIN", "HR"] },
    ],
  },
];

export function Sidebar() {
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setUser(getUser());
    // Check theme
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        setIsDark(false);
      } else {
        html.classList.add('dark');
        setIsDark(true);
      }
    }
  };

  return (
    <aside className="w-64 min-h-screen flex flex-col sticky top-0" style={{ backgroundColor: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-fg)' }}>
      {/* Header / Logo */}
      <div className="h-16 px-6 flex items-center border-b" style={{ borderColor: 'var(--color-sidebar-border)' }}>
        <Link to="/dashboard" className="font-display text-lg font-extrabold tracking-tighter text-white">
          INSII<span className="text-primary">HR</span>
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 py-6 px-4 space-y-8">
        {NAV_GROUPS.map((group) => {
          const groupItems = group.items.filter(
            (item) => !item.roles || (user?.role && item.roles.includes(user.role))
          );
          
          if (groupItems.length === 0) return null;

          return (
            <div key={group.title}>
              <div className="px-3 mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                {group.title}
              </div>
              <div className="space-y-1">
                {groupItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    activeProps={{ className: "bg-primary text-white font-semibold" }}
                    inactiveProps={{
                      className: "text-white/70 hover:text-white hover:bg-white/5",
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors"
                  >
                    <span className="opacity-80"><item.icon className="w-4 h-4" /></span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
