-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table that mirrors auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  user_id UUID,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  image TEXT,
  token_identifier TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  description TEXT,
  location TEXT,
  mobile TEXT,
  profile_picture TEXT,
  theme TEXT,
  user_role TEXT,
  credits TEXT,
  subscription TEXT,
  subscription_id TEXT,
  subscription_status TEXT,
  subscription_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  visibility TEXT DEFAULT 'public',
  team_size INTEGER DEFAULT 5,
  repository_link TEXT,
  cover_image TEXT,
  workflow_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create join_requests table
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, user_id)
);

-- Create commits table
CREATE TABLE IF NOT EXISTS commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  message TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  stripe_id TEXT,
  stripe_price_id TEXT,
  price_id TEXT,
  status TEXT,
  interval TEXT,
  amount NUMERIC,
  currency TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at NUMERIC,
  customer_id TEXT,
  started_at NUMERIC,
  ended_at NUMERIC,
  ends_at NUMERIC,
  customer_cancellation_reason TEXT,
  customer_cancellation_comment TEXT,
  metadata JSONB,
  custom_field_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Public projects are viewable by everyone"
ON projects FOR SELECT
TO authenticated
USING (visibility = 'public');

CREATE POLICY "Private projects are viewable by members"
ON projects FOR SELECT
TO authenticated
USING (
  visibility = 'private' AND
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project creators can update their projects"
ON projects FOR UPDATE
TO authenticated
USING (creator_id = auth.uid());

CREATE POLICY "Project creators can delete their projects"
ON projects FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

CREATE POLICY "Authenticated users can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- Project members policies
CREATE POLICY "Project members are viewable by project members"
ON project_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_members AS pm
    WHERE pm.project_id = project_id
    AND pm.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.creator_id = auth.uid()
  )
);

CREATE POLICY "Project creators can manage members"
ON project_members FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can leave projects"
ON project_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Join requests policies
CREATE POLICY "Users can view their own join requests"
ON join_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Project creators can view join requests for their projects"
ON join_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can create join requests"
ON join_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Project creators can update join requests"
ON join_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.creator_id = auth.uid()
  )
);

-- Commits policies
CREATE POLICY "Project members can view commits"
ON commits FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = project_id
    AND project_members.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.creator_id = auth.uid()
  )
);

CREATE POLICY "Project creators can manage commits"
ON commits FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_id
    AND projects.creator_id = auth.uid()
  )
);

CREATE POLICY "Assigned users can update their commits"
ON commits FOR UPDATE
TO authenticated
USING (assigned_to = auth.uid());
