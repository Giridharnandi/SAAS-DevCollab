"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserX, CheckCircle, XCircle, Plus } from "lucide-react";
import { createClient } from "../../supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

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
  };
}

interface Commit {
  id: string;
  project_id: string;
  message: string;
  assigned_to: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  users?: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  } | null;
}

interface TeamMemberRowProps {
  member: Member;
  commits: Commit[];
  projectId: string;
}

export default function TeamMemberRow({
  member,
  commits,
  projectId,
}: TeamMemberRowProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isAssigningCommit, setIsAssigningCommit] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter commits that are assigned to this member
  const assignedCommits = commits.filter(
    (commit) => commit.assigned_to === member.users.id,
  );
  const completedCommits = assignedCommits.filter(
    (commit) => commit.status === "completed",
  );
  const pendingCommits = assignedCommits.filter(
    (commit) => commit.status === "pending",
  );

  // Filter unassigned commits
  const unassignedCommits = commits.filter((commit) => !commit.assigned_to);

  const handleAssignCommit = async () => {
    if (!selectedCommit) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("commits")
        .update({ assigned_to: member.users.id })
        .eq("id", selectedCommit);

      if (error) throw error;

      setIsAssigningCommit(false);
      setSelectedCommit("");
      router.refresh();
    } catch (error) {
      console.error("Error assigning commit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    setIsLoading(true);

    try {
      // First, unassign all commits from this member
      const { error: commitError } = await supabase
        .from("commits")
        .update({ assigned_to: null })
        .eq("assigned_to", member.users.id);

      if (commitError) throw commitError;

      // Then remove the member from the project
      const { error: memberError } = await supabase
        .from("project_members")
        .delete()
        .eq("id", member.id);

      if (memberError) throw memberError;

      router.refresh();
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden mr-2">
            {member.users.profile_picture ? (
              <img
                src={member.users.profile_picture}
                alt={member.users.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium">
                {member.users.name?.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium">{member.users.name}</p>
            <p className="text-xs text-muted-foreground">
              {member.users.email}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline">
          {member.users.id === projectId
            ? "Admin"
            : member.users.user_role === "project_creator"
              ? "Creator"
              : "Member"}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center">
          <span className="font-medium">{assignedCommits.length}</span>
          <Dialog open={isAssigningCommit} onOpenChange={setIsAssigningCommit}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Commit</DialogTitle>
                <DialogDescription>
                  Assign a commit to {member.users.name}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <Label htmlFor="commit" className="mb-2 block">
                  Select Commit
                </Label>
                <Select
                  value={selectedCommit}
                  onValueChange={setSelectedCommit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a commit to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedCommits.length > 0 ? (
                      unassignedCommits.map((commit) => (
                        <SelectItem key={commit.id} value={commit.id}>
                          {commit.message}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No unassigned commits available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAssigningCommit(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignCommit}
                  disabled={!selectedCommit || isLoading}
                >
                  {isLoading ? "Assigning..." : "Assign Commit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>

      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
              <span className="font-medium">
                {completedCommits.length}/{assignedCommits.length}
              </span>
              {assignedCommits.length > 0 && (
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(completedCommits.length / assignedCommits.length) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Commit Status for {member.users.name}</DialogTitle>
              <DialogDescription>
                {assignedCommits.length} commits assigned,{" "}
                {completedCommits.length} completed
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              {assignedCommits.length > 0 ? (
                <div className="space-y-2 py-2">
                  {assignedCommits.map((commit) => (
                    <div
                      key={commit.id}
                      className={`p-3 rounded-md border flex items-center ${commit.status === "completed" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}
                    >
                      {commit.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{commit.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Created:{" "}
                          {new Date(commit.created_at).toLocaleDateString()}
                          {commit.completed_at && (
                            <>
                              {" "}
                              • Completed:{" "}
                              {new Date(
                                commit.completed_at,
                              ).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No commits assigned to this team member yet
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>

      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleRemoveMember}
          disabled={member.users.user_role === "project_creator" || isLoading}
        >
          <UserX className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
}
