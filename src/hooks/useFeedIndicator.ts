
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export const useFeedIndicator = () => {
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    // Load last viewed time from localStorage
    const getLastViewedTime = () => {
      const storedDate = localStorage.getItem('lastViewedFeed');
      return storedDate ? new Date(storedDate) : null;
    };

    const lastViewedFeed = getLastViewedTime();

    // Check for new feed items since last view
    const checkNewFeedItems = async () => {
      if (!lastViewedFeed) return;

      const { data, error } = await supabase
        .from('feed_activities')
        .select('created_at')
        .gt('created_at', lastViewedFeed.toISOString())
        .limit(1);

      if (!error && data && data.length > 0) {
        setHasNewPosts(true);
      }
    };

    // Only check if we're not currently on the feed page
    if (path !== '/') {
      checkNewFeedItems();
    }

    // Subscribe to feed changes
    const feedChannel = supabase
      .channel('feed_indicator')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'claimed_activities' }, 
        () => {
          if (path !== '/') {
            setHasNewPosts(true);
          }
        }
      )
      .subscribe();

    // Update last viewed time when visiting feed
    if (path === '/') {
      const now = new Date();
      localStorage.setItem('lastViewedFeed', now.toISOString());
      setHasNewPosts(false);
    }

    return () => {
      supabase.removeChannel(feedChannel);
    };
  }, [path]);

  return { hasNewPosts };
};
