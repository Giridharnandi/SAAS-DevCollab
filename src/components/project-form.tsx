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
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProjectFormProps {
  user: User;
}

export default function ProjectForm({ user }: ProjectFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
    team_size: "5",
    repository_link: "",
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
      // Create the project
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          title: formData.title,
          description: formData.description,
          visibility: formData.visibility,
          team_size: parseInt(formData.team_size),
          repository_link: formData.repository_link,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the creator as a project member
      if (project) {
        await supabase.from("project_members").insert({
          project_id: project.id,
          user_id: user.id,
        });
      }

      router.push(`/dashboard/projects/${project.id}`);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              onValueChange={(value) => handleSelectChange("visibility", value)}
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
              onValueChange={(value) => handleSelectChange("team_size", value)}
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
            <Button type="button" variant="outline" size="sm" className="mt-4">
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Project..." : "Create Project"}
      </Button>
    </form>
  );
}
