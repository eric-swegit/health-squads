import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { useActivities } from '@/hooks/useActivities';
import { supabase } from '@/integrations/supabase/client'; // Added missing import
import CategorySection from './activities/CategorySection';
import ActivityInfoDialog from './activities/ActivityInfoDialog';
import ActivityConfirmDialog from './activities/ActivityConfirmDialog';
import { activityInfo, groupActivitiesByCategory, getCategoryTitle } from './activities/utils';

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

  const groupedActivities = groupActivitiesByCategory(getActivitiesBySection());

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-2 mb-4">
          <Button 
            variant={activeSection === 'common' ? "default" : "outline"}
            onClick={() => setActiveSection('common')}
            className="flex-1"
          >
            Gemensamma
          </Button>
          <Button 
            variant={activeSection === 'personal' ? "default" : "outline"}
            onClick={() => setActiveSection('personal')}
            className="flex-1"
          >
            Personliga
          </Button>
        </div>

        <CardContent className="p-0">
          {Object.entries(groupedActivities).map(([category, activities]) => (
            <CategorySection
              key={category}
              title={getCategoryTitle(category)}
              activities={activities}
              claimedToday={claimedToday}
              onClaim={handleClaim}
              onInfo={(activity) => {
                setSelectedActivity(activity);
                setInfoOpen(true);
              }}
              onUndo={handleUndoClaim}
            />
          ))}
          
          {activeSection === 'personal' && personalActivities.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              Du har inga personliga aktiviteter än. Kontakta en administratör för att lägga till personliga mål.
            </div>
          )}

          {Object.values(groupedActivities).every(arr => arr.length === 0) && (
            <div className="text-center p-8 text-gray-500">
              Inga aktiviteter hittades i denna kategori.
            </div>
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
