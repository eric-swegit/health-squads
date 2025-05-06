
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { Comment } from "./types";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
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
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: sv })}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
