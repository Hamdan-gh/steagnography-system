import { apiService } from './api';
import { EmbeddingRequest, EmbeddingResponse } from '@/types';
import { API_ENDPOINTS } from '@/constants';
import { databaseService } from './database.service';
import { storageService } from './storage.service';
import { getCurrentUser } from '@/lib/supabase';
import { resolveMediaUrl } from '@/utils/urls';
import { toast } from 'sonner';

export class EmbeddingService {
  private async uploadStegoToStorageAndSync(
    stegoId: string,
    userId: string,
    response: EmbeddingResponse
  ): Promise<void> {
    try {
      const stegoImageBlob = await fetch(
        `data:image/png;base64,${response.stego_image_base64}`
      ).then((r) => r.blob());
      const stegoImageFile = new File([stegoImageBlob], `stego_${Date.now()}.png`, {
        type: 'image/png',
      });

      const stegoImageUrl = await storageService.uploadStegoImage(stegoImageFile, userId);
      await databaseService.updateStegoImage(stegoId, { stego_image_url: stegoImageUrl });
    } catch (error) {
      // Keep original backend URL if storage sync fails.
      console.error('Error syncing stego image to storage:', error);
    }
  }

  private async saveEmbeddingToHistory(
    request: EmbeddingRequest,
    response: EmbeddingResponse
  ): Promise<void> {
    const { user } = await getCurrentUser();
    if (!user) return;

    await databaseService.ensureUserProfile(
      user.id,
      user.email!,
      user.user_metadata?.full_name
    );

    // Prepare data with validation
    const stegoData = {
      user_id: user.id,
      cover_image_name: request.cover_image.name,
      audio_file_name: request.audio_file.name,
      stego_image_url: resolveMediaUrl(response.stego_image_url) || response.stego_image_url,
      psnr: response.metrics.psnr,
      ssim: response.metrics.ssim,
      mse: response.metrics.mse,
      capacity_used: response.metrics.capacity_used,
      capacity_total: response.metrics.capacity_total,
      ga_generations: request.ga_generations || 20,
      ga_population_size: request.ga_population_size || 15,
      best_fitness: response.ga_results.best_fitness,
      execution_time: response.execution_time,
      status: 'completed' as const,
    };

    console.log('Saving embedding to history with data:', stegoData);

    // Save immediately using backend download URL so history persistence is reliable.
    const created = await databaseService.createStegoImage(stegoData);

    toast.success('Embedding saved to your history!');

    // Best-effort background sync to Supabase storage URL.
    void this.uploadStegoToStorageAndSync(created.id, user.id, response);
  }

  async embedAudio(request: EmbeddingRequest, onProgress?: (progress: number) => void): Promise<EmbeddingResponse> {
    const formData = new FormData();
    formData.append('cover_image', request.cover_image);
    formData.append('audio_file', request.audio_file);
    formData.append('encryption_key', request.encryption_key);
    
    if (request.ga_generations) {
      formData.append('ga_generations', request.ga_generations.toString());
    }
    
    if (request.ga_population_size) {
      formData.append('ga_population_size', request.ga_population_size.toString());
    }

    // Call the processing engine via proxy first
    let response: EmbeddingResponse;
    try {
      response = await apiService.post<EmbeddingResponse>(API_ENDPOINTS.EMBED, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
    } catch (err: any) {
      console.warn('Primary embed POST failed, attempting direct backend fallback', err?.response?.status || err?.message);
      const status = err?.response?.status;
      const shouldFallback = [502, 504, 413].includes(status) || !err?.response;
      const directBackend = (import.meta as any).env?.VITE_PROCESSING_ENGINE_URL;

      if (shouldFallback && directBackend) {
        try {
          // Use axios directly to post to the backend URL (bypass Vercel proxy)
          const axios = (await import('axios')).default;
          const resp = await axios.post(`${directBackend}${API_ENDPOINTS.EMBED}`, formData, {
            headers: {
              // Let browser/axios set the multipart boundary
            },
            timeout: 15 * 60 * 1000, // 15 minutes for long processing
            onUploadProgress: (progressEvent: any) => {
              if (onProgress && progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
              }
            },
          });
          toast(`Upload routed directly to backend`);
          response = resp.data as EmbeddingResponse;
        } catch (err2: any) {
          console.error('Direct backend fallback also failed', err2);
          throw err2;
        }
      } else {
        throw err;
      }
    }

    // Save to history with proper error handling
    try {
      await this.saveEmbeddingToHistory(request, response);
    } catch (saveError) {
      console.error('Error saving embedding to history:', saveError);
      const err = saveError as any;
      
      // Log full error details for debugging
      if (err?.message) console.error('Error message:', err.message);
      if (err?.code) console.error('Error code:', err.code);
      if (err?.details) console.error('Error details:', err.details);
      if (err?.hint) console.error('Error hint:', err.hint);
      
      if (err?.code === 'PGRST204') {
        toast.error('Database schema outdated. Run supabase_fix_stego_columns.sql in Supabase SQL Editor, then restart the project.');
      } else if (err?.code === '42501' || err?.message?.includes('permission denied')) {
        toast.error('Permission denied. Check RLS policies in Supabase.');
      } else {
        toast.warning('Embedding completed but could not save to history');
      }
    }

    return response;
  }

  async analyzeCapacity(coverImage: File): Promise<{ max_capacity: number; dimensions: { width: number; height: number } }> {
    const formData = new FormData();
    formData.append('image', coverImage);

    return apiService.post(API_ENDPOINTS.ANALYZE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const embeddingService = new EmbeddingService();
