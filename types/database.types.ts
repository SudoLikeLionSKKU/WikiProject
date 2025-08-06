export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      Documents: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          location: string | null
          stars: number
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: number
          location?: string | null
          stars: number
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: number
          location?: string | null
          stars?: number
          title?: string | null
        }
        Relationships: []
      }
      Hashtags: {
        Row: {
          content: string | null
          created_at: string
          document_id: number | null
          id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          document_id?: number | null
          id?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          document_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Hashtags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "Documents"
            referencedColumns: ["id"]
          },
        ]
      }
      Reviews: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          document_id: number | null
          id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: number | null
          id?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Reviews_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "Documents"
            referencedColumns: ["id"]
          },
        ]
      }
      SectionRevisions: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          document_id: number | null
          id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: number | null
          id?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "SectionRevisions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "Documents"
            referencedColumns: ["id"]
          },
        ]
      }
      Sections: {
        Row: {
          created_at: string
          current_revision_id: number | null
          document_id: number | null
          id: number
          section_key: string | null
        }
        Insert: {
          created_at?: string
          current_revision_id?: number | null
          document_id?: number | null
          id?: number
          section_key?: string | null
        }
        Update: {
          created_at?: string
          current_revision_id?: number | null
          document_id?: number | null
          id?: number
          section_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Sections_current_revision_id_fkey"
            columns: ["current_revision_id"]
            isOneToOne: false
            referencedRelation: "SectionRevisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Sections_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "Documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
