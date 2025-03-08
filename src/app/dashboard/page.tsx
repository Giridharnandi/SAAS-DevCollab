import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import {
  InfoIcon,
  UserCircle,
  FolderKanban,
  Users,
  GitBranch,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user profile data
  let { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // If profile not found by id, try by user_id
  if (!profile) {
    const { data: userIdProfile } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    profile = userIdProfile;
  }

  // Fetch user's projects
  const { data: memberProjects } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const projectIds = memberProjects?.map((item) => item.project_id) || [];

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .in(
      "id",
      projectIds.length > 0
        ? projectIds
        : ["00000000-0000-0000-0000-000000000000"],
    )
    .limit(3);

  // Fetch join requests (if project creator)
  const { data: joinRequests } = await supabase
    .from("join_requests")
    .select("*")
    .eq("status", "pending")
    .limit(5);

  // Check if user is a project creator
  const isProjectCreator = user.user_metadata?.user_role === "project_creator";

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {profile?.name || user.email}
              </p>
            </div>

            {isProjectCreator && (
              <Link href="/dashboard/projects/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            )}
          </header>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Projects
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {projects?.length || 0}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FolderKanban className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Team Members
                    </p>
                    <p className="text-2xl font-bold mt-1">0</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Commits
                    </p>
                    <p className="text-2xl font-bold mt-1">0</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <GitBranch className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Messages
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {joinRequests?.length || 0}
                    </p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your recently active projects</CardDescription>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                      </div>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You don't have any projects yet
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
            </CardContent>
          </Card>

          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {profile?.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                      <span className="text-lg font-bold">
                        {profile?.name
                          ? profile.name.substring(0, 2).toUpperCase()
                          : user.email.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {profile?.name || "Complete your profile"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    Role:{" "}
                    {user.user_metadata?.user_role?.replace("_", " ") ||
                      "Project Member"}
                  </p>
                </div>
                <div className="ml-auto">
                  <Link href="/dashboard/profile">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
