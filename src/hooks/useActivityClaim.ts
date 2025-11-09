
import { useState } from 'react';
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { useEnhancedPhotoUpload } from './useEnhancedPhotoUpload';
import { supabase } from '@/integrations/supabase/client';

const GRATITUDE_ACTIVITY_NAME = "Skriv ner 3 saker du är tacksam för idag";

export const useActivityClaim = (
  user: { id: string } | null,
  claimedToday: string[],
  progressiveActivities: Record<string, {
    currentProgress: number;
    maxProgress: number;
    photoUrls: string[];
  }>,
  saveClaimedActivity: (activity: Activity, photoUrl?: string, metadata?: any) => Promise<boolean>,
  refreshData: () => void
) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gratitudeFormOpen, setGratitudeFormOpen] = useState(false);
  const { openFileUploader, uploading, uploadProgress } = useEnhancedPhotoUpload(user?.id);

  const handleClaim = async (activity: Activity) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att claima aktiviteter");
      return;
    }

    if (claimedToday.includes(activity.id)) {
      toast.error("Du har redan claimat denna aktivitet idag");
      return;
    }

    setSelectedActivity(activity);

    // Check if this is the gratitude activity
    const isGratitudeActivity = activity.name === GRATITUDE_ACTIVITY_NAME;
    if (isGratitudeActivity) {
      setGratitudeFormOpen(true);
      return;
    }

    // Debug the activity properties
    console.log(`Claiming activity:`, JSON.stringify(activity, null, 2));
    
    // Check if this is a progressive activity
    const isProgressiveActivity = activity.progressive && activity.progress_steps && activity.progress_steps > 1;
    const currentProgress = progressiveActivities[activity.id]?.currentProgress || 0;
    const maxProgress = activity.progress_steps || 1;
    
    console.log(`Is progressive: ${isProgressiveActivity}, progress: ${currentProgress}/${maxProgress}`);
    
    // For activities that require photos
    if (activity.requiresPhoto) {
      handlePhotoRequiredActivity(activity);
    } else {
      // Open confirmation dialog for activities without photo requirement
      setConfirmOpen(true);
    }
  };

  const handlePhotoRequiredActivity = (activity: Activity) => {
    // Check if this is a progressive activity
    const isProgressiveActivity = activity.progressive && activity.progress_steps && activity.progress_steps > 1;
    const currentProgress = progressiveActivities[activity.id]?.currentProgress || 0;
    const maxProgress = activity.progress_steps || 1;
    
    openFileUploader(activity, async (photoUrl, metadata) => {
      if (photoUrl) {
        try {
          console.log(`Processing activity: ${activity.name}`);
          console.log(`Is progressive: ${isProgressiveActivity}, current progress: ${currentProgress}, max progress: ${maxProgress}`);
          
          if (isProgressiveActivity) {
            // For progressive activities with photos, we need to handle progress tracking
            console.log(`Handling progressive activity with photo: ${activity.name}`);
            
            // Call saveClaimedActivity which handles the progressive logic internally
            const success = await saveClaimedActivity(activity, photoUrl, metadata);
            
            if (success) {
              // Calculate the new progress after this claim
              const newProgress = currentProgress + 1;
              
              // Show appropriate message based on progress
              if (newProgress < maxProgress) {
                toast.success(`Steg ${newProgress}/${maxProgress} klart! Fortsätt så.`);
              } else {
                toast.success(`Du har klarat av "${activity.name}"! +${activity.points} poäng`);
              }
              
              // Refresh data to update the UI
              refreshData();
            }
          } else {
            // For regular (non-progressive) activities with photo
            await saveClaimedActivity(activity, photoUrl, metadata);
            toast.success(`Du har klarat av "${activity.name}"! +${activity.points} poäng`);
            refreshData();
          }
        } catch (error: any) {
          console.error("Error handling activity with photo:", error);
          toast.error(`Uppladdning misslyckades: ${error.message}`);
        }
      }
    });
  };

  const handleConfirmClaim = async () => {
    if (selectedActivity) {
      const success = await saveClaimedActivity(selectedActivity);
      if (success) {
        setConfirmOpen(false);
        refreshData();
      }
    }
  };

  const handleGratitudeSubmit = async (gratitudes: [string, string, string]) => {
    if (!selectedActivity || !user) return;
    
    try {
      const success = await saveClaimedActivity(selectedActivity);
      
      if (success) {
        const { data: claimedActivity } = await supabase
          .from('claimed_activities')
          .select('id')
          .eq('user_id', user.id)
          .eq('activity_id', selectedActivity.id)
          .eq('date', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (claimedActivity) {
          await supabase
            .from('gratitude_entries')
            .insert({
              user_id: user.id,
              claimed_activity_id: claimedActivity.id,
              gratitude_1: gratitudes[0],
              gratitude_2: gratitudes[1],
              gratitude_3: gratitudes[2]
            });
          
          toast.success(`Du har klarat av "${selectedActivity.name}"! +${selectedActivity.points} poäng`);
          refreshData();
        }
      }
    } catch (error) {
      console.error("Error saving gratitude:", error);
      toast.error("Kunde inte spara dina svar. Försök igen.");
    }
  };

  return {
    selectedActivity,
    setSelectedActivity,
    confirmOpen,
    setConfirmOpen,
    gratitudeFormOpen,
    setGratitudeFormOpen,
    handleClaim,
    handleConfirmClaim,
    handleGratitudeSubmit,
    uploading,
    uploadProgress
  };
};
