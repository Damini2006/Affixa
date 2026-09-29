-- Supabase schema for Affix Identification System

-- 1. Create tables
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    results_json JSONB NOT NULL,
    method TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE affix_dictionary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affix TEXT NOT NULL,
    type TEXT NOT NULL, -- 'prefix' or 'suffix'
    example_word TEXT,
    description TEXT
);

CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affix TEXT NOT NULL,
    frequency_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE affix_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Analyses: Users can only select/insert/update/delete their own analyses
CREATE POLICY "Users can view their own analyses" 
ON analyses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" 
ON analyses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
ON analyses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON analyses FOR DELETE 
USING (auth.uid() = user_id);

-- Affix Dictionary: Public read, Admin only write (simplified to public read for now)
CREATE POLICY "Public can view affix dictionary" 
ON affix_dictionary FOR SELECT 
USING (true);

-- Analytics Cache: Public read
CREATE POLICY "Public can view analytics cache" 
ON analytics_cache FOR SELECT 
USING (true);
