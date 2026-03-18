-- ews_users
CREATE TABLE ews_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  avatar_url TEXT
);

-- ews_projects
CREATE TABLE ews_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES ews_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ews_chapters
CREATE TABLE ews_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES ews_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ews_conversations
CREATE TABLE ews_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES ews_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ews_ai_prompts
CREATE TABLE ews_ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES ews_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES ews_users(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ews_songs
CREATE TABLE ews_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES ews_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ews_images
CREATE TABLE ews_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES ews_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies 
-- Assuming minimal setup for now
ALTER TABLE ews_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ews_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ews_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ews_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ews_ai_prompts ENABLE ROW LEVEL SECURITY;
