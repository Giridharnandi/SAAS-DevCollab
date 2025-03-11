import { createClient } from "../../../../../supabase/server";
import { redirect, notFound } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Users,
  Eye,
  EyeOff,
  GitBranch,
  Edit,
  UserPlus,
  Activity,
} from "lucide-react";
import ProjectHealthBadge from "@/components/project-health-badge";
import { calculateHealthScore } from "@/utils/project-health";
import Link from "next/link";
import ProjectMembers from "@/components/project-members";
import ProjectCommits from "@/components/project-commits";
import JoinRequestButton from "@/components/join-request-button";

export default async function ProjectDetailsPage({
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

  // Check if user is a member of this project
  const { data: membership } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", project.id)
    .eq("user_id", user.id)
    .single();

  const isProjectMember = !!membership;
  const isProjectCreator = project.creator_id === user.id;

  // Check if user has a pending join request
  const { data: pendingRequest } = await supabase
    .from("join_requests")
    .select("*")
    .eq("project_id", project.id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .single();

  const hasRequestPending = !!pendingRequest;

  // If project is private and user is not a member, redirect
  if (project.visibility === "private" && !isProjectMember) {
    return redirect(
      "/dashboard/projects?error=You do not have access to this project",
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

  // Calculate project health score
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentCommits =
    commits?.filter((commit) => new Date(commit.created_at) > oneWeekAgo) || [];

  const completedCommits =
    commits?.filter((commit) => commit.status === "completed") || [];

  const activeMembers =
    members?.filter(
      (member) =>
        // For demo purposes, consider all members active
        true,
    ) || [];

  // Get join requests in the last month
  const { data: joinRequests } = await supabase
    .from("join_requests")
    .select("*")
    .eq("project_id", project.id)
    .gte(
      "created_at",
      new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    );

  const healthScore = calculateHealthScore(
    {
      count: commits?.length || 0,
      frequency: recentCommits.length,
      completedCount: completedCommits.length,
    },
    {
      total: 10, // Mock test data
      passed: 8, // Mock test data
    },
    {
      memberCount: members?.length || 0,
      activeMembers: activeMembers.length,
      joinRequests: joinRequests?.length || 0,
    },
  );

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <Badge
                  variant={
                    project.visibility === "public" ? "default" : "secondary"
                  }
                >
                  {project.visibility === "public" ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" /> Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" /> Private
                    </>
                  )}
                </Badge>
                <div className="ml-2">
                  <ProjectHealthBadge healthScore={healthScore} />
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span className="mx-2">•</span>
                <Users className="h-4 w-4 mr-1" />
                <span>{members?.length || 1} members</span>
              </div>
            </div>

            <div className="flex gap-2">
              {isProjectCreator ? (
                <>
                  <Link href={`/dashboard/projects/${project.id}/edit`}>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </Button>
                  </Link>
                  <Link href={`/dashboard/projects/${project.id}/members`}>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Team
                    </Button>
                  </Link>
                </>
              ) : (
                <JoinRequestButton
                  projectId={project.id}
                  userId={user.id}
                  isMember={isProjectMember}
                  hasRequestPending={hasRequestPending}
                  teamSize={project.team_size}
                  currentMemberCount={members?.length || 0}
                />
              )}
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="whitespace-pre-line">{project.description}</p>

              {project.repository_link && isProjectMember && (
                <div className="mt-4 flex items-center">
                  <GitBranch className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a
                    href={project.repository_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {project.repository_link}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {isProjectMember ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="commits">Commits</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-500" />
                        Project Health
                      </h3>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div>
                          <ProjectHealthBadge
                            healthScore={healthScore}
                            showDetails={true}
                          />
                        </div>
                        <div className="md:ml-8 space-y-2">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-muted/50 p-3 rounded-md text-center">
                              <div className="text-2xl font-bold">
                                {commits?.length || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total Commits
                              </div>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-md text-center">
                              <div className="text-2xl font-bold">
                                {completedCommits.length}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Completed
                              </div>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-md text-center">
                              <div className="text-2xl font-bold">
                                {members?.length || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Team Members
                              </div>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-md text-center">
                              <div className="text-2xl font-bold">
                                {recentCommits.length}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Recent Activity
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Project Creator
                      </h3>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-3">
                          {project.users?.profile_picture ? (
                            <img
                              src={project.users.profile_picture}
                              alt={project.users.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {project.users?.name
                                ?.substring(0, 2)
                                .toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {project.users?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {project.users?.email || "No email available"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Project Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Visibility:
                          </span>
                          <span className="font-medium capitalize">
                            {project.visibility}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Team Size:
                          </span>
                          <span className="font-medium">
                            {project.team_size} members
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Current Members:
                          </span>
                          <span className="font-medium">
                            {members?.length || 1}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Commits:
                          </span>
                          <span className="font-medium">
                            {commits?.length || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="commits">
                <ProjectCommits
                  commits={commits || []}
                  isProjectCreator={isProjectCreator}
                  projectId={project.id}
                />
              </TabsContent>

              <TabsContent value="team">
                <ProjectMembers
                  members={members || []}
                  isProjectCreator={isProjectCreator}
                  projectId={project.id}
                />
              </TabsContent>

              <TabsContent value="workflow">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-4">
                    Team Workflow Management
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isProjectCreator
                      ? "Create and manage your team's workflow with a visual board. Drag and drop elements to build a custom workflow."
                      : "View the project workflow in a structured table format. See how tasks, team members, and resources are connected."}
                  </p>
                  <Link href={`/dashboard/projects/${params.id}/workflow`}>
                    <Button>
                      {isProjectCreator ? "Manage Workflow" : "View Workflow"}
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Creator
                  </h3>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-3">
                      {project.users?.profile_picture ? (
                        <img
                          src={project.users.profile_picture}
                          alt={project.users.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {project.users?.name?.substring(0, 2).toUpperCase() ||
                            "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {project.users?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project.users?.email || "No email available"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visibility:</span>
                      <span className="font-medium capitalize">
                        {project.visibility}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Max Team Size:
                      </span>
                      <span className="font-medium">
                        {project.team_size} members
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current Members:
                      </span>
                      <span className="font-medium">
                        {members?.length || 1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Created Date:
                      </span>
                      <span className="font-medium">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
