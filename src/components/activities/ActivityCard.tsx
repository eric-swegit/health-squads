
import { Camera, Info, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity } from '@/types';
import { getActivityIcon, getActivityTitle } from './utils';

interface ActivityCardProps {
  activity: Activity;
  isClaimed: boolean;
  onClaim: (activity: Activity) => void;
  onInfo: (activity: Activity) => void;
  onUndo: (activityId: string) => void;
}

const ActivityCard = ({ 
  activity, 
  isClaimed, 
  onClaim, 
  onInfo, 
  onUndo 
}: ActivityCardProps) => {
  const ActivityIcon = getActivityIcon(activity.name);
  const title = getActivityTitle(activity.name);
  const duration = activity.duration || "";
  
  return (
    <Card 
      key={activity.id} 
      className={`overflow-hidden transition-all hover:shadow-md cursor-pointer aspect-square max-h-[120px] ${
        isClaimed ? 'bg-gray-100 border-green-300' : ''
      }`}
      onClick={() => !isClaimed && onClaim(activity)}
    >
      <CardContent className="p-2 flex flex-col justify-between h-full relative">
        {/* Info button in top right */}
        <div className="absolute top-0 right-0 p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild onClick={(e) => {
                e.stopPropagation();
                onInfo(activity);
              }}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full bg-purple-50"
                >
                  <Info className="h-3 w-3 text-purple-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Visa info</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Icon in center */}
        <div className="flex flex-col items-center justify-center flex-1">
          <ActivityIcon className="h-6 w-6 text-purple-600 mb-1" />
          <h3 className="font-medium text-xs text-center">{title}</h3>
          <p className="text-xs text-gray-500 mt-1 text-center">{duration}</p>
        </div>
        
        {/* Status banner if claimed */}
        {isClaimed && (
          <div className="absolute inset-0 bg-green-100/70 flex flex-col items-center justify-center gap-2">
            <div className="bg-white/80 py-1 px-2 rounded-full shadow-sm">
              <span className="text-green-600 text-xs font-semibold">Genomförd</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1 py-1 px-2 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                onUndo(activity.id);
              }}
            >
              <RotateCcw className="h-3 w-3" /> Ångra
            </Button>
          </div>
        )}
        
        {/* Points in bottom right */}
        <div className="absolute bottom-1 right-1">
          <span className="text-xs font-bold text-purple-700">{activity.points}p</span>
        </div>
        
        {/* Camera indicator */}
        {activity.requiresPhoto && (
          <div className="absolute bottom-1 left-1">
            <Camera className="h-3 w-3 text-gray-400" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
