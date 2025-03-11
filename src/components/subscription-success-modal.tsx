"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface SubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export default function SubscriptionSuccessModal({
  isOpen,
  onClose,
  planName,
}: SubscriptionSuccessModalProps) {
  const currentDate = new Date();
  const expiryDate = new Date(currentDate);
  expiryDate.setMonth(currentDate.getMonth() + 1);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Subscription Activated!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your {planName} has been successfully activated.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            You now have access to all the features included in your plan.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Your subscription is now active until{" "}
            {expiryDate.toLocaleDateString()}.
          </p>
          <p className="text-sm text-muted-foreground">
            Your subscription will automatically renew at the end of your
            billing period.
          </p>
        </div>

        <DialogFooter className="flex justify-center">
          <Button onClick={onClose}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
