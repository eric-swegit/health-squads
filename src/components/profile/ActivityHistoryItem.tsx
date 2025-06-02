
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { ProfileActivityItem } from "@/hooks/useProfileActivityHistory";

interface ActivityHistoryItemProps {
  activity: ProfileActivityItem;
}

const ActivityHistoryItem = ({ activity }: ActivityHistoryItemProps) => {
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        return "Just nu";
      }
      if (diffInHours < 2) {
        return "1 timme sedan";
      }
      return `${Math.floor(diffInHours)} timmar sedan`;
    }
    
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: sv 
    });
  };

  const getActivityImage = () => {
    if (activity.photo_urls && activity.photo_urls.length > 0) {
      return activity.photo_urls[0];
    }
    return activity.photo_url;
  };

  const activityImage = getActivityImage();

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 truncate">
            {activity.activity_name}
          </h4>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            +{activity.points}p
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {formatRelativeDate(activity.created_at)}
        </p>
      </div>
      
      {activityImage && (
        <div className="flex-shrink-0 w-12 h-12">
          <img 
            src={activityImage} 
            alt="Aktivitetsbild" 
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ActivityHistoryItem;
