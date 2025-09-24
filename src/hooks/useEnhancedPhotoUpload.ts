import { useState, useCallback } from 'react';
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { compressImage, validateImageFile } from '@/utils/imageCompression';

interface UploadProgress {
  stage: 'validating' | 'compressing' | 'uploading' | 'completed' | 'error';
  progress: number;
  message: string;
}

interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMultiplier: 1.5,
  initialDelay: 1000,
};

export const useEnhancedPhotoUpload = (userId: string | undefined) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const updateProgress = useCallback((stage: UploadProgress['stage'], progress: number, message: string) => {
    setUploadProgress({ stage, progress, message });
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadWithRetry = async (
    fileName: string, 
    fileBlob: Blob, 
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<string> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
          updateProgress('uploading', 0, `Försöker igen om ${Math.round(delay / 1000)} sekunder...`);
          await sleep(delay);
        }

        updateProgress('uploading', 10 + (attempt * 20), 
          attempt === 0 ? 'Laddar upp bild...' : `Försök ${attempt + 1}/${retryConfig.maxRetries + 1}`);

        const { data, error } = await supabase.storage
          .from('activity-photos')
          .upload(fileName, fileBlob, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('activity-photos')
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      } catch (error: any) {
        lastError = error;
        console.error(`Upload attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on certain errors
        if (error.message?.includes('already exists') || 
            error.message?.includes('unauthorized') ||
            error.message?.includes('forbidden')) {
          throw error;
        }
      }
    }

    throw lastError || new Error('Upload failed after all retries');
  };

  const uploadPhoto = async (file: File, activity: Activity): Promise<string | null> => {
    if (!userId) {
      toast.error("Du måste vara inloggad för att ladda upp foton");
      return null;
    }

    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      setUploading(true);
      updateProgress('validating', 5, 'Validerar bild...');

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || 'Ogiltig bildfil');
        return null;
      }

      updateProgress('compressing', 20, 'Komprimerar bild...');

      // Compress image
      let compressedBlob: Blob;
      try {
        compressedBlob = await compressImage(file, {
          maxWidth: window.innerWidth > 768 ? 1920 : 1080, // Lower res on mobile
          maxHeight: window.innerWidth > 768 ? 1080 : 720,
          quality: 0.8,
          maxSizeKB: 1024
        });
      } catch (compressionError) {
        console.warn('Image compression failed, using original:', compressionError);
        compressedBlob = file;
      }

      const finalSizeKB = Math.round(compressedBlob.size / 1024);
      updateProgress('compressing', 50, `Komprimering klar (${finalSizeKB} KB)`);

      // Generate filename
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}/${activity.id}_${Date.now()}.${fileExt}`;

      // Upload with retry logic
      const publicUrl = await uploadWithRetry(fileName, compressedBlob);
      
      updateProgress('completed', 100, 'Uppladdning slutförd!');
      
      toast.success(`Bild uppladdad (${finalSizeKB} KB)`);
      return publicUrl;

    } catch (error: any) {
      console.error("Error uploading photo:", error);
      updateProgress('error', 0, 'Uppladdning misslyckades');
      
      let errorMessage = 'Uppladdning misslyckades';
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Nätverksfel - kontrollera din anslutning';
      } else if (error.message?.includes('size') || error.message?.includes('large')) {
        errorMessage = 'Bilden är för stor';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Uppladdningen tog för lång tid';
      } else if (error.message) {
        errorMessage = `Fel: ${error.message}`;
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setUploading(false);
      setAbortController(null);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress(null), 3000);
    }
  };

  const openFileUploader = (
    activity: Activity, 
    onPhotoSelected: (photoUrl: string | null) => void
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const photoUrl = await uploadPhoto(file, activity);
        onPhotoSelected(photoUrl);
      }
    };
    input.click();
  };

  const cancelUpload = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setUploading(false);
      setUploadProgress(null);
      setAbortController(null);
      toast.info('Uppladdning avbruten');
    }
  }, [abortController]);

  return {
    uploading,
    uploadProgress,
    uploadPhoto,
    openFileUploader,
    cancelUpload
  };
};