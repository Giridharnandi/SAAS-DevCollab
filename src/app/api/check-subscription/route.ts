import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import {
  getMaxTeamSize,
  getMaxProjectCount,
  isSubscriptionActive,
} from "@/utils/subscription";

export async function POST(req: Request) {
  try {
    const { user_id, feature_type } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get user's subscription and role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        "subscription, subscription_status, subscription_period_end, user_role",
      )
      .or(`id.eq.${user_id},user_id.eq.${user_id}`)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Error fetching user data" },
        { status: 500 },
      );
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if subscription is active using the utility function
    const subscriptionActive = isSubscriptionActive(
      userData.subscription_status,
      userData.subscription_period_end,
    );

    // Get subscription limits using utility functions
    const maxTeamSize = getMaxTeamSize(
      subscriptionActive ? userData.subscription : null,
    );
    const maxProjects = getMaxProjectCount(
      subscriptionActive ? userData.subscription : null,
      userData.user_role || "project_member",
    );

    // Determine access based on feature type and subscription
    let hasAccess = false;

    if (feature_type === "basic") {
      // Basic features are available to all users
      hasAccess = true;
    } else if (feature_type === "workflow") {
      // Workflow features require Pro or Professional subscription
      hasAccess =
        subscriptionActive &&
        ["Pro Plan", "Professional Plan", "Professional Annual Plan"].includes(
          userData.subscription || "",
        );
    } else if (feature_type === "advanced") {
      // Advanced features require any paid subscription
      hasAccess = subscriptionActive && userData.subscription !== null;
    }

    return NextResponse.json({
      hasAccess,
      subscription: userData.subscription || "Free Plan",
      isActive: subscriptionActive,
      limits: {
        maxTeamSize,
        maxProjects,
      },
    });
  } catch (error: any) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
