import { createClient } from "../../../../../../supabase/server";
import { redirect, notFound } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import WorkflowBoard from "@/components/workflow-board";
import { WorkflowSidebarWrapper } from "./client-components";

export default async function WorkflowPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select(
      "*, users!projects_creator_id_fkey(id, name, email, profile_picture), workflow_data",
    )
    .eq("id", params.id)
    .single();

  if (!project) {
    return notFound();
  }

  // Check if user is the project creator or a member
  const { data: membership } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", project.id)
    .eq("user_id", user.id)
    .single();

  const isProjectMember = !!membership;
  const isProjectCreator = project.creator_id === user.id;

  if (!isProjectMember && !isProjectCreator) {
    return redirect(
      `/dashboard/projects/${params.id}?error=You do not have access to this project's workflow`,
    );
  }

  // Fetch project members
  const { data: members } = await supabase
    .from("project_members")
    .select(
      "*, users!project_members_user_id_fkey(id, name, email, profile_picture, user_role)",
    )
    .eq("project_id", project.id);

  // Fetch project commits
  const { data: commits } = await supabase
    .from("commits")
    .select(
      "*, users!commits_assigned_to_fkey(id, name, email, profile_picture)",
    )
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href={`/dashboard/projects/${params.id}`} className="mr-4">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Workflow Management</h1>
              <p className="text-muted-foreground">Project: {project.title}</p>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="flex h-[calc(100vh-250px)]">
              <WorkflowSidebarWrapper
                isAdmin={isProjectCreator}
                members={members || []}
                commits={commits || []}
              />
              <div className="flex-1 overflow-hidden">
                {hasWorkflowAccess ? (
                  <WorkflowBoard
                    projectId={project.id}
                    isAdmin={isProjectCreator}
                    members={members || []}
                    commits={commits || []}
                    initialWorkflow={project.workflow_data}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md p-6 bg-muted/30 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">
                        Subscription Required
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        The workflow management feature requires a Pro or
                        Professional subscription. Please upgrade your
                        subscription to access this feature.
                      </p>
                      <Button asChild>
                        <Link href="/dashboard/profile">
                          Upgrade Subscription
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
