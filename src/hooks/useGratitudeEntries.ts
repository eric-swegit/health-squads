import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface GratitudeEntry {
  id: string;
  gratitude_1: string;
  gratitude_2: string;
  gratitude_3: string;
  created_at: string;
  claimed_activity_id: string;
}

export const useGratitudeEntries = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('gratitude_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEntries(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user]);

  return { entries, loading, error };
};
