import { supabase } from '@/lib/supabase';
import { TABLES } from '@/constants';
import { StegoImage, ExtractionLog, AuditLog, DashboardStats, User } from '@/types';

export class DatabaseService {
  async ensureUserProfile(userId: string, email: string, fullName?: string | null): Promise<void> {
    const { data, error: selectError } = await supabase
      .from(TABLES.USERS)
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (selectError) throw selectError;
    if (data) return;

    const { error: insertError } = await supabase.from(TABLES.USERS).insert({
      id: userId,
      email,
      full_name: fullName || null,
      role: 'user',
    });

    if (insertError) throw insertError;
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>
  ): Promise<User> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOperationHistoryData(userId: string, limit: number = 50): Promise<{
    embeddings: StegoImage[];
    extractions: ExtractionLog[];
    errors: string[];
  }> {
    const errors: string[] = [];

    const [embedResult, extractResult] = await Promise.allSettled([
      this.getStegoImages(userId, limit),
      this.getExtractionLogs(userId, limit),
    ]);

    const embeddings =
      embedResult.status === 'fulfilled' ? embedResult.value : [];
    if (embedResult.status === 'rejected') {
      errors.push('Failed to load embedding history');
      console.error(embedResult.reason);
    }

    const extractions =
      extractResult.status === 'fulfilled' ? extractResult.value : [];
    if (extractResult.status === 'rejected') {
      errors.push('Failed to load extraction history');
      console.error(extractResult.reason);
    }

    return { embeddings, extractions, errors };
  }

  // Stego Images
  async createStegoImage(data: Partial<StegoImage>): Promise<StegoImage> {
    // Validate numeric fields to prevent NaN/Infinity issues
    const sanitized = {
      ...data,
      psnr: typeof data.psnr === 'number' && isFinite(data.psnr) ? data.psnr : null,
      ssim: typeof data.ssim === 'number' && isFinite(data.ssim) ? data.ssim : null,
      mse: typeof data.mse === 'number' && isFinite(data.mse) ? data.mse : null,
      best_fitness: typeof data.best_fitness === 'number' && isFinite(data.best_fitness) ? data.best_fitness : null,
      execution_time: typeof data.execution_time === 'number' && isFinite(data.execution_time) ? data.execution_time : null,
    };

    const { data: result, error } = await supabase
      .from(TABLES.STEGO_IMAGES)
      .insert(sanitized)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        insertedData: sanitized,
      });
      throw error;
    }
    return result;
  }

  async getStegoImages(userId: string, limit: number = 10): Promise<StegoImage[]> {
    const { data, error } = await supabase
      .from(TABLES.STEGO_IMAGES)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getStegoImageById(id: string): Promise<StegoImage | null> {
    const { data, error } = await supabase
      .from(TABLES.STEGO_IMAGES)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateStegoImage(id: string, data: Partial<StegoImage>): Promise<StegoImage> {
    const { data: result, error } = await supabase
      .from(TABLES.STEGO_IMAGES)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  // Extraction Logs
  async createExtractionLog(data: Partial<ExtractionLog>): Promise<ExtractionLog> {
    const elapsed = data.extraction_time ?? data.execution_time ?? 0;

    const payload: Record<string, unknown> = {
      user_id: data.user_id,
      stego_id: data.stego_id ?? null,
      stego_image_name: data.stego_image_name,
      audio_name: data.audio_name,
      audio_url: data.audio_url,
      extracted_audio_size: data.extracted_audio_size,
      original_audio_size: data.original_audio_size,
      extraction_time: elapsed,
      execution_time: elapsed,
      status: data.status,
      error_message: data.error_message,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    const { data: result, error } = await supabase
      .from(TABLES.EXTRACTION_LOGS)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return result as ExtractionLog;
  }

  async getExtractionLogs(userId: string, limit: number = 10): Promise<ExtractionLog[]> {
    const { data, error } = await supabase
      .from(TABLES.EXTRACTION_LOGS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getOperationHistory(userId: string, limit: number = 50) {
    const errors: string[] = [];
    let embeddings: StegoImage[] = [];
    let extractions: ExtractionLog[] = [];

    try {
      embeddings = await this.getStegoImages(userId, limit);
    } catch (error) {
      console.error('Error fetching embeddings:', error);
      errors.push('Could not load embedding history');
    }

    try {
      extractions = await this.getExtractionLogs(userId, limit);
    } catch (error) {
      console.error('Error fetching extractions:', error);
      errors.push('Could not load extraction history');
    }

    return { embeddings, extractions, errors };
  }

  async updateExtractionLog(id: string, data: Partial<ExtractionLog>): Promise<ExtractionLog> {
    const { data: result, error } = await supabase
      .from(TABLES.EXTRACTION_LOGS)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  // Audit Logs
  async createAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const { data: result, error } = await supabase
      .from(TABLES.AUDIT_LOGS)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from(TABLES.AUDIT_LOGS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Dashboard Stats
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Get total hidden files
    const { count: totalHidden } = await supabase
      .from(TABLES.STEGO_IMAGES)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Get extracted files
    const { count: totalExtracted } = await supabase
      .from(TABLES.EXTRACTION_LOGS)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'success');

    // Get average PSNR
    const { data: psnrData } = await supabase
      .from(TABLES.STEGO_IMAGES)
      .select('psnr')
      .eq('user_id', userId)
      .eq('status', 'completed');

    const averagePsnr = psnrData && psnrData.length > 0
      ? psnrData.reduce((acc, curr) => acc + curr.psnr, 0) / psnrData.length
      : 0;

    return {
      total_hidden_files: totalHidden || 0,
      extracted_files: totalExtracted || 0,
      images_processed: totalHidden || 0,
      average_psnr: averagePsnr,
      security_level: 95, // Based on encryption strength
    };
  }

  // Activity Data for Charts
  async getActivityData(userId: string, days: number = 30) {
    const { data, error } = await supabase
      .from(TABLES.STEGO_IMAGES)
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Process data for charts
    const activityMap = new Map<string, { embeddings: number; extractions: number }>();
    
    data?.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const existing = activityMap.get(date) || { embeddings: 0, extractions: 0 };
      activityMap.set(date, { ...existing, embeddings: existing.embeddings + 1 });
    });

    return Array.from(activityMap.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));
  }
}

export const databaseService = new DatabaseService();
