"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Link from "next/link";

interface PricingCardProps {
  item: any;
  user: User | null;
}

export default function PricingCard({ item, user }: PricingCardProps) {
  // Determine if this is the popular plan
  const isPopular = item?.product_name?.includes("Pro Plan") || false;

  // Format price from cents to dollars
  const price = item?.amount ? `$${(item.amount / 100).toFixed(0)}` : "$0";

  // Determine interval
  const interval = item?.interval || "lifetime";

  // Set features based on plan
  let features = [];
  let title = "Free Plan";

  if (item?.product_name?.includes("Pro Plan")) {
    title = "Pro Plan";
    features = [
      { text: "Unlimited projects", included: true },
      { text: "Up to 25 team members per project", included: true },
      { text: "Advanced project management", included: true },
      { text: "Priority email support", included: true },
      { text: "Custom roles and permissions", included: true },
    ];
  } else if (item?.product_name?.includes("Professional Plan")) {
    title = "Professional Plan";
    features = [
      { text: "Unlimited projects", included: true },
      { text: "Up to 50 team members per project", included: true },
      { text: "Advanced project management", included: true },
      { text: "Priority support with SLA", included: true },
      { text: "API access", included: true },
    ];
  } else if (item?.product_name?.includes("Professional Annual")) {
    title = "Professional Annual";
    features = [
      { text: "Unlimited projects", included: true },
      { text: "Up to 50 team members per project", included: true },
      { text: "Advanced project management", included: true },
      { text: "Priority support with SLA", included: true },
      { text: "API access", included: true },
    ];
  } else if (item?.product_name?.includes("Pro Dev")) {
    title = "Pro Dev Plan";
    features = [
      { text: "Unlimited open/public projects", included: true },
      { text: "Limited team size (5 members)", included: true },
      { text: "Advanced project management", included: true },
      { text: "Join multiple teams", included: true },
      { text: "Custom roles and permissions", included: false },
    ];
  } else {
    // Free plan
    features = [
      { text: "Up to 2 open/public projects", included: true },
      { text: "Limited team size (5 members)", included: true },
      { text: "Basic project management", included: true },
      { text: "Repository integration", included: true },
      { text: "Advanced team management", included: false },
    ];
  }

  return (
    <Card
      className={`h-full flex flex-col ${isPopular ? "border-2 border-blue-500 shadow-md" : ""}`}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold">{price}</span>
              <span className="text-gray-500 text-sm">/{interval}</span>
            </div>
          </div>
          {isPopular && (
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Popular
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={feature.included ? "" : "text-gray-400"}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link
          href={user ? "/dashboard/profile" : "/sign-up"}
          className="w-full"
        >
          <Button
            variant={isPopular ? "default" : "outline"}
            className="w-full"
          >
            {user ? "Manage Subscription" : "Get Started"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
