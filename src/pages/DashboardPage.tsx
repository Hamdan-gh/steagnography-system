import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileAudio, Image as ImageIcon, TrendingUp, Activity } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, DashboardStats, ActivityData } from '@/types';
import { databaseService } from '@/services/database.service';
import { toast } from 'sonner';

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsData, activity] = await Promise.all([
        databaseService.getDashboardStats(user.id),
        databaseService.getActivityData(user.id, 7),
      ]);

      setStats(statsData);
      setActivityData(activity);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user.full_name}!
          </p>
        </div>
        <div className="flex items-center gap-2 text-success">
          <Activity className="w-5 h-5" />
          <span className="font-medium">System Active</span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Hidden Files"
          value={stats?.total_hidden_files || 0}
          icon={FileAudio}
          trend={{ value: 12, isPositive: true }}
          delay={0}
        />
        <StatCard
          title="Extracted Files"
          value={stats?.extracted_files || 0}
          icon={ImageIcon}
          trend={{ value: 8, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Images Processed"
          value={stats?.images_processed || 0}
          icon={ImageIcon}
          trend={{ value: 15, isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Avg PSNR Score"
          value={stats?.average_psnr.toFixed(2) || '0.00'}
          icon={TrendingUp}
          delay={0.3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="embeddings"
                    stroke="#2563EB"
                    strokeWidth={2}
                    name="Embeddings"
                  />
                  <Line
                    type="monotone"
                    dataKey="extractions"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    name="Extractions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Level */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                Security Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Encryption Strength</span>
                  <span className="text-2xl font-bold text-success">
                    {stats?.security_level}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.security_level}%` }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="h-full bg-gradient-to-r from-success to-green-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm">AES-256 Encryption</span>
                  <span className="text-xs font-medium text-success">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <span className="text-sm">GA Optimization</span>
                  <span className="text-xs font-medium text-success">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span className="text-sm">LSB Steganography</span>
                  <span className="text-xs font-medium text-success">Active</span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg">
                <p className="text-sm font-medium mb-1">Security Status</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your data is protected with military-grade encryption and advanced
                  steganography techniques.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.a
                href="/embed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 border-2 border-dashed border-primary/50 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <FileAudio className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Embed Audio</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hide audio files in images
                </p>
              </motion.a>

              <motion.a
                href="/extract"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 border-2 border-dashed border-accent/50 rounded-lg hover:border-accent hover:bg-accent/5 transition-all cursor-pointer"
              >
                <ImageIcon className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-semibold mb-1">Extract Audio</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Retrieve hidden audio files
                </p>
              </motion.a>

              <motion.a
                href="/history"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 border-2 border-dashed border-success/50 rounded-lg hover:border-success hover:bg-success/5 transition-all cursor-pointer"
              >
                <Activity className="w-8 h-8 text-success mb-3" />
                <h3 className="font-semibold mb-1">View History</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access past operations
                </p>
              </motion.a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
