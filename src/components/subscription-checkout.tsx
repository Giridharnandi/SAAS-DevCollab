"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";

interface SubscriptionCheckoutProps {
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planPrice: string;
  planInterval: string;
  planDescription: string;
  onSuccess: () => void;
}

export default function SubscriptionCheckout({
  userId,
  userEmail,
  planId,
  planName,
  planPrice,
  planInterval,
  planDescription,
  onSuccess,
}: SubscriptionCheckoutProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Create checkout session with Stripe using Next.js API route
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_id: planId,
          user_id: userId,
        }),
      });

      const data = await response.json();
      const error = !response.ok
        ? new Error("Failed to create checkout session")
        : null;

      console.log("Checkout response:", data, error);

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout URL
      if (data?.url) {
        window.location.href = data.url;
      } else {
        // For demo purposes, simulate a successful payment if no URL is returned
        setTimeout(() => {
          setIsLoading(false);

          // Update the user's subscription in the database
          updateUserSubscription();
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setIsLoading(false);
    }
  };

  const updateUserSubscription = async () => {
    try {
      // Update the user's subscription in the database
      // Calculate expiry date based on plan interval
      const expiryDate = new Date();
      if (planInterval === "year") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      // First try to update by user_id
      let { error } = await supabase
        .from("users")
        .update({
          subscription: planName,
          subscription_status: "active",
          subscription_period_end: expiryDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      // If that fails, try updating by id
      if (error) {
        const { error: secondError } = await supabase
          .from("users")
          .update({
            subscription: planName,
            subscription_status: "active",
            subscription_period_end: expiryDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (secondError) throw secondError;
      }

      // Also update the subscriptions table
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          status: "active",
          price_id: planId,
          current_period_start: new Date().toISOString(),
          current_period_end: expiryDate.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

      // Call the success callback
      onSuccess();

      // Refresh the page to show the updated subscription
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  return (
    <Button size="sm" onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? "Processing..." : "Select"}
    </Button>
  );
}
