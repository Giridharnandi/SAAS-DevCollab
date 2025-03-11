import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { session_id, user_id } = await req.json();

    if (!session_id || !user_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.status !== "complete") {
      return NextResponse.json(
        { error: "Invalid or incomplete session" },
        { status: 400 },
      );
    }

    // Get subscription details
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Get plan details
    const priceId = subscription.items.data[0]?.price.id;
    const product = await stripe.products.retrieve(
      subscription.items.data[0]?.price.product as string,
    );

    // Update user's subscription in the database
    const supabase = await createClient();

    // First try to update by user_id
    let { error: updateError } = await supabase
      .from("users")
      .update({
        subscription: product.name,
        subscription_id: subscriptionId,
        subscription_status: subscription.status,
        subscription_period_end: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    // If that fails, try updating by id
    if (updateError) {
      const { error: secondError } = await supabase
        .from("users")
        .update({
          subscription: product.name,
          subscription_id: subscriptionId,
          subscription_status: subscription.status,
          subscription_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user_id);

      if (secondError) {
        throw secondError;
      }
    }

    // Also store subscription details in subscriptions table
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          stripe_id: subscriptionId,
          user_id: user_id,
          price_id: priceId,
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "stripe_id",
        },
      );

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        status: subscription.status,
        plan_name: product.name,
        current_period_end: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
