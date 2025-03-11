import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

// This endpoint would be called by a cron job daily
export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Get all users with subscriptions expiring in the next 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const { data: usersWithExpiringSubscriptions, error } = await supabase
      .from("users")
      .select("id, email, name, subscription, subscription_period_end")
      .lt("subscription_period_end", twoDaysFromNow.toISOString())
      .gt("subscription_period_end", new Date().toISOString())
      .eq("subscription_status", "active");

    if (error) throw error;

    // In a real application, you would send emails to these users
    // For this demo, we'll just return the list of users
    const notificationsSent =
      usersWithExpiringSubscriptions?.map((user) => {
        // Here you would integrate with an email service like SendGrid, Mailgun, etc.
        console.log(
          `Sending expiry notification to ${user.email} for ${user.subscription}`,
        );
        return {
          userId: user.id,
          email: user.email,
          subscription: user.subscription,
          expiryDate: user.subscription_period_end,
        };
      }) || [];

    return NextResponse.json({
      success: true,
      notificationsSent,
      count: notificationsSent.length,
    });
  } catch (error: any) {
    console.error("Error sending expiry notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
