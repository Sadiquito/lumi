export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          metadata: Json | null
          resource: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          ai_response: string
          created_at: string
          id: string
          transcript: string
          user_id: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          id?: string
          transcript: string
          user_id: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          id?: string
          transcript?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_advice: {
        Row: {
          advice_text: string
          created_at: string
          id: string
          metadata: Json | null
          personalization_level: string | null
          user_id: string
        }
        Insert: {
          advice_text: string
          created_at?: string
          id?: string
          metadata?: Json | null
          personalization_level?: string | null
          user_id: string
        }
        Update: {
          advice_text?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          personalization_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_advice_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      personalization_profiles: {
        Row: {
          id: string
          psychological_portrait_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          psychological_portrait_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          psychological_portrait_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personalization_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_health: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_date: string
          metric_hour: number
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_hour?: number
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_hour?: number
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      trial_conversions: {
        Row: {
          conversion_date: string | null
          conversion_type: string | null
          created_at: string
          days_to_conversion: number | null
          id: string
          metadata: Json | null
          trial_start_date: string
          user_id: string
        }
        Insert: {
          conversion_date?: string | null
          conversion_type?: string | null
          created_at?: string
          days_to_conversion?: number | null
          id?: string
          metadata?: Json | null
          trial_start_date: string
          user_id: string
        }
        Update: {
          conversion_date?: string | null
          conversion_type?: string | null
          created_at?: string
          days_to_conversion?: number | null
          id?: string
          metadata?: Json | null
          trial_start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_count: number
          activity_date: string
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_count?: number
          activity_date?: string
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_count?: number
          activity_date?: string
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          call_time: string | null
          created_at: string
          id: string
          max_retries: number | null
          phone_number: string | null
          preferred_channel: string | null
          privacy_settings: Json | null
          retry_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          call_time?: string | null
          created_at?: string
          id?: string
          max_retries?: number | null
          phone_number?: string | null
          preferred_channel?: string | null
          privacy_settings?: Json | null
          retry_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          call_time?: string | null
          created_at?: string
          id?: string
          max_retries?: number | null
          phone_number?: string | null
          preferred_channel?: string | null
          privacy_settings?: Json | null
          retry_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          subscription_status: string
          trial_start_date: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          subscription_status?: string
          trial_start_date?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          subscription_status?: string
          trial_start_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_use_ai_advice: {
        Args: { user_id: string }
        Returns: boolean
      }
      can_use_tts: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_anonymized_user_activity: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          user_hash: string
          activity_date: string
          activity_type: string
          total_activities: number
        }[]
      }
      get_daily_user_activity: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          activity_date: string
          activity_type: string
          total_users: number
          total_activities: number
        }[]
      }
      get_privacy_safe_conversions: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          conversion_date: string
          conversion_type: string
          conversion_count: number
          avg_days_to_conversion: number
        }[]
      }
      get_system_health_metrics: {
        Args: { metric_name?: string; start_date?: string; end_date?: string }
        Returns: {
          metric_name: string
          metric_date: string
          avg_value: number
          min_value: number
          max_value: number
          data_points: number
        }[]
      }
      get_trial_conversion_stats: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          conversion_date: string
          conversion_type: string
          conversion_count: number
          avg_days_to_conversion: number
        }[]
      }
      get_trial_days_remaining: {
        Args: { user_id: string }
        Returns: number
      }
      has_admin_role: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_premium_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_trial_expired: {
        Args: { user_id: string }
        Returns: boolean
      }
      track_anonymized_activity: {
        Args: { activity_type: string }
        Returns: undefined
      }
      track_user_activity: {
        Args: { activity_type: string; user_id?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
