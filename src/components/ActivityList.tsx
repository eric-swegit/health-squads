
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { useActivities } from '@/hooks/useActivities';
import { supabase } from '@/integrations/supabase/client';
import ActivityInfoDialog from './activities/ActivityInfoDialog';
import ActivityConfirmDialog from './activities/ActivityConfirmDialog';
import ActivityFilters from './activities/ActivityFilters';
import ActivityCategories from './activities/ActivityCategories';
import { activityInfo } from './activities/utils';

const ActivityList = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'common' | 'personal'>('common');
  const [undoInProgress, setUndoInProgress] = useState(false);

  const {
    commonActivities,
    personalActivities,
    claimedToday,
    progressiveActivities,
    loading,
    error,
    user,
    saveClaimedActivity,
    undoClaimActivity,
    refreshData
  } = useActivities();

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

    const isProgressiveActivity = activity.progressive && activity.progress_steps && activity.progress_steps > 1;
    const currentProgress = progressiveActivities[activity.id]?.currentProgress || 0;
    const maxProgress = activity.progress_steps || 1;
    
    // For activities that require photos
    if (activity.requiresPhoto) {
      // Open file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${activity.id}_${Date.now()}.${fileExt}`;
            
            const { data, error } = await supabase.storage
              .from('activity-photos')
              .upload(fileName, file);

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('activity-photos')
              .getPublicUrl(fileName);

            // Special handling for progressive activities with photos
            if (isProgressiveActivity) {
              console.log(`Handling progressive activity with photo: ${activity.name}, currentProgress=${currentProgress}, maxProgress=${maxProgress}`);
              // Just pass the photo URL to the handleProgressiveActivity function
              // which will handle creating/updating the progress correctly
              await saveClaimedActivity(activity, urlData.publicUrl);
              
              // Show appropriate message based on progress
              const newProgress = currentProgress + 1;
              if (newProgress < maxProgress) {
                toast.success(`Steg ${newProgress}/${maxProgress} klart! Fortsätt så.`);
              } else {
                toast.success(`Du har klarat av "${activity.name}"! +${activity.points} poäng`);
              }
            } else {
              // For regular (non-progressive) activities with photo
              await saveClaimedActivity(activity, urlData.publicUrl);
              toast.success(`Du har klarat av "${activity.name}"! +${activity.points} poäng`);
            }
            
            // Refresh data after claim regardless of activity type
            refreshData();
          } catch (error: any) {
            console.error("Error handling activity with photo:", error);
            toast.error(`Uppladdning misslyckades: ${error.message}`);
          }
        }
      };
      input.click();
    } else {
      // Open confirmation dialog for activities without photo requirement
      setConfirmOpen(true);
    }
  };

  const handleConfirmClaim = async () => {
    if (selectedActivity) {
      const success = await saveClaimedActivity(selectedActivity);
      if (success) {
        setConfirmOpen(false);
        // Refresh data after claim
        refreshData();
      }
    }
  };

  const handleUndoClaim = async (activityId: string) => {
    if (undoInProgress) {
      toast.info("En annan aktivitet bearbetas redan, vänta lite");
      return;
    }
    
    setUndoInProgress(true);
    try {
      const success = await undoClaimActivity(activityId);
      if (success) {
        // Force a refresh after the undo completes successfully
        setTimeout(() => refreshData(), 500);
      }
    } finally {
      setUndoInProgress(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar aktiviteter...</div>;
  }

  const getActivitiesBySection = () => {
    return activeSection === 'common' ? commonActivities : personalActivities;
  };

  const hasActivities = commonActivities.length > 0 || personalActivities.length > 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <ActivityFilters 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />

        <CardContent className="p-0">
          {error ? (
            <div className="text-center p-8 text-red-500">
              Ett fel uppstod: {error}. Försök igen senare.
            </div>
          ) : (
            <ActivityCategories
              activities={getActivitiesBySection()}
              activeSection={activeSection}
              claimedToday={claimedToday}
              progressiveActivities={progressiveActivities}
              onClaim={handleClaim}
              onInfo={(activity) => {
                setSelectedActivity(activity);
                setInfoOpen(true);
              }}
              onUndo={handleUndoClaim}
            />
          )}
        </CardContent>
      </Card>

      {/* Info Dialog */}
      <ActivityInfoDialog
        open={infoOpen}
        onOpenChange={setInfoOpen}
        activity={selectedActivity}
        activityInfo={activityInfo}
      />

      {/* Confirmation Dialog */}
      <ActivityConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        activity={selectedActivity}
        onConfirm={handleConfirmClaim}
      />
    </div>
  );
};

export default ActivityList;
