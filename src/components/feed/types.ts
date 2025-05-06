
export interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  profile_image_url: string | null;
  likes: number;
  userLiked: boolean;
}

export interface FeedItem {
  id: string;
  user_id: string;
  user_name: string;
  profile_image_url: string | null;
  activity_id: string;
  activity_name: string;
  photo_url: string | null;
  date: string;
  created_at: string;
  points: number;
  likes: number;
  userLiked: boolean;
  comments: Comment[];
}
