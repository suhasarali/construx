'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
        <div className="flex min-h-screen">
            {/* Only show Sidebar if NOT on login page */}
            {!isLoginPage && <Sidebar />}

            {/* Adjust main content area: full width on login, pushed right on dashboard */}
            <main className={`flex-1 ${isLoginPage ? 'w-full p-0' : 'ml-64 p-8'} relative transition-all duration-300`}>
                {/* Only show ThemeToggle if NOT on login page */}
                {!isLoginPage && (
                    <div className="absolute top-6 right-6 z-50">
                        <ThemeToggle />
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
