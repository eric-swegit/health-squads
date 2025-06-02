import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserStats } from '@/types/profile';
import { toast } from "@/components/ui/sonner";
import { debounce } from '@/utils/debounce';
import { calculateStreaks } from '@/utils/streakCalculations';

export const useProfileData = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalActivities: 0,
    activitiesThisWeek: 0,
    streak: 0,
    longestStreak: 0
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
        
        // Calculate activities last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activitiesThisWeek = activitiesData.filter(
          activity => new Date(activity.date) >= sevenDaysAgo
        ).length;
        
        // Calculate current streak and longest streak
        const { currentStreak, longestStreak } = calculateStreaks(activitiesData);
        
        setStats({
          totalActivities,
          activitiesThisWeek,
          streak: currentStreak,
          longestStreak
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
