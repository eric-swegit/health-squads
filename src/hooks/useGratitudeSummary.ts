import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { GratitudeEntry } from './useGratitudeEntries';

interface GratitudeSummary {
  summary: string;
  themes: string[];
  insight: string;
}

export const useGratitudeSummary = (userId: string | undefined) => {
  const [summary, setSummary] = useState<GratitudeSummary | null>(null);
  const [cachedSummary, setCachedSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCachedSummary = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('gratitude_summary, gratitude_summary_updated_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data?.gratitude_summary) {
        setCachedSummary(data.gratitude_summary);
        try {
          const parsed = JSON.parse(data.gratitude_summary);
          setSummary(parsed);
        } catch {
          // If it's not JSON, treat as plain text summary
          setSummary({ summary: data.gratitude_summary, themes: [], insight: '' });
        }
      }
    } catch (err) {
      console.error('Error fetching cached summary:', err);
    }
  }, [userId]);

  const generateSummary = useCallback(async (entries: GratitudeEntry[]) => {
    if (!userId || entries.length === 0) {
      toast.error('Inga tacksamhetsposter att sammanfatta');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize-gratitude', {
        body: { 
          userId,
          entries: entries.map(e => ({
            date: e.created_at,
            gratitude_1: e.gratitude_1,
            gratitude_2: e.gratitude_2,
            gratitude_3: e.gratitude_3
          }))
        }
      });

      if (error) throw error;
      
      setSummary(data);
      setCachedSummary(JSON.stringify(data));
      toast.success('Sammanfattning genererad!');
    } catch (err: any) {
      console.error('Error generating summary:', err);
      toast.error('Kunde inte generera sammanfattning');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { summary, cachedSummary, loading, generateSummary, fetchCachedSummary };
};
