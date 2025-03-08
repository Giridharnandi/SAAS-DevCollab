"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  UserCircle,
  Home,
  Code,
  FolderKanban,
  Search,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            prefetch
            className="text-xl font-bold flex items-center"
          >
            <Code className="mr-2 h-6 w-6 text-blue-600" />
            <span>DevCollab</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1 ml-6">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/dashboard") && !isActive("/dashboard/projects") && !isActive("/dashboard/explore") && !isActive("/dashboard/messages") ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/dashboard/projects") ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Projects
            </Link>
            <Link
              href="/dashboard/explore"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/dashboard/explore") ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Explore
            </Link>
            <Link
              href="/dashboard/messages"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/dashboard/messages") ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Messages
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/dashboard/profile">
                <DropdownMenuItem>
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/projects">
                <DropdownMenuItem>
                  <FolderKanban className="h-4 w-4 mr-2" />
                  My Projects
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/explore">
                <DropdownMenuItem>
                  <Search className="h-4 w-4 mr-2" />
                  Explore
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/messages">
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
