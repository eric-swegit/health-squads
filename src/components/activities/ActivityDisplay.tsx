
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from '@/types';
import ActivityFilters from './ActivityFilters';
import ActivityCategories from './ActivityCategories';

interface ActivityDisplayProps {
  activeSection: 'common' | 'personal';
  setActiveSection: (section: 'common' | 'personal') => void;
  activities: Activity[];
  claimedToday: string[];
  progressiveActivities: Record<string, {
    currentProgress: number;
    maxProgress: number;
    photoUrls: string[];
  }>;
  error: string | null;
  onClaim: (activity: Activity) => void;
  onInfo: (activity: Activity) => void;
  onUndo: (activityId: string) => void;
  onReset?: (activityId: string) => void;
}

const ActivityDisplay = ({
  activeSection,
  setActiveSection,
  activities,
  claimedToday,
  progressiveActivities,
  error,
  onClaim,
  onInfo,
  onUndo,
  onReset
}: ActivityDisplayProps) => {
  return (
    <Card className="p-4">
      <ActivityFilters 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />

      <CardContent className="p-0">
        {error ? (
          <div className="text-center p-8 text-red-500">
            Ett fel uppstod: {error}. Försök igen senare.
          </div>
        ) : (
          <ActivityCategories
            activities={activities}
            activeSection={activeSection}
            claimedToday={claimedToday}
            progressiveActivities={progressiveActivities}
            onClaim={onClaim}
            onInfo={onInfo}
            onUndo={onUndo}
            onReset={onReset}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityDisplay;
