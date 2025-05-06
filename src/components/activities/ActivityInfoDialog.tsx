
import { Activity } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ActivityInfo } from './types';

interface ActivityInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  activityInfo: ActivityInfo;
}

const ActivityInfoDialog = ({
  open,
  onOpenChange,
  activity,
  activityInfo
}: ActivityInfoDialogProps) => {
  if (!activity) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activity?.name}</DialogTitle>
          <DialogDescription>
            {activity && activityInfo[activity.name] ? 
              activityInfo[activity.name] : 
              "Ingen beskrivning tillgänglig för denna aktivitet."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            Poäng: <span className="font-bold text-purple-700">{activity?.points}p</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {activity?.requiresPhoto ? "Kräver foto" : "Inget foto krävs"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityInfoDialog;
