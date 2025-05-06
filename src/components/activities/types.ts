
import { Activity } from '@/types';

export interface ClaimedActivity {
  id: string;
  activityId: string;
}

export interface ActivityInfo {
  [key: string]: string;
}

export interface CategoryGroup {
  [key: string]: Activity[];
}
