"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "../../supabase/client";
import { GitCommit, User } from "lucide-react";

interface CommitItemProps {
  commit: any;
  isAdmin: boolean;
  currentUserId: string;
}

export default function CommitItem({
  commit,
  isAdmin,
  currentUserId,
}: CommitItemProps) {
  const [status, setStatus] = useState(commit.status || "pending");
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  // Check if the current user is assigned to this commit
  const isAssigned = commit.assigned_to === currentUserId;
  const canEdit = isAdmin || isAssigned;

  const handleStatusChange = async (newStatus: string) => {
    if (!canEdit) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("commits")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", commit.id);

      if (error) throw error;
      setStatus(newStatus);
    } catch (error) {
      console.error("Error updating commit status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <GitCommit className="h-4 w-4" />
          {commit.message}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4" />
            <span>Assigned to: {commit.users?.name || "Unassigned"}</span>
          </div>
          <div>
            <span className="text-xs">
              Created: {new Date(commit.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${status === "completed" ? "bg-green-500" : status === "in_progress" ? "bg-amber-500" : "bg-gray-500"}`}
            ></span>
            <span className="text-sm">{status}</span>
          </div>
          {canEdit ? (
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Button variant="outline" size="sm" disabled>
              No Access
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
