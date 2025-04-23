"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import CommitItem from "./commit-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus } from "lucide-react";

interface ProjectCommitsListProps {
  projectId: string;
  isAdmin: boolean;
  members: any[];
}

export default function ProjectCommitsList({
  projectId,
  isAdmin,
  members,
}: ProjectCommitsListProps) {
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCommit, setNewCommit] = useState({
    message: "",
    assigned_to: "",
  });
  const [currentUserId, setCurrentUserId] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }

        // Fetch commits
        const { data, error } = await supabase
          .from("commits")
          .select(
            "*, users!commits_assigned_to_fkey(id, name, email, profile_picture)",
          )
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCommits(data || []);
      } catch (error) {
        console.error("Error loading commits:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId, supabase]);

  const handleAddCommit = async () => {
    if (!newCommit.message) return;

    try {
      const { data, error } = await supabase
        .from("commits")
        .insert({
          project_id: projectId,
          message: newCommit.message,
          assigned_to: newCommit.assigned_to || null,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          "*, users!commits_assigned_to_fkey(id, name, email, profile_picture)",
        );

      if (error) throw error;

      if (data && data.length > 0) {
        setCommits([data[0], ...commits]);
      }

      setNewCommit({ message: "", assigned_to: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding commit:", error);
    }
  };

  if (loading) {
    return <div className="py-4">Loading commits...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Project Commits</h3>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Commit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Commit</DialogTitle>
                <DialogDescription>
                  Create a new commit and assign it to a team member.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="commit-message">Commit Message</Label>
                  <Input
                    id="commit-message"
                    value={newCommit.message}
                    onChange={(e) =>
                      setNewCommit({ ...newCommit, message: e.target.value })
                    }
                    placeholder="Enter commit message"
                  />
                </div>
                <div>
                  <Label htmlFor="assigned-to">Assign To</Label>
                  <Select
                    value={newCommit.assigned_to}
                    onValueChange={(value) =>
                      setNewCommit({ ...newCommit, assigned_to: value })
                    }
                  >
                    <SelectTrigger id="assigned-to">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.users?.name || "Unknown User"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddCommit}>Add Commit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {commits.length > 0 ? (
          commits.map((commit) => (
            <CommitItem
              key={commit.id}
              commit={commit}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No commits found for this project.
          </div>
        )}
      </div>
    </div>
  );
}
