
import { useEffect, useRef, useState } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerFooter
} from "@/components/ui/drawer";
import { FeedItem, Comment } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import CommentItem from "./CommentItem";
import CommentDrawerActivity from "./CommentDrawerActivity";
import CommentInput from "./CommentInput";

interface CommentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: FeedItem | null;
  onAddComment: (comment: string) => void;
}

const CommentsDrawer = ({ open, onOpenChange, selectedItem, onAddComment }: CommentsDrawerProps) => {
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [currentUserImage, setCurrentUserImage] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
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
          .single();
          
        if (!error && profileData) {
          setCurrentUserName(profileData.name);
          setCurrentUserImage(profileData.profile_image_url);
        }
      }
    };
    
    getCurrentUser();
  }, []);

  // Initialize local comments when the selected item changes
  useEffect(() => {
    if (selectedItem) {
      setLocalComments(selectedItem.comments);
    }
  }, [selectedItem]);

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
  }, [localComments.length]);

  const handleAddComment = () => {
    if (newComment.trim() && selectedItem) {
      // Create temporary comment for immediate display
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        user_id: currentUser || '',
        content: newComment,
        created_at: new Date().toISOString(),
        user_name: currentUserName || 'Du',
        profile_image_url: currentUserImage,
        likes: 0,
        userLiked: false
      };
      
      // Update local state immediately
      setLocalComments(prevComments => [...prevComments, tempComment]);
      
      // Call the parent handler to actually post the comment
      onAddComment(newComment);
      
      // Clear the input
      setNewComment("");
    }
  };

  const handleLikeComment = async (comment: Comment) => {
    if (!currentUser || !selectedItem) return;
    
    try {
      // Update local state immediately for responsiveness
      setLocalComments(prevComments => 
        prevComments.map(c => {
          if (c.id === comment.id) {
            return {
              ...c,
              likes: comment.userLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
              userLiked: !comment.userLiked
            };
          }
          return c;
        })
      );
      
      // Make the API call
      if (comment.userLiked) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', currentUser);
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: comment.id,
            user_id: currentUser
          });
      }
    } catch (error: any) {
      console.error("Error liking comment:", error);
      toast.error(`Kunde inte uppdatera gillning: ${error.message}`);
      
      // Revert local state if the API call fails
      setLocalComments(selectedItem.comments);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="px-4 py-2 border-b">
          <DrawerTitle>Kommentarer</DrawerTitle>
        </DrawerHeader>
        
        {/* Activity Content */}
        {selectedItem && <CommentDrawerActivity item={selectedItem} />}
        
        {/* Comments List */}
        <div 
          ref={commentsContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {!selectedItem || localComments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Inga kommentarer än. Bli först med att kommentera!</p>
          ) : (
            localComments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onLike={() => handleLikeComment(comment)}
              />
            ))
          )}
        </div>
        
        {/* Comment Input */}
        <DrawerFooter className="p-3 border-t">
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
