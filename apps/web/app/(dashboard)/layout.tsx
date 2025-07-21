"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/features/auth/UserMenu";
import { TeamSwitcher } from "@/components/features/team/TeamSwitcher";
import { useTeamData } from "@/hooks/useTeamData";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Load user teams data
  useTeamData();

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Squadre", href: "/teams" },
    { name: "Allenamenti", href: "/trainings" },
    { name: "AI Coach", href: "/ai-coach" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-gray-900">Kora</h1>
            <div className="max-w-48">
              <TeamSwitcher variant="mobile" />
            </div>
          </div>
          <UserMenu />
        </div>
      </div>

      <div className="lg:flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto relative">
            <div className="flex items-center justify-between flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-gray-900">Kora</h1>
            </div>
            
            {/* Team Switcher Desktop */}
            <div className="mt-4 px-4">
              <TeamSwitcher variant="desktop" />
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      } group flex items-center px-2 py-2 text-sm font-medium border-l-4`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-2 mt-4">
                <UserMenu variant="sidebar" />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6 pb-20 lg:pb-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive ? "text-blue-600" : "text-gray-400"
                } flex flex-col items-center py-2 text-xs`}
              >
                <div className="w-6 h-6 mb-1 bg-current opacity-20 rounded"></div>
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}