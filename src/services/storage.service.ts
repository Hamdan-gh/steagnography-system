import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKETS } from '@/constants';

export class StorageService {
  async uploadImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.IMAGES)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.IMAGES)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/avatar.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.IMAGES)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.IMAGES)
      .getPublicUrl(data.path);

    return `${urlData.publicUrl}?t=${Date.now()}`;
  }

  async uploadAudio(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.AUDIO)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.AUDIO)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async uploadStegoImage(file: File | Blob, userId: string): Promise<string> {
    const fileName = `${userId}/${Date.now()}_stego.png`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.STEGO)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/png',
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.STEGO)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
}

export const storageService = new StorageService();
