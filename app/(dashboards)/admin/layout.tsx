'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, HeartHandshake, History, LogOut, PlusCircle, Menu, X ,BarChart3} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Fraud Detection", href: "/admin/fraud_analytics", icon: HeartHandshake }, 
  { name: "Manage Campaigns", href: "/admin/campaigns", icon: HeartHandshake },
  { name: "Transactions", href: "/admin/transactions", icon: History },
  { name: "Create Post", href: "/admin/create-post", icon: PlusCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r shadow-sm transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <HeartHandshake className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-0">
        <div className="min-h-screen p-6 md:p-8">
          {children}
        </div>
      </main>

      <style jsx global>{`
        /* Smooth fade in for content */
        main > div {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth hover transitions */
        aside a,
        aside button {
          position: relative;
          overflow: hidden;
        }

        aside a::before,
        aside button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent);
          transition: left 0.5s;
        }

        aside a:hover::before,
        aside button:hover::before {
          left: 100%;
        }

        /* Active indicator slide in */
        aside a[class*="bg-emerald"] {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Scrollbar */
        aside::-webkit-scrollbar {
          width: 6px;
        }

        aside::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        aside::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}