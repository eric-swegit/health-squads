
export interface FeedItem {
  id: string;
  user_id: string;
  activity_id: string;
  activity_name: string;
  user_name: string;
  profile_image_url: string | null;
  photo_url: string | null;
  created_at: string;
  points: number;
  likes: number;
  userLiked: boolean;
  comments: Comment[];
}

export interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  profile_image_url: string | null;
}
