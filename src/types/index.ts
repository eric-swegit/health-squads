
export interface User {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  dailyPoints: number;
  profileImageUrl?: string;
}

export interface Activity {
  id: string;
  name: string;
  points: number;
  requiresPhoto: boolean;
  requiresGratitude?: boolean;
  type: 'common' | 'personal';
  userId?: string;
  category?: 'physical' | 'diet' | 'mind';
  duration?: string;
  amount?: string;
  progressive?: boolean;
  progress_steps?: number;
}

export interface ClaimedActivity {
  id: string;
  userId: string;
  activityId: string;
  date: string;
  photoUrl?: string;
  photoUrls?: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  claimedActivityId: string;
  content: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  claimedActivityId: string;
  createdAt: string;
}

export interface ProgressTracking {
  id: string;
  userId: string;
  activityId: string;
  currentProgress: number;
  maxProgress: number;
  photoUrls: string[];
  progressTimestamps: string[];
  createdAt: string;
  lastUpdatedAt: string;
}

export interface GratitudeEntry {
  id: string;
  userId: string;
  claimedActivityId: string;
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  createdAt: string;
}
