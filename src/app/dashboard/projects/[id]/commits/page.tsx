import { createClient } from "../../../../../../supabase/server";
import { redirect, notFound } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProjectCommitsList from "@/components/project-commits-list";

export default async function ProjectCommitsPage({
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
      "*, users!projects_creator_id_fkey(id, name, email, profile_picture)",
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
      `/dashboard/projects/${params.id}?error=You do not have access to this project's commits`,
    );
  }

  // Fetch project members
  const { data: members } = await supabase
    .from("project_members")
    .select(
      "*, users!project_members_user_id_fkey(id, name, email, profile_picture, user_role)",
    )
    .eq("project_id", project.id);

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href={`/dashboard/projects/${params.id}`} className="mr-4">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Project Commits</h1>
              <p className="text-muted-foreground">Project: {project.title}</p>
            </div>
          </div>

          <Card className="p-6">
            <ProjectCommitsList
              projectId={project.id}
              isAdmin={isProjectCreator}
              members={members || []}
            />
          </Card>
        </div>
      </main>
    </>
  );
}
