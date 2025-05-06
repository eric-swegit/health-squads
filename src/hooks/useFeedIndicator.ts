
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export const useFeedIndicator = () => {
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();
  const path = location.pathname;
  const feedChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastCheckedRef = useRef<number>(Date.now());
  
  // Debounce check for new posts to prevent excessive queries
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get the current user session once
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

  // Get last viewed time from localStorage
  const getLastViewedTime = useCallback(() => {
    const storedDate = localStorage.getItem('lastViewedFeed');
    return storedDate ? new Date(storedDate) : null;
  }, []);

  // Check for new feed items - this is debounced
  const checkNewFeedItems = useCallback(async () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(async () => {
      const lastViewedFeed = getLastViewedTime();
      if (!lastViewedFeed) return;
      
      // Only check if we're not already on the feed page and at least 5 seconds have passed since last check
      if (path !== '/' && (Date.now() - lastCheckedRef.current) > 5000) {
        try {
          const { data, error } = await supabase
            .from('feed_activities')
            .select('created_at')
            .gt('created_at', lastViewedFeed.toISOString())
            .limit(1);
  
          if (!error && data && data.length > 0) {
            setHasNewPosts(true);
          }
          
          lastCheckedRef.current = Date.now();
        } catch (error) {
          console.error("Error checking for new feed items:", error);
        }
      }
    }, 1000); // 1 second debounce
  }, [path, getLastViewedTime]);

  // Setup subscription and check for new posts
  useEffect(() => {
    // Only run this if we're not on the feed page
    if (path !== '/') {
      checkNewFeedItems();
    }

    // Subscribe to feed changes only if we have a userId and we're not already subscribed
    if (userId && !feedChannel.current) {
      feedChannel.current = supabase
        .channel('feed_indicator_' + userId)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'claimed_activities'
          }, 
          () => {
            if (path !== '/') {
              setHasNewPosts(true);
            }
          }
        )
        .subscribe();
    }

    // Reset indicator and update last viewed time when visiting feed
    if (path === '/') {
      const now = new Date();
      localStorage.setItem('lastViewedFeed', now.toISOString());
      setHasNewPosts(false);
    }

    return () => {
      // Clear debounce timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      // Cleanup subscription when component unmounts
      if (feedChannel.current) {
        supabase.removeChannel(feedChannel.current);
        feedChannel.current = null;
      }
    };
  }, [path, userId, checkNewFeedItems]);

  return { hasNewPosts };
};
