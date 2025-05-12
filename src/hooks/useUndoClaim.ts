
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";

export const useUndoClaim = (
  undoClaimActivity: (activityId: string) => Promise<boolean>,
  refreshData: () => void
) => {
  const [undoInProgress, setUndoInProgress] = useState(false);
  
  const handleUndoClaim = async (activityId: string) => {
    if (undoInProgress) {
      toast.info("En annan aktivitet bearbetas redan, vänta lite");
      return;
    }
    
    setUndoInProgress(true);
    try {
      const success = await undoClaimActivity(activityId);
      if (success) {
        // Force a refresh after the undo completes successfully
        setTimeout(() => refreshData(), 500);
      }
    } finally {
      setUndoInProgress(false);
    }
  };
  
  return {
    undoInProgress,
    handleUndoClaim
  };
};
