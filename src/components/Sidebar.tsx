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
      <div className="p-4 lg:p-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl font-bold truncate bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
            <p className="text-xs text-gray-400">Secure Steganography</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={closeMobileMenu}
            className="lg:hidden ml-auto p-2 hover:bg-gray-800 rounded-lg transition-colors active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path} onClick={closeMobileMenu}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 shrink-0 transition-transform",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span className="font-medium text-sm lg:text-base truncate">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                      transition={{ type: 'spring', damping: 20 }}
                    />
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 lg:p-4 border-t border-gray-800/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent text-sm lg:text-base transition-all group"
          onClick={() => {
            onLogout();
            closeMobileMenu();
          }}
        >
          <LogOut className="w-5 h-5 mr-3 shrink-0 group-hover:text-red-400 transition-colors" />
          <span className="truncate">Logout</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button - Only show when sidebar is closed */}
      {!isMobileMenuOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-gradient-to-br from-primary to-accent text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden lg:flex w-64 bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-white h-screen fixed left-0 top-0 flex-col shadow-2xl z-30 border-r border-gray-800"
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
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden w-[280px] sm:w-80 bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-white h-full fixed left-0 top-0 flex flex-col shadow-2xl z-50 overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
