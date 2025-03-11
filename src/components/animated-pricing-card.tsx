"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface AnimatedPricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  ctaText?: string;
  ctaLink?: string;
  delay?: number;
}

export default function AnimatedPricingCard({
  title,
  price,
  period,
  description,
  features,
  popular = false,
  ctaText = "Get Started",
  ctaLink = "/sign-up",
  delay = 0,
}: AnimatedPricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.2 }}
      viewport={{ once: true }}
      className={`relative rounded-2xl overflow-hidden ${popular ? "border-2 border-blue-500" : "border border-gray-200"} ${isHovered ? "shadow-xl transform -translate-y-2" : "shadow-md"} transition-all duration-300 bg-white`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
          Most Popular
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-500 ml-2">{period}</span>
        </div>

        <Link href={ctaLink}>
          <Button
            className={`w-full py-6 mb-6 ${popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            variant={popular ? "default" : "outline"}
          >
            {ctaText}
          </Button>
        </Link>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + index * 0.1 }}
              className="flex items-center text-sm"
            >
              <Check
                className={`h-5 w-5 mr-2 ${feature.included ? "text-green-500" : "text-gray-300"}`}
              />
              <span
                className={
                  feature.included
                    ? "text-gray-700"
                    : "text-gray-400 line-through"
                }
              >
                {feature.text}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
