
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState } from "react";
import CommentItem from "./CommentItem";
import { FeedItem } from "./types";

interface CommentsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: FeedItem | null;
  onAddComment: (comment: string) => void;
}

const CommentsList = ({ open, onOpenChange, selectedItem, onAddComment }: CommentsListProps) => {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Kommentarer</DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto space-y-4 my-4">
          {!selectedItem || selectedItem.comments.length === 0 ? (
            <p className="text-center text-gray-500">Inga kommentarer än.</p>
          ) : (
            selectedItem.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
        <DialogFooter>
          <div className="flex w-full gap-2">
            <Input 
              placeholder="Skriv en kommentar..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsList;
