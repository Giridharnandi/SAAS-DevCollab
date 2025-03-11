-- Add role column to commits table if it doesn't exist
ALTER TABLE commits ADD COLUMN IF NOT EXISTS role UUID REFERENCES project_roles(id) ON DELETE SET NULL;

-- Enable realtime for commits table
alter publication supabase_realtime add table commits;
