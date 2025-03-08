import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import ProjectList from "@/components/project-list";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's projects (both created and joined)
  const { data: memberProjects } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const projectIds = memberProjects?.map((item) => item.project_id) || [];

  const { data: projects } = await supabase
    .from("projects")
    .select("*, users!projects_creator_id_fkey(name, email, profile_picture)")
    .in(
      "id",
      projectIds.length > 0
        ? projectIds
        : ["00000000-0000-0000-0000-000000000000"],
    );

  // Fetch projects created by the user
  const { data: createdProjects } = await supabase
    .from("projects")
    .select("*, users!projects_creator_id_fkey(name, email, profile_picture)")
    .eq("creator_id", user.id);

  // Check if user is a project creator
  const isProjectCreator = user.user_metadata?.user_role === "project_creator";

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          {isProjectCreator && (
            <Link href="/dashboard/projects/create">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          )}
        </div>

        {isProjectCreator && createdProjects && createdProjects.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Projects You Created</h2>
            <ProjectList projects={createdProjects} />
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Projects You're Part Of
          </h2>
          {projects && projects.length > 0 ? (
            <ProjectList projects={projects} />
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                {isProjectCreator
                  ? "Create your first project or join an existing one"
                  : "Join a project to collaborate with other developers"}
              </p>
              {isProjectCreator ? (
                <Link href="/dashboard/projects/create">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard/explore">
                  <Button>Explore Projects</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
