import { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DocumentationSidebar from "@/components/documentation-sidebar";
import {
  FileText,
  Folder,
  BookOpen,
  Code,
  Users,
  GitBranch,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation - DevCollab",
  description:
    "Learn how to use the DevCollab platform for developer collaboration",
};

const sidebarItems = [
  {
    title: "Getting Started",
    icon: <BookOpen className="h-4 w-4" />,
    children: [
      { title: "Introduction", href: "/documentation/introduction" },
      { title: "Quick Start Guide", href: "/documentation/quick-start" },
      { title: "Installation", href: "/documentation/installation" },
    ],
  },
  {
    title: "Core Concepts",
    icon: <Folder className="h-4 w-4" />,
    children: [
      { title: "Projects", href: "/documentation/projects" },
      { title: "Teams", href: "/documentation/teams" },
      { title: "Repositories", href: "/documentation/repositories" },
      { title: "Commits", href: "/documentation/commits" },
    ],
  },
  {
    title: "User Guides",
    icon: <Users className="h-4 w-4" />,
    children: [
      {
        title: "Project Creator Guide",
        href: "/documentation/project-creator-guide",
      },
      { title: "Team Member Guide", href: "/documentation/team-member-guide" },
      {
        title: "Collaboration Workflow",
        href: "/documentation/collaboration-workflow",
      },
    ],
  },
  {
    title: "API Reference",
    icon: <Code className="h-4 w-4" />,
    children: [
      { title: "Authentication", href: "/documentation/api/authentication" },
      { title: "Projects", href: "/documentation/api/projects" },
      { title: "Users", href: "/documentation/api/users" },
      { title: "Teams", href: "/documentation/api/teams" },
    ],
  },
  {
    title: "Advanced Topics",
    icon: <GitBranch className="h-4 w-4" />,
    children: [
      { title: "Webhooks", href: "/documentation/webhooks" },
      { title: "Custom Integrations", href: "/documentation/integrations" },
      { title: "Security Best Practices", href: "/documentation/security" },
    ],
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <DocumentationSidebar
            items={sidebarItems}
            className="hidden md:block"
          />

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-6">Documentation</h1>
            <p className="text-xl text-gray-600 mb-8">
              Learn how to use DevCollab to streamline your development workflow
            </p>

            <div className="prose max-w-none">
              <h2>Welcome to DevCollab Documentation</h2>
              <p>
                DevCollab is a comprehensive platform designed for developers
                and solopreneurs to create projects, build teams, and
                collaborate effectively with tools tailored specifically for
                development workflows.
              </p>

              <p>
                This documentation will guide you through all aspects of the
                platform, from getting started to advanced features and API
                integrations.
              </p>

              <h3>Key Features</h3>
              <ul>
                <li>
                  <strong>Project Management</strong> - Create and manage
                  development projects with customizable settings
                </li>
                <li>
                  <strong>Team Collaboration</strong> - Build teams, assign
                  roles, and manage permissions
                </li>
                <li>
                  <strong>Repository Integration</strong> - Connect with Git
                  repositories for seamless code management
                </li>
                <li>
                  <strong>Commit Tracking</strong> - Monitor development
                  progress with detailed commit history
                </li>
                <li>
                  <strong>Role-Based Access</strong> - Control who can view and
                  modify project resources
                </li>
              </ul>

              <h3>Getting Started</h3>
              <p>
                To begin using DevCollab, we recommend starting with our{" "}
                <a href="/documentation/quick-start">Quick Start Guide</a>,
                which will walk you through the basic setup and core
                functionality.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 my-8">
                <h4 className="text-blue-800 font-medium mb-2">Need Help?</h4>
                <p className="text-blue-700">
                  If you can't find what you're looking for in the
                  documentation, feel free to reach out to our support team at{" "}
                  <a
                    href="mailto:support@devcollab.com"
                    className="text-blue-600 underline"
                  >
                    support@devcollab.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
