"use client";

import { createClient } from "../../../../supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, MessageSquare, UserCircle } from "lucide-react";
import UserProfileModal from "@/components/user-profile-modal";

export default function MessagesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [isProjectCreator, setIsProjectCreator] = useState(false);
  const [createdProjects, setCreatedProjects] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      // Check if user is a project creator
      const isCreator =
        currentUser.user_metadata?.user_role === "project_creator";
      setIsProjectCreator(isCreator);

      // Fetch projects created by the user (if project creator)
      let projects = [];
      if (isCreator) {
        const { data } = await supabase
          .from("projects")
          .select("id, title")
          .eq("creator_id", currentUser.id);
        projects = data || [];
        setCreatedProjects(projects);
      }

      // Fetch join requests for user's projects (if project creator)
      let requests = [];
      if (isCreator && projects.length > 0) {
        const projectIds = projects.map((p) => p.id);
        const { data } = await supabase
          .from("join_requests")
          .select(
            "*, users!join_requests_user_id_fkey(id, name, email, profile_picture), projects!join_requests_project_id_fkey(id, title)",
          )
          .in("project_id", projectIds)
          .eq("status", "pending");
        requests = data || [];
        setReceivedRequests(requests);
      }

      // Fetch join requests sent by the user
      const { data: userRequests } = await supabase
        .from("join_requests")
        .select(
          "*, projects!join_requests_project_id_fkey(id, title, creator_id, users!projects_creator_id_fkey(id, name, email, profile_picture))",
        )
        .eq("user_id", currentUser.id);
      setSentRequests(userRequests || []);

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>

          <Tabs defaultValue={isProjectCreator ? "received" : "sent"}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              {isProjectCreator && (
                <TabsTrigger key="received-tab" value="received">
                  Received Requests
                  {receivedRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {receivedRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger key="sent-tab" value="sent">
                Sent Requests
                {sentRequests && sentRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {sentRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              {!isProjectCreator && (
                <TabsTrigger key="notifications-tab" value="notifications">
                  Notifications
                </TabsTrigger>
              )}
            </TabsList>

            {isProjectCreator && (
              <TabsContent value="received">
                <Card>
                  <CardHeader>
                    <CardTitle>Join Requests</CardTitle>
                    <CardDescription>
                      Manage requests from developers who want to join your
                      projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {receivedRequests.length > 0 ? (
                      <div className="space-y-4">
                        {receivedRequests.map((request) => (
                          <div
                            key={request.id}
                            className="border rounded-md p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <div
                                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-3 cursor-pointer"
                                  onClick={() => {
                                    setSelectedUserId(
                                      request.users?.id || request.user_id,
                                    );
                                    setIsProfileModalOpen(true);
                                  }}
                                >
                                  {request.users?.profile_picture ? (
                                    <img
                                      src={request.users.profile_picture}
                                      alt={request.users?.name || "User"}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-medium">
                                      {request.users?.name
                                        ?.substring(0, 2)
                                        .toUpperCase() || "U"}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p
                                    className="font-medium cursor-pointer hover:text-primary"
                                    onClick={() => {
                                      setSelectedUserId(
                                        request.users?.id || request.user_id,
                                      );
                                      setIsProfileModalOpen(true);
                                    }}
                                  >
                                    {request.users?.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {request.users?.email}
                                  </p>
                                </div>
                              </div>
                              <Badge>Pending</Badge>
                            </div>

                            <div className="mt-3">
                              <p className="text-sm mb-1">
                                <span className="font-medium">Project:</span>{" "}
                                {request.projects?.title || "Unknown Project"}
                              </p>
                              {request.message && (
                                <div className="bg-muted/50 p-3 rounded-md text-sm mt-2">
                                  <p className="font-medium mb-1">Message:</p>
                                  <p>{request.message}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={async () => {
                                  // First add user to project members
                                  await supabase
                                    .from("project_members")
                                    .insert({
                                      project_id: request.project_id,
                                      user_id: request.user_id,
                                      joined_at: new Date().toISOString(),
                                    });

                                  // Then update request status
                                  await supabase
                                    .from("join_requests")
                                    .update({
                                      status: "approved",
                                      updated_at: new Date().toISOString(),
                                    })
                                    .eq("id", request.id);

                                  router.refresh();
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={async () => {
                                  await supabase
                                    .from("join_requests")
                                    .update({
                                      status: "rejected",
                                      updated_at: new Date().toISOString(),
                                    })
                                    .eq("id", request.id);

                                  router.refresh();
                                }}
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
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No pending requests
                        </h3>
                        <p className="text-muted-foreground">
                          You don't have any pending join requests for your
                          projects
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="sent">
              <Card>
                <CardHeader>
                  <CardTitle>Your Join Requests</CardTitle>
                  <CardDescription>
                    Track the status of your requests to join projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sentRequests && sentRequests.length > 0 ? (
                    <div className="space-y-4">
                      {sentRequests.map((request) => (
                        <div key={request.id} className="border rounded-md p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">
                                {request.projects?.title || "Unknown Project"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Created by {request.projects?.users?.name}
                              </p>
                            </div>
                            <Badge
                              variant={
                                request.status === "pending"
                                  ? "secondary"
                                  : request.status === "approved"
                                    ? "success"
                                    : "destructive"
                              }
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </Badge>
                          </div>

                          {request.message && (
                            <div className="bg-muted/50 p-3 rounded-md text-sm mt-3">
                              <p className="font-medium mb-1">Your message:</p>
                              <p>{request.message}</p>
                            </div>
                          )}

                          <div className="mt-3 text-sm text-muted-foreground">
                            Sent on{" "}
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No requests sent
                      </h3>
                      <p className="text-muted-foreground">
                        You haven't sent any join requests yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {!isProjectCreator && (
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Updates about your projects and requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No notifications
                      </h3>
                      <p className="text-muted-foreground">
                        You don't have any notifications at the moment
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </>
  );
}
