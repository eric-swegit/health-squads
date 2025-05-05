
export interface User {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  dailyPoints: number;
}

export interface Activity {
  id: string;
  name: string;
  points: number;
  requiresPhoto: boolean;
  type: 'common' | 'personal';
  userId?: string;
  category?: 'physical' | 'diet' | 'mind';
  duration?: string;
  amount?: string;
}
