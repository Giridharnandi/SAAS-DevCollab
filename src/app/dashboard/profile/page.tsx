import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import ProfileForm from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Upload } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user profile data
  let { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // If profile not found by id, try by user_id
  if (!profile) {
    const { data: userIdProfile } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    profile = userIdProfile;
  }

  // If still no profile, create one
  if (!profile) {
    const { data: newProfile, error } = await supabase
      .from("users")
      .insert({
        id: user.id,
        user_id: user.id,
        name: user.user_metadata?.full_name || "",
        email: user.email,
        user_role: user.user_metadata?.user_role || "project_member",
        token_identifier: user.id,
        created_at: new Date().toISOString(),
        theme: "light",
      })
      .select()
      .single();

    if (!error) {
      profile = newProfile;
    }
  }

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger key="profile-tab" value="profile">
                Profile Information
              </TabsTrigger>
              <TabsTrigger key="account-tab" value="account">
                Account Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent key="profile-content" value="profile">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Update your profile image</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                      {profile?.profile_picture ? (
                        <img
                          src={profile.profile_picture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                          <span className="text-3xl font-bold">
                            {profile?.name
                              ? profile.name.substring(0, 2).toUpperCase()
                              : user.email.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <button className="flex items-center text-sm text-primary">
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Image
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF. 1MB max size.
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your profile details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm user={user} profile={profile} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent key="account-content" value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Email Address</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">User Role</h3>
                      <p className="text-muted-foreground capitalize">
                        {user.user_metadata?.user_role?.replace("_", " ") ||
                          "Project Member"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Account Created</h3>
                      <p className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
