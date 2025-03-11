"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "@supabase/supabase-js";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: User;
  profile: any;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || user.user_metadata?.full_name || "",
    username: profile?.username || "",
    location: profile?.location || "",
    description: profile?.description || "",
    mobile: profile?.mobile || "",
    theme: profile?.theme || "light",
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user.user_metadata?.full_name || "",
        username: profile.username || "",
        location: profile.location || "",
        description: profile.description || "",
        mobile: profile.mobile || "",
        theme: profile.theme || "light",
      });
    }
  }, [profile, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, theme: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if the profile exists
      const { data: existingProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      let updateError = null;

      if (existingProfile) {
        // Update by id if profile exists
        const { error } = await supabase
          .from("users")
          .update({
            name: formData.name,
            username: formData.username,
            location: formData.location,
            description: formData.description,
            mobile: formData.mobile,
            theme: formData.theme,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        updateError = error;
      } else {
        // Check if profile exists by user_id
        const { data: existingUserIdProfile } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingUserIdProfile) {
          // Update by user_id if profile exists
          const { error } = await supabase
            .from("users")
            .update({
              name: formData.name,
              username: formData.username,
              location: formData.location,
              description: formData.description,
              mobile: formData.mobile,
              theme: formData.theme,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

          updateError = error;
        } else {
          // Insert new profile if it doesn't exist
          const { error } = await supabase.from("users").insert({
            id: user.id,
            user_id: user.id,
            name: formData.name,
            username: formData.username,
            location: formData.location,
            description: formData.description,
            mobile: formData.mobile,
            theme: formData.theme,
            email: user.email,
            user_role: user.user_metadata?.user_role || "project_member",
            token_identifier: user.id,
            created_at: new Date().toISOString(),
          });

          updateError = error;
        }
      }

      if (updateError) {
        console.error("Error updating profile:", updateError);
        alert("Failed to save profile. Please try again.");
        return;
      }

      // Apply theme change immediately
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(formData.theme);

      // Show success message
      alert("Profile updated successfully!");

      // Force a refresh to show updated data
      setTimeout(() => {
        window.location.href = window.location.pathname;
      }, 500);
    } catch (error) {
      // Handle error
      console.error("Error in profile update:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter a unique username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, Country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">About Me</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="+1 (123) 456-7890"
          />
        </div>

        <div className="space-y-3">
          <Label>Theme Preference</Label>
          <RadioGroup
            value={formData.theme}
            onValueChange={handleThemeChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
