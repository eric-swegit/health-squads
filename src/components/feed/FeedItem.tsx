
import { Card } from "@/components/ui/card";
import FeedItemHeader from "./FeedItemHeader";
import FeedItemContent from "./FeedItemContent";
import FeedItemFooter from "./FeedItemFooter";
import { FeedItem as FeedItemType } from "./types";

interface FeedItemProps {
  item: FeedItemType;
  onLike: (item: FeedItemType) => void;
  onOpenComments: (item: FeedItemType) => void;
  onOpenImage: (imageUrl: string) => void;
}

const FeedItem = ({ item, onLike, onOpenComments, onOpenImage }: FeedItemProps) => {
  return (
    <Card className="overflow-hidden">
      <FeedItemHeader item={item} />
      <FeedItemContent item={item} onOpenImage={onOpenImage} />
      <FeedItemFooter 
        item={item} 
        onLike={onLike} 
        onOpenComments={onOpenComments}
      />
    </Card>
  );
};

export default FeedItem;
