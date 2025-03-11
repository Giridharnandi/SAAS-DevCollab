/**
 * Utility functions for calculating project health scores
 */

interface CommitData {
  count: number;
  frequency: number; // commits per week
  completedCount: number;
}

interface TestData {
  total: number;
  passed: number;
}

interface ActivityData {
  memberCount: number;
  activeMembers: number; // members active in last week
  joinRequests: number; // join requests in last month
}

export interface HealthScore {
  score: number;
  status: "Critical" | "At Risk" | "Moderate" | "Healthy" | "Excellent";
  suggestions: string[];
}

/**
 * Calculate project health score based on commit frequency, test results, and member activity
 * @param commits Commit data for the project
 * @param tests Test data for the project
 * @param activity Activity data for the project
 * @returns Health score object with score, status, and suggestions
 */
export function calculateHealthScore(
  commits: CommitData,
  tests: TestData,
  activity: ActivityData,
): HealthScore {
  // Calculate commit score (50% weight)
  const commitScore = calculateCommitScore(commits);

  // Calculate test score (30% weight)
  const testScore = calculateTestScore(tests);

  // Calculate activity score (20% weight)
  const activityScore = calculateActivityScore(activity);

  // Calculate weighted total score
  const totalScore = Math.round(
    commitScore * 0.5 + testScore * 0.3 + activityScore * 0.2,
  );

  // Determine status based on score
  const status = getStatusFromScore(totalScore);

  // Generate suggestions based on component scores
  const suggestions = generateSuggestions(
    commitScore,
    testScore,
    activityScore,
    commits,
    tests,
    activity,
  );

  return {
    score: totalScore,
    status,
    suggestions,
  };
}

/**
 * Calculate commit score based on frequency and completion rate
 */
function calculateCommitScore(commits: CommitData): number {
  if (commits.count === 0) return 0;

  // Score based on frequency (commits per week)
  const frequencyScore = Math.min(100, commits.frequency * 20); // 5 commits/week = 100%

  // Score based on completion rate
  const completionRate =
    commits.count > 0 ? (commits.completedCount / commits.count) * 100 : 0;

  // Weighted average (60% frequency, 40% completion)
  return Math.round(frequencyScore * 0.6 + completionRate * 0.4);
}

/**
 * Calculate test score based on pass rate
 */
function calculateTestScore(tests: TestData): number {
  if (tests.total === 0) return 0;
  return Math.round((tests.passed / tests.total) * 100);
}

/**
 * Calculate activity score based on active members and join requests
 */
function calculateActivityScore(activity: ActivityData): number {
  if (activity.memberCount === 0) return 0;

  // Score based on active members percentage
  const activeMemberScore =
    (activity.activeMembers / activity.memberCount) * 100;

  // Score based on join requests (more is better, up to a point)
  const joinRequestScore = Math.min(100, activity.joinRequests * 25); // 4 requests = 100%

  // Weighted average (70% active members, 30% join requests)
  return Math.round(activeMemberScore * 0.7 + joinRequestScore * 0.3);
}

/**
 * Determine status label based on score
 */
function getStatusFromScore(
  score: number,
): "Critical" | "At Risk" | "Moderate" | "Healthy" | "Excellent" {
  if (score < 30) return "Critical";
  if (score < 50) return "At Risk";
  if (score < 70) return "Moderate";
  if (score < 90) return "Healthy";
  return "Excellent";
}

/**
 * Generate improvement suggestions based on component scores
 */
function generateSuggestions(
  commitScore: number,
  testScore: number,
  activityScore: number,
  commits: CommitData,
  tests: TestData,
  activity: ActivityData,
): string[] {
  const suggestions: string[] = [];

  // Commit-related suggestions
  if (commitScore < 50) {
    if (commits.frequency < 3) {
      suggestions.push(
        "Increase commit frequency to at least 3 times per week",
      );
    }
    if (commits.count > 0 && commits.completedCount / commits.count < 0.5) {
      suggestions.push("Complete more pending commits");
    }
  }

  // Test-related suggestions
  if (testScore < 60) {
    if (tests.total === 0) {
      suggestions.push("Add tests to your project");
    } else if (tests.passed / tests.total < 0.7) {
      suggestions.push("Fix failing tests to improve test pass rate");
    }
  }

  // Activity-related suggestions
  if (activityScore < 60) {
    if (
      activity.memberCount > 0 &&
      activity.activeMembers / activity.memberCount < 0.5
    ) {
      suggestions.push("Encourage more team members to actively participate");
    }
    if (activity.joinRequests === 0) {
      suggestions.push("Promote your project to attract more join requests");
    }
  }

  return suggestions;
}

/**
 * Get color for health score badge
 */
export function getHealthScoreColor(status: string): string {
  switch (status) {
    case "Critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "At Risk":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Moderate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Healthy":
      return "bg-green-100 text-green-800 border-green-200";
    case "Excellent":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
