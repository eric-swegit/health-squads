
import { useState } from 'react';
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { usePhotoUpload } from './usePhotoUpload';

export const useActivityClaim = (
  user: { id: string } | null,
  claimedToday: string[],
  progressiveActivities: Record<string, {
    currentProgress: number;
    maxProgress: number;
    photoUrls: string[];
  }>,
  saveClaimedActivity: (activity: Activity, photoUrl?: string) => Promise<boolean>,
  refreshData: () => void
) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { openFileUploader } = usePhotoUpload(user?.id);

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
    
    openFileUploader(activity, async (photoUrl) => {
      if (photoUrl) {
        try {
          console.log(`Processing activity: ${activity.name}`);
          console.log(`Is progressive: ${isProgressiveActivity}, current progress: ${currentProgress}, max progress: ${maxProgress}`);
          
          if (isProgressiveActivity) {
            // For progressive activities with photos, we need to handle progress tracking
            console.log(`Handling progressive activity with photo: ${activity.name}`);
            
            // Call saveClaimedActivity which handles the progressive logic internally
            const success = await saveClaimedActivity(activity, photoUrl);
            
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
            await saveClaimedActivity(activity, photoUrl);
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

  return {
    selectedActivity,
    setSelectedActivity,
    confirmOpen,
    setConfirmOpen,
    handleClaim,
    handleConfirmClaim
  };
};
