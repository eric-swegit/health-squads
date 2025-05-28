
import { FeedItem } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentDrawerActivityProps {
  item: FeedItem;
}

const CommentDrawerActivity = ({ item }: CommentDrawerActivityProps) => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-start space-x-3">
        <Avatar className="flex-shrink-0">
          <AvatarImage src={item.profile_image_url || undefined} />
          <AvatarFallback>{item.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{item.user_name}</p>
          <p className="text-sm text-gray-500">{item.activity_name}</p>
        </div>
        
        {item.photo_url && (
          <div className="flex-shrink-0 w-16 h-16">
            <img 
              src={item.photo_url} 
              alt="Activity" 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentDrawerActivity;
