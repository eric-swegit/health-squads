
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FeedItem from "./FeedItem";
import CommentsDrawer from "./CommentsDrawer";
import ImageViewer from "./ImageViewer";
import { useFeedData } from "@/hooks/useFeedData";
import { useCommentDrawer } from "@/hooks/useCommentDrawer";
import { useImageViewer } from "@/hooks/useImageViewer";
import { useLikeActions } from "@/hooks/useLikeActions";
import { useCommentActions } from "@/hooks/useCommentActions";

const FeedList = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

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
  
  const { 
    commentDrawerOpen, 
    setCommentDrawerOpen, 
    selectedItem, 
    setSelectedItem, 
    openCommentDrawer 
  } = useCommentDrawer();
  
  const { 
    imageDialogOpen, 
    setImageDialogOpen, 
    selectedImage, 
    openImageDialog 
  } = useImageViewer();
  
  const { handleLike } = useLikeActions(currentUser, updateItemLikes);
  
  const { handleAddComment } = useCommentActions(
    currentUser, 
    selectedItem, 
    setSelectedItem, 
    addCommentToItem
  );

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
