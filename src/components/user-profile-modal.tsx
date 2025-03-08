"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCircle, MapPin, Mail, Info } from "lucide-react";

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  userId,
  isOpen,
  onClose,
}: UserProfileModalProps) {
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!userId || !isOpen) return;

      setLoading(true);

      try {
        // Try to find user by id first
        let { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        // If not found, try by user_id
        if (!data) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (userData) {
            data = userData;
            error = userError;
          }
        }

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [userId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View detailed information about this user
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-center">Loading profile information...</div>
        ) : userProfile ? (
          <div className="py-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {userProfile.profile_picture ? (
                  <img
                    src={userProfile.profile_picture}
                    alt={userProfile.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                    <span className="text-xl font-bold">
                      {userProfile.name
                        ? userProfile.name.substring(0, 2).toUpperCase()
                        : userProfile.email
                          ? userProfile.email.substring(0, 2).toUpperCase()
                          : "U"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{userProfile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {userProfile.username ? `@${userProfile.username}` : ""}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userProfile.email}</span>
              </div>

              {userProfile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userProfile.location}</span>
                </div>
              )}

              {userProfile.description && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">About</span>
                  </div>
                  <p className="text-sm pl-6">{userProfile.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Role:{" "}
                  <span className="capitalize">
                    {userProfile.user_role?.replace("_", " ") ||
                      "Project Member"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            User profile not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
