import { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PricingCard from "@/components/pricing-card";
import { Button } from "@/components/ui/button";
import { CheckCircle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../supabase/server";

export const metadata: Metadata = {
  title: "Pricing - DevCollab",
  description:
    "Simple, transparent pricing for DevCollab - the developer collaboration platform",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  // Create mock plans if API call fails or returns no plans
  const mockPlans = [
    {
      id: "free-plan",
      product_name: "Free Plan",
      amount: 0,
      interval: "lifetime",
    },
    {
      id: "pro-dev-plan",
      product_name: "Pro Dev Plan",
      amount: 1500,
      interval: "month",
    },
    {
      id: "pro-plan",
      product_name: "Pro Plan",
      amount: 1900,
      interval: "month",
    },
    {
      id: "professional-plan",
      product_name: "Professional Plan",
      amount: 4900,
      interval: "month",
    },
    {
      id: "professional-annual",
      product_name: "Professional Annual Plan",
      amount: 54900,
      interval: "year",
    },
  ];

  const displayPlans = plans && plans.length > 0 ? plans : mockPlans;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Choose the perfect plan for your development team. Scale as you
            grow.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-12">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>No credit card required for free plan</span>
            <span className="mx-2">•</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Cancel anytime</span>
            <span className="mx-2">•</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>All plans include core features</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
            {displayPlans.map((plan) => (
              <div key={plan.id}>
                <PricingCard item={plan} user={user} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                How does billing work?
              </h3>
              <p className="text-gray-600">
                We bill monthly or annually depending on your plan. You can
                cancel at any time.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Do you offer discounts?
              </h3>
              <p className="text-gray-600">
                We offer discounts for educational institutions and non-profit
                organizations. Contact us for details.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for
                annual plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are building better projects
            together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full px-8"
              >
                Sign Up Free
              </Button>
            </Link>
            <Link href="/documentation">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 bg-transparent text-white border-white hover:bg-white/10"
              >
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
