-- ========================================================
-- 5만 원 챌린지 (Pacemaker) Supabase PostgreSQL Schema DDL
-- ========================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- 'unni', 'dongsaeng', 'me'
  name TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '🙋‍♀️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initial seed data for profiles
INSERT INTO public.profiles (id, name, avatar_emoji)
VALUES 
  ('unni', '언니', '🎀'),
  ('dongsaeng', '동생', '🐻'),
  ('me', '나', '🙋‍♀️')
ON CONFLICT (id) DO NOTHING;

-- 2. Challenges Table (Supports Custom Weekly Budget & Solo/Duo Modes)
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL DEFAULT 'duo', -- 'solo' or 'duo'
  budget_per_person INTEGER NOT NULL DEFAULT 50000, -- Default 50,000 KRW (customizable)
  start_day_of_week INTEGER NOT NULL DEFAULT 1, -- 0=Sun, 1=Mon, ..., 6=Sat
  current_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial active challenge if none exists
INSERT INTO public.challenges (mode, budget_per_person, start_day_of_week, current_start_date, is_active)
SELECT 'duo', 50000, 1, NOW(), TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.challenges WHERE is_active = TRUE);

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  memo TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '#식비',
  spent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Reactions Table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  emoji TEXT NOT NULL, -- '👏', '🚨', '☕', '🎉'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_expense_user_emoji UNIQUE (expense_id, user_id, emoji)
);

-- Enable Row Level Security (RLS) & Public Policies for simple sister app usage
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public select challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Allow public update challenges" ON public.challenges FOR UPDATE USING (true);
CREATE POLICY "Allow public insert challenges" ON public.challenges FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public all expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Allow public all reactions" ON public.reactions FOR ALL USING (true);

-- Enable Supabase Realtime for expenses and reactions
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.expenses, public.reactions, public.challenges;
COMMIT;
