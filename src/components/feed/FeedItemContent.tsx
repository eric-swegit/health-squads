
import { CardContent } from "@/components/ui/card";
import { FeedItem } from "./types";

interface FeedItemContentProps {
  item: FeedItem;
  onOpenImage: (imageUrl: string) => void;
}

const FeedItemContent = ({ item, onOpenImage }: FeedItemContentProps) => {
  return (
    <CardContent className="p-4">
      <p className="mb-2">
        Genomförde <span className="font-medium">{item.activity_name}</span> och tjänade <span className="font-medium text-purple-600">{item.points}p</span>!
      </p>
      
      {item.photo_url && (
        <div 
          className="mt-3 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onOpenImage(item.photo_url!)}
        >
          <img 
            src={item.photo_url} 
            alt={item.activity_name}
            className="w-full h-auto max-h-[300px] object-contain bg-black"
          />
        </div>
      )}
    </CardContent>
  );
};

export default FeedItemContent;
