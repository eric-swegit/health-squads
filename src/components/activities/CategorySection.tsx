
import { Activity } from '@/types';
import ActivityCard from './ActivityCard';

interface CategorySectionProps {
  title: string;
  activities: Activity[];
  claimedToday: string[];
  onClaim: (activity: Activity) => void;
  onInfo: (activity: Activity) => void;
  onUndo: (activityId: string) => void;
}

const CategorySection = ({
  title,
  activities,
  claimedToday,
  onClaim,
  onInfo,
  onUndo
}: CategorySectionProps) => {
  if (activities.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <div className="grid grid-cols-3 gap-3">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isClaimed={claimedToday.includes(activity.id)}
            onClaim={onClaim}
            onInfo={onInfo}
            onUndo={onUndo}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
