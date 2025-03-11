import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProjectForm from "@/components/project-form";

export default async function CreateProjectPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user is a project creator
  if (user.user_metadata?.user_role !== "project_creator") {
    return redirect(
      "/dashboard?error=You must be a Project Creator to create projects",
    );
  }

  // Get user's subscription to determine project limits
  const { data: userProfile } = await supabase
    .from("users")
    .select("subscription, subscription_status, subscription_period_end")
    .eq("id", user.id)
    .single();

  // Check if user has reached project limit (for free plan)
  if (!userProfile?.subscription) {
    const { data: projectCount } = await supabase
      .from("projects")
      .select("id", { count: true })
      .eq("creator_id", user.id);

    const count = projectCount?.length || 0;
    if (count >= 5) {
      return redirect(
        "/dashboard/profile?error=You have reached the maximum number of projects for the free plan. Please upgrade to create more projects.",
      );
    }
  }

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
          <p className="text-muted-foreground mb-6">
            As the project creator, you'll be the admin with full control over
            the project.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Fill in the information below to create your new project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectForm
                user={user}
                subscription={userProfile?.subscription}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
