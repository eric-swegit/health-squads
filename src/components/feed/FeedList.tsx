
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import FeedItem from "./FeedItem";
import CommentsDrawer from "./CommentsDrawer";
import ImageViewer from "./ImageViewer";
import { useFeedData } from "@/hooks/useFeedData";
import { useCommentDrawer } from "@/hooks/useCommentDrawer";
import { useImageViewer } from "@/hooks/useImageViewer";
import { useLikeActions } from "@/hooks/useLikeActions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const FeedList = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.id);
      }
    };

    fetchCurrentUser();
  }, []);

  const { feedItems, loading, hasMore, loadMore, updateItemLikes, incrementCommentCount } = useFeedData(currentUser);
  
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

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMore]);

  const handleCommentAdded = useCallback((itemId: string) => {
    incrementCommentCount(itemId);
  }, [incrementCommentCount]);

  if (loading && feedItems.length === 0) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Laddar feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedItems.length === 0 && !loading && (
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
        />
      ))}
      
      {/* Infinite scroll sentinel */}
      <div ref={observerTarget} className="py-4 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-gray-500">Laddar fler...</span>
          </div>
        )}
        
        {!loading && hasMore && (
          <Button 
            variant="outline" 
            onClick={loadMore}
            className="w-full max-w-xs"
          >
            Ladda fler inlägg
          </Button>
        )}
        
        {!hasMore && feedItems.length > 0 && (
          <p className="text-sm text-gray-500">Inga fler inlägg att visa</p>
        )}
      </div>
      
      {/* Comments Drawer */}
      <CommentsDrawer 
        open={commentDrawerOpen}
        onOpenChange={setCommentDrawerOpen}
        selectedItem={selectedItem}
        onCommentAdded={handleCommentAdded}
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
