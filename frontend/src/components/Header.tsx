import { Bell, Settings, LogOut, Search, Plus, ChevronDown, Moon, Sun, UserPlus, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { getUser, logout } from "../lib/auth";
import { useRouter } from "@tanstack/react-router";

export function Header() {
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setUser(getUser());
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

  const pathname = router.state.location.pathname;
  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/employees": "Employees",
    "/attendance": "Attendance",
    "/leaves": "Leave Management",
    "/payroll": "Payroll",
    "/performance": "Performance Reviews",
    "/ai-insights": "AI Insights",
    "/hr-assistant": "HR Assistant",
  };
  const title = titleMap[pathname] || "NexusHR";

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-40 gap-4">
      {/* Left: Page Title */}
      <div className="flex items-center shrink-0">
        <h1 className="text-xl font-display font-bold text-foreground tracking-tight">{title}</h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="flex items-center bg-secondary/50 rounded-md px-3 py-1.5 border border-border focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search employees, documents..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground text-foreground" 
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center justify-end gap-3 shrink-0">
        {/* Add New Dropdown */}
        <div className="hidden lg:block relative group">
          <button className="flex h-9 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-md shadow-sm items-center gap-1.5 hover:bg-primary/90 transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> New
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="p-1">
              <button onClick={() => alert("Add Employee coming soon")} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2 rounded-md cursor-pointer">
                <UserPlus className="w-4 h-4 text-muted-foreground" /> Add Employee
              </button>
              <button onClick={() => alert("Add Leave coming soon")} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2 rounded-md cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" /> Leave Request
              </button>
            </div>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors cursor-pointer"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors cursor-pointer" title="Notifications">
          <Bell className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-3 cursor-pointer group relative">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-foreground leading-tight">{user?.fullName || "Guest"}</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{user?.role || "USER"}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.fullName?.[0]?.toUpperCase() || "G"}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-2 border-b border-border">
              <div className="text-sm font-medium text-foreground">{user?.fullName}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
            <div className="p-1">
              <button 
                id="logout-btn" 
                onClick={logout}
                className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 rounded-md cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
