"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import {
  Save,
  Trash2,
  Edit,
  Plus,
  X,
  Link as LinkIcon,
  GitCommit,
  UserCircle,
  StickyNote,
  MessageSquare,
  FileText,
  BarChart4,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";

interface WorkflowBoardProps {
  projectId: string;
  isAdmin: boolean;
  members: any[];
  commits: any[];
  initialWorkflow?: any;
}

interface WorkflowItem {
  id: string;
  type: string;
  name: string;
  content: any;
  position: { x: number; y: number };
  connections: string[];
}

export default function WorkflowBoard({
  projectId,
  isAdmin,
  members,
  commits,
  initialWorkflow,
}: WorkflowBoardProps) {
  const router = useRouter();
  const supabase = createClient();
  const boardRef = useRef<HTMLDivElement>(null);
  const [workflow, setWorkflow] = useState<WorkflowItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    type: string;
    name: string;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<any>({});
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "table">(
    isAdmin ? "board" : "table",
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for drawing connections
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Load initial workflow data
  useEffect(() => {
    if (initialWorkflow) {
      try {
        const parsedWorkflow =
          typeof initialWorkflow === "string"
            ? JSON.parse(initialWorkflow)
            : initialWorkflow;

        if (Array.isArray(parsedWorkflow)) {
          setWorkflow(parsedWorkflow);
        }
      } catch (error) {
        console.error("Error parsing workflow data:", error);
      }
    }
  }, [initialWorkflow]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!boardRef.current || !draggedItem) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - boardRect.left;
    const y = e.clientY - boardRect.top;

    // Create new workflow item
    const newItem: WorkflowItem = {
      id: `item-${Date.now()}`,
      type: draggedItem.type,
      name: draggedItem.name,
      content: getDefaultContent(draggedItem.type, draggedItem.name),
      position: { x, y },
      connections: [],
    };

    setWorkflow([...workflow, newItem]);
    setDraggedItem(null);
    setIsDragging(false);
  };

  const getDefaultContent = (type: string, name: string) => {
    switch (type) {
      case "container":
        return { title: "Container", items: [] };
      case "table":
        return { headers: ["Task", "Assignee", "Status"], rows: [] };
      case "chart":
        return { type: "bar", title: "Chart", data: [] };
      case "note":
        return { text: "Add your notes here..." };
      case "comment":
        return { text: "Add your comment here..." };
      case "link":
        return { url: "", title: "Link Title" };
      case "commit":
        return { message: name, status: "pending" };
      case "member":
        return { name: name, role: "Member" };
      case "file":
        return { name: "Document.pdf", url: "" };
      default:
        return {};
    }
  };

  const handleItemDragStart = (e: React.DragEvent, id: string) => {
    if (!isAdmin) return;
    e.dataTransfer.setData("itemId", id);
    setIsDragging(true);
  };

  const handleItemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const itemId = e.dataTransfer.getData("itemId");
    if (!itemId || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - boardRect.left;
    const y = e.clientY - boardRect.top;

    setWorkflow(
      workflow.map((item) =>
        item.id === itemId ? { ...item, position: { x, y } } : item,
      ),
    );

    setIsDragging(false);
  };

  const handleItemClick = (id: string) => {
    if (isDrawingConnection) {
      if (!connectionStart) {
        setConnectionStart(id);
      } else if (id !== connectionStart) {
        setConnectionEnd(id);
        // Create connection
        setWorkflow(
          workflow.map((item) =>
            item.id === connectionStart
              ? {
                  ...item,
                  connections: [...item.connections, id],
                }
              : item,
          ),
        );
        setIsDrawingConnection(false);
        setConnectionStart(null);
        setConnectionEnd(null);
      }
    } else {
      setSelectedItem(id);
    }
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    const item = workflow.find((item) => item.id === selectedItem);
    if (item) {
      setEditContent(item.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (!selectedItem) return;
    setWorkflow(
      workflow.map((item) =>
        item.id === selectedItem ? { ...item, content: editContent } : item,
      ),
    );
    setIsEditing(false);
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    // Remove connections to this item
    const updatedWorkflow = workflow
      .filter((item) => item.id !== selectedItem)
      .map((item) => ({
        ...item,
        connections: item.connections.filter((id) => id !== selectedItem),
      }));
    setWorkflow(updatedWorkflow);
    setSelectedItem(null);
  };

  const handleSaveWorkflow = async () => {
    if (!isAdmin) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          workflow_data: JSON.stringify(workflow),
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;
      alert("Workflow saved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("Failed to save workflow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderItemContent = (item: WorkflowItem) => {
    switch (item.type) {
      case "container":
        return (
          <div className="p-2 min-h-[100px] min-w-[150px] border-2 border-dashed border-gray-300 rounded-md">
            <h3 className="text-sm font-medium mb-2">{item.content.title}</h3>
          </div>
        );
      case "table":
        return (
          <div className="overflow-x-auto max-w-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {item.content.headers.map((header: string, index: number) => (
                    <TableHead key={index} className="text-xs">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.content.rows.map((row: string[], rowIndex: number) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell: string, cellIndex: number) => (
                      <TableCell key={cellIndex} className="text-xs">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case "chart":
        return (
          <div className="p-2 min-h-[100px] min-w-[150px] flex items-center justify-center">
            <BarChart4 className="h-8 w-8 text-muted-foreground" />
            <span className="ml-2 text-sm">{item.content.title}</span>
          </div>
        );
      case "note":
        return (
          <div className="p-2 min-h-[80px] min-w-[150px] bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs">{item.content.text}</p>
          </div>
        );
      case "comment":
        return (
          <div className="p-2 min-h-[60px] min-w-[150px] bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs">{item.content.text}</p>
          </div>
        );
      case "link":
        return (
          <div className="p-2 flex items-center">
            <LinkIcon className="h-4 w-4 text-blue-500 mr-2" />
            <a
              href={item.content.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 underline"
            >
              {item.content.title}
            </a>
          </div>
        );
      case "commit":
        return (
          <div className="p-2 flex items-center bg-gray-50 border border-gray-200 rounded-md">
            <GitCommit className="h-4 w-4 text-gray-500 mr-2" />
            <div>
              <p className="text-xs font-medium">{item.content.message}</p>
              <p className="text-xs text-muted-foreground">
                {item.content.status}
              </p>
            </div>
          </div>
        );
      case "member":
        return (
          <div className="p-2 flex items-center bg-indigo-50 border border-indigo-200 rounded-md">
            <UserCircle className="h-4 w-4 text-indigo-500 mr-2" />
            <div>
              <p className="text-xs font-medium">{item.content.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.content.role}
              </p>
            </div>
          </div>
        );
      case "file":
        return (
          <div className="p-2 flex items-center bg-green-50 border border-green-200 rounded-md">
            <FileText className="h-4 w-4 text-green-500 mr-2" />
            <p className="text-xs">{item.content.name}</p>
          </div>
        );
      default:
        return <div className="p-2">Unknown item type</div>;
    }
  };

  const renderEditForm = () => {
    if (!selectedItem) return null;
    const item = workflow.find((item) => item.id === selectedItem);
    if (!item) return null;

    switch (item.type) {
      case "container":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editContent.title || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, title: e.target.value })
                }
              />
            </div>
          </div>
        );
      case "table":
        return (
          <div className="space-y-4">
            <div>
              <Label>Headers</Label>
              <div className="flex gap-2 mb-2">
                {editContent.headers?.map((header: string, index: number) => (
                  <div key={index} className="flex-1">
                    <Input
                      value={header}
                      onChange={(e) => {
                        const newHeaders = [...editContent.headers];
                        newHeaders[index] = e.target.value;
                        setEditContent({ ...editContent, headers: newHeaders });
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditContent({
                      ...editContent,
                      headers: [...(editContent.headers || []), ""],
                    });
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Rows</Label>
              {editContent.rows?.map((row: string[], rowIndex: number) => (
                <div key={rowIndex} className="flex gap-2 mb-2">
                  {row.map((cell: string, cellIndex: number) => (
                    <div key={cellIndex} className="flex-1">
                      <Input
                        value={cell}
                        onChange={(e) => {
                          const newRows = [...editContent.rows];
                          newRows[rowIndex][cellIndex] = e.target.value;
                          setEditContent({ ...editContent, rows: newRows });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newRows = [...editContent.rows];
                      newRows.splice(rowIndex, 1);
                      setEditContent({ ...editContent, rows: newRows });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  const newRow = Array(editContent.headers?.length || 0).fill(
                    "",
                  );
                  setEditContent({
                    ...editContent,
                    rows: [...(editContent.rows || []), newRow],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>
            </div>
          </div>
        );
      case "chart":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="chartTitle">Chart Title</Label>
              <Input
                id="chartTitle"
                value={editContent.title || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="chartType">Chart Type</Label>
              <Select
                value={editContent.type || "bar"}
                onValueChange={(value) =>
                  setEditContent({ ...editContent, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "note":
      case "comment":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text</Label>
              <Textarea
                id="text"
                value={editContent.text || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, text: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
        );
      case "link":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkTitle">Link Title</Label>
              <Input
                id="linkTitle"
                value={editContent.title || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                value={editContent.url || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
          </div>
        );
      case "commit":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="commitMessage">Commit Message</Label>
              <Input
                id="commitMessage"
                value={editContent.message || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, message: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="commitStatus">Status</Label>
              <Select
                value={editContent.status || "pending"}
                onValueChange={(value) =>
                  setEditContent({ ...editContent, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "member":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="memberName">Name</Label>
              <Input
                id="memberName"
                value={editContent.name || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="memberRole">Role</Label>
              <Input
                id="memberRole"
                value={editContent.role || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, role: e.target.value })
                }
              />
            </div>
          </div>
        );
      case "file":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={editContent.name || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="fileUrl">File URL</Label>
              <Input
                id="fileUrl"
                value={editContent.url || ""}
                onChange={(e) =>
                  setEditContent({ ...editContent, url: e.target.value })
                }
                placeholder="https://example.com/file.pdf"
              />
            </div>
          </div>
        );
      default:
        return <div>No editable properties</div>;
    }
  };

  const renderTableView = () => {
    // Group items by type
    const groupedItems: Record<string, WorkflowItem[]> = {};
    workflow.forEach((item) => {
      if (!groupedItems[item.type]) {
        groupedItems[item.type] = [];
      }
      groupedItems[item.type].push(item);
    });

    // If user is not admin, show a more structured table view
    if (!isAdmin) {
      return (
        <div className="space-y-8">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-2">Project Workflow</h3>
            <p className="text-sm text-blue-700">
              This is a visualization of the project workflow created by the
              project admin. You can see all workflow items and their
              connections in a structured format.
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Connected To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflow.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium capitalize">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span>{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{renderTableItemDetails(item)}</TableCell>
                    <TableCell>
                      {item.connections.length > 0 ? (
                        <ul className="list-disc list-inside text-sm">
                          {item.connections.map((connId) => {
                            const connectedItem = workflow.find(
                              (i) => i.id === connId,
                            );
                            return (
                              <li key={connId}>
                                {connectedItem
                                  ? `${connectedItem.type}: ${connectedItem.name}`
                                  : "Unknown item"}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No connections
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {Object.entries(groupedItems).map(([type, items]) => (
          <div key={type} className="space-y-4">
            <h3 className="text-lg font-medium capitalize flex items-center">
              {getTypeIcon(type)}
              <span className="ml-2">{type}s</span>
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Connections</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{renderTableItemDetails(item)}</TableCell>
                      <TableCell>
                        {item.connections.length > 0 ? (
                          <ul className="list-disc list-inside text-sm">
                            {item.connections.map((connId) => {
                              const connectedItem = workflow.find(
                                (i) => i.id === connId,
                              );
                              return (
                                <li key={connId}>
                                  {connectedItem
                                    ? `${connectedItem.type}: ${connectedItem.name}`
                                    : "Unknown item"}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No connections
                          </span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item.id);
                              handleEditItem();
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item.id);
                              handleDeleteItem();
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTableItemDetails = (item: WorkflowItem) => {
    switch (item.type) {
      case "container":
        return <span>{item.content.title}</span>;
      case "table":
        return (
          <span>
            {item.content.headers?.length || 0} columns,{" "}
            {item.content.rows?.length || 0} rows
          </span>
        );
      case "chart":
        return (
          <span>
            {item.content.title} ({item.content.type} chart)
          </span>
        );
      case "note":
      case "comment":
        return (
          <span className="truncate max-w-xs block">
            {item.content.text?.substring(0, 50)}
            {item.content.text?.length > 50 ? "..." : ""}
          </span>
        );
      case "link":
        return (
          <a
            href={item.content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center"
          >
            {item.content.title}
            <LinkIcon className="h-3 w-3 ml-1" />
          </a>
        );
      case "commit":
        return (
          <div className="flex items-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${item.content.status === "completed" ? "bg-green-500" : item.content.status === "in_progress" ? "bg-amber-500" : "bg-gray-500"}`}
            ></span>
            <span>{item.content.status}</span>
          </div>
        );
      case "member":
        return <span>{item.content.role}</span>;
      case "file":
        return (
          <span className="flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            {item.content.name}
          </span>
        );
      default:
        return <span>No details</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "container":
        return <LayoutGrid className="h-5 w-5 text-gray-500" />;
      case "table":
        return <TableIcon className="h-5 w-5 text-blue-500" />;
      case "chart":
        return <BarChart4 className="h-5 w-5 text-purple-500" />;
      case "note":
        return <StickyNote className="h-5 w-5 text-yellow-500" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "link":
        return <LinkIcon className="h-5 w-5 text-indigo-500" />;
      case "commit":
        return <GitCommit className="h-5 w-5 text-gray-500" />;
      case "member":
        return <UserCircle className="h-5 w-5 text-green-500" />;
      case "file":
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const Label = ({
    htmlFor,
    children,
  }: {
    htmlFor?: string;
    children: React.ReactNode;
  }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
      {children}
    </label>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium">Team Workflow</h2>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "board" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("board")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Board
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant={isDrawingConnection ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setIsDrawingConnection(!isDrawingConnection);
                setConnectionStart(null);
              }}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              {isDrawingConnection ? "Cancel Connection" : "Connect Items"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveWorkflow}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Workflow"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {viewMode === "board" && isAdmin ? (
          <div
            ref={boardRef}
            className="relative h-full min-h-[600px] bg-muted/20"
            onDragOver={handleDragOver}
            onDrop={handleItemDrop}
          >
            {/* Draw connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {workflow.map((item) =>
                item.connections.map((targetId) => {
                  const target = workflow.find((i) => i.id === targetId);
                  if (!target) return null;

                  // Calculate connection points
                  const startX = item.position.x + 75; // Assuming item width is 150px
                  const startY = item.position.y + 50; // Assuming item height is 100px
                  const endX = target.position.x + 75;
                  const endY = target.position.y + 50;

                  return (
                    <path
                      key={`${item.id}-${targetId}`}
                      d={`M${startX},${startY} C${(startX + endX) / 2},${startY} ${(startX + endX) / 2},${endY} ${endX},${endY}`}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={isDrawingConnection ? "5,5" : "none"}
                    />
                  );
                }),
              )}
              {/* Drawing connection in progress */}
              {isDrawingConnection && connectionStart && (
                <path
                  d={`M${workflow.find((i) => i.id === connectionStart)?.position.x + 75},${workflow.find((i) => i.id === connectionStart)?.position.y + 50} L${mousePosition.x},${mousePosition.y}`}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
              )}
            </svg>

            {/* Render workflow items */}
            {workflow.map((item) => (
              <div
                key={item.id}
                className={`absolute cursor-move ${isAdmin ? "cursor-move" : "cursor-pointer"} ${selectedItem === item.id ? "ring-2 ring-blue-500" : ""} ${isDrawingConnection && connectionStart === item.id ? "ring-2 ring-green-500" : ""}`}
                style={{
                  left: `${item.position.x}px`,
                  top: `${item.position.y}px`,
                  minWidth: "150px",
                }}
                draggable={isAdmin}
                onDragStart={(e) => handleItemDragStart(e, item.id)}
                onClick={() => handleItemClick(item.id)}
              >
                {renderItemContent(item)}
              </div>
            ))}

            {/* Drop area message */}
            {workflow.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                {isAdmin
                  ? "Drag and drop items from the sidebar to start building your workflow"
                  : "No workflow items have been added yet"}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            {workflow.length > 0 ? (
              renderTableView()
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  {isAdmin
                    ? "No workflow items have been added yet"
                    : "The project creator hasn't created a workflow yet"}
                </h3>
                <p className="text-muted-foreground">
                  {isAdmin
                    ? "Drag and drop items from the sidebar to start building your workflow"
                    : "Check back later to see the project workflow"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit{" "}
              {selectedItem &&
                workflow.find((i) => i.id === selectedItem)?.type}
            </DialogTitle>
            <DialogDescription>
              Modify the properties of this workflow item.
            </DialogDescription>
          </DialogHeader>
          {renderEditForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item actions */}
      {selectedItem && isAdmin && viewMode === "board" && (
        <div className="absolute bottom-4 right-4 bg-white shadow-lg rounded-lg p-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEditItem}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDeleteItem}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
