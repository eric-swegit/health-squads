
import { useState } from 'react';
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';

export const useProgressiveActivity = () => {
  const handleProgressiveActivity = async (
    userId: string | undefined,
    activity: Activity,
    photoUrl?: string,
    currentProgress = 0,
    currentPhotoUrls: string[] = []
  ) => {
    if (!userId || !activity.progressive || !activity.progress_steps) {
      console.log("Invalid progressive activity data:", { user: !!userId, progressive: activity.progressive, steps: activity.progress_steps });
      return false;
    }
    
    const today = new Date().toISOString();
    
    try {
      // If this is the first step or activity doesn't exist in progress tracking yet
      if (currentProgress === 0) {
        console.log(`Starting new progressive activity: ${activity.name} (Step 1/${activity.progress_steps})`);
        
        // Initialize new progress tracking for first step
        const photoUrls = photoUrl ? [photoUrl] : [];
        const progressTimestamps = [today]; // Add timestamp for first step
        
        const { error } = await supabase
          .from('progress_tracking')
          .insert({
            user_id: userId,
            activity_id: activity.id,
            current_progress: 1, // Start at 1 for first step
            max_progress: activity.progress_steps,
            photo_urls: photoUrls,
            progress_timestamps: progressTimestamps,
            created_at: today,
            last_updated_at: today
          });
        
        if (error) throw error;
        
        toast.success(`Steg 1/${activity.progress_steps} klart för "${activity.name}"!`);
        return true;
      }
      
      // For subsequent steps
      const maxProgress = activity.progress_steps;
      
      console.log(`Updating progressive activity: ${activity.name}, Current progress: ${currentProgress}/${maxProgress}`);
      
      // Make sure we haven't already completed all steps
      if (currentProgress >= maxProgress) {
        console.log("All steps already completed, cannot progress further");
        toast.info(`Du har redan klarat alla steg för "${activity.name}"`);
        return false;
      }
      
      // Prepare for the next step
      const newProgress = currentProgress + 1;
      const photoUrls = [...currentPhotoUrls];
      
      if (photoUrl) {
        photoUrls.push(photoUrl);
      }
      
      // Update progress timestamps, maintaining existing ones
      let progressTimestamps = [];
      
      // Get existing timestamps from the database directly to ensure accuracy
      const { data: progressData, error: fetchError } = await supabase
        .from('progress_tracking')
        .select('progress_timestamps')
        .eq('user_id', userId)
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
          .eq('user_id', userId)
          .eq('activity_id', activity.id);
        
        if (error) throw error;
        
        toast.success(`Steg ${newProgress}/${maxProgress} klart för "${activity.name}"!`);
        return true;
      } else {
        // Final step reached - complete the activity
        console.log(`Completing progressive activity: ${activity.name}`);
        
        // First mark activity as completed
        const { error: claimError } = await supabase
          .from('claimed_activities')
          .insert({
            user_id: userId,
            activity_id: activity.id,
            photo_url: photoUrls[0] || null, // Set first photo as main photo
            photo_urls: photoUrls // Store all photos
          });
        
        if (claimError) throw claimError;
        
        // Then delete progress tracking record
        const { error: deleteError } = await supabase
          .from('progress_tracking')
          .delete()
          .eq('user_id', userId)
          .eq('activity_id', activity.id);
        
        if (deleteError) throw deleteError;
        
        toast.success(`Du har klarat av "${activity.name}"! +${activity.points} poäng`);
        return true;
      }
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

  return {
    handleProgressiveActivity,
    undoProgressiveActivity
  };
};
