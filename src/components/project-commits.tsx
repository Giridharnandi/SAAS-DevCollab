"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "../../supabase/client";

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

interface ProjectCommitsProps {
  commits: Commit[];
  isProjectCreator: boolean;
  projectId: string;
}

export default function ProjectCommits({
  commits,
  isProjectCreator,
  projectId,
}: ProjectCommitsProps) {
  const supabase = createClient();
  const [newCommitMessage, setNewCommitMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localCommits, setLocalCommits] = useState<Commit[]>(commits);

  const handleAddCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitMessage.trim()) return;

    setIsLoading(true);

    try {
      const { data: newCommit, error } = await supabase
        .from("commits")
        .insert({
          project_id: projectId,
          message: newCommitMessage,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      setLocalCommits([newCommit, ...localCommits]);
      setNewCommitMessage("");
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCommitStatus = async (commit: Commit) => {
    const newStatus = commit.status === "pending" ? "completed" : "pending";
    const completedAt =
      newStatus === "completed" ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from("commits")
        .update({
          status: newStatus,
          completed_at: completedAt,
        })
        .eq("id", commit.id);

      if (error) throw error;

      setLocalCommits(
        localCommits.map((c) =>
          c.id === commit.id
            ? { ...c, status: newStatus, completed_at: completedAt }
            : c,
        ),
      );
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commits</CardTitle>
      </CardHeader>
      <CardContent>
        {isProjectCreator && (
          <form onSubmit={handleAddCommit} className="flex gap-2 mb-6">
            <Input
              placeholder="Add a new commit message (e.g. 'Implement login page')"
              value={newCommitMessage}
              onChange={(e) => setNewCommitMessage(e.target.value)}
              required
            />
            <Button type="submit" disabled={isLoading}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {localCommits.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No commits yet
            </p>
          ) : (
            localCommits.map((commit) => (
              <div
                key={commit.id}
                className={`flex items-center justify-between p-3 rounded-md border ${commit.status === "completed" ? "bg-muted/30" : ""}`}
              >
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleToggleCommitStatus(commit)}
                  >
                    {commit.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </Button>
                  <div>
                    <p
                      className={`font-medium ${commit.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                    >
                      {commit.message}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>
                        {new Date(commit.created_at).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                      {commit.status === "completed" && commit.completed_at && (
                        <>
                          <span className="mx-1">•</span>
                          <span>
                            Completed on{" "}
                            {new Date(commit.completed_at).toLocaleDateString()}
                          </span>
                        </>
                      )}
                      {commit.users && (
                        <>
                          <span className="mx-1">•</span>
                          <span>Assigned to {commit.users.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    commit.status === "completed" ? "outline" : "secondary"
                  }
                >
                  {commit.status === "completed" ? "Completed" : "Pending"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
