
import { CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { FeedItem } from "./types";

interface FeedItemHeaderProps {
  item: FeedItem;
}

const FeedItemHeader = ({ item }: FeedItemHeaderProps) => {
  return (
    <CardHeader className="p-4 pb-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 overflow-hidden">
            <AvatarImage 
              src={item.profile_image_url || undefined} 
              className="object-cover"
            />
            <AvatarFallback>{item.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.user_name}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: sv })}
            </p>
          </div>
        </div>
        <MoreVertical className="h-5 w-5 text-gray-400" />
      </div>
    </CardHeader>
  );
};

export default FeedItemHeader;
