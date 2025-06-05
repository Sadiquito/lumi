
-- Create daily_greetings table
CREATE TABLE IF NOT EXISTS public.daily_greetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  greeting_text TEXT NOT NULL,
  time_of_day TEXT NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  personalization_level TEXT NOT NULL DEFAULT 'moderate' CHECK (personalization_level IN ('minimal', 'moderate', 'full')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_greetings_user_date 
ON public.daily_greetings(user_id, created_at DESC);

-- Create index for today's greetings lookup
CREATE INDEX IF NOT EXISTS idx_daily_greetings_today 
ON public.daily_greetings(user_id, created_at) 
WHERE created_at >= CURRENT_DATE;

-- Enable RLS
ALTER TABLE public.daily_greetings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own greetings" 
ON public.daily_greetings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own greetings" 
ON public.daily_greetings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.daily_greetings TO authenticated;
GRANT ALL ON public.daily_greetings TO service_role;
