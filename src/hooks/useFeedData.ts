
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeedItem } from "@/components/feed/types";
import { toast } from "@/components/ui/sonner";

const PAGE_SIZE = 10;

export const useFeedData = (currentUser: string | null) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);

  const fetchFeedItems = useCallback(async (isLoadMore: boolean = false) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Build query with cursor-based pagination
      let query = supabase
        .from('feed_activities')
        .select('*')
        .gte('created_at', '2025-11-02')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(PAGE_SIZE);
      
      // Apply cursor if loading more
      if (isLoadMore && lastCreatedAt) {
        query = query.lt('created_at', lastCreatedAt);
        // If same timestamp, also filter by id
        if (lastId) {
          query = query.neq('id', lastId);
        }
      }
        
      const { data: feedData, error: feedError } = await query;
        
      if (feedError) throw feedError;
      
      if (!feedData || feedData.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // Check if we have more items
      setHasMore(feedData.length === PAGE_SIZE);
      
      // Set cursor for next page
      const lastItem = feedData[feedData.length - 1];
      setLastCreatedAt(lastItem.created_at);
      setLastId(lastItem.id);
      
      // Batch fetch likes and comments counts
      const itemIds = feedData.map(item => item.id);
      
      // Fetch likes summary
      const { data: likesSummary, error: likesError } = await supabase
        .rpc('get_likes_summary', { ids: itemIds, in_user: currentUser });
        
      if (likesError) {
        console.error("Error fetching likes:", likesError);
      }
      
      // Fetch comments summary
      const { data: commentsSummary, error: commentsError } = await supabase
        .rpc('get_comments_summary', { ids: itemIds });
        
      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      }
      
      // Fetch latest 2 comments for each item
      const { data: latestComments, error: commentsDataError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          claimed_activity_id,
          profiles:user_id (
            name,
            profile_image_url
          )
        `)
        .in('claimed_activity_id', itemIds)
        .order('created_at', { ascending: false });
        
      if (commentsDataError) {
        console.error("Error fetching comments data:", commentsDataError);
      }
      
      // Group comments by claimed_activity_id and take latest 2
      const commentsDataMap = new Map<string, any[]>();
      (latestComments || []).forEach(comment => {
        const activityId = comment.claimed_activity_id;
        if (!commentsDataMap.has(activityId)) {
          commentsDataMap.set(activityId, []);
        }
        const existingComments = commentsDataMap.get(activityId)!;
        if (existingComments.length < 2) {
          existingComments.push({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            user_id: comment.user_id,
            user_name: (comment.profiles as any)?.name || 'Okänd',
            profile_image_url: (comment.profiles as any)?.profile_image_url || null,
            likes: 0,
            userLiked: false
          });
        }
      });
      
      // Create lookup maps
      const likesMap = new Map(
        (likesSummary || []).map(l => [l.claimed_activity_id, l])
      );
      const commentsMap = new Map(
        (commentsSummary || []).map(c => [c.claimed_activity_id, c.comments_count])
      );
      
      // Map items with aggregated data
      const itemsWithData = feedData.map(item => {
        const likesData = likesMap.get(item.id);
        const itemComments = commentsDataMap.get(item.id) || [];
        // Reverse to show oldest first (Instagram style)
        return {
          ...item,
          likes: likesData?.likes_count || 0,
          userLiked: likesData?.user_liked || false,
          comments: itemComments.reverse(),
          commentsCount: commentsMap.get(item.id) || 0
        };
      });
      
      setFeedItems(prev => isLoadMore ? [...prev, ...itemsWithData] : itemsWithData);
    } catch (error: any) {
      console.error("Error fetching feed:", error);
      toast.error(`Kunde inte hämta feed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentUser, lastCreatedAt, lastId]);

  useEffect(() => {
    // Reset and fetch initial page
    setFeedItems([]);
    setLastCreatedAt(null);
    setLastId(null);
    setHasMore(true);
    fetchFeedItems(false);
    
    // Subscribe to realtime updates for new activities
    const feedChannel = supabase
      .channel('feed_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'claimed_activities' }, 
        () => {
          // Reset and reload when new activity is added
          setFeedItems([]);
          setLastCreatedAt(null);
          setLastId(null);
          setHasMore(true);
          fetchFeedItems(false);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(feedChannel);
    };
  }, [currentUser]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchFeedItems(true);
    }
  }, [loading, hasMore, fetchFeedItems]);

  // Function to update likes optimistically
  const updateItemLikes = (itemId: string, liked: boolean) => {
    setFeedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            likes: liked ? item.likes + 1 : Math.max(0, item.likes - 1),
            userLiked: liked
          };
        }
        return item;
      })
    );
  };

  // Function to update comment count when comment is added
  const incrementCommentCount = (itemId: string) => {
    setFeedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            commentsCount: (item.commentsCount || 0) + 1
          };
        }
        return item;
      })
    );
  };

  return { 
    feedItems, 
    loading, 
    hasMore,
    loadMore,
    updateItemLikes,
    incrementCommentCount
  };
};
