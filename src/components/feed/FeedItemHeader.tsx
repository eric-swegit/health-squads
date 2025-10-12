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
    <header className="px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 overflow-hidden">
            <AvatarImage 
              src={item.profile_image_url || undefined} 
              className="object-cover"
            />
            <AvatarFallback>{item.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm leading-tight">{item.user_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: sv })}
            </p>
          </div>
        </div>
        <button className="p-2 hover:opacity-60 transition-opacity">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default FeedItemHeader;
