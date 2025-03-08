import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ProjectList from "@/components/project-list";

export default async function ExplorePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch public projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*, users!projects_creator_id_fkey(name, email, profile_picture)")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Explore Projects</h1>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search for projects..." className="pl-10" />
          </div>

          {projects && projects.length > 0 ? (
            <ProjectList projects={projects} />
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                No public projects found
              </h3>
              <p className="text-muted-foreground">
                Check back later for new projects to join
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
