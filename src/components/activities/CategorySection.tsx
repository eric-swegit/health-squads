
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Activity } from '@/types';
import ActivityCard from './ActivityCard';
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [expanded, setExpanded] = useState(true);
  const isMobile = useIsMobile();
  
  if (activities.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium text-gray-700">{title}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
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
      )}
    </div>
  );
};

export default CategorySection;
