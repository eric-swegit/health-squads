
import { Activity } from '@/types';
import { useEnhancedPhotoUpload } from './useEnhancedPhotoUpload';

// Legacy hook - redirects to enhanced version for backward compatibility
export const usePhotoUpload = (userId: string | undefined) => {
  return useEnhancedPhotoUpload(userId);
};
