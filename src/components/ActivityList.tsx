
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

  const {
    commonActivities,
    personalActivities,
    claimedToday,
    loading,
    user,
    saveClaimedActivity,
    undoClaimActivity
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

            // Save claimed activity with photo URL
            await saveClaimedActivity(activity, urlData.publicUrl);
          } catch (error: any) {
            toast.error(`Uppladdning misslyckades: ${error.message}`);
          }
        }
      };
      input.click();
    } else {
      // Open confirmation dialog
      setConfirmOpen(true);
    }
  };

  const handleConfirmClaim = async () => {
    if (selectedActivity) {
      const success = await saveClaimedActivity(selectedActivity);
      if (success) {
        setConfirmOpen(false);
      }
    }
  };

  const handleUndoClaim = async (activityId: string) => {
    await undoClaimActivity(activityId);
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar aktiviteter...</div>;
  }

  const getActivitiesBySection = () => {
    return activeSection === 'common' ? commonActivities : personalActivities;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <ActivityFilters 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />

        <CardContent className="p-0">
          <ActivityCategories
            activities={getActivitiesBySection()}
            activeSection={activeSection}
            claimedToday={claimedToday}
            onClaim={handleClaim}
            onInfo={(activity) => {
              setSelectedActivity(activity);
              setInfoOpen(true);
            }}
            onUndo={handleUndoClaim}
          />
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
