"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JoinRequestButtonProps {
  projectId: string;
  userId: string;
  isMember: boolean;
  hasRequestPending: boolean;
  teamSize: number;
  currentMemberCount: number;
}

export default function JoinRequestButton({
  projectId,
  userId,
  isMember,
  hasRequestPending,
  teamSize,
  currentMemberCount,
}: JoinRequestButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isTeamFull = currentMemberCount >= teamSize;

  const handleSubmitRequest = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.from("join_requests").insert({
        project_id: projectId,
        user_id: userId,
        message: message,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error submitting join request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMember) {
    return (
      <Button variant="outline" disabled>
        <UserPlus className="h-4 w-4 mr-2" />
        Already a Member
      </Button>
    );
  }

  if (hasRequestPending) {
    return (
      <Button variant="outline" disabled>
        <UserPlus className="h-4 w-4 mr-2" />
        Request Pending
      </Button>
    );
  }

  if (isTeamFull) {
    return (
      <Button variant="outline" disabled>
        <UserPlus className="h-4 w-4 mr-2" />
        Team Full
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Request to Join
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Join Project</DialogTitle>
          <DialogDescription>
            Send a request to the project admin to join this team.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="message" className="mb-2 block">
            Message (Optional)
          </Label>
          <Textarea
            id="message"
            placeholder="Introduce yourself and explain why you'd like to join this project..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmitRequest} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
