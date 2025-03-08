"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@supabase/supabase-js";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import { AlertCircle, Trash2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditProjectFormProps {
  project: any;
  user: User;
}

export default function EditProjectForm({
  project,
  user,
}: EditProjectFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [formData, setFormData] = useState({
    title: project.title || "",
    description: project.description || "",
    visibility: project.visibility || "public",
    team_size: project.team_size?.toString() || "5",
    repository_link: project.repository_link || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: formData.title,
          description: formData.description,
          visibility: formData.visibility,
          team_size: parseInt(formData.team_size),
          repository_link: formData.repository_link,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (error) throw error;

      router.push(
        `/dashboard/projects/${project.id}?success=Project updated successfully`,
      );
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (deleteConfirmation !== project.title) return;

    setIsLoading(true);

    try {
      // First delete all project members
      const { error: membersError } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", project.id);

      if (membersError) throw membersError;

      // Delete all project commits
      const { error: commitsError } = await supabase
        .from("commits")
        .delete()
        .eq("project_id", project.id);

      if (commitsError) throw commitsError;

      // Delete all join requests
      const { error: requestsError } = await supabase
        .from("join_requests")
        .delete()
        .eq("project_id", project.id);

      if (requestsError) throw requestsError;

      // Finally delete the project
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (projectError) throw projectError;

      router.push("/dashboard/projects?success=Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Project Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) =>
                  handleSelectChange("visibility", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_size">Team Size</Label>
              <Select
                value={formData.team_size}
                onValueChange={(value) =>
                  handleSelectChange("team_size", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 member</SelectItem>
                  <SelectItem value="2">2 members</SelectItem>
                  <SelectItem value="3">3 members</SelectItem>
                  <SelectItem value="4">4 members</SelectItem>
                  <SelectItem value="5">5 members</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository_link">Repository Link (Optional)</Label>
            <Input
              id="repository_link"
              name="repository_link"
              value={formData.repository_link}
              onChange={handleChange}
              placeholder="https://github.com/username/repository"
            />
          </div>

          <div className="space-y-2">
            <Label>Project Cover Image</Label>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop an image, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG or GIF. 2MB max size.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Upload Image
              </Button>
            </div>
          </div>

          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Teams larger than 5 members require a Pro subscription plan.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button type="button" variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  project and remove all team members, commits, and associated
                  data.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <Label htmlFor="confirm" className="mb-2 block">
                  To confirm, type{" "}
                  <span className="font-semibold">{project.title}</span> below:
                </Label>
                <Input
                  id="confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={project.title}
                  className="mt-2"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  disabled={deleteConfirmation !== project.title || isLoading}
                >
                  {isLoading ? "Deleting..." : "Confirm Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
