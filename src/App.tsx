import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import { User } from './types';
import { toast } from 'sonner';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EmbedPage from './pages/EmbedPage';
import ExtractPage from './pages/ExtractPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

// Layout
import MainLayout from './layouts/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session?.user) {
        // Fetch user profile
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If user profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('User profile not found, creating one...');
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                id: authUser.id,
                email: authUser.email!,
                full_name: authUser.user_metadata?.full_name || null,
                role: 'user',
              })
              .select()
              .single();

            if (insertError) {
              console.error('Error creating user profile:', insertError);
              // Use auth data as fallback
              setUser({
                id: authUser.id,
                email: authUser.email!,
                full_name: authUser.user_metadata?.full_name || null,
                role: 'user',
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            } else {
              setUser(newUser);
            }
          }
        } else {
          throw error;
        }
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const maybeError = error as { code?: string; message?: string };
      if (maybeError?.code === '42P17') {
        toast.error('Database policy error detected. Apply supabase_rls_fix.sql in Supabase SQL Editor.');
      }
      // As a last resort, try to use auth session data
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || null,
          role: 'user',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Welcome Page */}
          <Route path="/welcome" element={<WelcomePage />} />

          {/* Public Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" /> : <SignupPage />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />}
          />
          <Route
            path="/dashboard"
            element={user ? <MainLayout user={user} /> : <Navigate to="/welcome" replace />}
          >
            <Route index element={<DashboardPage user={user} />} />
          </Route>
          <Route
            path="/embed"
            element={user ? <MainLayout user={user} /> : <Navigate to="/welcome" replace />}
          >
            <Route index element={<EmbedPage user={user} />} />
          </Route>
          <Route
            path="/extract"
            element={user ? <MainLayout user={user} /> : <Navigate to="/welcome" replace />}
          >
            <Route index element={<ExtractPage user={user} />} />
          </Route>
          <Route
            path="/history"
            element={user ? <MainLayout user={user} /> : <Navigate to="/welcome" replace />}
          >
            <Route index element={<HistoryPage user={user} />} />
          </Route>
          <Route
            path="/profile"
            element={user ? <MainLayout user={user} /> : <Navigate to="/welcome" replace />}
          >
            <Route index element={<ProfilePage user={user} onUserUpdate={handleUserUpdate} />} />
          </Route>
          <Route
            path="/settings"
            element={user ? <MainLayout user={user} /> : <Navigate to="/welcome" replace />}
          >
            <Route index element={<SettingsPage user={user} />} />
          </Route>
          {user?.role === 'admin' && (
            <Route
              path="/admin"
              element={<MainLayout user={user} />}
            >
              <Route index element={<AdminPage />} />
            </Route>
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/welcome"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
