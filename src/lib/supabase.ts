import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
  last_seen: string;
};

export type ChatSession = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type KnowledgeBase = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  keywords: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type RestaurantIssue = {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  solutions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfitReport = {
  id: string;
  report_date: string;
  total_sales: number;
  total_orders: number;
  avg_order_value: number;
  gross_profit: number;
  net_profit: number;
  top_items: Array<{ name: string; qty: number; revenue: number }>;
  hourly_data: Array<{ hour: number; orders: number }>;
  online_orders: number;
  dine_in_orders: number;
  takeaway_orders: number;
  created_at: string;
};
