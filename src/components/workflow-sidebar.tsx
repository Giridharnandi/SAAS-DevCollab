"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutGrid,
  Table,
  BarChart4,
  Users,
  GitCommit,
  Link as LinkIcon,
  StickyNote,
  MessageSquare,
  Database,
  FileText,
  PanelLeft,
  PanelRight,
} from "lucide-react";

interface WorkflowSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onDragStart: (type: string, name: string) => void;
  members: any[];
  commits: any[];
}

export default function WorkflowSidebar({
  isCollapsed,
  toggleSidebar,
  onDragStart,
  members,
  commits,
}: WorkflowSidebarProps) {
  const [activeTab, setActiveTab] = useState<"elements" | "data" | "team">(
    "elements",
  );

  const handleDragStart = (e: React.DragEvent, type: string, name: string) => {
    e.dataTransfer.setData("type", type);
    e.dataTransfer.setData("name", name);
    onDragStart(type, name);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-muted/30 border-r flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mb-6"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "elements" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveTab("elements")}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Elements</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "data" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveTab("data")}
                >
                  <Database className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Data</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "team" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveTab("team")}
                >
                  <Users className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Team</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-muted/30 border-r flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Workflow Tools</h3>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex border-b">
        <Button
          variant={activeTab === "elements" ? "subtle" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("elements")}
        >
          Elements
        </Button>
        <Button
          variant={activeTab === "data" ? "subtle" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("data")}
        >
          Data
        </Button>
        <Button
          variant={activeTab === "team" ? "subtle" : "ghost"}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("team")}
        >
          Team
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "elements" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop elements onto the board
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Card
                className="cursor-move hover:border-primary/50 transition-colors"
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, "container", "Container")
                }
              >
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs">Container</span>
                </CardContent>
              </Card>

              <Card
                className="cursor-move hover:border-primary/50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, "table", "Table")}
              >
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <Table className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs">Table</span>
                </CardContent>
              </Card>

              <Card
                className="cursor-move hover:border-primary/50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, "chart", "Chart")}
              >
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <BarChart4 className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs">Chart</span>
                </CardContent>
              </Card>

              <Card
                className="cursor-move hover:border-primary/50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, "note", "Note")}
              >
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <StickyNote className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs">Note</span>
                </CardContent>
              </Card>

              <Card
                className="cursor-move hover:border-primary/50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, "comment", "Comment")}
              >
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs">Comment</span>
                </CardContent>
              </Card>

              <Card
                className="cursor-move hover:border-primary/50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, "link", "Link")}
              >
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <LinkIcon className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs">Link</span>
                </CardContent>
              </Card>

              <Card
                className="cursor-move hover:border-primary/50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, "file", "File")}
              >
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs">File</span>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Commits</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {commits.length > 0 ? (
                  commits.map((commit) => (
                    <Card
                      key={commit.id}
                      className="cursor-move hover:border-primary/50 transition-colors"
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, "commit", commit.message)
                      }
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GitCommit className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-medium truncate">
                              {commit.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {commit.status}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No commits available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-2">Team Members</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.length > 0 ? (
                members.map((member) => (
                  <Card
                    key={member.id}
                    className="cursor-move hover:border-primary/50 transition-colors"
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(
                        e,
                        "member",
                        member.users?.name || "Unknown User",
                      )
                    }
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {member.users?.profile_picture ? (
                            <img
                              src={member.users.profile_picture}
                              alt={member.users?.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              {member.users?.name
                                ?.substring(0, 2)
                                .toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium truncate">
                            {member.users?.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.users?.id === member.project_id
                              ? "Admin"
                              : "Member"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No team members available
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground">
          Drag elements onto the board and connect them to create your workflow.
        </p>
      </div>
    </div>
  );
}
