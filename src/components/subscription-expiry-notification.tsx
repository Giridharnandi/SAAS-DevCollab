"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SubscriptionExpiryNotificationProps {
  userId: string;
  subscriptionName: string;
  expiryDate: string;
}

export default function SubscriptionExpiryNotification({
  userId,
  subscriptionName,
  expiryDate,
}: SubscriptionExpiryNotificationProps) {
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    if (!expiryDate) return;

    const calculateDaysRemaining = () => {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const timeDiff = expiry.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setDaysRemaining(daysDiff);
      setShowNotification(daysDiff <= 2 && daysDiff > 0);
    };

    calculateDaysRemaining();
    // Check daily
    const interval = setInterval(calculateDaysRemaining, 86400000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  const handleRenew = () => {
    // Scroll to subscription tab
    document.getElementById("subscription-tab")?.click();
  };

  if (!showNotification) return null;

  return (
    <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">
        Your {subscriptionName} is expiring soon!
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          Your subscription will expire in {daysRemaining} day
          {daysRemaining !== 1 ? "s" : ""}. Renew now to continue enjoying
          premium features.
        </p>
        <Button size="sm" variant="outline" onClick={handleRenew}>
          Renew Subscription
        </Button>
      </AlertDescription>
    </Alert>
  );
}
