
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import FeedItem from "./FeedItem";
import CommentsList from "./CommentsList";
import ImageViewer from "./ImageViewer";
import { FeedItem as FeedItemType } from "./types";
import { useFeedData } from "@/hooks/useFeedData";

const FeedList = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
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

  const { feedItems, loading } = useFeedData(currentUser);

  const handleLike = async (item: FeedItemType) => {
    if (!currentUser) return;
    
    try {
      if (item.userLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('claimed_activity_id', item.id)
          .eq('user_id', currentUser);
          
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            claimed_activity_id: item.id,
            user_id: currentUser
          });
          
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Error updating like:", error);
      toast.error(`Kunde inte uppdatera gillning: ${error.message}`);
    }
  };

  const openCommentDialog = (item: FeedItemType) => {
    setSelectedItem(item);
    setCommentDialogOpen(true);
  };

  const handleAddComment = async (content: string) => {
    if (!currentUser || !selectedItem) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          claimed_activity_id: selectedItem.id,
          user_id: currentUser,
          content: content.trim()
        });
        
      if (error) throw error;
      
      // Fetch updated comments will happen via realtime subscription
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
          onOpenComments={openCommentDialog}
          onOpenImage={openImageDialog}
        />
      ))}
      
      {/* Comments Dialog */}
      <CommentsList 
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
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
