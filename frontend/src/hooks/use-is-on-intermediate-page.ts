/**
 * List of all intermediate page paths.
 * Intermediate pages are shown after authentication but before the main app
 * (e.g., TOS acceptance, profile questions, org selection).
 *
 * Add new intermediate page paths here as needed.
 */
const INTERMEDIATE_PAGE_PATHS = ["/accept-tos", "/profile-questions"] as const;

/**
 * Hook to check if the current page is an intermediate page.
 * Intermediate pages bypass normal app behavior like auth checks, settings loading, etc.
 *
 * This hook is reusable for all intermediate pages. To add a new intermediate page,
 * simply add its path to the INTERMEDIATE_PAGE_PATHS array above.
 *
 * Note: This hook uses window.location.pathname directly to avoid Router context
 * dependency issues in tests.
 *
 * @returns {boolean} True if the current page is an intermediate page, false otherwise.
 */
export const useIsOnIntermediatePage = (): boolean => {
  // Use window.location.pathname directly to avoid Router context issues in tests
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  return INTERMEDIATE_PAGE_PATHS.includes(
    pathname as (typeof INTERMEDIATE_PAGE_PATHS)[number],
  );
};
