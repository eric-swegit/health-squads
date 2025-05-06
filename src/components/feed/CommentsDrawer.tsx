
import { useEffect, useRef, useState } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import CommentItem from "./CommentItem";
import { FeedItem, Comment } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
        user_name: currentUserName || 'Du', // Use actual username instead of "Du"
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
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
        {selectedItem && (
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={selectedItem.profile_image_url || undefined} />
                <AvatarFallback>{selectedItem.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedItem.user_name}</p>
                <p className="text-sm text-gray-500">{selectedItem.activity_name}</p>
              </div>
            </div>
            {selectedItem.photo_url && (
              <div className="mt-2">
                <img src={selectedItem.photo_url} alt="Activity" className="w-full h-auto rounded-md" />
              </div>
            )}
          </div>
        )}
        
        {/* Comments List - Using localComments instead of selectedItem.comments */}
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
        <DrawerFooter className="p-3 border-t flex items-end gap-2">
          <div className="flex items-end gap-2 w-full">
            <Textarea 
              ref={commentInputRef}
              placeholder="Skriv en kommentar..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] resize-none flex-1"
              rows={1}
            />
            <Button 
              onClick={handleAddComment} 
              disabled={!newComment.trim()} 
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentsDrawer;
