import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface WrappedStats {
  totalActivities: number;
  totalPoints: number;
  longestStreak: number;
  daysActive: number;
  topActivities: Array<{ name: string; count: number; emoji: string }>;
  achievements: Array<{ id: string; title: string; description: string; emoji: string }>;
  gratitudeSummary: string | null;
  gratitudeCount: number;
  photos: string[];
  userName: string;
  profileImage: string | null;
}

export const useWrappedData = (userId: string | undefined) => {
  const [data, setData] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWrapped = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: wrappedData, error: fnError } = await supabase.functions.invoke('generate-wrapped', {
        body: { userId }
      });

      if (fnError) throw fnError;
      setData(wrappedData);
    } catch (err: any) {
      console.error('Error generating wrapped:', err);
      setError(err.message);
      toast.error('Kunde inte ladda din Wrapped');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { data, loading, error, generateWrapped };
};
