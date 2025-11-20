
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/types';
import { 
  initializeProgressTracking, 
  updateProgressTracking, 
  completeProgressiveActivity 
} from './useProgressTracking';

export const useProgressiveActivity = () => {
  const handleProgressiveActivity = async (
    userId: string | undefined,
    activity: Activity,
    photoUrl?: string,
    currentProgress = 0,
    currentPhotoUrls: string[] = []
  ) => {
    if (!userId || !activity.progressive || !activity.progress_steps) {
      console.log("Invalid progressive activity data:", { 
        user: !!userId, 
        progressive: activity.progressive, 
        steps: activity.progress_steps 
      });
      return false;
    }
    
    try {
      // If this is the first step or activity doesn't exist in progress tracking yet
      if (currentProgress === 0) {
        return await initializeProgressTracking(userId, activity, photoUrl);
      }
      
      // For subsequent steps
      const result = await updateProgressTracking(userId, activity, currentProgress, photoUrl);
      
      if (result && typeof result !== 'boolean' && result.completed) {
        // Final step reached - complete the activity
        return await completeProgressiveActivity(userId, activity, result.photoUrls);
      }
      
      return result ? true : false;
      
    } catch (error: any) {
      console.error("Error handling progressive activity:", error);
      toast.error(`Kunde inte uppdatera aktiviteten: ${error.message}`);
      return false;
    }
  };

  const undoProgressiveActivity = async (
    userId: string,
    activityId: string,
    activityProgress: {
      currentProgress: number;
      maxProgress: number;
      photoUrls: string[];
    }
  ) => {
    try {
      // Prepare for undo
      const newProgress = activityProgress.currentProgress - 1;
      const newPhotoUrls = [...activityProgress.photoUrls];
      
      if (newPhotoUrls.length > 0) {
        newPhotoUrls.pop(); // Remove the last photo
      }
      
      if (newProgress <= 0) {
        // If no steps remain, delete the progress tracking record
        const { error } = await supabase
          .from('progress_tracking')
          .delete()
          .match({ user_id: userId, activity_id: activityId });
          
        if (error) throw error;
        
        toast.success("Aktivitetens framsteg har återställts");
      } else {
        // Update the progress tracking record with the new progress
        const { error } = await supabase
          .from('progress_tracking')
          .update({
            current_progress: newProgress,
            photo_urls: newPhotoUrls,
            last_updated_at: new Date().toISOString()
          })
          .match({ user_id: userId, activity_id: activityId });
          
        if (error) throw error;
        
        toast.success(`Steg ${newProgress + 1}/${activityProgress.maxProgress} har ångrats`);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error removing progressive step:", error);
      toast.error(`Kunde inte ångra steg: ${error.message}`);
      return false;
    }
  };

  const resetProgressiveActivity = async (
    userId: string,
    activityId: string
  ) => {
    try {
      // Delete the entire progress tracking record
      const { error } = await supabase
        .from('progress_tracking')
        .delete()
        .match({ user_id: userId, activity_id: activityId });
        
      if (error) throw error;
      
      toast.success("Aktivitetens framsteg har återställts");
      return true;
    } catch (error: any) {
      console.error("Error resetting progressive activity:", error);
      toast.error(`Kunde inte återställa aktivitet: ${error.message}`);
      return false;
    }
  };

  return {
    handleProgressiveActivity,
    undoProgressiveActivity,
    resetProgressiveActivity
  };
};
