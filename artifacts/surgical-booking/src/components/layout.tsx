import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CalendarDays,
  CalendarCheck,
  Users, 
  Activity,
  PlusCircle,
  Stethoscope,
  DoorOpen
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Vezérlőpult", icon: LayoutDashboard },
    { href: "/felvetel", label: "Felvételi naptár", icon: CalendarDays },
    { href: "/naptar", label: "Műtéti naptár", icon: CalendarCheck },
    { href: "/betegek", label: "Betegek", icon: Users },
    { href: "/mutetek", label: "Műtétek", icon: Activity },
    { href: "/elojegyzes", label: "Új előjegyzés", icon: PlusCircle },
    { href: "/sebeszek", label: "Sebészek", icon: Stethoscope },
    { href: "/mutotermek", label: "Műtőtermek", icon: DoorOpen },
  ];

  const activeLabel = navItems.find(i =>
    i.href === location || (i.href !== "/" && location.startsWith(i.href))
  )?.label ?? "Műtéti Előjegyzési Rendszer";

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-6 border-b">
          <h1 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Műtéti Előjegyzés
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-8 shadow-sm z-10">
          <h2 className="text-xl font-medium text-foreground">{activeLabel}</h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
