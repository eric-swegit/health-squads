
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageSquare, Heart } from "lucide-react";
import { FeedItem } from "./types";

interface FeedItemFooterProps {
  item: FeedItem;
  onLike: (item: FeedItem) => void;
  onOpenComments: (item: FeedItem) => void;
}

const FeedItemFooter = ({ item, onLike, onOpenComments }: FeedItemFooterProps) => {
  return (
    <CardFooter className="p-4 pt-0 flex flex-col">
      <div className="flex justify-between items-center w-full py-2 border-t border-gray-100">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => onLike(item)}
        >
          {item.userLiked ? (
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span>{item.likes}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={() => onOpenComments(item)}
        >
          <MessageSquare className="h-5 w-5" />
          <span>{item.comments.length}</span>
        </Button>
      </div>
      
      {item.comments.length > 0 && (
        <div className="pt-2 w-full">
          <div className="text-sm">
            <span className="font-medium">{item.comments[0].user_name}</span>{" "}
            <span>{item.comments[0].content}</span>
          </div>
          {item.comments.length > 1 && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-gray-500"
              onClick={() => onOpenComments(item)}
            >
              Visa alla {item.comments.length} kommentarer
            </Button>
          )}
        </div>
      )}
    </CardFooter>
  );
};

export default FeedItemFooter;
