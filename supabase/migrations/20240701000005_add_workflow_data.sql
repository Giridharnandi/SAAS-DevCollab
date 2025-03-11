-- Add workflow_data column to projects table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'workflow_data') THEN
    ALTER TABLE projects ADD COLUMN workflow_data JSONB;
  END IF;
END $$;
