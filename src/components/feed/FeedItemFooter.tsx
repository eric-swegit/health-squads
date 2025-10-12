import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Bookmark } from "lucide-react";
import { FeedItem } from "./types";

interface FeedItemFooterProps {
  item: FeedItem;
  onLike: (item: FeedItem) => void;
  onOpenComments: (item: FeedItem) => void;
}

const FeedItemFooter = ({ item, onLike, onOpenComments }: FeedItemFooterProps) => {
  const commentsCount = item.commentsCount || 0;
  
  return (
    <div className="px-4 pt-1 pb-2">
      {/* Action buttons */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-0 hover:bg-transparent hover:opacity-60 transition-opacity"
            onClick={() => onLike(item)}
          >
            <Heart 
              className={`h-7 w-7 transition-all ${
                item.userLiked 
                  ? 'fill-red-500 text-red-500 scale-110' 
                  : 'stroke-foreground'
              }`} 
            />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-0 hover:bg-transparent hover:opacity-60 transition-opacity"
            onClick={() => onOpenComments(item)}
          >
            <MessageSquare className="h-7 w-7" />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-0 hover:bg-transparent hover:opacity-60 transition-opacity"
        >
          <Bookmark className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Likes count */}
      {item.likes > 0 && (
        <p className="text-sm font-semibold mb-1">
          {item.likes} {item.likes === 1 ? 'gillning' : 'gillar detta'}
        </p>
      )}
    </div>
  );
};

export default FeedItemFooter;
