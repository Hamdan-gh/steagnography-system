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
    // Validate file sizes before upload (2MB to 20MB for images)
    const coverImageSizeMB = request.cover_image.size / (1024 * 1024);
    const audioFileSizeMB = request.audio_file.size / (1024 * 1024);
    
    console.log(`File sizes - Image: ${coverImageSizeMB.toFixed(2)}MB, Audio: ${audioFileSizeMB.toFixed(2)}MB`);
    
    if (coverImageSizeMB < 2) {
      throw new Error('Cover image must be at least 2MB in size for optimal embedding');
    }
    
    if (coverImageSizeMB > 20) {
      throw new Error(`Cover image is too large (${coverImageSizeMB.toFixed(2)}MB). Maximum size is 20MB`);
    }
    
    if (audioFileSizeMB > 20) {
      throw new Error(`Audio file is too large (${audioFileSizeMB.toFixed(2)}MB). Maximum size is 20MB`);
    }
    
    const formData = new FormData();
    formData.append('cover_image', request.cover_image);
    formData.append('audio_file', request.audio_file);
    formData.append('encryption_key', request.encryption_key);
    
    // Auto-optimize GA parameters for large files to speed up processing
    const optimizedGenerations = coverImageSizeMB > 10 
      ? Math.min(request.ga_generations || 10, 10) 
      : (request.ga_generations || 20);
    const optimizedPopulation = coverImageSizeMB > 10 
      ? Math.min(request.ga_population_size || 10, 10) 
      : (request.ga_population_size || 15);
    
    formData.append('ga_generations', optimizedGenerations.toString());
    formData.append('ga_population_size', optimizedPopulation.toString());
    
    if (coverImageSizeMB > 10) {
      toast.info('Large file detected. Using optimized processing parameters for faster results.');
    }

    // Always use direct backend for large files to avoid Vercel timeout
    const directBackend = (import.meta as any).env?.VITE_PROCESSING_ENGINE_URL;
    const useDirect = coverImageSizeMB > 5 || audioFileSizeMB > 5;
    
    let response: EmbeddingResponse;
    
    if (useDirect && directBackend) {
      console.log('Using direct backend connection for large files');
      try {
        const axios = (await import('axios')).default;
        const resp = await axios.post(`${directBackend}${API_ENDPOINTS.EMBED}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 15 * 60 * 1000, // 15 minutes for large file processing
          onUploadProgress: (progressEvent: any) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
        });
        response = resp.data as EmbeddingResponse;
      } catch (err: any) {
        console.error('Embedding error:', err);
        if (err.code === 'ECONNABORTED') {
          throw new Error('Processing timeout. The backend service may need more resources for this file size.');
        } else if (err.response?.status === 502) {
          throw new Error('Backend service temporarily unavailable (502). Please wait a moment and try again.');
        } else if (err.response?.status === 504) {
          throw new Error('Processing timeout (504). Try with a smaller file or reduced GA parameters.');
        }
        throw err;
      }
    } else {
      // Use Vercel proxy for smaller files
      try {
        response = await apiService.post<EmbeddingResponse>(API_ENDPOINTS.EMBED, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 5 * 60 * 1000, // 5 minutes timeout
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
        const shouldFallback = [502, 504, 413, 408].includes(status) || !err?.response;

        if (shouldFallback && directBackend) {
          try {
            toast.info('Retrying with direct connection...');
            const axios = (await import('axios')).default;
            const resp = await axios.post(`${directBackend}${API_ENDPOINTS.EMBED}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 15 * 60 * 1000, // 15 minutes for retry
              onUploadProgress: (progressEvent: any) => {
                if (onProgress && progressEvent.total) {
                  const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  onProgress(progress);
                }
              },
            });
            toast.success('Connected directly to backend');
            response = resp.data as EmbeddingResponse;
          } catch (err2: any) {
            console.error('Direct backend fallback also failed', err2);
            if (err2.code === 'ECONNABORTED') {
              throw new Error('Processing timeout. The file may be too large or the service is under heavy load.');
            }
            throw err2;
          }
        } else {
          throw err;
        }
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
