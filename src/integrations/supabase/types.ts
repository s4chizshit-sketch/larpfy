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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      affiliates: {
        Row: {
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          platform: string
          published: boolean
          sort_order: number
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          platform?: string
          published?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          platform?: string
          published?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount: number
          created_at: string
          id: string
          paid_at: string | null
          plan_id: string
          status: string
          telegram_notified_at: string | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          paid_at?: string | null
          plan_id: string
          status?: string
          telegram_notified_at?: string | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          plan_id?: string
          status?: string
          telegram_notified_at?: string | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          details: string | null
          id: string
          method: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          details?: string | null
          id?: string
          method: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          details?: string | null
          id?: string
          method?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_purchases: {
        Row: {
          billing_period: string
          created_at: string
          duration_days: number | null
          expires_at: string | null
          id: string
          plan_id: string | null
          plan_name: string
          price: number
          started_at: string
          user_id: string
        }
        Insert: {
          billing_period: string
          created_at?: string
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          plan_name: string
          price?: number
          started_at?: string
          user_id: string
        }
        Update: {
          billing_period?: string
          created_at?: string
          duration_days?: number | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          plan_name?: string
          price?: number
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          billing_period: string
          created_at: string
          cta: string
          features: string[]
          id: string
          name: string
          popular: boolean
          price: number
          sort_order: number
        }
        Insert: {
          active?: boolean
          billing_period?: string
          created_at?: string
          cta?: string
          features?: string[]
          id?: string
          name: string
          popular?: boolean
          price?: number
          sort_order?: number
        }
        Update: {
          active?: boolean
          billing_period?: string
          created_at?: string
          cta?: string
          features?: string[]
          id?: string
          name?: string
          popular?: boolean
          price?: number
          sort_order?: number
        }
        Relationships: []
      }
      private_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_country: string | null
          last_ip: string | null
          last_seen_at: string | null
          name: string | null
          plan_id: string | null
          signup_country: string | null
          signup_ip: string | null
          status: string
          subscription_status: string
          total_seconds: number
          visit_count: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          last_country?: string | null
          last_ip?: string | null
          last_seen_at?: string | null
          name?: string | null
          plan_id?: string | null
          signup_country?: string | null
          signup_ip?: string | null
          status?: string
          subscription_status?: string
          total_seconds?: number
          visit_count?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_country?: string | null
          last_ip?: string | null
          last_seen_at?: string | null
          name?: string | null
          plan_id?: string | null
          signup_country?: string | null
          signup_ip?: string | null
          status?: string
          subscription_status?: string
          total_seconds?: number
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          data: Json
          id: string
          name: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          name: string
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          name?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_clicks: {
        Row: {
          affiliate_user_id: string
          created_at: string
          id: string
        }
        Insert: {
          affiliate_user_id: string
          created_at?: string
          id?: string
        }
        Update: {
          affiliate_user_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          affiliate_user_id: string
          commission: number
          commission_status: string
          created_at: string
          id: string
          referred_user_id: string
          status: string
        }
        Insert: {
          affiliate_user_id: string
          commission?: number
          commission_status?: string
          created_at?: string
          id?: string
          referred_user_id: string
          status?: string
        }
        Update: {
          affiliate_user_id?: string
          commission?: number
          commission_status?: string
          created_at?: string
          id?: string
          referred_user_id?: string
          status?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          country: string | null
          created_at: string
          id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_visit_time: { Args: { _seconds: number }; Returns: undefined }
      admin_stats: { Args: never; Returns: Json }
      create_payment_order: { Args: { _plan_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      oxapay_ack_alert: {
        Args: { _key_hash: string; _order_id: string }
        Returns: undefined
      }
      oxapay_is_ready: { Args: { _key_hash: string }; Returns: boolean }
      oxapay_mark_paid: {
        Args: { _key_hash: string; _order_id: string; _track_id?: string }
        Returns: Json
      }
      record_my_visit: {
        Args: { _country: string; _ip: string }
        Returns: Json
      }
      set_order_track: {
        Args: { _order_id: string; _track: string }
        Returns: undefined
      }
      set_oxapay_key_hash: { Args: { _hash: string }; Returns: undefined }
      track_referral_click: { Args: { _code: string }; Returns: undefined }
      track_site_visit: { Args: { _country: string }; Returns: undefined }
      update_my_name: { Args: { _name: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
