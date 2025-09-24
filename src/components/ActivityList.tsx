
import { useState } from 'react';
import { Activity } from '@/types';
import { useActivities } from '@/hooks/useActivities';
import ActivityInfoDialog from './activities/ActivityInfoDialog';
import ActivityConfirmDialog from './activities/ActivityConfirmDialog';
import ActivityDisplay from './activities/ActivityDisplay';
import { useActivityClaim } from '@/hooks/useActivityClaim';
import { useUndoClaim } from '@/hooks/useUndoClaim';
import { activityInfo } from './activities/utils';
import { UploadProgress } from './ui/upload-progress';

const ActivityList = () => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'common' | 'personal'>('common');

  const {
    commonActivities,
    personalActivities,
    claimedToday,
    progressiveActivities,
    loading,
    error,
    user,
    saveClaimedActivity,
    undoClaimActivity,
    refreshData
  } = useActivities();

  // Hook for handling undo claim functionality
  const { handleUndoClaim } = useUndoClaim(undoClaimActivity, refreshData);

  // Hook for handling claim functionality
  const {
    selectedActivity,
    setSelectedActivity,
    confirmOpen,
    setConfirmOpen,
    handleClaim,
    handleConfirmClaim,
    uploading,
    uploadProgress
  } = useActivityClaim(
    user,
    claimedToday,
    progressiveActivities,
    saveClaimedActivity,
    refreshData
  );

  const getActivitiesBySection = () => {
    return activeSection === 'common' ? commonActivities : personalActivities;
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar aktiviteter...</div>;
  }

  return (
    <div className="space-y-4">
      <ActivityDisplay
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activities={getActivitiesBySection()}
        claimedToday={claimedToday}
        progressiveActivities={progressiveActivities}
        error={error}
        onClaim={handleClaim}
        onInfo={(activity) => {
          setSelectedActivity(activity);
          setInfoOpen(true);
        }}
        onUndo={handleUndoClaim}
      />

      {/* Info Dialog */}
      <ActivityInfoDialog
        open={infoOpen}
        onOpenChange={setInfoOpen}
        activity={selectedActivity}
        activityInfo={activityInfo}
      />

      {/* Confirmation Dialog */}
      <ActivityConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        activity={selectedActivity}
        onConfirm={handleConfirmClaim}
      />

      {/* Upload Progress */}
      {uploadProgress && (
        <UploadProgress
          stage={uploadProgress.stage}
          progress={uploadProgress.progress}
          message={uploadProgress.message}
        />
      )}
    </div>
  );
};

export default ActivityList;
