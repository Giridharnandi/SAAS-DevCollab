import { createClient } from "../../../../../../supabase/server";
import { redirect, notFound } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditProjectForm from "@/components/edit-project-form";

export default async function EditProjectPage({
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
    .select("*")
    .eq("id", params.id)
    .single();

  if (!project) {
    return notFound();
  }

  // Check if user is the project creator (admin)
  if (project.creator_id !== user.id) {
    return redirect(
      `/dashboard/projects/${params.id}?error=Only the project admin can edit this project`,
    );
  }

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
              <h1 className="text-3xl font-bold">Edit Project</h1>
              <p className="text-muted-foreground">
                Update project details or delete this project
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Update your project information</CardDescription>
            </CardHeader>
            <CardContent>
              <EditProjectForm project={project} user={user} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
