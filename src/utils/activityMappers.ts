
import { Activity, ClaimedActivity } from '@/types';

/**
 * Converts snake_case DB activity records to camelCase Activity objects
 */
export const mapDbActivityToActivity = (dbActivity: any): Activity => {
  return {
    id: dbActivity.id,
    name: dbActivity.name,
    points: dbActivity.points,
    requiresPhoto: dbActivity.requires_photo,
    type: dbActivity.type,
    userId: dbActivity.user_id,
    category: dbActivity.category || null,
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
