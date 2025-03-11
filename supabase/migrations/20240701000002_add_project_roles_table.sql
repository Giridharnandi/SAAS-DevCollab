-- Create project_roles table
CREATE TABLE IF NOT EXISTS project_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add role column to commits table
ALTER TABLE commits ADD COLUMN IF NOT EXISTS role UUID REFERENCES project_roles(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS project_roles_project_id_idx ON project_roles(project_id);

-- Enable row level security
ALTER TABLE project_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Project members can view roles"
  ON project_roles FOR SELECT
  USING (project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Project creators can insert roles"
  ON project_roles FOR INSERT
  WITH CHECK (project_id IN (
    SELECT id FROM projects WHERE creator_id = auth.uid()
  ));

CREATE POLICY "Project creators can update roles"
  ON project_roles FOR UPDATE
  USING (project_id IN (
    SELECT id FROM projects WHERE creator_id = auth.uid()
  ));

CREATE POLICY "Project creators can delete roles"
  ON project_roles FOR DELETE
  USING (project_id IN (
    SELECT id FROM projects WHERE creator_id = auth.uid()
  ));

-- Enable realtime
alter publication supabase_realtime add table project_roles;
