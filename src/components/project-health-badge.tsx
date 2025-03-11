import { HealthScore, getHealthScoreColor } from "@/utils/project-health";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectHealthBadgeProps {
  healthScore: HealthScore;
  showDetails?: boolean;
}

export default function ProjectHealthBadge({
  healthScore,
  showDetails = false,
}: ProjectHealthBadgeProps) {
  const { score, status, suggestions } = healthScore;
  const colorClass = getHealthScoreColor(status);

  return (
    <div className="flex items-center">
      <div
        className={`px-3 py-1 rounded-full text-sm font-medium border ${colorClass} flex items-center gap-1`}
      >
        <span>{score}/100</span>
        <span className="mx-1">-</span>
        <span>{status}</span>
      </div>

      {suggestions.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-1">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc list-inside text-sm">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {showDetails && suggestions.length > 0 && (
        <div className="mt-4 bg-muted/50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Suggestions to improve:</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
