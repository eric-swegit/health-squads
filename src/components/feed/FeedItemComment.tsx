
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedItem } from "./types";

interface FeedItemCommentProps {
  item: FeedItem;
  profile?: { image: string | null; name: string } | null;
  onAddComment: (itemId: string, comment: string) => void;
}

const FeedItemComment = ({ item, profile, onAddComment }: FeedItemCommentProps) => {
  const [newComment, setNewComment] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(item.id, newComment);
      setNewComment("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Auto-focus input when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="px-4 py-3 border-t flex items-start gap-2">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={profile?.image || undefined} />
        <AvatarFallback>{profile?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <Textarea 
        ref={textareaRef}
        placeholder="Skriv en kommentar..." 
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[40px] resize-none flex-1 py-2"
        rows={1}
      />
      <Button 
        onClick={handleAddComment} 
        disabled={!newComment.trim()} 
        size="icon"
        className="h-8 w-8 shrink-0 mt-1"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FeedItemComment;
