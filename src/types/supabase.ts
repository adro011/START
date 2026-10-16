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
      addresses: {
        Row: {
          area: string | null
          created_at: string
          district: string | null
          division: string | null
          id: string
          is_default: boolean
          line1: string
          name: string
          notes: string | null
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          district?: string | null
          division?: string | null
          id?: string
          is_default?: boolean
          line1: string
          name: string
          notes?: string | null
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string | null
          created_at?: string
          district?: string | null
          division?: string | null
          id?: string
          is_default?: boolean
          line1?: string
          name?: string
          notes?: string | null
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          diff: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          diff?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          diff?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_path: string | null
          name: string
          name_bn: string | null
          parent_id: string | null
          section: string
          slug: string
          sort: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path?: string | null
          name: string
          name_bn?: string | null
          parent_id?: string | null
          section: string
          slug: string
          sort?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string | null
          name?: string
          name_bn?: string | null
          parent_id?: string | null
          section?: string
          slug?: string
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          ends_at: string | null
          min_subtotal_paisa: number
          starts_at: string | null
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          ends_at?: string | null
          min_subtotal_paisa?: number
          starts_at?: string | null
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          ends_at?: string | null
          min_subtotal_paisa?: number
          starts_at?: string | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      order_events: {
        Row: {
          actor: string | null
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          image_snapshot: string | null
          name_snapshot: string
          order_id: string
          qty: number
          size: string | null
          unit_price_paisa: number
          variant_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          image_snapshot?: string | null
          name_snapshot: string
          order_id: string
          qty: number
          size?: string | null
          unit_price_paisa: number
          variant_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          image_snapshot?: string | null
          name_snapshot?: string
          order_id?: string
          qty?: number
          size?: string | null
          unit_price_paisa?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json | null
          coupon_code: string | null
          courier: string | null
          created_at: string
          discount_paisa: number
          guest_email: string | null
          guest_phone: string | null
          id: string
          order_no: string
          payment_method: string
          payment_status: string
          shipping_paisa: number
          status: string
          subtotal_paisa: number
          total_paisa: number
          tracking_no: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          coupon_code?: string | null
          courier?: string | null
          created_at?: string
          discount_paisa?: number
          guest_email?: string | null
          guest_phone?: string | null
          id?: string
          order_no: string
          payment_method?: string
          payment_status?: string
          shipping_paisa?: number
          status?: string
          subtotal_paisa?: number
          total_paisa?: number
          tracking_no?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          coupon_code?: string | null
          courier?: string | null
          created_at?: string
          discount_paisa?: number
          guest_email?: string | null
          guest_phone?: string | null
          id?: string
          order_no?: string
          payment_method?: string
          payment_status?: string
          shipping_paisa?: number
          status?: string
          subtotal_paisa?: number
          total_paisa?: number
          tracking_no?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          blur_data_url: string | null
          created_at: string
          id: string
          path_large: string | null
          path_medium: string | null
          path_thumb: string | null
          position: number
          product_id: string
          updated_at: string
        }
        Insert: {
          alt?: string | null
          blur_data_url?: string | null
          created_at?: string
          id?: string
          path_large?: string | null
          path_medium?: string | null
          path_thumb?: string | null
          position: number
          product_id: string
          updated_at?: string
        }
        Update: {
          alt?: string | null
          blur_data_url?: string | null
          created_at?: string
          id?: string
          path_large?: string | null
          path_medium?: string | null
          path_thumb?: string | null
          position?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          color_hex: string | null
          created_at: string
          id: string
          price_override_paisa: number | null
          product_id: string
          size: string | null
          sku: string
          stock: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          color_hex?: string | null
          created_at?: string
          id?: string
          price_override_paisa?: number | null
          product_id: string
          size?: string | null
          sku: string
          stock?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          color_hex?: string | null
          created_at?: string
          id?: string
          price_override_paisa?: number | null
          product_id?: string
          size?: string | null
          sku?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          care: string | null
          category_id: string | null
          compare_at_paisa: number | null
          created_at: string
          deleted_at: string | null
          description: string
          description_bn: string
          fabric: string | null
          fit_notes: string | null
          id: string
          is_featured: boolean
          is_new: boolean
          is_sale: boolean
          name: string
          name_bn: string | null
          price_paisa: number
          search: unknown
          section: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          care?: string | null
          category_id?: string | null
          compare_at_paisa?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          description_bn?: string
          fabric?: string | null
          fit_notes?: string | null
          id?: string
          is_featured?: boolean
          is_new?: boolean
          is_sale?: boolean
          name: string
          name_bn?: string | null
          price_paisa: number
          search?: unknown
          section: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          care?: string | null
          category_id?: string | null
          compare_at_paisa?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          description_bn?: string
          fabric?: string | null
          fit_notes?: string | null
          id?: string
          is_featured?: boolean
          is_new?: boolean
          is_sale?: boolean
          name?: string
          name_bn?: string | null
          price_paisa?: number
          search?: unknown
          section?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          locale: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          locale?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          body: string | null
          created_at: string
          id: string
          photos: string[] | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved?: boolean
          body?: string | null
          created_at?: string
          id?: string
          photos?: string[] | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved?: boolean
          body?: string | null
          created_at?: string
          id?: string
          photos?: string[] | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          created_at: string
          districts: string[]
          eta_days: string | null
          fee_paisa: number
          free_over_paisa: number | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          districts?: string[]
          eta_days?: string | null
          fee_paisa?: number
          free_over_paisa?: number | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          districts?: string[]
          eta_days?: string | null
          fee_paisa?: number
          free_over_paisa?: number | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          created_at: string
          email: string
          id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
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
      adjust_stock: {
        Args: { p_delta: number; p_variant: string }
        Returns: number
      }
      cancel_order: { Args: { p_order: string }; Returns: Json }
      create_order: {
        Args: {
          p_address: Json
          p_cart: Json
          p_coupon: string
          p_payment: string
        }
        Returns: Json
      }
      dearmor: { Args: { "": string }; Returns: string }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_staff_or_admin: { Args: never; Returns: boolean }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      search_products: {
        Args: { p_limit?: number; p_section?: string; q?: string }
        Returns: {
          id: string
          name: string
          price_paisa: number
          rank: number
          slug: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
    Enums: {},
  },
} as const
