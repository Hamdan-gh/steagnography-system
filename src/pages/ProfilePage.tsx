import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Calendar, Shield, Camera, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { formatDate } from '@/utils/formatters';
import { validateAvatarFile } from '@/utils/validators';
import { databaseService } from '@/services/database.service';
import { storageService } from '@/services/storage.service';
import { updateAuthProfile } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProfilePageProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUserUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user.full_name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setUsername(user.full_name || '');
    setAvatarPreview(user.avatar_url || null);
  }, [user.full_name, user.avatar_url]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setUploadingAvatar(true);
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);

    try {
      const avatarUrl = await storageService.uploadAvatar(file, user.id);
      const updatedUser = await databaseService.updateUserProfile(user.id, { avatar_url: avatarUrl });
      await updateAuthProfile({ avatar_url: avatarUrl });
      onUserUpdate(updatedUser);
      setAvatarPreview(avatarUrl);
      toast.success('Profile photo updated');
    } catch (error: unknown) {
      setAvatarPreview(user.avatar_url || null);
      const message = error instanceof Error ? error.message : 'Failed to upload profile photo';
      toast.error(message);
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error('Please enter a username');
      return;
    }

    setSavingProfile(true);
    try {
      const updatedUser = await databaseService.updateUserProfile(user.id, {
        full_name: trimmedUsername,
      });
      await updateAuthProfile({ full_name: trimmedUsername });
      onUserUpdate(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-primary" />
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account information
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={username || 'Profile avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-white" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  aria-label="Upload profile photo"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold">{username || 'Set your username'}</h2>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role.toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Click the camera icon to upload a profile photo (max 2MB)
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  maxLength={50}
                />
              </div>

              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Calendar className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="font-medium">{formatDate(user.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Shield className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <UserIcon className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                  <p className="font-medium text-xs">{user.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
