
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import { FeedItem } from "./types";

interface FeedItemFooterProps {
  item: FeedItem;
  onLike: (item: FeedItem) => void;
  onOpenComments: (item: FeedItem) => void;
  onComment: () => void;
}

const FeedItemFooter = ({ item, onLike, onOpenComments, onComment }: FeedItemFooterProps) => {
  return (
    <CardFooter className="p-4 pt-0 flex justify-between">
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs flex items-center gap-1"
          onClick={() => onLike(item)}
        >
          <Heart className={`h-4 w-4 ${item.userLiked ? 'fill-red-500 text-red-500' : ''}`} />
          {item.likes > 0 && <span>{item.likes} gillar</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs flex items-center gap-1"
          onClick={() => onOpenComments(item)}
        >
          <MessageSquare className="h-4 w-4" />
          {item.comments.length > 0 && <span>{item.comments.length} kommentarer</span>}
        </Button>
      </div>
    </CardFooter>
  );
};

export default FeedItemFooter;
