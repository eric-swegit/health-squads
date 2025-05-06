
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { FeedItem } from "@/components/feed/types";

export const useLikeActions = (currentUser: string | null, updateItemLikes: (itemId: string, liked: boolean) => void) => {
  const handleLike = async (item: FeedItem) => {
    if (!currentUser) return;
    
    try {
      // Optimistically update UI first
      updateItemLikes(item.id, !item.userLiked);
      
      if (item.userLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('claimed_activity_id', item.id)
          .eq('user_id', currentUser);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            claimed_activity_id: item.id,
            user_id: currentUser
          });
      }
    } catch (error: any) {
      // Revert optimistic update on error
      updateItemLikes(item.id, item.userLiked);
      console.error("Error updating like:", error);
      toast.error(`Kunde inte uppdatera gillning: ${error.message}`);
    }
  };

  return { handleLike };
};
