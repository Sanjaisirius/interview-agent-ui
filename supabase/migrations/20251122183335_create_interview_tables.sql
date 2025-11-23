/*
  # Interview Practice Partner - Database Schema

  1. New Tables
    - `interview_sessions`
      - `id` (uuid, primary key) - Unique identifier for each session
      - `role` (text) - The job role being practiced (sales, engineer, retail associate)
      - `status` (text) - Session status (in_progress, completed)
      - `started_at` (timestamptz) - When the interview started
      - `completed_at` (timestamptz) - When the interview ended
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `interview_exchanges`
      - `id` (uuid, primary key) - Unique identifier for each exchange
      - `session_id` (uuid, foreign key) - Reference to interview session
      - `question` (text) - The question asked by the interviewer
      - `response` (text) - The user's response
      - `sequence_number` (integer) - Order of the exchange in the interview
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `interview_feedback`
      - `id` (uuid, primary key) - Unique identifier for feedback
      - `session_id` (uuid, foreign key) - Reference to interview session
      - `overall_score` (integer) - Overall performance score (1-10)
      - `communication_score` (integer) - Communication quality score (1-10)
      - `technical_score` (integer) - Technical knowledge score (1-10)
      - `strengths` (text) - Identified strengths
      - `areas_for_improvement` (text) - Areas needing improvement
      - `detailed_feedback` (text) - Comprehensive feedback text
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question text NOT NULL,
  response text NOT NULL,
  sequence_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_score integer,
  communication_score integer,
  technical_score integer,
  strengths text,
  areas_for_improvement text,
  detailed_feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to sessions"
  ON interview_sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to sessions"
  ON interview_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to exchanges"
  ON interview_exchanges FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to exchanges"
  ON interview_exchanges FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to feedback"
  ON interview_feedback FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to feedback"
  ON interview_feedback FOR INSERT
  WITH CHECK (true);