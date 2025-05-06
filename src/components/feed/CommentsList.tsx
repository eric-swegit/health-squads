
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { useState } from "react";
import CommentItem from "./CommentItem";
import { FeedItem } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";

interface CommentsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: FeedItem | null;
  onAddComment: (comment: string) => void;
}

const CommentsList = ({ open, onOpenChange, selectedItem, onAddComment }: CommentsListProps) => {
  const [newComment, setNewComment] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus the comment input when the dialog opens
  useEffect(() => {
    if (open && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [selectedItem?.comments.length]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Kommentarer</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
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
        
        {/* Comments List */}
        <div 
          ref={commentsContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {!selectedItem || selectedItem.comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Inga kommentarer än. Bli först med att kommentera!</p>
          ) : (
            selectedItem.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
        
        {/* Comment Input */}
        <div className="p-3 border-t flex items-end gap-2">
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
      </DialogContent>
    </Dialog>
  );
};

export default CommentsList;
