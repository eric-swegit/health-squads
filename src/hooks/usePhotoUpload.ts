
import { useState } from 'react';
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';

export const usePhotoUpload = (userId: string | undefined) => {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (file: File, activity: Activity): Promise<string | null> => {
    if (!userId) {
      toast.error("Du måste vara inloggad för att ladda upp foton");
      return null;
    }
    
    try {
      setUploading(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${activity.id}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('activity-photos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('activity-photos')
        .getPublicUrl(fileName);
        
      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(`Uppladdning misslyckades: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const openFileUploader = (activity: Activity, onPhotoSelected: (photoUrl: string | null) => void) => {
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

  return {
    uploading,
    uploadPhoto,
    openFileUploader
  };
};
