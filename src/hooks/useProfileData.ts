
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserStats } from '@/types/profile';
import { toast } from "@/components/ui/sonner";
import { debounce } from '@/utils/debounce';

export const useProfileData = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalActivities: 0,
    activitiesThisWeek: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const profileChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Get user ID once
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);
  
  // Fetch profile and stats data with debounce
  const fetchProfileData = useCallback(debounce(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) throw profileError;
      if (profileData) {
        setProfile(profileData);
      }
      
      // Fetch claimed activities for stats
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('claimed_activities')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (activitiesError) throw activitiesError;
      
      if (activitiesData) {
        // Calculate stats from activities data
        const totalActivities = activitiesData.length;
        
        // Calculate activities this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const activitiesThisWeek = activitiesData.filter(
          activity => new Date(activity.date) >= oneWeekAgo
        ).length;
        
        // Calculate streak
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
        
        // Check for activity today
        const hasActivityToday = activitiesData.some(activity => activity.date === today);
        
        // Check for activity yesterday
        const hasActivityYesterday = activitiesData.some(activity => activity.date === yesterday);
        
        if (hasActivityToday) {
          streak = 1;
          
          // Check for consecutive days before today
          let checkDate = yesterday;
          let consecutiveDays = true;
          
          while (consecutiveDays) {
            const hasActivity = activitiesData.some(activity => activity.date === checkDate);
            if (hasActivity) {
              streak++;
              // Move to the previous day
              const nextDate = new Date(checkDate);
              nextDate.setDate(nextDate.getDate() - 1);
              checkDate = nextDate.toISOString().split('T')[0];
            } else {
              consecutiveDays = false;
            }
          }
        } else if (hasActivityYesterday) {
          streak = 1;
          
          // Check for consecutive days before yesterday
          let checkDate = new Date(yesterday);
          checkDate.setDate(checkDate.getDate() - 1);
          let dateStr = checkDate.toISOString().split('T')[0];
          let consecutiveDays = true;
          
          while (consecutiveDays) {
            const hasActivity = activitiesData.some(activity => activity.date === dateStr);
            if (hasActivity) {
              streak++;
              // Move to the previous day
              checkDate.setDate(checkDate.getDate() - 1);
              dateStr = checkDate.toISOString().split('T')[0];
            } else {
              consecutiveDays = false;
            }
          }
        }
        
        setStats({
          totalActivities,
          activitiesThisWeek,
          streak
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error(`Kunde inte hämta profil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, 300), [userId]);

  // Setup subscription to profile and claimed activities
  useEffect(() => {
    if (!userId) return;
    
    // Initial fetch
    fetchProfileData();
    
    // Setup subscription only once per userId
    if (!profileChannel.current) {
      profileChannel.current = supabase
        .channel('profile_changes_' + userId)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${userId}`
          }, 
          () => {
            fetchProfileData();
          }
        )
        .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'claimed_activities',
            filter: `user_id=eq.${userId}`
          },
          () => {
            fetchProfileData();
          }
        )
        .subscribe();
    }
    
    return () => {
      // Clean up subscription when component unmounts or userId changes
      if (profileChannel.current) {
        supabase.removeChannel(profileChannel.current);
        profileChannel.current = null;
      }
    };
  }, [userId, fetchProfileData]);

  return {
    profile,
    stats,
    loading,
    uploadingImage,
    setUploadingImage
  };
};
