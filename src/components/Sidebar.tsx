import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  Download,
  History,
  Settings,
  Shield,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ROUTES, APP_NAME, type RoutePath } from '@/constants';
import { Button } from './ui/button';

interface SidebarProps {
  userRole?: 'user' | 'admin';
  onLogout: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: RoutePath;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole = 'user', onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.DASHBOARD },
    { icon: Upload, label: 'Embed Audio', path: ROUTES.EMBED },
    { icon: Download, label: 'Extract Audio', path: ROUTES.EXTRACT },
    { icon: History, label: 'History', path: ROUTES.HISTORY },
    { icon: User, label: 'Profile', path: ROUTES.PROFILE },
    { icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
  ];

  if (userRole === 'admin') {
    navItems.push({ icon: Shield, label: 'Admin Panel', path: ROUTES.ADMIN });
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg lg:text-xl font-bold truncate">{APP_NAME}</h1>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={closeMobileMenu}
            className="lg:hidden ml-auto p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path} onClick={closeMobileMenu}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all cursor-pointer',
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-sm lg:text-base truncate">{item.label}</span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 lg:p-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 text-sm lg:text-base"
          onClick={() => {
            onLogout();
            closeMobileMenu();
          }}
        >
          <LogOut className="w-5 h-5 mr-3 shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-secondary dark:bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden lg:flex w-64 bg-secondary dark:bg-gray-900 text-white h-screen fixed left-0 top-0 flex-col shadow-xl z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden w-64 sm:w-72 bg-secondary dark:bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
