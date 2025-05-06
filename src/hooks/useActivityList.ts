
import { useState, useEffect } from 'react';
import { Activity } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { mapDbActivitiesToActivities } from '@/utils/activityMappers';

export const useActivityList = (user: { id: string } | null, refreshTrigger: number) => {
  const [commonActivities, setCommonActivities] = useState<Activity[]>([]);
  const [personalActivities, setPersonalActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // Fetch common activities
        const { data: common, error: commonError } = await supabase
          .from('activities')
          .select('*')
          .eq('type', 'common');

        if (commonError) throw commonError;
        setCommonActivities(mapDbActivitiesToActivities(common || []));

        // Fetch personal activities if user is available
        if (user) {
          const { data: personal, error: personalError } = await supabase
            .from('activities')
            .select('*')
            .eq('type', 'personal')
            .eq('user_id', user.id);

          if (personalError) throw personalError;
          setPersonalActivities(mapDbActivitiesToActivities(personal || []));
        } else {
          setPersonalActivities([]);
        }
      } catch (error: any) {
        console.error("Error fetching activities:", error);
        toast.error(`Kunde inte hämta aktiviteter: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, refreshTrigger]);

  return {
    commonActivities,
    personalActivities,
    loading
  };
};
