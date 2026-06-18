import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { signOut } from '@/lib/supabase';
import { User } from '@/types';
import { toast } from 'sonner';

interface MainLayoutProps {
  user: User;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar userRole={user.role} onLogout={handleLogout} />
      
      {/* Main content with responsive margins */}
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
