import { Metadata } from "next";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import FeatureCard from "@/components/feature-card";
import ParallaxSection from "@/components/parallax-section";
import {
  Code,
  GitBranch,
  Users,
  GitPullRequest,
  Shield,
  Workflow,
  MessageSquare,
  LineChart,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features - DevCollab",
  description:
    "Explore the powerful features of DevCollab for developer collaboration",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Powerful Features for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Modern Development
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            DevCollab provides all the tools you need to streamline your
            development workflow and collaborate effectively with your team.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg font-medium"
            >
              Start Building Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Core Platform Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="Developer-First Design"
              description="Built specifically for developers with intuitive interfaces and powerful tools that integrate with your existing workflow."
              color="blue"
              delay={1}
            />

            <FeatureCard
              icon={<GitBranch className="w-8 h-8" />}
              title="Repository Integration"
              description="Connect and track your Git repositories seamlessly with automatic commit tracking and branch management."
              color="indigo"
              delay={2}
            />

            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Team Management"
              description="Build and manage development teams with role-based access control and permission settings."
              color="purple"
              delay={3}
            />

            <FeatureCard
              icon={<GitPullRequest className="w-8 h-8" />}
              title="Collaboration Tools"
              description="Streamline collaboration with join requests, commit tracking, and task assignments for team members."
              color="pink"
              delay={4}
            />

            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Security Controls"
              description="Protect your projects with advanced security features including private repositories and access management."
              color="red"
              delay={5}
            />

            <FeatureCard
              icon={<Workflow className="w-8 h-8" />}
              title="Workflow Management"
              description="Customize your development workflow with kanban boards, task tracking, and progress monitoring."
              color="orange"
              delay={6}
            />
          </div>
        </div>
      </section>

      {/* Parallax Feature Section */}
      <ParallaxSection bgColor="bg-blue-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-12">
            Built for Serious Development Teams
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <MessageSquare className="w-10 h-10 mb-4 mx-auto text-blue-200" />
              <h3 className="text-xl font-semibold mb-3">
                Real-time Communication
              </h3>
              <p className="text-blue-100">
                Keep your team in sync with integrated messaging and
                notification systems.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <LineChart className="w-10 h-10 mb-4 mx-auto text-blue-200" />
              <h3 className="text-xl font-semibold mb-3">
                Performance Analytics
              </h3>
              <p className="text-blue-100">
                Track team productivity and project progress with detailed
                analytics dashboards.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <Zap className="w-10 h-10 mb-4 mx-auto text-blue-200" />
              <h3 className="text-xl font-semibold mb-3">Automation Tools</h3>
              <p className="text-blue-100">
                Automate repetitive tasks and streamline your development
                process with built-in tools.
              </p>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* Feature Details Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">
              Detailed Feature Breakdown
            </h2>

            <div className="space-y-16">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold mb-4">
                    Project Management
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create and manage development projects with customizable
                    settings, team assignments, and progress tracking.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Public and private project visibility
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Customizable team size and member roles
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Repository integration and tracking
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-white p-4 rounded-xl shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80"
                    alt="Project Management"
                    className="rounded-lg w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold mb-4">
                    Team Collaboration
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Build and manage development teams with powerful
                    collaboration tools designed for modern workflows.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Role-based access control
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Join request system for team building
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Team member performance tracking
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-white p-4 rounded-xl shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                    alt="Team Collaboration"
                    className="rounded-lg w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold mb-4">
                    Workflow Management
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Customize your development workflow with kanban boards, task
                    tracking, and progress monitoring tools.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Kanban board for visual task management
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Commit tracking and assignment
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Progress reporting and analytics
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-white p-4 rounded-xl shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80"
                    alt="Workflow Management"
                    className="rounded-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are building better projects
            together with DevCollab.
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
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
