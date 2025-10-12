
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/components/feed/types";
import { toast } from "@/components/ui/sonner";

export const useComments = (itemId: string | null, currentUserId: string | null) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!itemId || !currentUserId) return;
    
    try {
      setLoading(true);
      
      // Fetch comments for this activity
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, user_id, content, created_at')
        .eq('claimed_activity_id', itemId)
        .order('created_at', { ascending: true });
        
      if (commentsError) throw commentsError;
      
      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }
      
      // Get unique user IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      
      // Batch fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, profile_image_url')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      
      // Create profile lookup map
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );
      
      // Get comment IDs
      const commentIds = commentsData.map(c => c.id);
      
      // Batch fetch comment likes
      const { data: likesData, error: likesError } = await supabase
        .from('comment_likes')
        .select('comment_id, user_id')
        .in('comment_id', commentIds);
        
      if (likesError) {
        console.error("Error fetching comment likes:", likesError);
      }
      
      // Create likes lookup map
      const likesMap = new Map<string, { count: number; userLiked: boolean }>();
      (likesData || []).forEach(like => {
        const current = likesMap.get(like.comment_id) || { count: 0, userLiked: false };
        current.count++;
        if (like.user_id === currentUserId) {
          current.userLiked = true;
        }
        likesMap.set(like.comment_id, current);
      });
      
      // Map comments with profile and likes data
      const formattedComments: Comment[] = commentsData.map(comment => {
        const profile = profilesMap.get(comment.user_id);
        const likesInfo = likesMap.get(comment.id) || { count: 0, userLiked: false };
        
        return {
          id: comment.id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          user_name: profile?.name || 'Användare',
          profile_image_url: profile?.profile_image_url || null,
          likes: likesInfo.count,
          userLiked: likesInfo.userLiked
        };
      });
      
      setComments(formattedComments);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast.error(`Kunde inte hämta kommentarer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [itemId, currentUserId]);

  useEffect(() => {
    if (itemId) {
      fetchComments();
      
      // Subscribe to realtime updates for this activity's comments
      const channel = supabase
        .channel(`comments_${itemId}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'comments', filter: `claimed_activity_id=eq.${itemId}` },
          () => {
            fetchComments();
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'comment_likes' },
          () => {
            fetchComments();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [itemId, fetchComments]);

  // Function to update comment likes optimistically
  const updateCommentLikes = useCallback((commentId: string, liked: boolean) => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: liked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
            userLiked: liked
          };
        }
        return comment;
      })
    );
  }, []);

  // Function to add comment optimistically
  const addCommentOptimistically = useCallback((newComment: Comment) => {
    setComments(prevComments => [...prevComments, newComment]);
  }, []);

  return {
    comments,
    loading,
    updateCommentLikes,
    addCommentOptimistically,
    refetch: fetchComments
  };
};
