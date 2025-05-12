
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/types';

// Function to initialize a new progressive activity
export const initializeProgressTracking = async (
  userId: string,
  activity: Activity,
  photoUrl?: string
) => {
  console.log(`Starting new progressive activity: ${activity.name} (Step 1/${activity.progress_steps})`);
  
  const today = new Date().toISOString();
  const photoUrls = photoUrl ? [photoUrl] : [];
  const progressTimestamps = [today]; // Add timestamp for first step
  
  try {
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
  } catch (error: any) {
    console.error("Error initializing progress tracking:", error);
    throw error;
  }
};

// Function to update an existing progressive activity
export const updateProgressTracking = async (
  userId: string,
  activity: Activity,
  currentProgress: number,
  photoUrl?: string
) => {
  try {
    const today = new Date().toISOString();
    const maxProgress = activity.progress_steps || 1;
    
    // Make sure we haven't already completed all steps
    if (currentProgress >= maxProgress) {
      console.log("All steps already completed, cannot progress further");
      return false;
    }
    
    // Get existing timestamps and photos
    const { data: progressData, error: fetchError } = await supabase
      .from('progress_tracking')
      .select('progress_timestamps, photo_urls')
      .eq('user_id', userId)
      .eq('activity_id', activity.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Prepare updated data
    const newProgress = currentProgress + 1;
    const photoUrls = [...(progressData?.photo_urls || [])];
    const progressTimestamps = [...(progressData?.progress_timestamps || [])];
    
    if (photoUrl) {
      photoUrls.push(photoUrl);
    }
    
    // Add new timestamp
    progressTimestamps.push(today);
    
    console.log(`Updating progressive activity: ${activity.name} (Step ${newProgress}/${maxProgress})`);
    
    // Update progress tracking
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
    return { 
      success: true, 
      completed: newProgress >= maxProgress,
      photoUrls
    };
  } catch (error: any) {
    console.error("Error updating progress tracking:", error);
    throw error;
  }
};

// Function to complete a progressive activity
export const completeProgressiveActivity = async (
  userId: string,
  activity: Activity,
  photoUrls: string[]
) => {
  try {
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
  } catch (error: any) {
    console.error("Error completing progressive activity:", error);
    throw error;
  }
};
