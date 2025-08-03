export interface Database {
  public: {
    Tables: {
      models: {
        Row: {
          id: string;
          name: string;
          context_window: number;
          cost_per_1k: number;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          context_window: number;
          cost_per_1k: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          context_window?: number;
          cost_per_1k?: number;
          created_at?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          title: string;
          model_id: string;
          user_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string;
          model_id: string;
          user_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          model_id?: string;
          user_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          tokens: number | null;
          timestamp: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          tokens?: number | null;
          timestamp: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          tokens?: number | null;
          timestamp?: number;
          created_at?: string | null;
        };
      };
    };
  };
}