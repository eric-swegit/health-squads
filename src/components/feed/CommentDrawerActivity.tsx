
import { FeedItem } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentDrawerActivityProps {
  item: FeedItem;
}

const CommentDrawerActivity = ({ item }: CommentDrawerActivityProps) => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={item.profile_image_url || undefined} />
          <AvatarFallback>{item.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{item.user_name}</p>
          <p className="text-sm text-gray-500">{item.activity_name}</p>
        </div>
      </div>
      {item.photo_url && (
        <div className="mt-2">
          <img src={item.photo_url} alt="Activity" className="w-full h-auto rounded-md" />
        </div>
      )}
    </div>
  );
};

export default CommentDrawerActivity;
