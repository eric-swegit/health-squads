import FeedItemHeader from "./FeedItemHeader";
import FeedItemContent from "./FeedItemContent";
import FeedItemFooter from "./FeedItemFooter";
import FeedItemInlineComments from "./FeedItemInlineComments";
import { FeedItem as FeedItemType } from "./types";

interface FeedItemProps {
  item: FeedItemType;
  onLike: (item: FeedItemType) => void;
  onOpenComments: (item: FeedItemType) => void;
  onOpenImage: (imageUrl: string, allImages?: string[]) => void;
}

const FeedItem = ({ item, onLike, onOpenComments, onOpenImage }: FeedItemProps) => {
  return (
    <article className="bg-background border-b border-border">
      <FeedItemHeader item={item} />
      <FeedItemContent 
        item={item} 
        onOpenImage={onOpenImage}
        onLike={onLike}
      />
      <FeedItemFooter 
        item={item} 
        onLike={onLike} 
        onOpenComments={onOpenComments}
      />
      <FeedItemInlineComments 
        comments={item.comments || []}
        totalCount={item.commentsCount || 0}
        onViewAll={() => onOpenComments(item)}
      />
    </article>
  );
};

export default FeedItem;
