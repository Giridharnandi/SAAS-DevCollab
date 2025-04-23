-- Enable Row Level Security (RLS) on public tables

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy for projects table
DROP POLICY IF EXISTS "Users can view public projects" ON public.projects;
CREATE POLICY "Users can view public projects"
ON public.projects
FOR SELECT
USING (visibility = 'public' OR auth.uid() = creator_id);

DROP POLICY IF EXISTS "Project creators can update their projects" ON public.projects;
CREATE POLICY "Project creators can update their projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Project creators can delete their projects" ON public.projects;
CREATE POLICY "Project creators can delete their projects"
ON public.projects
FOR DELETE
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can insert projects" ON public.projects;
CREATE POLICY "Users can insert projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Enable RLS on join_requests table
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for join_requests table
DROP POLICY IF EXISTS "Project creators can view join requests" ON public.join_requests;
CREATE POLICY "Project creators can view join requests"
ON public.join_requests
FOR SELECT
USING (
  auth.uid() IN (
    SELECT creator_id FROM public.projects WHERE id = project_id
  ) OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can create join requests" ON public.join_requests;
CREATE POLICY "Users can create join requests"
ON public.join_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Project creators can update join requests" ON public.join_requests;
CREATE POLICY "Project creators can update join requests"
ON public.join_requests
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT creator_id FROM public.projects WHERE id = project_id
  )
);

-- Enable RLS on commits table
ALTER TABLE public.commits ENABLE ROW LEVEL SECURITY;

-- Create policy for commits table
DROP POLICY IF EXISTS "Project members can view commits" ON public.commits;
CREATE POLICY "Project members can view commits"
ON public.commits
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.project_members WHERE project_id = commits.project_id
  ) OR auth.uid() IN (
    SELECT creator_id FROM public.projects WHERE id = project_id
  )
);

DROP POLICY IF EXISTS "Project members can insert commits" ON public.commits;
CREATE POLICY "Project members can insert commits"
ON public.commits
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.project_members WHERE project_id = commits.project_id
  ) OR auth.uid() IN (
    SELECT creator_id FROM public.projects WHERE id = project_id
  )
);

DROP POLICY IF EXISTS "Project members can update their commits" ON public.commits;
CREATE POLICY "Project members can update their commits"
ON public.commits
FOR UPDATE
USING (
  auth.uid() = assigned_to OR auth.uid() IN (
    SELECT creator_id FROM public.projects WHERE id = project_id
  )
);

-- Enable RLS on project_members table
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create policy for project_members table
DROP POLICY IF EXISTS "Project members can view team" ON public.project_members;
CREATE POLICY "Project members can view team"
ON public.project_members
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.project_members WHERE project_id = project_members.project_id
  ) OR auth.uid() IN (
    SELECT creator_id FROM public.projects WHERE id = project_id
  )
);

DROP POLICY IF EXISTS "Project creators can manage members" ON public.project_members;
CREATE POLICY "Project creators can manage members"
ON public.project_members
FOR ALL
USING (
  auth.uid() IN (
    SELECT creator_id FROM public.projects WHERE id = project_id
  )
);

DROP POLICY IF EXISTS "Members can leave projects" ON public.project_members;
CREATE POLICY "Members can leave projects"
ON public.project_members
FOR DELETE
USING (auth.uid() = user_id);
