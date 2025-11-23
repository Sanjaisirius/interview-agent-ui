import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface InterviewSession {
  id: string;
  role: string;
  status: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface InterviewExchange {
  id: string;
  session_id: string;
  question: string;
  response: string;
  sequence_number: number;
  created_at: string;
}

export interface InterviewFeedback {
  id: string;
  session_id: string;
  overall_score: number;
  communication_score: number;
  technical_score: number;
  strengths: string;
  areas_for_improvement: string;
  detailed_feedback: string;
  created_at: string;
}
