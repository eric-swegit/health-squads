
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Activity } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

const ActivityList = () => {
  const [activeSection, setActiveSection] = useState<'common' | 'personal'>('common');
  const [commonActivities, setCommonActivities] = useState<Activity[]>([]);
  const [personalActivities, setPersonalActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimedToday, setClaimedToday] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get the current user
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        return session.user;
      }
      return null;
    };

    // Fetch activities
    const fetchActivities = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch common activities
        const { data: commonData, error: commonError } = await supabase
          .from('activities')
          .select('*')
          .eq('type', 'common');

        if (commonError) throw commonError;
        
        // Fetch personal activities for the user
        const { data: personalData, error: personalError } = await supabase
          .from('activities')
          .select('*')
          .eq('type', 'personal')
          .eq('user_id', currentUser.id);

        if (personalError) throw personalError;

        // Fetch claimed activities for today
        const today = new Date().toISOString().split('T')[0];
        const { data: claimedData, error: claimedError } = await supabase
          .from('claimed_activities')
          .select('activity_id')
          .eq('user_id', currentUser.id)
          .eq('date', today);

        if (claimedError) throw claimedError;

        // Map to our Activity type
        setCommonActivities(commonData.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          points: activity.points,
          requiresPhoto: activity.requires_photo,
          type: activity.type
        })));

        setPersonalActivities(personalData.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          points: activity.points,
          requiresPhoto: activity.requires_photo,
          type: activity.type,
          userId: activity.user_id
        })));

        setClaimedToday(claimedData.map((item: any) => item.activity_id));
      } catch (error: any) {
        toast.error(`Error fetching activities: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleClaim = async (activity: Activity) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att claima aktiviteter");
      return;
    }

    if (claimedToday.includes(activity.id)) {
      toast.error("Du har redan claimat denna aktivitet idag");
      return;
    }

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
      // Claim without photo
      try {
        await saveClaimedActivity(activity);
      } catch (error: any) {
        toast.error(`Kunde inte claima aktivitet: ${error.message}`);
      }
    }
  };

  const saveClaimedActivity = async (activity: Activity, photoUrl?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('claimed_activities')
      .insert({
        user_id: user.id,
        activity_id: activity.id,
        date: today,
        photo_url: photoUrl || null
      });

    if (error) throw error;

    // Update local state
    setClaimedToday([...claimedToday, activity.id]);
    toast.success(`Claimade ${activity.name} för ${activity.points} poäng!`);
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar aktiviteter...</div>;
  }

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

        <div className="space-y-2">
          {(activeSection === 'common' ? commonActivities : personalActivities).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div>
                <div className="font-medium">{activity.name}</div>
                <div className="text-sm text-gray-500">{activity.points}p</div>
              </div>
              <Button 
                onClick={() => handleClaim(activity)} 
                variant="outline"
                disabled={claimedToday.includes(activity.id)}
              >
                {activity.requiresPhoto && <Camera className="mr-2 h-4 w-4" />}
                {claimedToday.includes(activity.id) ? "Claimad" : "Claima"}
              </Button>
            </div>
          ))}
          {activeSection === 'personal' && personalActivities.length === 0 && (
            <div className="text-center p-4 text-gray-500">
              Du har inga personliga aktiviteter än. Kontakta en administratör för att lägga till personliga mål.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ActivityList;
