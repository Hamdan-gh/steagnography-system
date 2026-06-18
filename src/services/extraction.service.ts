import { apiService } from './api';
import { ExtractionRequest, ExtractionResponse } from '@/types';
import { API_ENDPOINTS } from '@/constants';
import { databaseService } from './database.service';
import { storageService } from './storage.service';
import { getCurrentUser } from '@/lib/supabase';
import { resolveMediaUrl } from '@/utils/urls';
import { toast } from 'sonner';

export class ExtractionService {
  private async uploadAudioToStorageAndSync(
    logId: string,
    userId: string,
    response: ExtractionResponse
  ): Promise<void> {
    try {
      const audioBlob = await fetch(
        `data:audio/wav;base64,${response.audio_base64}`
      ).then((r) => r.blob());
      const audioFile = new File([audioBlob], response.audio_name || 'extracted.wav', {
        type: 'audio/wav',
      });
      const audioUrl = await storageService.uploadAudio(audioFile, userId);
      await databaseService.updateExtractionLog(logId, { audio_url: audioUrl });
    } catch (error) {
      console.error('Error syncing extracted audio to storage:', error);
    }
  }

  private async logExtractionSuccess(
    request: ExtractionRequest,
    response: ExtractionResponse
  ): Promise<void> {
    const { user } = await getCurrentUser();
    if (!user) return;

    await databaseService.ensureUserProfile(
      user.id,
      user.email!,
      user.user_metadata?.full_name
    );

    const audioUrl = resolveMediaUrl(response.audio_url) || response.audio_url;

    const created = await databaseService.createExtractionLog({
      user_id: user.id,
      stego_image_name: request.stego_image.name,
      audio_name: response.audio_name,
      audio_url: audioUrl,
      extracted_audio_size: response.audio_size,
      original_audio_size: response.audio_size,
      extraction_time: response.execution_time,
      status: 'success',
    });

    toast.success('Extraction saved to your history!');

    if (response.audio_base64) {
      void this.uploadAudioToStorageAndSync(created.id, user.id, response);
    }
  }

  private async logExtractionFailure(request: ExtractionRequest, error: unknown): Promise<void> {
    const { user } = await getCurrentUser();
    if (!user) return;

    await databaseService.ensureUserProfile(
      user.id,
      user.email!,
      user.user_metadata?.full_name
    );

    const err = error as { response?: { data?: { error?: string } }; message?: string };

    await databaseService.createExtractionLog({
      user_id: user.id,
      stego_image_name: request.stego_image.name,
      extracted_audio_size: 0,
      extraction_time: 0,
      status: 'failed',
      error_message: err.response?.data?.error || err.message || 'Extraction failed',
    });
  }

  async extractAudio(
    request: ExtractionRequest,
    onProgress?: (progress: number) => void
  ): Promise<ExtractionResponse> {
    try {
      const formData = new FormData();
      formData.append('stego_image', request.stego_image);
      formData.append('encryption_key', request.encryption_key);

      const response = await apiService.post<ExtractionResponse>(API_ENDPOINTS.EXTRACT, formData, {
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

      try {
        await this.logExtractionSuccess(request, response);
      } catch (saveError) {
        console.error('Error saving extraction to history:', saveError);
        const err = saveError as { code?: string; message?: string };
        if (err?.code === 'PGRST204') {
          toast.error('Database schema outdated. Run supabase_extraction_history.sql in Supabase SQL Editor.');
        } else {
          toast.warning('Extraction completed but could not save to history');
        }
      }

      return response;
    } catch (error: unknown) {
      try {
        await this.logExtractionFailure(request, error);
      } catch (logError) {
        console.error('Error logging failed extraction:', logError);
      }

      throw error;
    }
  }
}

export const extractionService = new ExtractionService();
