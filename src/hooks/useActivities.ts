
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Activity } from '@/types';
import { getActivityCategory, getActivityDuration } from '@/components/activities/utils';

export const useActivities = () => {
  const [commonActivities, setCommonActivities] = useState<Activity[]>([]);
  const [personalActivities, setPersonalActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimedToday, setClaimedToday] = useState<string[]>([]);
  const [claimedIds, setClaimedIds] = useState<{[key: string]: string}>({});
  const [user, setUser] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

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
          .select('id, activity_id')
          .eq('user_id', currentUser.id)
          .eq('date', today);

        if (claimedError) throw claimedError;

        // Map to our Activity type
        const mappedCommonActivities = commonData.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          points: activity.points,
          requiresPhoto: activity.requires_photo,
          type: activity.type,
          category: getActivityCategory(activity.name),
          duration: getActivityDuration(activity.name)
        }));

        const mappedPersonalActivities = personalData.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          points: activity.points,
          requiresPhoto: activity.requires_photo,
          type: activity.type,
          userId: activity.user_id,
          category: getActivityCategory(activity.name),
          duration: getActivityDuration(activity.name)
        }));

        // Create a map of claimed activity IDs to their claimed record IDs
        const claimedIdsMap: {[key: string]: string} = {};
        claimedData.forEach((item: any) => {
          claimedIdsMap[item.activity_id] = item.id;
        });

        setCommonActivities(mappedCommonActivities);
        setPersonalActivities(mappedPersonalActivities);
        setClaimedToday(claimedData.map((item: any) => item.activity_id));
        setClaimedIds(claimedIdsMap);
      } catch (error: any) {
        toast.error(`Error fetching activities: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up realtime subscription to claimed_activities changes
    const claimedChannel = supabase
      .channel('claimed_activities_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'claimed_activities' }, 
        (payload) => {
          console.log('Activity claimed/unclaimed:', payload);
          // Trigger a refresh of the activities data
          setLastRefresh(Date.now());
        }
      )
      .subscribe();

    // Subscribe to profile changes to update points
    const profileChannel = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload) => {
          console.log('Profile updated:', payload);
          // Refresh when points change
          setLastRefresh(Date.now());
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(claimedChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [lastRefresh]);

  const saveClaimedActivity = async (activity: Activity, photoUrl?: string) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att claima aktiviteter");
      return false;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('claimed_activities')
        .insert({
          user_id: user.id,
          activity_id: activity.id,
          date: today,
          photo_url: photoUrl || null
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Update local state
        setClaimedToday([...claimedToday, activity.id]);
        
        // Store the claimed_activities.id for this activity to enable undo
        const newClaimedIds = {...claimedIds};
        newClaimedIds[activity.id] = data[0].id;
        setClaimedIds(newClaimedIds);
        
        toast.success(`Bra jobbat! Du får ${activity.points} poäng för ${activity.name}!`);
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(`Kunde inte spara aktivitet: ${error.message}`);
      return false;
    }
  };

  const undoClaimActivity = async (activityId: string) => {
    console.log("Undoing claim for activity:", activityId);
    console.log("Current claimedIds:", claimedIds);
    
    if (!user) {
      toast.error("Du måste vara inloggad för att ångra aktiviteter");
      return false;
    }
    
    const claimedId = claimedIds[activityId];
    if (!claimedId) {
      toast.error("Kunde inte hitta aktiviteten för att ångra");
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
      
      // Trigger a refresh to ensure points are updated
      setLastRefresh(Date.now());
      
      toast.success("Aktiviteten har ångrats");
      return true;
    } catch (error: any) {
      console.error("Full error when undoing claim:", error);
      toast.error(`Kunde inte ångra aktivitet: ${error.message}`);
      return false;
    }
  };

  // Function to manually refresh the data
  const refreshActivities = () => {
    setLastRefresh(Date.now());
  };

  return {
    commonActivities,
    personalActivities,
    claimedToday,
    loading,
    user,
    saveClaimedActivity,
    undoClaimActivity,
    refreshActivities
  };
};
