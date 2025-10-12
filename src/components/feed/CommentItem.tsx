
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
    <div className="flex gap-3 py-2">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.profile_image_url || undefined} />
        <AvatarFallback>{comment.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold mr-2">{comment.user_name}</span>
              <span className="text-foreground">{comment.content}</span>
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 flex-shrink-0 -mt-1"
            onClick={onLike}
          >
            <Heart className={`h-3.5 w-3.5 ${comment.userLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: sv })}
          </p>
          {comment.likes > 0 && (
            <p className="text-xs text-gray-500 font-semibold">
              {comment.likes} {comment.likes === 1 ? 'gillning' : 'gillningar'}
            </p>
          )}
          <button className="text-xs font-semibold text-gray-500 hover:text-gray-700">
            Svara
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
