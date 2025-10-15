'use client'

import { createClient } from "@/lib/supabase/client";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import Link from "next/link";
import { HeartHandshake, LayoutDashboard, Droplet, FileHeart, Trophy, Newspaper, Menu, X, Sparkles, Gift, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useBloodNotifications } from '@/hooks/useBloodNotifications';
import { Toaster } from 'sonner';

const navItems = [
  { 
    title: "Dashboard", 
    href: "/donor", 
    icon: LayoutDashboard 
  },
  { 
    title: "Campaigns", 
    href: "/donor/campaigns", 
    icon: FileHeart 
  },
  { 
    title: "Blood Bank", 
    href: "/donor/blood-bank", 
    icon: Droplet 
  },
  { 
    title: "My History", 
    href: "/donor/history", 
    icon: FileHeart 
  },
  { 
    title: "Rewards",
    href: "/donor/rewards", 
    icon: Gift 
  },
  { 
    title: "Settings",
    href: "/donor/settings", 
    icon: Settings 
  },
  { 
    title: "Leaderboard", 
    href: "/donor/leaderboard", 
    icon: Trophy 
  },
  { 
    title: "Daily Impact", 
    href: "/donor/daily-impact", 
    icon: Newspaper 
  },
];

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>();
  const supabase = createClient();

  // Fetch user data and set state
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        setUserId(user.id);
      }
    };
    getUserData();
  }, [supabase]);
  
  // Enable blood notifications hook for the logged-in user
  useBloodNotifications(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Toast notifications container */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        expand={false}
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-pink-200 shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-pink-100 transition-all duration-300 hover:scale-110"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-rose-700 animate-spin" />
              ) : (
                <Menu className="h-5 w-5 text-rose-700" />
              )}
            </button>
            
            <Link href="/donor" className="flex items-center gap-3 group">
              <div className="relative p-2 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-xl shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-pink-300">
                <HeartHandshake className="h-6 w-6 text-white animate-pulse" />
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
                  HealChain
                </span>
                <span className="block text-xs text-rose-600 font-semibold -mt-0.5 tracking-wide">
                  Donor Portal
                </span>
              </div>
            </Link>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full border border-pink-200">
              <Sparkles className="h-4 w-4 text-rose-600 animate-pulse" />
              <span className="text-sm font-semibold text-rose-700">Making an Impact</span>
            </div>
            <UserProfileDropdown userEmail={userEmail} />
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 w-64 backdrop-blur-xl bg-white/90 border-r border-pink-200 shadow-2xl transition-all duration-500 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="h-full overflow-y-auto py-6 px-3">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== '/donor' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden animate-fadeInLeft",
                    isActive
                      ? "bg-gradient-to-r from-pink-100 via-rose-100 to-red-100 text-rose-700 font-bold shadow-lg scale-105"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:scale-105 hover:shadow-md"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-rose-400/20 to-red-400/20 animate-pulse"></div>
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all duration-300 relative z-10",
                      isActive
                        ? "text-rose-600 scale-110 animate-bounce"
                        : "text-gray-500 group-hover:text-rose-600 group-hover:scale-110"
                    )}
                  />
                  <span className="text-sm relative z-10">{item.title}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="mt-8 mx-3">
            <div className="relative p-5 bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 rounded-2xl border-2 border-pink-200 shadow-lg overflow-hidden group hover:scale-105 transition-all duration-300">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-rose-300/30 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <HeartHandshake className="h-5 w-5 text-rose-600 animate-pulse" />
                  <p className="font-bold text-rose-800 text-sm">Make an Impact</p>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Every contribution saves lives and brings hope to families in need.
                </p>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-rose-900/20 backdrop-blur-sm lg:hidden animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn">
          {children}
        </div>
      </main>

      {/* Add custom CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.3s ease-out forwards;
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}