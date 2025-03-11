"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

interface Member {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: string;
  users: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
    user_role: string;
  } | null;
}

interface ProjectMembersProps {
  members: Member[];
  isProjectCreator: boolean;
  projectId: string;
}

export default function ProjectMembers({
  members,
  isProjectCreator,
  projectId,
}: ProjectMembersProps) {
  const handleRemoveMember = async (memberId: string) => {
    // Implementation for removing a member would go here
    console.log("Remove member", memberId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No team members yet
            </p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-md border"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-3">
                    {member.users?.profile_picture ? (
                      <img
                        src={member.users.profile_picture}
                        alt={member.user_id.substring(0, 2).toUpperCase()}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {member.user_id.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">
                        {member.users?.name || member.user_id}
                      </p>
                      <Badge variant="outline" className="ml-2">
                        {member.users?.id === projectId
                          ? "Admin"
                          : member.users?.user_role === "project_creator"
                            ? "Creator"
                            : "Member"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.users?.email || member.user_id}
                    </p>
                  </div>
                </div>

                {isProjectCreator && member.users?.id !== projectId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <UserX className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
