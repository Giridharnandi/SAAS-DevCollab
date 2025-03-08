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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserX, CheckCircle, XCircle, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import TeamMemberRow from "@/components/team-member-row";

export default async function ProjectMembersPage({
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

  // Check if user is the project creator
  if (project.creator_id !== user.id) {
    return redirect(
      `/dashboard/projects/${params.id}?error=Only the project creator can manage team members`,
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

  // Fetch pending join requests
  const { data: joinRequests } = await supabase
    .from("join_requests")
    .select(
      "*, users!join_requests_user_id_fkey(id, name, email, profile_picture)",
    )
    .eq("project_id", project.id)
    .eq("status", "pending");

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href={`/dashboard/projects/${params.id}`} className="mr-4">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Team Management</h1>
              <p className="text-muted-foreground">Project: {project.title}</p>
            </div>
          </div>

          <Tabs defaultValue="members">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="requests">
                Join Requests
                {joinRequests && joinRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {joinRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members ({members?.length || 0})</CardTitle>
                  <CardDescription>
                    Manage team members and assign commits. As the project
                    admin, you have full control over team members and their
                    assignments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {members && members.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Assigned Commits</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((member) => (
                            <TeamMemberRow
                              key={member.id}
                              member={member}
                              commits={commits || []}
                              projectId={project.id}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No team members yet
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Invite developers to join your project or approve
                        pending join requests
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Join Requests ({joinRequests?.length || 0})
                  </CardTitle>
                  <CardDescription>
                    Manage requests from developers who want to join your
                    project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {joinRequests && joinRequests.length > 0 ? (
                    <div className="space-y-4">
                      {joinRequests.map((request) => (
                        <div key={request.id} className="border rounded-md p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-3">
                                {request.users.profile_picture ? (
                                  <img
                                    src={request.users.profile_picture}
                                    alt={request.users.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {request.users.name
                                      ?.substring(0, 2)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {request.users.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {request.users.email}
                                </p>
                              </div>
                            </div>
                            <Badge>Pending</Badge>
                          </div>

                          {request.message && (
                            <div className="bg-muted/50 p-3 rounded-md text-sm mt-3">
                              <p className="font-medium mb-1">Message:</p>
                              <p>{request.message}</p>
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" className="flex-1">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No pending requests
                      </h3>
                      <p className="text-muted-foreground">
                        There are no pending join requests for this project
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
