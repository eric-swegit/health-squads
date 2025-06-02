
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_image_url: string | null;
  total_points: number;
  daily_points: number;
}

export interface UserStats {
  totalActivities: number;
  activitiesThisWeek: number;
  streak: number;
  longestStreak: number;
}
