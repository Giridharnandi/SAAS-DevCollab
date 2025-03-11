"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";

interface DocItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: DocItem[];
}

interface DocumentationSidebarProps {
  items: DocItem[];
  className?: string;
}

export default function DocumentationSidebar({
  items,
  className,
}: DocumentationSidebarProps) {
  return (
    <div className={cn("w-64 pr-4 flex-shrink-0", className)}>
      <nav className="space-y-1">
        {items.map((item, i) => (
          <SidebarItem key={i} item={item} level={0} />
        ))}
      </nav>
    </div>
  );
}

interface SidebarItemProps {
  item: DocItem;
  level: number;
}

function SidebarItem({ item, level }: SidebarItemProps) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
          item.href
            ? "hover:bg-gray-100 cursor-pointer"
            : "font-medium text-gray-900",
          level > 0 && "ml-4",
        )}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
          )
        ) : item.icon ? (
          <span className="mr-2">{item.icon}</span>
        ) : (
          <FileText className="h-4 w-4 mr-2 text-gray-500" />
        )}

        {item.href ? (
          <Link
            href={item.href}
            className="flex-1 text-gray-700 hover:text-gray-900"
          >
            {item.title}
          </Link>
        ) : (
          <span className="flex-1">{item.title}</span>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="mt-1">
          {item.children!.map((child, i) => (
            <SidebarItem key={i} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
