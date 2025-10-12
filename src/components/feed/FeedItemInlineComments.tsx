import { Comment } from "./types";

interface FeedItemInlineCommentsProps {
  comments: Comment[];
  totalCount: number;
  onViewAll: () => void;
}

const FeedItemInlineComments = ({ comments, totalCount, onViewAll }: FeedItemInlineCommentsProps) => {
  const displayComments = comments.slice(0, 2);
  const hasMore = totalCount > 2;

  if (totalCount === 0) return null;

  return (
    <div className="px-4 pb-2 space-y-1">
      {displayComments.map((comment) => (
        <div key={comment.id} className="text-sm">
          <span className="font-semibold mr-1">{comment.user_name}</span>
          <span>{comment.content}</span>
        </div>
      ))}
    </div>
  );
};

export default FeedItemInlineComments;
