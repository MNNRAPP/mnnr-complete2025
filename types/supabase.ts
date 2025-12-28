export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_prefix: string
          key_hash: string
          last_used_at: string | null
          created_at: string
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_prefix: string
          key_hash: string
          last_used_at?: string | null
          created_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_prefix?: string
          key_hash?: string
          last_used_at?: string | null
          created_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
      }
      api_usage: {
        Row: {
          id: string
          api_key_id: string
          endpoint: string
          method: string
          status_code: number
          response_time_ms: number
          created_at: string
        }
        Insert: {
          id?: string
          api_key_id: string
          endpoint: string
          method: string
          status_code: number
          response_time_ms: number
          created_at?: string
        }
        Update: {
          id?: string
          api_key_id?: string
          endpoint?: string
          method?: string
          status_code?: number
          response_time_ms?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
