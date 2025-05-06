
import { useState, useEffect } from 'react';
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';

export const useClaimedActivities = (user: { id: string } | null, refreshTrigger: number) => {
  const [claimedToday, setClaimedToday] = useState<string[]>([]);
  const [claimedIds, setClaimedIds] = useState<{ [activityId: string]: string }>({});

  useEffect(() => {
    const fetchClaimedActivities = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('claimed_activities')
          .select('activity_id, id')
          .eq('user_id', user.id)
          .eq('date', today);

        if (error) throw error;

        // Update claimedToday state with activity IDs
        setClaimedToday(data.map(item => item.activity_id));

        // Update claimedIds map
        const newClaimedIds: { [activityId: string]: string } = {};
        data.forEach(item => {
          newClaimedIds[item.activity_id] = item.id;
        });
        setClaimedIds(newClaimedIds);
      } catch (error: any) {
        console.error("Error fetching claimed activities:", error);
        toast.error(`Kunde inte hämta dagens aktiviteter: ${error.message}`);
      }
    };

    fetchClaimedActivities();
  }, [user, refreshTrigger]);

  /**
   * Save a claimed activity
   */
  const saveClaimedActivity = async (activity: Activity, photoUrl: string | null = null) => {
    if (!user) return false;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Optimistically update local state
      setClaimedToday(prev => [...prev, activity.id]);

      const { data, error } = await supabase
        .from('claimed_activities')
        .insert([{
          activity_id: activity.id,
          user_id: user.id,
          date: today,
          photo_url: photoUrl
        }])
        .select('id')
        .single();

      if (error) {
        // If there's an error, revert the optimistic update
        setClaimedToday(prev => prev.filter(id => id !== activity.id));
        throw error;
      }

      // Update claimedIds with the new ID
      setClaimedIds(prev => ({ ...prev, [activity.id]: data.id }));
      
      toast.success(`${activity.name} claimad!`);
      return true;
    } catch (error: any) {
      console.error("Error claiming activity:", error);
      toast.error(`Kunde inte claima aktivitet: ${error.message}`);
      return false;
    }
  };

  /**
   * Undo a claimed activity
   */
  const undoClaimActivity = async (activityId: string) => {
    if (!user) return false;
    
    // Get the claimed activity ID
    const claimedId = claimedIds[activityId];
    if (!claimedId) {
      console.error("Claimed activity not found for activity ID:", activityId);
      return false;
    }
    
    try {
      console.log("Deleting claimed activity with id:", claimedId);
      
      // Immediately update local state to give user feedback
      setClaimedToday(claimedToday.filter(id => id !== activityId));
      
      // Remove from claimedIds map
      const newClaimedIds = {...claimedIds};
      delete newClaimedIds[activityId];
      setClaimedIds(newClaimedIds);
      
      const { error } = await supabase
        .from('claimed_activities')
        .delete()
        .eq('id', claimedId);

      if (error) {
        console.error("Supabase delete error:", error);
        // Revert local state changes on error
        setClaimedToday([...claimedToday]);
        setClaimedIds({...claimedIds});
        throw error;
      }

      console.log("Successfully deleted claimed activity");
      return true;
    } catch (error: any) {
      console.error("Error undoing claimed activity:", error);
      toast.error(`Kunde inte ångra aktivitet: ${error.message}`);
      return false;
    }
  };

  return {
    claimedToday,
    claimedIds,
    saveClaimedActivity,
    undoClaimActivity
  };
};
