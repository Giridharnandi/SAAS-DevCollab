"use client";

import { useState } from "react";
import WorkflowSidebar from "@/components/workflow-sidebar";

export function WorkflowSidebarWrapper({
  isAdmin,
  members,
  commits,
}: {
  isAdmin: boolean;
  members: any[];
  commits: any[];
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    type: string;
    name: string;
  } | null>(null);

  const handleDragStart = (type: string, name: string) => {
    setDraggedItem({ type, name });
  };

  // Only show sidebar for admins
  if (!isAdmin) return null;

  return (
    <WorkflowSidebar
      isCollapsed={isCollapsed}
      toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      onDragStart={handleDragStart}
      members={members}
      commits={commits}
    />
  );
}
