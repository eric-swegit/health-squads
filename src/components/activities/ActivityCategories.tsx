
import { Activity } from '@/types';
import CategorySection from './CategorySection';
import EmptyActivities from './EmptyActivities';
import { groupActivitiesByCategory, getCategoryTitle } from './utils';

interface ActivityCategoriesProps {
  activities: Activity[];
  activeSection: 'common' | 'personal';
  claimedToday: string[];
  progressiveActivities?: Record<string, {
    currentProgress: number;
    maxProgress: number;
    photoUrls: string[];
  }>;
  onClaim: (activity: Activity) => void;
  onInfo: (activity: Activity) => void;
  onUndo: (activityId: string) => void;
  onReset?: (activityId: string) => void;
}

const ActivityCategories = ({ 
  activities, 
  activeSection, 
  claimedToday, 
  progressiveActivities = {},
  onClaim, 
  onInfo, 
  onUndo,
  onReset
}: ActivityCategoriesProps) => {
  const groupedActivities = groupActivitiesByCategory(activities);
  const hasAnyActivities = activities.length > 0;
  const hasCategories = Object.values(groupedActivities).some(arr => arr.length > 0);
  
  return (
    <>
      {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
        <CategorySection
          key={category}
          title={getCategoryTitle(category)}
          activities={categoryActivities}
          claimedToday={claimedToday}
          progressiveActivities={progressiveActivities}
          onClaim={onClaim}
          onInfo={onInfo}
          onUndo={onUndo}
          onReset={onReset}
        />
      ))}
      
      <EmptyActivities 
        isPersonal={activeSection === 'personal'} 
        hasCategories={hasCategories}
      />
    </>
  );
};

export default ActivityCategories;
