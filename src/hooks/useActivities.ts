
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
    loading: activitiesLoading 
  } = useActivityList(user, lastRefresh);
  
  const {
    claimedToday,
    saveClaimedActivity,
    undoClaimActivity
  } = useClaimedActivities(user, lastRefresh);

  const refreshData = () => {
    setLastRefresh(Date.now());
  };

  const loading = authLoading || activitiesLoading;

  return {
    commonActivities,
    personalActivities,
    claimedToday,
    loading,
    user,
    saveClaimedActivity,
    undoClaimActivity
  };
};
