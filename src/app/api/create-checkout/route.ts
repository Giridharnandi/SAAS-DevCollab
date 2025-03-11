import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "../../../../supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { price_id, user_id } = await req.json();

    if (!price_id || !user_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Get user email from Supabase
    const supabase = await createClient();
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", user_id)
      .single();

    // For demo purposes, create a product and price if the price_id doesn't exist
    let priceId = price_id;
    try {
      // Try to retrieve the price to see if it exists
      await stripe.prices.retrieve(price_id);
    } catch (error) {
      // If price doesn't exist, create a demo product and price
      const product = await stripe.products.create({
        name: "Demo Subscription",
        description: "Demo subscription for testing",
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1900, // $19.00
        currency: "usd",
        recurring: {
          interval: "month",
        },
      });

      priceId = price.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard/profile?canceled=true`,
      customer_email: userData?.email,
      metadata: {
        user_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
