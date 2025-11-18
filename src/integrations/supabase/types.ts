export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          id: string
          name: string
          points: number
          progress_steps: number | null
          progressive: boolean
          requires_photo: boolean
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          points: number
          progress_steps?: number | null
          progressive?: boolean
          requires_photo?: boolean
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          points?: number
          progress_steps?: number | null
          progressive?: boolean
          requires_photo?: boolean
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      claimed_activities: {
        Row: {
          activity_id: string
          created_at: string
          date: string
          id: string
          photo_metadata: Json | null
          photo_url: string | null
          photo_urls: string[] | null
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          date?: string
          id?: string
          photo_metadata?: Json | null
          photo_url?: string | null
          photo_urls?: string[] | null
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          date?: string
          id?: string
          photo_metadata?: Json | null
          photo_url?: string | null
          photo_urls?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claimed_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          claimed_activity_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          claimed_activity_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          claimed_activity_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_claimed_activity_id_fkey"
            columns: ["claimed_activity_id"]
            isOneToOne: false
            referencedRelation: "claimed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_claimed_activity_id_fkey"
            columns: ["claimed_activity_id"]
            isOneToOne: false
            referencedRelation: "feed_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      gratitude_entries: {
        Row: {
          claimed_activity_id: string
          created_at: string | null
          gratitude_1: string
          gratitude_2: string
          gratitude_3: string
          id: string
          user_id: string
        }
        Insert: {
          claimed_activity_id: string
          created_at?: string | null
          gratitude_1: string
          gratitude_2: string
          gratitude_3: string
          id?: string
          user_id: string
        }
        Update: {
          claimed_activity_id?: string
          created_at?: string | null
          gratitude_1?: string
          gratitude_2?: string
          gratitude_3?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gratitude_entries_claimed_activity_id_fkey"
            columns: ["claimed_activity_id"]
            isOneToOne: false
            referencedRelation: "claimed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gratitude_entries_claimed_activity_id_fkey"
            columns: ["claimed_activity_id"]
            isOneToOne: false
            referencedRelation: "feed_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          claimed_activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          claimed_activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          claimed_activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_claimed_activity_id_fkey"
            columns: ["claimed_activity_id"]
            isOneToOne: false
            referencedRelation: "claimed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_claimed_activity_id_fkey"
            columns: ["claimed_activity_id"]
            isOneToOne: false
            referencedRelation: "feed_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          activity_id: string | null
          content: string
          created_at: string
          from_user_id: string | null
          id: string
          is_read: boolean
          type: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          content: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          is_read?: boolean
          type: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          content?: string
          created_at?: string
          from_user_id?: string | null
          id?: string
          is_read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "claimed_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "feed_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          daily_points: number
          email: string
          id: string
          name: string
          profile_image_url: string | null
          total_points: number
        }
        Insert: {
          created_at?: string
          daily_points?: number
          email: string
          id: string
          name: string
          profile_image_url?: string | null
          total_points?: number
        }
        Update: {
          created_at?: string
          daily_points?: number
          email?: string
          id?: string
          name?: string
          profile_image_url?: string | null
          total_points?: number
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          activity_id: string
          created_at: string
          current_progress: number
          id: string
          last_updated_at: string
          max_progress: number
          photo_urls: string[]
          progress_timestamps: string[]
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          current_progress?: number
          id?: string
          last_updated_at?: string
          max_progress: number
          photo_urls?: string[]
          progress_timestamps?: string[]
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          current_progress?: number
          id?: string
          last_updated_at?: string
          max_progress?: number
          photo_urls?: string[]
          progress_timestamps?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      feed_activities: {
        Row: {
          activity_id: string | null
          activity_name: string | null
          created_at: string | null
          date: string | null
          id: string | null
          photo_url: string | null
          photo_urls: string[] | null
          points: number | null
          profile_image_url: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claimed_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_comments_summary: {
        Args: { ids: string[] }
        Returns: {
          claimed_activity_id: string
          comments_count: number
        }[]
      }
      get_likes_summary: {
        Args: { ids: string[]; in_user: string }
        Returns: {
          claimed_activity_id: string
          likes_count: number
          user_liked: boolean
        }[]
      }
      get_profiles: {
        Args: never
        Returns: {
          created_at: string
          daily_points: number
          email: string
          id: string
          name: string
          profile_image_url: string | null
          total_points: number
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_profiles_filtered: {
        Args: never
        Returns: {
          created_at: string
          daily_points: number
          email: string
          id: string
          name: string
          profile_image_url: string
          total_points: number
        }[]
      }
      reset_daily_points_cron: { Args: never; Returns: undefined }
      reset_progress_tracking_cron: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
