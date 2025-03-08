import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  visibility: string;
  team_size: number;
  created_at: string;
  users: {
    name: string;
    email: string;
    profile_picture?: string;
  };
}

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden flex flex-col">
          <div className="h-40 bg-gradient-to-r from-blue-100 to-indigo-100 relative">
            {project.cover_image ? (
              <img
                src={project.cover_image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-500/30">
                  {project.title.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge
                variant={
                  project.visibility === "public" ? "default" : "secondary"
                }
              >
                {project.visibility === "public" ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" /> Public
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" /> Private
                  </>
                )}
              </Badge>
            </div>
          </div>

          <CardContent className="pt-6 flex-grow">
            <h3 className="text-xl font-semibold mb-2 line-clamp-1">
              {project.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {new Date(project.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="mx-2">•</span>
              <Users className="h-4 w-4 mr-1" />
              <span>{project.team_size} members</span>
            </div>
          </CardContent>

          <CardFooter className="border-t pt-4">
            <Link href={`/dashboard/projects/${project.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
