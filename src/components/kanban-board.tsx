"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Edit, CheckCircle, XCircle, UserPlus } from "lucide-react";

interface Member {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: string;
  users?: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
    user_role: string;
  } | null;
}

interface Commit {
  id: string;
  project_id: string;
  message: string;
  assigned_to: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  users?: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  } | null;
}

interface Role {
  id: string;
  project_id: string;
  name: string;
  description: string;
  created_at: string;
}

interface KanbanBoardProps {
  projectId: string;
  members: Member[];
  commits: Commit[];
  roles: Role[];
  isAdmin: boolean;
}

const DEFAULT_STATUSES = ["Backlog", "To Do", "In Progress", "Review", "Done"];

export default function KanbanBoard({
  projectId,
  members,
  commits,
  roles: initialRoles,
  isAdmin,
}: KanbanBoardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [tasks, setTasks] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [statuses, setStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    status: "Backlog",
    role: "",
  });
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize tasks from commits and update statuses based on roles
  useEffect(() => {
    const initialTasks = commits.map((commit) => ({
      id: commit.id,
      title: commit.message,
      description: "",
      assignee: commit.assigned_to || "",
      status: commit.status === "completed" ? "Done" : "To Do",
      role: "",
      created_at: commit.created_at,
      completed_at: commit.completed_at,
    }));
    setTasks(initialTasks);

    // Update statuses to include role-based columns
    updateStatusesWithRoles(initialRoles);
  }, [commits]);

  // Update statuses when roles change
  useEffect(() => {
    updateStatusesWithRoles(roles);
  }, [roles]);

  // Function to update statuses based on roles
  const updateStatusesWithRoles = (currentRoles: Role[]) => {
    const roleNames = currentRoles.map((role) => role.name);
    setStatuses([...DEFAULT_STATUSES, ...roleNames]);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");

    // Update task status locally
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, status };
      }
      return task;
    });
    setTasks(updatedTasks);

    // Update commit status in database
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      try {
        // Check if the status is a role name or a default status
        const isRoleName = !DEFAULT_STATUSES.includes(status);
        const dbStatus = status === "Done" ? "completed" : "pending";
        const completedAt = status === "Done" ? new Date().toISOString() : null;

        // If it's a role name, we'll store it in a custom field
        if (isRoleName) {
          // Find the role ID that matches the status name
          const roleId = roles.find((r) => r.name === status)?.id || "";

          await supabase
            .from("commits")
            .update({
              status: dbStatus,
              completed_at: completedAt,
              role: roleId, // Store the role ID
            })
            .eq("id", taskId);
        } else {
          await supabase
            .from("commits")
            .update({
              status: dbStatus,
              completed_at: completedAt,
              // Clear role if moving back to a default status
              role: null,
            })
            .eq("id", taskId);
        }

        // Refresh the page to show updated data
        router.refresh();
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    setIsLoading(true);

    try {
      // Add new commit to database
      const { data, error } = await supabase
        .from("commits")
        .insert({
          project_id: projectId,
          message: newTask.title,
          assigned_to: newTask.assignee || null,
          status: newTask.status === "Done" ? "completed" : "pending",
          created_at: new Date().toISOString(),
          completed_at:
            newTask.status === "Done" ? new Date().toISOString() : null,
        })
        .select();

      if (error) throw error;

      // Add new task to local state
      if (data && data[0]) {
        setTasks([
          ...tasks,
          {
            id: data[0].id,
            title: newTask.title,
            description: newTask.description,
            assignee: newTask.assignee,
            status: newTask.status,
            role: newTask.role,
            created_at: data[0].created_at,
            completed_at: data[0].completed_at,
          },
        ]);
      }

      // Reset form
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        status: "Backlog",
        role: "",
      });
      setIsAddingTask(false);
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name) return;
    setIsLoading(true);

    try {
      // Add new role to database
      const { data, error } = await supabase
        .from("project_roles")
        .insert({
          project_id: projectId,
          name: newRole.name,
          description: newRole.description,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      // Add new role to local state
      if (data && data[0]) {
        const updatedRoles = [...roles, data[0]];
        setRoles(updatedRoles);

        // Update statuses to include the new role
        updateStatusesWithRoles(updatedRoles);
      }

      // Reset form
      setNewRole({
        name: "",
        description: "",
      });
      setIsAddingRole(false);
    } catch (error) {
      console.error("Error adding role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMemberName = (userId: string) => {
    const member = members.find((m) => m.users?.id === userId);
    return member?.users?.name || "Unassigned";
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.name || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <h2 className="text-xl font-semibold">Team Workflow</h2>
          <Badge variant="outline" className="ml-2">
            {tasks.length} Tasks
          </Badge>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Dialog open={isAddingRole} onOpenChange={setIsAddingRole}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Role</DialogTitle>
                  <DialogDescription>
                    Create a new role for your team members
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      placeholder="e.g. Frontend Developer"
                      value={newRole.name}
                      onChange={(e) =>
                        setNewRole({ ...newRole, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Textarea
                      id="role-description"
                      placeholder="Describe the responsibilities of this role"
                      value={newRole.description}
                      onChange={(e) =>
                        setNewRole({ ...newRole, description: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingRole(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddRole} disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Role"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task and assign it to a team member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    placeholder="e.g. Implement login page"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Describe the task"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-assignee">Assignee</Label>
                  <Select
                    value={newTask.assignee}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, assignee: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem
                          key={member.users?.id || member.id}
                          value={member.users?.id || ""}
                        >
                          {member.users?.name || "Unknown User"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-status">Status</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {roles.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="task-role">Role</Label>
                    <Select
                      value={newTask.role}
                      onValueChange={(value) =>
                        setNewTask({ ...newTask, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingTask(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddTask} disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div
        className="grid grid-cols-auto-fill gap-4"
        style={{
          gridTemplateColumns: `repeat(${statuses.length}, minmax(200px, 1fr))`,
        }}
      >
        {statuses.map((status) => (
          <div key={status} className="space-y-4">
            <div
              className={`rounded-md p-3 ${DEFAULT_STATUSES.includes(status) ? "bg-muted" : "bg-blue-50"}`}
            >
              <h3 className="font-medium text-sm">{status}</h3>
              <div className="text-xs text-muted-foreground">
                {tasks.filter((task) => task.status === status).length} tasks
              </div>
            </div>
            <div
              className="min-h-[500px] bg-muted/30 rounded-md p-2 space-y-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {getMemberName(task.assignee)}
                        </Badge>
                        {task.role && (
                          <Badge variant="secondary" className="text-xs">
                            {getRoleName(task.role)}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {roles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Team Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="text-md">{role.name}</CardTitle>
                  {role.description && (
                    <CardDescription>{role.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Members: </span>
                    {
                      members.filter((m) => m.users?.user_role === role.name)
                        .length
                    }
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
