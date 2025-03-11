"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import ProfileForm from "@/components/profile-form";
import SubscriptionCheckout from "@/components/subscription-checkout";
import SubscriptionSuccessModal from "@/components/subscription-success-modal";
import SubscriptionExpiryNotification from "@/components/subscription-expiry-notification";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);

      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      setUser(currentUser);

      // Fetch user profile data
      let { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      // If profile not found by id, try by user_id
      if (!userProfile) {
        const { data: userIdProfile } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        userProfile = userIdProfile;
      }

      // If still no profile, create one
      if (!userProfile) {
        const { data: newProfile } = await supabase
          .from("users")
          .insert({
            id: currentUser.id,
            user_id: currentUser.id,
            name: currentUser.user_metadata?.full_name || "",
            email: currentUser.email,
            user_role: currentUser.user_metadata?.user_role || "project_member",
            token_identifier: currentUser.id,
            created_at: new Date().toISOString(),
            theme: "light",
          })
          .select()
          .single();

        if (newProfile) {
          userProfile = newProfile;
        }
      }

      setProfile(userProfile);
      setLoading(false);

      // Check URL parameters for Stripe session ID
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");
      console.log("Session ID from URL:", sessionId);

      if (sessionId) {
        // Verify the session with Stripe and update subscription
        verifyStripeSession(sessionId, currentUser.id);
      }
    }

    loadUserData();
  }, [router, supabase]);

  const verifyStripeSession = async (sessionId: string, userId: string) => {
    console.log("Verifying session:", sessionId, userId);
    try {
      // Call the verify-session API route
      const response = await fetch("/api/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
        }),
      });

      const data = await response.json();
      const error = !response.ok ? new Error("Failed to verify session") : null;

      console.log("Verification response:", data, error);

      if (error) throw error;

      if (data?.success) {
        // Update local state
        setSelectedPlan(data.subscription?.plan_name || "subscription");
        setShowSuccessModal(true);

        // Remove the session_id from URL without refreshing the page
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        // Refresh profile data to show updated subscription
        const { data: updatedProfile } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (updatedProfile) {
          setProfile(updatedProfile);
          console.log(
            "Updated profile with subscription:",
            updatedProfile.subscription,
          );
        }

        // Force reload to ensure UI updates properly
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying Stripe session:", error);
    }
  };

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        {profile?.subscription && profile?.subscription_period_end && (
          <SubscriptionExpiryNotification
            userId={user.id}
            subscriptionName={profile.subscription}
            expiryDate={profile.subscription_period_end}
          />
        )}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="account">Account Settings</TabsTrigger>
              <TabsTrigger id="subscription-tab" value="subscription">
                Subscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
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

            <TabsContent value="account">
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

            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>
                    View and manage your subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Current Plan</h3>
                      <div className="bg-muted/50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <p className="font-semibold text-lg">
                                {profile?.subscription
                                  ? profile.subscription
                                  : "Free Plan"}
                              </p>
                              {profile?.subscription && (
                                <Badge
                                  variant="success"
                                  className="ml-2 bg-green-100 text-green-800"
                                >
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {profile?.subscription === "Pro Plan"
                                ? "Up to 25 team members per project"
                                : profile?.subscription ===
                                      "Professional Plan" ||
                                    profile?.subscription ===
                                      "Professional Annual Plan"
                                  ? "Up to 50 team members per project"
                                  : profile?.subscription === "Pro Dev Plan"
                                    ? "Unlimited open/public projects"
                                    : user.user_metadata?.user_role ===
                                        "project_creator"
                                      ? "Up to 5 team members per project (Free Plan)"
                                      : "Up to 2 open/public projects (Free Plan)"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("subscription-tab")
                                ?.click()
                            }
                          >
                            {profile?.subscription ? "Manage Plan" : "Upgrade"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">
                        Available Plans
                      </h3>
                      <div className="space-y-4">
                        {user.user_metadata?.user_role === "project_creator" ? (
                          <>
                            <div
                              className={`p-4 rounded-lg border ${profile?.subscription === "Pro Plan" ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/30"} transition-colors cursor-pointer`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">Pro Plan</p>
                                    {profile?.subscription === "Pro Plan" && (
                                      <Badge
                                        variant="success"
                                        className="bg-green-100 text-green-800"
                                      >
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Up to 25 team members per project for 1
                                    month
                                  </p>
                                  <p className="text-lg font-bold">
                                    $19
                                    <span className="text-sm font-normal text-muted-foreground">
                                      /month
                                    </span>
                                  </p>
                                </div>
                                <SubscriptionCheckout
                                  userId={user.id}
                                  userEmail={user.email || ""}
                                  planId="price_1PQRSTUVWXYZabcdefghijkl" // Replace with your actual Stripe price ID
                                  planName="Pro Plan"
                                  planPrice="19"
                                  planInterval="month"
                                  planDescription="Up to 25 team members per project"
                                  onSuccess={() => {
                                    setSelectedPlan("Pro Plan");
                                    setShowSuccessModal(true);
                                  }}
                                />
                              </div>
                            </div>

                            <div
                              className={`p-4 rounded-lg border ${profile?.subscription === "Professional Plan" ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/30"} transition-colors cursor-pointer`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">
                                      Professional Plan
                                    </p>
                                    {profile?.subscription ===
                                      "Professional Plan" && (
                                      <Badge
                                        variant="success"
                                        className="bg-green-100 text-green-800"
                                      >
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Up to 50 team members per project for 1
                                    month
                                  </p>
                                  <p className="text-lg font-bold">
                                    $49
                                    <span className="text-sm font-normal text-muted-foreground">
                                      /month
                                    </span>
                                  </p>
                                </div>
                                <SubscriptionCheckout
                                  userId={user.id}
                                  userEmail={user.email || ""}
                                  planId="price_1PQRSTUVWXYZabcdefghijkm" // Replace with your actual Stripe price ID
                                  planName="Professional Plan"
                                  planPrice="49"
                                  planInterval="month"
                                  planDescription="Up to 50 team members per project"
                                  onSuccess={() => {
                                    setSelectedPlan("Professional Plan");
                                    setShowSuccessModal(true);
                                  }}
                                />
                              </div>
                            </div>

                            <div
                              className={`p-4 rounded-lg border ${profile?.subscription === "Professional Annual Plan" ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/30"} transition-colors cursor-pointer`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold">
                                      Professional Annual Plan
                                    </p>
                                    {profile?.subscription ===
                                      "Professional Annual Plan" && (
                                      <Badge
                                        variant="success"
                                        className="bg-green-100 text-green-800"
                                      >
                                        Active
                                      </Badge>
                                    )}
                                    <Badge variant="secondary">Save 7%</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Up to 50 team members per project for 1 year
                                  </p>
                                  <p className="text-lg font-bold">
                                    $549
                                    <span className="text-sm font-normal text-muted-foreground">
                                      /year
                                    </span>
                                  </p>
                                </div>
                                <SubscriptionCheckout
                                  userId={user.id}
                                  userEmail={user.email || ""}
                                  planId="price_1PQRSTUVWXYZabcdefghijkn" // Replace with your actual Stripe price ID
                                  planName="Professional Annual Plan"
                                  planPrice="549"
                                  planInterval="year"
                                  planDescription="Up to 50 team members per project"
                                  onSuccess={() => {
                                    setSelectedPlan("Professional Annual Plan");
                                    setShowSuccessModal(true);
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div
                            className={`p-4 rounded-lg border ${profile?.subscription === "Pro Dev Plan" ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/30"} transition-colors cursor-pointer`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">Pro Dev Plan</p>
                                  {profile?.subscription === "Pro Dev Plan" && (
                                    <Badge
                                      variant="success"
                                      className="bg-green-100 text-green-800"
                                    >
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Unlimited open/public projects for 1 month
                                </p>
                                <p className="text-lg font-bold">
                                  $15
                                  <span className="text-sm font-normal text-muted-foreground">
                                    /month
                                  </span>
                                </p>
                              </div>
                              <SubscriptionCheckout
                                userId={user.id}
                                userEmail={user.email || ""}
                                planId="price_1PQRSTUVWXYZabcdefghijko" // Replace with your actual Stripe price ID
                                planName="Pro Dev Plan"
                                planPrice="15"
                                planInterval="month"
                                planDescription="Unlimited open/public projects"
                                onSuccess={() => {
                                  setSelectedPlan("Pro Dev Plan");
                                  setShowSuccessModal(true);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm">
                      <p className="font-medium text-blue-700 mb-1">
                        Need help with your subscription?
                      </p>
                      <p className="text-blue-600">
                        Contact our support team at support@devcollab.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Success Modal */}
      <SubscriptionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        planName={selectedPlan || "subscription"}
      />
    </>
  );
}
