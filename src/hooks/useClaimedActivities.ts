
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { Activity, ClaimedActivity } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useClaimedActivities = (user: { id: string } | null, refreshTrigger: number) => {
  const [claimedToday, setClaimedToday] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaimedActivities = async () => {
      if (!user) {
        setClaimedToday([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        const { data, error: fetchError } = await supabase
          .from('claimed_activities')
          .select('activity_id')
          .eq('user_id', user.id)
          .eq('date', today);

        if (fetchError) throw fetchError;
        
        setClaimedToday(data ? data.map(item => item.activity_id) : []);
      } catch (error: any) {
        console.error("Error fetching claimed activities:", error);
        setError(`Kunde inte hämta genomförda aktiviteter: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimedActivities();
  }, [user, refreshTrigger]);

  const saveClaimedActivity = async (activity: Activity, photoUrl?: string) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att claima aktiviteter");
      return false;
    }

    try {
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

  const undoClaimActivity = async (activityId: string) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att ta bort en aktivitet");
      return false;
    }

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const { error } = await supabase
        .from('claimed_activities')
        .delete()
        .match({ user_id: user.id, activity_id: activityId, date: today });

      if (error) throw error;

      // Optimistically update the local state
      setClaimedToday(prev => prev.filter(id => id !== activityId));
      
      toast.success("Aktivitet borttagen");
      
      // Force a delay before returning to ensure the database transaction completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error: any) {
      console.error("Error removing claimed activity:", error);
      toast.error(`Kunde inte ta bort aktivitet: ${error.message}`);
      return false;
    }
  };

  return {
    claimedToday,
    saveClaimedActivity,
    undoClaimActivity,
    loading,
    error
  };
};
