/**
 * Utility functions for subscription-related features
 */

/**
 * Get the maximum team size based on subscription plan
 * @param subscription The user's subscription plan name
 * @returns The maximum allowed team size
 */
export function getMaxTeamSize(subscription: string | null): number {
  switch (subscription) {
    case "Pro Plan":
      return 25;
    case "Professional Plan":
    case "Professional Annual Plan":
      return 50;
    case "Pro Dev Plan":
      return 5; // Pro Dev focuses on unlimited projects, not team size
    default:
      return 5; // Free plan
  }
}

/**
 * Get the maximum project count based on subscription plan
 * @param subscription The user's subscription plan name
 * @param userRole The user's role (project_creator or project_member)
 * @returns The maximum allowed project count or -1 for unlimited
 */
export function getMaxProjectCount(
  subscription: string | null,
  userRole: string,
): number {
  if (subscription === "Pro Dev Plan") {
    return -1; // Unlimited
  }

  if (userRole === "project_creator") {
    switch (subscription) {
      case "Pro Plan":
      case "Professional Plan":
      case "Professional Annual Plan":
        return -1; // Unlimited
      default:
        return 5; // Free plan
    }
  } else {
    // Project members
    return subscription ? -1 : 2; // Free plan: 2, Any paid plan: unlimited
  }
}

/**
 * Check if a subscription is active
 * @param status The subscription status
 * @param expiryDate The subscription expiry date
 * @returns Boolean indicating if subscription is active
 */
export function isSubscriptionActive(
  status: string | null,
  expiryDate: string | null,
): boolean {
  if (!status || !expiryDate) return false;
  if (status !== "active") return false;

  const now = new Date();
  const expiry = new Date(expiryDate);
  return now < expiry;
}
