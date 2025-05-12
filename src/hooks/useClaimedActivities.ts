
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { Activity, ClaimedActivity } from '@/types';
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

  useEffect(() => {
    const fetchClaimedActivities = async () => {
      if (!user) {
        setClaimedToday([]);
        setProgressiveActivities({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Fetch fully claimed activities
        const { data: claimedData, error: fetchError } = await supabase
          .from('claimed_activities')
          .select('activity_id')
          .eq('user_id', user.id)
          .eq('date', today);

        if (fetchError) throw fetchError;
        
        // Fetch in-progress activities
        const { data: progressData, error: progressError } = await supabase
          .from('progress_tracking')
          .select('*')
          .eq('user_id', user.id);
          
        if (progressError) throw progressError;
        
        // Set fully claimed activities
        setClaimedToday(claimedData ? claimedData.map(item => item.activity_id) : []);
        
        // Set in-progress activities
        const progressMap: Record<string, {
          currentProgress: number;
          maxProgress: number;
          photoUrls: string[];
        }> = {};
        
        if (progressData) {
          progressData.forEach(item => {
            progressMap[item.activity_id] = {
              currentProgress: item.current_progress,
              maxProgress: item.max_progress,
              photoUrls: item.photo_urls || []
            };
          });
        }
        
        setProgressiveActivities(progressMap);
      } catch (error: any) {
        console.error("Error fetching claimed activities:", error);
        setError(`Kunde inte hämta genomförda aktiviteter: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimedActivities();
  }, [user, refreshTrigger, undoInProgress]);

  const saveClaimedActivity = async (activity: Activity, photoUrl?: string) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att claima aktiviteter");
      return false;
    }

    try {
      // Handle progressive activities
      if (activity.progressive && activity.progress_steps && activity.progress_steps > 1) {
        return await handleProgressiveActivity(activity, photoUrl);
      }
      
      // Handle regular activities
      const { error } = await supabase
        .from('claimed_activities')
        .insert({
          user_id: user.id,
          activity_id: activity.id,
          photo_url: photoUrl || null
        });

      if (error) throw error;

      // Optimistically update the local state
      setClaimedToday(prev => [...prev, activity.id]);
      
      toast.success(`Du har klarat av "${activity.name}"! +${activity.points} poäng`);
      return true;
    } catch (error: any) {
      console.error("Error saving claimed activity:", error);
      toast.error(`Kunde inte spara aktivitet: ${error.message}`);
      return false;
    }
  };
  
  // Updated function to handle progressive activities
  const handleProgressiveActivity = async (activity: Activity, photoUrl?: string) => {
    if (!user || !activity.progressive || !activity.progress_steps) {
      return false;
    }
    
    const today = new Date().toISOString();
    
    try {
      // Get current progress for this activity, if it exists
      const activityProgress = progressiveActivities[activity.id];
      
      // If this is the first step or activity doesn't exist in progress tracking yet
      if (!activityProgress) {
        console.log(`Starting new progressive activity: ${activity.name} (Step 1/${activity.progress_steps})`);
        
        // Initialize new progress tracking for first step
        const photoUrls = photoUrl ? [photoUrl] : [];
        const progressTimestamps = [today]; // Add timestamp for first step
        
        const { error } = await supabase
          .from('progress_tracking')
          .insert({
            user_id: user.id,
            activity_id: activity.id,
            current_progress: 1, // Start at 1 for first step
            max_progress: activity.progress_steps,
            photo_urls: photoUrls,
            progress_timestamps: progressTimestamps,
            created_at: today,
            last_updated_at: today
          });
        
        if (error) throw error;
        
        // Update local state
        setProgressiveActivities(prev => ({
          ...prev,
          [activity.id]: {
            currentProgress: 1,
            maxProgress: activity.progress_steps,
            photoUrls: photoUrls
          }
        }));
        
        toast.success(`Steg 1/${activity.progress_steps} klart för "${activity.name}"!`);
        return true;
      }
      
      // For subsequent steps
      const currentProgress = activityProgress.currentProgress;
      const maxProgress = activityProgress.maxProgress;
      
      // Make sure we haven't already completed all steps
      if (currentProgress >= maxProgress) {
        toast.info(`Du har redan klarat alla steg för "${activity.name}"`);
        return false;
      }
      
      // Prepare for the next step
      const newProgress = currentProgress + 1;
      const photoUrls = [...activityProgress.photoUrls];
      
      if (photoUrl) {
        photoUrls.push(photoUrl);
      }
      
      // Update progress timestamps, maintaining existing ones
      let progressTimestamps = [];
      
      // Get existing timestamps from the database directly to ensure accuracy
      const { data: progressData, error: fetchError } = await supabase
        .from('progress_tracking')
        .select('progress_timestamps')
        .eq('user_id', user.id)
        .eq('activity_id', activity.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (progressData && progressData.progress_timestamps) {
        progressTimestamps = [...progressData.progress_timestamps];
      }
      
      // Add new timestamp for current step
      progressTimestamps.push(today);
      
      console.log(`Updating progressive activity: ${activity.name} (Step ${newProgress}/${maxProgress})`);
      console.log('Photo URLs:', photoUrls);
      console.log('Progress timestamps:', progressTimestamps);
      
      if (newProgress < maxProgress) {
        // Activity still in progress - update progress
        const { error } = await supabase
          .from('progress_tracking')
          .update({
            current_progress: newProgress,
            photo_urls: photoUrls,
            progress_timestamps: progressTimestamps,
            last_updated_at: today
          })
          .eq('user_id', user.id)
          .eq('activity_id', activity.id);
        
        if (error) throw error;
        
        // Update local state
        setProgressiveActivities(prev => ({
          ...prev,
          [activity.id]: {
            currentProgress: newProgress,
            maxProgress: maxProgress,
            photoUrls: photoUrls
          }
        }));
        
        toast.success(`Steg ${newProgress}/${maxProgress} klart för "${activity.name}"!`);
        return true;
      } else {
        // Final step reached - complete the activity
        console.log(`Completing progressive activity: ${activity.name}`);
        
        // First mark activity as completed
        const { error: claimError } = await supabase
          .from('claimed_activities')
          .insert({
            user_id: user.id,
            activity_id: activity.id,
            photo_url: photoUrls[0] || null, // Set first photo as main photo
            photo_urls: photoUrls // Store all photos
          });
        
        if (claimError) throw claimError;
        
        // Then delete progress tracking record
        const { error: deleteError } = await supabase
          .from('progress_tracking')
          .delete()
          .eq('user_id', user.id)
          .eq('activity_id', activity.id);
        
        if (deleteError) throw deleteError;
        
        // Update local state
        setClaimedToday(prev => [...prev, activity.id]);
        setProgressiveActivities(prev => {
          const updated = { ...prev };
          delete updated[activity.id];
          return updated;
        });
        
        toast.success(`Du har klarat av "${activity.name}"! +${activity.points} poäng`);
        return true;
      }
    } catch (error: any) {
      console.error("Error handling progressive activity:", error);
      toast.error(`Kunde inte uppdatera aktiviteten: ${error.message}`);
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
        return await undoProgressiveActivity(activityId, activityProgress);
      }
      
      // Handle regular activity undo
      // Optimistically update the local state first
      setClaimedToday(prev => prev.filter(id => id !== activityId));
      
      // Show a pending toast
      const pendingToast = toast.loading("Tar bort aktivitet...");
      
      console.log(`Attempting to delete activity: ${activityId} for user: ${user.id}`);
      
      // Get today's date in YYYY-MM-DD format for the match criteria
      const today = new Date().toISOString().split('T')[0];
      
      // Include the date in the match criteria to only delete today's entry
      const { error, count } = await supabase
        .from('claimed_activities')
        .delete({ count: 'exact' })
        .match({ 
          user_id: user.id, 
          activity_id: activityId,
          date: today // Added this to only delete the current day's entry
        });

      if (error) throw error;
      
      console.log(`Deletion result: ${count} rows affected`);
      
      if (count === 0) {
        throw new Error("Ingen aktivitet hittades att ta bort");
      }
      
      // Dismiss the pending toast and show success
      toast.dismiss(pendingToast);
      toast.success("Aktivitet borttagen");
      
      // Reduced back to 500ms as requested by the user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error: any) {
      console.error("Error removing claimed activity:", error);
      
      // Revert the optimistic update on error
      await fetchCurrentClaimedActivities();
      
      toast.error(`Kunde inte ta bort aktivitet: ${error.message}`);
      return false;
    } finally {
      setUndoInProgress(null);
    }
  };
  
  // New function to handle undo for progressive activities
  const undoProgressiveActivity = async (activityId: string, activityProgress: {
    currentProgress: number;
    maxProgress: number;
    photoUrls: string[];
  }) => {
    try {
      // Optimistically update the local state
      const newPhotoUrls = [...activityProgress.photoUrls];
      const newProgress = activityProgress.currentProgress - 1;
      
      if (newPhotoUrls.length > 0) {
        newPhotoUrls.pop(); // Remove the last photo
      }
      
      if (newProgress <= 0) {
        // If no steps remain, delete the progress tracking record
        const { error } = await supabase
          .from('progress_tracking')
          .delete()
          .match({ user_id: user!.id, activity_id: activityId });
          
        if (error) throw error;
        
        // Update local state
        setProgressiveActivities(prev => {
          const updated = { ...prev };
          delete updated[activityId];
          return updated;
        });
        
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
          .match({ user_id: user!.id, activity_id: activityId });
          
        if (error) throw error;
        
        // Update local state
        setProgressiveActivities(prev => ({
          ...prev,
          [activityId]: {
            ...prev[activityId],
            currentProgress: newProgress,
            photoUrls: newPhotoUrls
          }
        }));
        
        toast.success(`Steg ${newProgress + 1}/${activityProgress.maxProgress} har ångrats`);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error removing progressive step:", error);
      toast.error(`Kunde inte ångra steg: ${error.message}`);
      return false;
    }
  };
  
  // Helper function to re-fetch current claimed activities on error
  const fetchCurrentClaimedActivities = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('claimed_activities')
        .select('activity_id')
        .eq('user_id', user.id)
        .eq('date', today);
        
      if (data) {
        setClaimedToday(data.map(item => item.activity_id));
      }
      
      // Fetch in-progress activities
      const { data: progressData } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', user.id);
        
      if (progressData) {
        const progressMap: Record<string, {
          currentProgress: number;
          maxProgress: number;
          photoUrls: string[];
        }> = {};
        
        progressData.forEach(item => {
          progressMap[item.activity_id] = {
            currentProgress: item.current_progress,
            maxProgress: item.max_progress,
            photoUrls: item.photo_urls || []
          };
        });
        
        setProgressiveActivities(progressMap);
      }
    } catch (err) {
      console.error("Error refreshing claimed activities:", err);
    }
  };

  return {
    claimedToday,
    progressiveActivities,
    saveClaimedActivity,
    undoClaimActivity,
    loading,
    error
  };
};
