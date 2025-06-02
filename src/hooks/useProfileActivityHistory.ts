
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

export interface ProfileActivityItem {
  id: string;
  activity_name: string;
  activity_id: string;
  points: number;
  date: string;
  created_at: string;
  photo_url?: string;
  photo_urls?: string[];
}

export const useProfileActivityHistory = (userId: string | null, limit: number = 10) => {
  const [activities, setActivities] = useState<ProfileActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityHistory = async () => {
      if (!userId) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('claimed_activities')
          .select(`
            id,
            activity_id,
            date,
            created_at,
            photo_url,
            photo_urls,
            activities (
              name,
              points
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) throw fetchError;

        const formattedActivities: ProfileActivityItem[] = (data || []).map(item => ({
          id: item.id,
          activity_id: item.activity_id,
          activity_name: (item.activities as any)?.name || 'Okänd aktivitet',
          points: (item.activities as any)?.points || 0,
          date: item.date,
          created_at: item.created_at,
          photo_url: item.photo_url,
          photo_urls: item.photo_urls
        }));

        setActivities(formattedActivities);
      } catch (error: any) {
        console.error("Error fetching activity history:", error);
        setError(`Kunde inte hämta aktivitetshistorik: ${error.message}`);
        toast.error(`Kunde inte hämta aktivitetshistorik: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityHistory();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('profile_activity_history')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'claimed_activities',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          fetchActivityHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, limit]);

  return {
    activities,
    loading,
    error
  };
};
