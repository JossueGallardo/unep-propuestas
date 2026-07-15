export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          created_at?: string;
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      proposals: {
        Row: {
          archived_at: string | null;
          category: Database["public"]["Enums"]["proposal_category"];
          community_role: Database["public"]["Enums"]["community_role"] | null;
          course_or_area: string | null;
          created_at: string;
          custom_category: string | null;
          description: string;
          expected_benefit: string | null;
          id: string;
          is_anonymous: boolean;
          reference_code: string;
          reviewed_at: string | null;
          search_document: unknown;
          status: Database["public"]["Enums"]["proposal_status"];
          submitter_name: string | null;
          title: string;
        };
        Insert: {
          archived_at?: string | null;
          category: Database["public"]["Enums"]["proposal_category"];
          community_role?: Database["public"]["Enums"]["community_role"] | null;
          course_or_area?: string | null;
          created_at?: string;
          custom_category?: string | null;
          description: string;
          expected_benefit?: string | null;
          id?: string;
          is_anonymous: boolean;
          reference_code: string;
          reviewed_at?: string | null;
          search_document?: unknown;
          status?: Database["public"]["Enums"]["proposal_status"];
          submitter_name?: string | null;
          title: string;
        };
        Update: {
          archived_at?: string | null;
          category?: Database["public"]["Enums"]["proposal_category"];
          community_role?: Database["public"]["Enums"]["community_role"] | null;
          course_or_area?: string | null;
          created_at?: string;
          custom_category?: string | null;
          description?: string;
          expected_benefit?: string | null;
          id?: string;
          is_anonymous?: boolean;
          reference_code?: string;
          reviewed_at?: string | null;
          search_document?: unknown;
          status?: Database["public"]["Enums"]["proposal_status"];
          submitter_name?: string | null;
          title?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_proposal_counts: { Args: never; Returns: Json };
      submit_proposal: {
        Args: {
          p_category: Database["public"]["Enums"]["proposal_category"];
          p_community_role:
            Database["public"]["Enums"]["community_role"] | null;
          p_course_or_area: string | null;
          p_custom_category: string | null;
          p_description: string;
          p_expected_benefit: string | null;
          p_is_anonymous: boolean;
          p_rate_limit_key: string;
          p_rpc_secret: string;
          p_submitter_name: string | null;
          p_title: string;
        };
        Returns: string;
      };
    };
    Enums: {
      app_role: "admin";
      community_role:
        "estudiante" | "docente" | "familia" | "personal" | "otro";
      proposal_category:
        | "academico"
        | "infraestructura_espacios"
        | "convivencia_bienestar"
        | "cultura_eventos"
        | "deportes_recreacion"
        | "tecnologia"
        | "medio_ambiente"
        | "seguridad"
        | "otra";
      proposal_status: "nueva" | "revisada" | "archivada";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      community_role: ["estudiante", "docente", "familia", "personal", "otro"],
      proposal_category: [
        "academico",
        "infraestructura_espacios",
        "convivencia_bienestar",
        "cultura_eventos",
        "deportes_recreacion",
        "tecnologia",
        "medio_ambiente",
        "seguridad",
        "otra",
      ],
      proposal_status: ["nueva", "revisada", "archivada"],
    },
  },
} as const;

export type ProposalRow = Database["public"]["Tables"]["proposals"]["Row"];
