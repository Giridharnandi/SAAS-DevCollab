import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import AnimatedGradientBackground from "@/components/animated-gradient-background";
import MouseTracker from "@/components/mouse-tracker";
import { createClient } from "../../supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  CheckCircle2,
  Code,
  GitBranch,
  Users,
  Workflow,
  GitPullRequest,
  Shield,
  ArrowRight,
  Zap,
  Globe,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen relative overflow-hidden cursor-none">
      <MouseTracker />
      <AnimatedGradientBackground />
      <Navbar />
      <div id="hero">
        <Hero />
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Developers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform is designed specifically for developers and
              solopreneurs who want to collaborate effectively on projects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Code className="w-6 h-6" />,
                title: "Developer-First",
                description:
                  "Tools and workflows designed specifically for development teams",
                color: "blue",
                delay: 0,
              },
              {
                icon: <GitBranch className="w-6 h-6" />,
                title: "Repository Integration",
                description:
                  "Connect and track your Git repositories seamlessly",
                color: "indigo",
                delay: 1,
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Team Management",
                description:
                  "Build and manage development teams with role-based access",
                color: "purple",
                delay: 2,
              },
              {
                icon: <GitPullRequest className="w-6 h-6" />,
                title: "Collaboration Tools",
                description:
                  "Join requests, commit tracking, and task assignments",
                color: "pink",
                delay: 3,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-6 bg-white rounded-xl shadow-sm border border-${feature.color}-100 hover:border-${feature.color}-300 transition-all`}
              >
                <div className={`text-${feature.color}-600 mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/features">
              <Button className="group">
                Explore All Features
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 bg-gray-50 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute -right-20 -top-20 text-blue-100"
            width="400"
            height="400"
            viewBox="0 0 200 200"
          >
            <path
              fill="currentColor"
              d="M45.3,-58.8C59.9,-53.2,73.8,-41.7,80.2,-26.6C86.5,-11.5,85.4,7.1,77.9,21.5C70.5,35.9,56.6,46.2,42.3,56.5C28.1,66.8,13.5,77.1,-2.4,80.2C-18.3,83.4,-36.6,79.4,-47.5,68.1C-58.3,56.8,-61.7,38.2,-65.8,20.9C-69.9,3.7,-74.8,-12.3,-70.8,-25.3C-66.8,-38.3,-53.9,-48.3,-40.4,-54.2C-26.9,-60.1,-13.5,-61.9,1.2,-63.5C15.8,-65.1,31.7,-66.5,45.3,-58.8Z"
              transform="translate(100 100)"
            />
          </svg>
          <svg
            className="absolute -left-20 -bottom-20 text-indigo-100"
            width="400"
            height="400"
            viewBox="0 0 200 200"
          >
            <path
              fill="currentColor"
              d="M47.7,-57.2C59,-47.3,63.6,-29.7,68.3,-11.1C73,7.5,77.8,27.1,70.8,41.1C63.8,55.2,45,63.7,25.8,69.9C6.6,76.1,-13,80,-29.1,74.4C-45.3,68.8,-58,53.7,-67.4,36.1C-76.8,18.5,-82.8,-1.6,-77.2,-17.8C-71.5,-34,-54.2,-46.4,-37.3,-55.3C-20.4,-64.2,-3.9,-69.6,11.1,-82.2C26.1,-94.8,39.2,-114.6,47.7,-57.2Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get your development team up and running in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create a Project</h3>
              <p className="text-gray-600">
                Set up your project with repository details and team
                requirements
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Build Your Team</h3>
              <p className="text-gray-600">
                Invite developers or approve join requests from interested
                collaborators
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Collaborate</h3>
              <p className="text-gray-600">
                Track commits, assign tasks, and manage your development
                workflow
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/documentation">
              <Button variant="outline" className="group">
                View Documentation
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg
            className="absolute right-0 top-0 h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon fill="#FFFFFF" points="0,0 100,0 100,100" />
          </svg>
          <svg
            className="absolute left-0 bottom-0 h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon fill="#FFFFFF" points="0,100 100,100 0,0" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-3">1000+</div>
              <div className="text-blue-100 text-lg">Active Projects</div>
            </div>

            <div>
              <div className="text-5xl font-bold mb-3">5000+</div>
              <div className="text-blue-100 text-lg">Developers</div>
            </div>

            <div>
              <div className="text-5xl font-bold mb-3">99.9%</div>
              <div className="text-blue-100 text-lg">Uptime Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your development team. Scale as you
              grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans?.map((item: any, index: number) => (
              <div key={item.id}>
                <PricingCard item={item} user={user} />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/pricing">
              <Button variant="outline" className="group">
                View All Pricing Options
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-blue-200 opacity-20" />
          <div className="absolute -left-20 top-20 w-80 h-80 rounded-full bg-indigo-200 opacity-20" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Supercharge Your Development Workflow?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are building better projects
              together.
            </p>
            <div>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg font-medium"
                >
                  Start Collaborating Now
                  <ArrowUpRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
