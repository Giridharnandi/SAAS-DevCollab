-- Add user_role, location, description, mobile, profile_picture, and theme columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS user_role VARCHAR(20) DEFAULT 'project_member',
ADD COLUMN IF NOT EXISTS username VARCHAR(50),
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255),
ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'light';

-- Make username unique
CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON public.users (username);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image VARCHAR(255),
  visibility VARCHAR(10) DEFAULT 'public',
  team_size INTEGER DEFAULT 5,
  creator_id UUID NOT NULL REFERENCES public.users(id),
  repository_link VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table for tracking project membership
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create join_requests table
CREATE TABLE IF NOT EXISTS public.join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create commits table
CREATE TABLE IF NOT EXISTS public.commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  assigned_to UUID REFERENCES public.users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable realtime for all tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table project_members;
alter publication supabase_realtime add table join_requests;
alter publication supabase_realtime add table commits;
