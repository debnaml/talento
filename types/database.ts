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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      brief_invites: {
        Row: {
          brief_id: string
          invited_at: string | null
          note: string | null
          responded_at: string | null
          status: string
          talent_id: string
        }
        Insert: {
          brief_id: string
          invited_at?: string | null
          note?: string | null
          responded_at?: string | null
          status?: string
          talent_id: string
        }
        Update: {
          brief_id?: string
          invited_at?: string | null
          note?: string | null
          responded_at?: string | null
          status?: string
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_invites_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "casting_briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brief_invites_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_briefs: {
        Row: {
          age_range: string | null
          budget_gbp_max: number | null
          budget_gbp_min: number | null
          categories: Database["public"]["Enums"]["talent_category"][] | null
          closes_at: string | null
          country: string | null
          created_at: string | null
          description: string | null
          gender: Database["public"]["Enums"]["gender_identity"] | null
          height_max_cm: number | null
          height_min_cm: number | null
          id: string
          requires_verified: boolean | null
          requires_video: boolean | null
          requires_voice: boolean | null
          shoot_date: string | null
          status: Database["public"]["Enums"]["brief_status"]
          studio_id: string
          title: string
          updated_at: string | null
          usage_scope: string | null
        }
        Insert: {
          age_range?: string | null
          budget_gbp_max?: number | null
          budget_gbp_min?: number | null
          categories?: Database["public"]["Enums"]["talent_category"][] | null
          closes_at?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          height_max_cm?: number | null
          height_min_cm?: number | null
          id?: string
          requires_verified?: boolean | null
          requires_video?: boolean | null
          requires_voice?: boolean | null
          shoot_date?: string | null
          status?: Database["public"]["Enums"]["brief_status"]
          studio_id: string
          title: string
          updated_at?: string | null
          usage_scope?: string | null
        }
        Update: {
          age_range?: string | null
          budget_gbp_max?: number | null
          budget_gbp_min?: number | null
          categories?: Database["public"]["Enums"]["talent_category"][] | null
          closes_at?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          height_max_cm?: number | null
          height_min_cm?: number | null
          id?: string
          requires_verified?: boolean | null
          requires_video?: boolean | null
          requires_voice?: boolean | null
          shoot_date?: string | null
          status?: Database["public"]["Enums"]["brief_status"]
          studio_id?: string
          title?: string
          updated_at?: string | null
          usage_scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casting_briefs_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studio_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          brief_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          studio_id: string
          talent_id: string
        }
        Insert: {
          brief_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          studio_id: string
          talent_id: string
        }
        Update: {
          brief_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          studio_id?: string
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "casting_briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          kind: string
          payload: Json
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kind: string
          payload?: Json
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kind?: string
          payload?: Json
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          full_name: string | null
          id: string
          onboarded: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          full_name?: string | null
          id: string
          onboarded?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          onboarded?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      studio_profiles: {
        Row: {
          company_name: string
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          studio_type: Database["public"]["Enums"]["studio_type"]
          supplier_code: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company_name: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          logo_url?: string | null
          studio_type: Database["public"]["Enums"]["studio_type"]
          supplier_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          studio_type?: Database["public"]["Enums"]["studio_type"]
          supplier_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_images: {
        Row: {
          created_at: string | null
          file_size_bytes: number | null
          height: number | null
          id: string
          is_primary: boolean | null
          mime_type: string | null
          sort_order: number | null
          storage_path: string
          talent_id: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          mime_type?: string | null
          sort_order?: number | null
          storage_path: string
          talent_id: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          mime_type?: string | null
          sort_order?: number | null
          storage_path?: string
          talent_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_images_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_media: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          label: string | null
          mime_type: string | null
          poster_path: string | null
          sort_order: number | null
          storage_path: string
          talent_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          label?: string | null
          mime_type?: string | null
          poster_path?: string | null
          sort_order?: number | null
          storage_path: string
          talent_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          label?: string | null
          mime_type?: string | null
          poster_path?: string | null
          sort_order?: number | null
          storage_path?: string
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_media_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          age_range: string | null
          allows_adult: boolean | null
          allows_advertising: boolean | null
          allows_d2c: boolean | null
          allows_film: boolean | null
          allows_gaming: boolean | null
          allows_political: boolean | null
          bio: string | null
          categories: Database["public"]["Enums"]["talent_category"][] | null
          country: string | null
          created_at: string | null
          ethnicity: string | null
          gender: Database["public"]["Enums"]["gender_identity"] | null
          height_cm: number | null
          id: string
          location: string | null
          published: boolean | null
          stage_name: string
          tik: string | null
          updated_at: string | null
          username: string | null
          verified: boolean | null
        }
        Insert: {
          age_range?: string | null
          allows_adult?: boolean | null
          allows_advertising?: boolean | null
          allows_d2c?: boolean | null
          allows_film?: boolean | null
          allows_gaming?: boolean | null
          allows_political?: boolean | null
          bio?: string | null
          categories?: Database["public"]["Enums"]["talent_category"][] | null
          country?: string | null
          created_at?: string | null
          ethnicity?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          height_cm?: number | null
          id: string
          location?: string | null
          published?: boolean | null
          stage_name: string
          tik?: string | null
          updated_at?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Update: {
          age_range?: string | null
          allows_adult?: boolean | null
          allows_advertising?: boolean | null
          allows_d2c?: boolean | null
          allows_film?: boolean | null
          allows_gaming?: boolean | null
          allows_political?: boolean | null
          bio?: string | null
          categories?: Database["public"]["Enums"]["talent_category"][] | null
          country?: string | null
          created_at?: string | null
          ethnicity?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          height_cm?: number | null
          id?: string
          location?: string | null
          published?: boolean | null
          stage_name?: string
          tik?: string | null
          updated_at?: string | null
          username?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_saves: {
        Row: {
          created_at: string | null
          note: string | null
          studio_id: string
          talent_id: string
        }
        Insert: {
          created_at?: string | null
          note?: string | null
          studio_id: string
          talent_id: string
        }
        Update: {
          created_at?: string | null
          note?: string | null
          studio_id?: string
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_saves_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studio_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_saves_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_blocked: { Args: { a: string; b: string }; Returns: boolean }
      match_talent_for_brief: {
        Args: { p_brief_id: string }
        Returns: {
          age_range: string
          categories: Database["public"]["Enums"]["talent_category"][]
          country: string
          gender: Database["public"]["Enums"]["gender_identity"]
          height_cm: number
          id: string
          location: string
          primary_storage_path: string
          stage_name: string
          username: string
          verified: boolean
        }[]
      }
    }
    Enums: {
      brief_status: "draft" | "open" | "closed" | "cancelled"
      gender_identity: "male" | "female" | "non_binary" | "other" | "prefer_not"
      media_kind: "video" | "voice"
      studio_type:
        | "film_production"
        | "advertising_agency"
        | "gaming_studio"
        | "brand"
        | "music_label"
        | "other"
      talent_category:
        | "film"
        | "tv"
        | "advertising"
        | "gaming"
        | "d2c"
        | "sports"
        | "music"
        | "historical"
        | "stunt"
        | "action"
        | "drama"
        | "comedy"
      user_role: "talent" | "studio"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      brief_status: ["draft", "open", "closed", "cancelled"],
      gender_identity: ["male", "female", "non_binary", "other", "prefer_not"],
      media_kind: ["video", "voice"],
      studio_type: [
        "film_production",
        "advertising_agency",
        "gaming_studio",
        "brand",
        "music_label",
        "other",
      ],
      talent_category: [
        "film",
        "tv",
        "advertising",
        "gaming",
        "d2c",
        "sports",
        "music",
        "historical",
        "stunt",
        "action",
        "drama",
        "comedy",
      ],
      user_role: ["talent", "studio"],
    },
  },
} as const
