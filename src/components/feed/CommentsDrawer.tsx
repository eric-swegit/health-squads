
import { useEffect, useRef, useState } from "react";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { FeedItem } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import CommentItem from "./CommentItem";
import CommentDrawerActivity from "./CommentDrawerActivity";
import CommentInput from "./CommentInput";
import { useComments } from "@/hooks/useComments";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: FeedItem | null;
  onCommentAdded: (itemId: string) => void;
}

const CommentsDrawer = ({ open, onOpenChange, selectedItem, onCommentAdded }: CommentsDrawerProps) => {
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [currentUserImage, setCurrentUserImage] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setCurrentUser(data.session.user.id);
        
        // Fetch the user's profile data
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('name, profile_image_url')
          .eq('id', data.session.user.id)
          .maybeSingle();
          
        if (!error && profileData) {
          setCurrentUserName(profileData.name);
          setCurrentUserImage(profileData.profile_image_url);
        }
      }
    };
    
    getCurrentUser();
  }, []);

  // Use the new useComments hook for on-demand comment loading
  const { 
    comments, 
    loading: loadingComments, 
    updateCommentLikes, 
    addCommentOptimistically 
  } = useComments(open ? selectedItem?.id || null : null, currentUser);

  // Auto-focus the comment input when the drawer opens
  useEffect(() => {
    if (open && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 300);
    }
  }, [open]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleAddComment = async () => {
    if (newComment.trim() && selectedItem && currentUser) {
      const commentText = newComment.trim();
      
      // Create temporary comment for immediate display
      const tempComment = {
        id: `temp-${Date.now()}`,
        user_id: currentUser,
        content: commentText,
        created_at: new Date().toISOString(),
        user_name: currentUserName || 'Du',
        profile_image_url: currentUserImage,
        likes: 0,
        userLiked: false
      };
      
      // Update local state immediately
      addCommentOptimistically(tempComment);
      
      // Clear the input
      setNewComment("");
      
      // Call the parent handler to notify about new comment
      onCommentAdded(selectedItem.id);
      
      // Post comment to database
      try {
        const { error } = await supabase
          .from('comments')
          .insert({
            claimed_activity_id: selectedItem.id,
            user_id: currentUser,
            content: commentText
          });
          
        if (error) throw error;
      } catch (error: any) {
        console.error("Error posting comment:", error);
        toast.error(`Kunde inte posta kommentar: ${error.message}`);
      }
    }
  };

  const handleLikeComment = async (commentId: string, currentlyLiked: boolean) => {
    if (!currentUser) return;
    
    try {
      // Update local state immediately
      updateCommentLikes(commentId, !currentlyLiked);
      
      // Make the API call
      if (currentlyLiked) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser);
      } else {
        // Like - Check if already liked first to prevent duplicate key errors
        const { data: existingLike } = await supabase
          .from('comment_likes')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', currentUser)
          .maybeSingle();
          
        if (!existingLike) {
          // Only insert if not already liked
          await supabase
            .from('comment_likes')
            .insert({
              comment_id: commentId,
              user_id: currentUser
            });
        }
      }
    } catch (error: any) {
      console.error("Error liking comment:", error);
      toast.error(`Kunde inte uppdatera gillning: ${error.message}`);
      
      // Revert local state if the API call fails
      updateCommentLikes(commentId, currentlyLiked);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[65vh] flex flex-col">
        {/* Header */}
        <DrawerHeader className="border-b flex flex-row items-center justify-between px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
          <DrawerTitle className="text-base font-semibold">Kommentarer</DrawerTitle>
          <div className="w-8" /> {/* Spacer for balance */}
        </DrawerHeader>
        
        {/* Activity Content */}
        {selectedItem && <CommentDrawerActivity item={selectedItem} />}
        
        {/* Comments List */}
        <div 
          ref={commentsContainerRef}
          className="flex-1 overflow-y-auto px-4 space-y-4"
        >
          {loadingComments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Inga kommentarer än. Bli först med att kommentera!</p>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onLike={() => handleLikeComment(comment.id, comment.userLiked)}
              />
            ))
          )}
        </div>
        
        {/* Sticky Comment Input */}
        <DrawerFooter className="border-t p-3">
          <CommentInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleAddComment}
            inputRef={commentInputRef}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentsDrawer;
