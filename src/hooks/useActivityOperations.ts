
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/types';

export const fetchClaimedActivities = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Fetch fully claimed activities
    const { data: claimedData, error: fetchError } = await supabase
      .from('claimed_activities')
      .select('activity_id')
      .eq('user_id', userId)
      .eq('date', today);

    if (fetchError) throw fetchError;
    
    return claimedData ? claimedData.map(item => item.activity_id) : [];
  } catch (error: any) {
    console.error("Error fetching claimed activities:", error);
    throw error;
  }
};

export const fetchProgressiveActivities = async (userId: string) => {
  try {
    // Fetch in-progress activities
    const { data: progressData, error: progressError } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('user_id', userId);
      
    if (progressError) throw progressError;
    
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
    
    return progressMap;
  } catch (error: any) {
    console.error("Error fetching progressive activities:", error);
    throw error;
  }
};

export const saveRegularActivity = async (
  userId: string, 
  activity: Activity, 
  photoUrl?: string
) => {
  try {
    console.log("Saving regular activity:", activity.name);
    
    const { error } = await supabase
      .from('claimed_activities')
      .insert({
        user_id: userId,
        activity_id: activity.id,
        photo_url: photoUrl || null
      });

    if (error) throw error;
    
    toast.success(`Du har klarat av "${activity.name}"! +${activity.points} poäng`);
    return true;
  } catch (error: any) {
    console.error("Error saving regular activity:", error);
    toast.error(`Kunde inte spara aktivitet: ${error.message}`);
    return false;
  }
};

export const removeClaimedActivity = async (userId: string, activityId: string) => {
  try {
    // Get today's date in YYYY-MM-DD format for the match criteria
    const today = new Date().toISOString().split('T')[0];
    
    // Include the date in the match criteria to only delete today's entry
    const { error, count } = await supabase
      .from('claimed_activities')
      .delete({ count: 'exact' })
      .match({ 
        user_id: userId, 
        activity_id: activityId,
        date: today // Added this to only delete the current day's entry
      });

    if (error) throw error;
    
    console.log(`Deletion result: ${count} rows affected`);
    
    if (count === 0) {
      throw new Error("Ingen aktivitet hittades att ta bort");
    }
    
    toast.success("Aktivitet borttagen");
    return true;
  } catch (error: any) {
    console.error("Error removing claimed activity:", error);
    throw error;
  }
};
