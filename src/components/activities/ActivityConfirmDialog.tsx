
import { Activity } from '@/types';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface ActivityConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  onConfirm: () => void;
}

const ActivityConfirmDialog = ({
  open,
  onOpenChange,
  activity,
  onConfirm
}: ActivityConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bekräfta genomförd aktivitet</AlertDialogTitle>
          <AlertDialogDescription>
            Har du genomfört "{activity?.name}"? Detta kommer att ge dig {activity?.points} poäng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Ja, jag har genomfört aktiviteten
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ActivityConfirmDialog;
