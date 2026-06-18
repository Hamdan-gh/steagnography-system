import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Activity, Database, HardDrive, 
  TrendingUp, AlertCircle, CheckCircle, XCircle,
  RefreshCw, Download, FileText, Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDateTime, formatBytes } from '@/utils/formatters';

interface AdminStats {
  totalUsers: number;
  totalEmbeddings: number;
  totalExtractions: number;
  totalStorage: number;
  recentUsers: any[];
  recentActivity: any[];
  systemHealth: {
    database: boolean;
    storage: boolean;
    auth: boolean;
  };
}

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalEmbeddings: 0,
    totalExtractions: 0,
    totalStorage: 0,
    recentUsers: [],
    recentActivity: [],
    systemHealth: {
      database: false,
      storage: false,
      auth: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity'>('overview');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Check system health
      const healthChecks = await Promise.allSettled([
        supabase.from('users').select('count'),
        supabase.storage.listBuckets(),
        supabase.auth.getSession(),
      ]);

      const systemHealth = {
        database: healthChecks[0].status === 'fulfilled',
        storage: healthChecks[1].status === 'fulfilled',
        auth: healthChecks[2].status === 'fulfilled',
      };

      // Fetch user count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch embedding count
      const { count: embeddingCount } = await supabase
        .from('stego_images')
        .select('*', { count: 'exact', head: true });

      // Fetch extraction count
      const { count: extractionCount } = await supabase
        .from('extraction_logs')
        .select('*', { count: 'exact', head: true });

      // Fetch recent users (last 10)
      const { data: recentUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent embeddings and extractions for activity
      const { data: recentEmbeddings } = await supabase
        .from('stego_images')
        .select('*, users(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentExtractions } = await supabase
        .from('extraction_logs')
        .select('*, users(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort activity
      const activity = [
        ...(recentEmbeddings || []).map(e => ({ ...e, type: 'embedding' })),
        ...(recentExtractions || []).map(e => ({ ...e, type: 'extraction' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Calculate storage usage (approximate)
      const { data: storageData } = await supabase
        .from('stego_images')
        .select('capacity_used');
      
      const totalStorage = (storageData || []).reduce((sum, item) => sum + (item.capacity_used || 0), 0);

      setStats({
        totalUsers: userCount || 0,
        totalEmbeddings: embeddingCount || 0,
        totalExtractions: extractionCount || 0,
        totalStorage,
        recentUsers: recentUsers || [],
        recentActivity: activity.slice(0, 10),
        systemHealth,
      });

      toast.success('Admin stats loaded');
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const HealthIndicator = ({ status, label }: { status: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {status ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-danger" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              System administration and monitoring
            </p>
          </div>
          <Button onClick={fetchAdminStats} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* System Health */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <HealthIndicator status={stats.systemHealth.database} label="Database" />
            <HealthIndicator status={stats.systemHealth.storage} label="Storage" />
            <HealthIndicator status={stats.systemHealth.auth} label="Authentication" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Embeddings</p>
                <p className="text-3xl font-bold mt-2">{stats.totalEmbeddings}</p>
              </div>
              <FileText className="w-12 h-12 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Extractions</p>
                <p className="text-3xl font-bold mt-2">{stats.totalExtractions}</p>
              </div>
              <Download className="w-12 h-12 text-accent opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-3xl font-bold mt-2">{formatBytes(stats.totalStorage)}</p>
              </div>
              <HardDrive className="w-12 h-12 text-warning opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Recent Users ({stats.recentUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'activity'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Recent Activity ({stats.recentActivity.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average per User</span>
                  <span className="font-semibold">
                    {stats.totalUsers > 0 ? (stats.totalEmbeddings / stats.totalUsers).toFixed(1) : 0} embeddings
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {stats.totalEmbeddings + stats.totalExtractions > 0
                      ? ((stats.totalEmbeddings / (stats.totalEmbeddings + stats.totalExtractions)) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Storage per File</span>
                  <span className="font-semibold">
                    {stats.totalEmbeddings > 0 ? formatBytes(stats.totalStorage / stats.totalEmbeddings) : '0 B'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Database Status</span>
                  <Badge variant={stats.systemHealth.database ? 'success' : 'destructive'}>
                    {stats.systemHealth.database ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Storage Status</span>
                  <Badge variant={stats.systemHealth.storage ? 'success' : 'destructive'}>
                    {stats.systemHealth.storage ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Auth Status</span>
                  <Badge variant={stats.systemHealth.auth ? 'success' : 'destructive'}>
                    {stats.systemHealth.auth ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No users yet</p>
              ) : (
                stats.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {(user.full_name || user.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {formatDateTime(user.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No activity yet</p>
              ) : (
                stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {activity.type === 'embedding' ? (
                        <FileText className="w-5 h-5 text-success" />
                      ) : (
                        <Download className="w-5 h-5 text-accent" />
                      )}
                      <div>
                        <p className="font-medium">
                          {activity.type === 'embedding' ? 'Audio Embedded' : 'Audio Extracted'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {activity.users?.full_name || activity.users?.email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.status === 'completed' || activity.status === 'success' ? 'success' : 'secondary'}>
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPage;
