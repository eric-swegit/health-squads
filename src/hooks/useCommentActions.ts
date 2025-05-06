
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FeedItem, Comment } from "@/components/feed/types";

export const useCommentActions = (currentUser: string | null, selectedItem: FeedItem | null, setSelectedItem: (item: FeedItem | null) => void, addCommentToItem: (itemId: string, comment: Comment) => void) => {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = async (content: string) => {
    if (!currentUser || !selectedItem) return;
    
    try {
      // Generate a temporary ID for optimistic UI update
      const tempId = `temp-${Date.now()}`;
      
      // Create new comment object
      const newComment: Comment = {
        id: tempId,
        user_id: currentUser,
        content: content,
        created_at: new Date().toISOString(),
        user_name: 'Du', // Temporary name until DB update comes through
        profile_image_url: null,
        likes: 0,
        userLiked: false
      };
      
      // Optimistically update local state first
      addCommentToItem(selectedItem.id, newComment);
      
      // Also update the currently selected item if in drawer
      if (selectedItem) {
        setSelectedItem({
          ...selectedItem,
          comments: [...selectedItem.comments, newComment]
        });
      }
      
      // Then add to database
      await supabase
        .from('comments')
        .insert({
          claimed_activity_id: selectedItem.id,
          user_id: currentUser,
          content: content.trim()
        });
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(`Kunde inte lägga till kommentar: ${error.message}`);
    }
  };

  return { handleAddComment };
};
