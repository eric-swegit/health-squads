
import { Activity } from '@/types';
import CategorySection from './CategorySection';
import EmptyActivities from './EmptyActivities';
import { groupActivitiesByCategory, getCategoryTitle } from './utils';

interface ActivityCategoriesProps {
  activities: Activity[];
  activeSection: 'common' | 'personal';
  claimedToday: string[];
  onClaim: (activity: Activity) => void;
  onInfo: (activity: Activity) => void;
  onUndo: (activityId: string) => void;
}

const ActivityCategories = ({ 
  activities, 
  activeSection, 
  claimedToday, 
  onClaim, 
  onInfo, 
  onUndo 
}: ActivityCategoriesProps) => {
  const groupedActivities = groupActivitiesByCategory(activities);
  const hasCategories = Object.values(groupedActivities).some(arr => arr.length > 0);
  
  return (
    <>
      {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
        <CategorySection
          key={category}
          title={getCategoryTitle(category)}
          activities={categoryActivities}
          claimedToday={claimedToday}
          onClaim={onClaim}
          onInfo={onInfo}
          onUndo={onUndo}
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
