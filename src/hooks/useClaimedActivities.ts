
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { Activity } from '@/types';
import { useProgressiveActivity } from './useProgressiveActivity';
import { 
  fetchClaimedActivities, 
  fetchProgressiveActivities, 
  saveRegularActivity, 
  removeClaimedActivity 
} from './useActivityOperations';
import { supabase } from '@/integrations/supabase/client';

export const useClaimedActivities = (user: { id: string } | null, refreshTrigger: number) => {
  const [claimedToday, setClaimedToday] = useState<string[]>([]);
  const [progressiveActivities, setProgressiveActivities] = useState<Record<string, {
    currentProgress: number;
    maxProgress: number;
    photoUrls: string[];
  }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [undoInProgress, setUndoInProgress] = useState<string | null>(null);
  
  const { handleProgressiveActivity, undoProgressiveActivity, resetProgressiveActivity } = useProgressiveActivity();

  useEffect(() => {
    const loadActivitiesData = async () => {
      if (!user) {
        setClaimedToday([]);
        setProgressiveActivities({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch claimed activities
        const claimed = await fetchClaimedActivities(user.id);
        setClaimedToday(claimed);
        
        // Fetch progressive activities
        const progressMap = await fetchProgressiveActivities(user.id);
        setProgressiveActivities(progressMap);
      } catch (error: any) {
        console.error("Error fetching activities:", error);
        setError(`Kunde inte hämta genomförda aktiviteter: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadActivitiesData();
  }, [user, refreshTrigger, undoInProgress]);

  const saveClaimedActivity = async (activity: Activity, photoUrl?: string, metadata?: any) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att claima aktiviteter");
      return false;
    }

    try {
      // Debug log for activity properties
      console.log("saveClaimedActivity called with:", {
        activityId: activity.id,
        activityName: activity.name,
        progressive: activity.progressive,
        progress_steps: activity.progress_steps,
        photoUrl: photoUrl ? "provided" : "not provided"
      });
      
      // Handle progressive activities
      if (activity.progressive && activity.progress_steps && activity.progress_steps > 1) {
        console.log("Detected progressive activity, handling with progress tracking");
        
        const activityProgress = progressiveActivities[activity.id];
        const currentProgress = activityProgress?.currentProgress || 0;
        const currentPhotoUrls = activityProgress?.photoUrls || [];
        
        return await handleProgressiveActivity(
          user.id, 
          activity, 
          photoUrl, 
          currentProgress, 
          currentPhotoUrls
        );
      }
      
      // Handle regular activities
      console.log("Handling regular (non-progressive) activity");
      return await saveRegularActivity(user.id, activity, photoUrl, metadata);
    } catch (error: any) {
      console.error("Error saving claimed activity:", error);
      toast.error(`Kunde inte spara aktivitet: ${error.message}`);
      return false;
    }
  };

  const undoClaimActivity = async (activityId: string) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att ta bort en aktivitet");
      return false;
    }

    try {
      // Set the activity as being processed
      setUndoInProgress(activityId);
      
      // Check if activity is progressive and in progress
      const activityProgress = progressiveActivities[activityId];
      
      if (activityProgress && activityProgress.currentProgress > 0) {
        // Handle undo for progressive activity
        return await undoProgressiveActivity(user.id, activityId, activityProgress);
      }
      
      // Handle regular activity undo
      // Optimistically update the local state first
      setClaimedToday(prev => prev.filter(id => id !== activityId));
      
      // Show a pending toast
      const pendingToast = toast.loading("Tar bort aktivitet...");
      
      try {
        await removeClaimedActivity(user.id, activityId);
        
        // Dismiss the pending toast
        toast.dismiss(pendingToast);
        
        // Reduced back to 500ms as requested by the user
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return true;
      } catch (error: any) {
        // Revert the optimistic update on error
        await fetchCurrentClaimedActivities();
        
        toast.dismiss(pendingToast);
        toast.error(`Kunde inte ta bort aktivitet: ${error.message}`);
        return false;
      }
    } catch (error: any) {
      console.error("Error removing claimed activity:", error);
      toast.error(`Kunde inte ta bort aktivitet: ${error.message}`);
      return false;
    } finally {
      setUndoInProgress(null);
    }
  };
  
  // Helper function to re-fetch current claimed activities on error
  const fetchCurrentClaimedActivities = async () => {
    if (!user) return;
    
    try {
      // Fetch claimed activities
      const claimed = await fetchClaimedActivities(user.id);
      setClaimedToday(claimed);
      
      // Fetch progressive activities
      const progressMap = await fetchProgressiveActivities(user.id);
      setProgressiveActivities(progressMap);
    } catch (err) {
      console.error("Error refreshing claimed activities:", err);
    }
  };

  const resetProgressActivity = async (activityId: string) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att återställa en aktivitet");
      return false;
    }

    try {
      setUndoInProgress(activityId);
      const result = await resetProgressiveActivity(user.id, activityId);
      return result;
    } catch (error: any) {
      console.error("Error resetting progressive activity:", error);
      toast.error(`Kunde inte återställa aktivitet: ${error.message}`);
      return false;
    } finally {
      setUndoInProgress(null);
    }
  };

  return {
    claimedToday,
    progressiveActivities,
    saveClaimedActivity,
    undoClaimActivity,
    resetProgressActivity,
    loading,
    error
  };
};
