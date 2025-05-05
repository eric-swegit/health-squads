
export type User = {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  dailyPoints: number;
};

export type Activity = {
  id: string;
  name: string;
  points: number;
  requiresPhoto: boolean;
  type: 'common' | 'personal';
  userId?: string; // Only for personal goals
};

export type ClaimedActivity = {
  id: string;
  userId: string;
  activityId: string;
  date: string;
  photoUrl?: string;
};
