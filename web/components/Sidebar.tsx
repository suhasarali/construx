'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarCheck, ClipboardList, PenTool, FileText, LogOut, MessageSquare } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Team Members', href: '/users', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList }, // Optional: separate page for tasks oversight
    { name: 'Requests', href: '/materials', icon: PenTool }, // We mapped this to /materials in dashboard already
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Messages', href: '/messages', icon: MessageSquare }, // Added Messages
  ];

  if (pathname === '/login') return null;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card text-card-foreground transition-transform border-r border-border">
      <div className="flex h-16 items-center justify-center border-b border-border bg-background/50">
        <h1 className="text-xl font-bold tracking-wider text-primary">CONSTRUX</h1>
      </div>

      <div className="px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t border-border space-y-4">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-accent hover:text-destructive transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
