import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, user_id } = await req.json();

    if (!session_id || !user_id) {
      throw new Error("Missing required parameters");
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.status !== "complete") {
      throw new Error("Invalid or incomplete session");
    }

    // Get subscription details
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Get plan details
    const priceId = subscription.items.data[0]?.price.id;
    const product = await stripe.products.retrieve(
      subscription.items.data[0]?.price.product as string,
    );

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update user's subscription in the database
    const { error: updateError } = await supabase
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

    if (updateError) {
      throw updateError;
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

    if (subscriptionError) {
      console.error("Error updating subscriptions table:", subscriptionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscriptionId,
          status: subscription.status,
          plan_name: product.name,
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error verifying session:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
