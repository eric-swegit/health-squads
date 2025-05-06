
import { Activity, ClaimedActivity } from '@/types';
import { getActivityCategory } from '@/components/activities/utils';

/**
 * Converts snake_case DB activity records to camelCase Activity objects
 */
export const mapDbActivityToActivity = (dbActivity: any): Activity => {
  // Calculate the category based on activity name
  const category = getActivityCategory(dbActivity.name);
  
  return {
    id: dbActivity.id,
    name: dbActivity.name,
    points: dbActivity.points,
    requiresPhoto: dbActivity.requires_photo,
    type: dbActivity.type,
    userId: dbActivity.user_id,
    category: category, // Set the calculated category
    duration: dbActivity.duration || null,
    amount: dbActivity.amount || null
  };
};

/**
 * Maps an array of DB activities to Activity objects
 */
export const mapDbActivitiesToActivities = (dbActivities: any[]): Activity[] => {
  return dbActivities ? dbActivities.map(mapDbActivityToActivity) : [];
};
