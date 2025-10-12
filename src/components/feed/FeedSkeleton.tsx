import { Skeleton } from "@/components/ui/skeleton";

const FeedSkeleton = () => {
  return (
    <div className="bg-background border-b border-border">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Image */}
      <Skeleton className="w-full aspect-[4/5]" />

      {/* Footer */}
      <div className="px-4 py-2 space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
};

export default FeedSkeleton;
