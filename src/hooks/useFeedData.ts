
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeedItem, Comment } from "@/components/feed/types";
import { toast } from "@/components/ui/sonner";

export const useFeedData = (currentUser: string | null) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedItems = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch feed activities
        const { data: feedData, error: feedError } = await supabase
          .from('feed_activities')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (feedError) throw feedError;
        
        // Fetch likes for each activity
        const feedItemsWithLikes = await Promise.all(
          (feedData || []).map(async (item) => {
            // Get like count
            const { count: likesCount, error: countError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('claimed_activity_id', item.id);
              
            if (countError) throw countError;
            
            // Check if current user liked this activity
            const { data: userLikeData, error: userLikeError } = await supabase
              .from('likes')
              .select('id')
              .eq('claimed_activity_id', item.id)
              .eq('user_id', currentUser)
              .single();
              
            const userLiked = !userLikeError && userLikeData;

            // Get comments
            const { data: commentsData, error: commentsError } = await supabase
              .from('comments')
              .select('id, user_id, content, created_at')
              .eq('claimed_activity_id', item.id)
              .order('created_at', { ascending: true });
              
            if (commentsError) throw commentsError;
            
            // For each comment, fetch the user profile separately
            const formattedComments = await Promise.all((commentsData || []).map(async (comment) => {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('name, profile_image_url')
                .eq('id', comment.user_id)
                .single();
                
              return {
                id: comment.id,
                user_id: comment.user_id,
                content: comment.content,
                created_at: comment.created_at,
                user_name: profileData?.name || 'Användare',
                profile_image_url: profileData?.profile_image_url || null
              };
            }));
            
            return {
              ...item,
              likes: likesCount || 0,
              userLiked: !!userLiked,
              comments: formattedComments
            };
          })
        );
        
        setFeedItems(feedItemsWithLikes);
      } catch (error: any) {
        console.error("Error fetching feed:", error);
        toast.error(`Kunde inte hämta feed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedItems();
    
    // Subscribe to realtime updates
    const feedChannel = supabase
      .channel('feed_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'claimed_activities' }, 
        () => {
          fetchFeedItems();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        () => {
          fetchFeedItems();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          fetchFeedItems();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(feedChannel);
    };
  }, [currentUser]);

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

  // Function to add a comment optimistically
  const addCommentToItem = (itemId: string, newComment: Comment) => {
    setFeedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            comments: [...item.comments, newComment]
          };
        }
        return item;
      })
    );
  };

  return { 
    feedItems, 
    loading, 
    updateItemLikes,
    addCommentToItem
  };
};
