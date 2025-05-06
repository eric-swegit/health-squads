
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { Comment } from "./types";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentItemProps {
  comment: Comment;
  onLike: () => void;
}

const CommentItem = ({ comment, onLike }: CommentItemProps) => {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.profile_image_url || undefined} />
        <AvatarFallback>{comment.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg p-2">
          <p className="font-medium text-sm">{comment.user_name}</p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center mt-1 gap-2">
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: sv })}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs flex items-center gap-1"
            onClick={onLike}
          >
            <Heart className={`h-3 w-3 ${comment.userLiked ? 'fill-red-500 text-red-500' : ''}`} />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
