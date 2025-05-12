
import { useState } from 'react';
import { Activity } from '@/types';
import { useAuth } from './useAuth';
import { useActivityList } from './useActivityList';
import { useClaimedActivities } from './useClaimedActivities';

export const useActivities = () => {
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const { user, loading: authLoading } = useAuth();
  
  const { 
    commonActivities, 
    personalActivities, 
    loading: activitiesLoading,
    error: activitiesError
  } = useActivityList(user, lastRefresh);
  
  const {
    claimedToday,
    progressiveActivities,
    saveClaimedActivity,
    undoClaimActivity,
    error: claimedError
  } = useClaimedActivities(user, lastRefresh);

  const refreshData = () => {
    setLastRefresh(Date.now());
  };

  const loading = authLoading || activitiesLoading;
  const error = activitiesError || claimedError;

  return {
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
  };
};
