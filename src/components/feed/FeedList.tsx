
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import FeedItem from "./FeedItem";
import CommentsDrawer from "./CommentsDrawer";
import ImageViewer from "./ImageViewer";
import { FeedItem as FeedItemType, Comment } from "./types";
import { useFeedData } from "@/hooks/useFeedData";

const FeedList = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItemType | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.id);
      }
    };

    fetchCurrentUser();
  }, []);

  const { feedItems, loading, updateItemLikes, addCommentToItem } = useFeedData(currentUser);

  const handleLike = async (item: FeedItemType) => {
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

  const openCommentDrawer = (item: FeedItemType) => {
    setSelectedItem(item);
    setCommentDrawerOpen(true);
  };

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

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar feed...</div>;
  }

  return (
    <div className="space-y-4">
      {feedItems.length === 0 && (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">Inga aktiviteter i din feed än. När du och dina vänner gör aktiviteter kommer de att visas här!</p>
        </div>
      )}
      
      {feedItems.map((item) => (
        <FeedItem 
          key={item.id} 
          item={item} 
          onLike={handleLike}
          onOpenComments={openCommentDrawer}
          onOpenImage={openImageDialog}
          onAddComment={handleAddComment}
        />
      ))}
      
      {/* Comments Drawer */}
      <CommentsDrawer 
        open={commentDrawerOpen}
        onOpenChange={setCommentDrawerOpen}
        selectedItem={selectedItem}
        onAddComment={handleAddComment}
      />
      
      {/* Image Dialog */}
      <ImageViewer
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        imageUrl={selectedImage}
      />
    </div>
  );
};

export default FeedList;
