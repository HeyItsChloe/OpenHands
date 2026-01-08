import { useQuery } from "@tanstack/react-query";
import { useConfig } from "#/hooks/query/use-config";
import {
  SAAS_NAV_ITEMS,
  OSS_NAV_ITEMS,
  SettingsNavItem,
} from "#/constants/settings-nav";
import { getSelectedOrganizationIdFromStore } from "#/stores/selected-organization-store";
import { OrganizationMember, OrganizationUserRole } from "#/types/org";
import { organizationService } from "#/api/organization-service/organization-service.api";

/**
 * Fetch active organization member.
 * - return cached data if present
 * - fetch from API if cache is empty or stale
 */
export function useActiveOrganizationMember(orgId?: string) {
  return useQuery<OrganizationMember>({
    queryKey: ["members", orgId, "me"],
    queryFn: () => {
      if (!orgId) {
        throw new Error("orgId required");
      }
      return organizationService.getMe({ orgId });
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Build Settings navigation items based on:
 * - app mode (saas / oss)
 * - feature flags
 * - active user's role
 * @returns Settings Nav Items
 */
export function useSettingsNavItems(): SettingsNavItem[] {
  const { data: config } = useConfig();

  const selectedOrgId = getSelectedOrganizationIdFromStore() ?? undefined;
  const { data: user } = useActiveOrganizationMember(selectedOrgId);
  const userRole: OrganizationUserRole = user?.role ?? "member";

  const shouldHideLlmSettings = !!config?.FEATURE_FLAGS?.HIDE_LLM_SETTINGS;
  const shouldHideBilling =
    !!config?.FEATURE_FLAGS?.HIDE_BILLING || userRole === "member";
  const isSaasMode = config?.APP_MODE === "saas";

  let items = isSaasMode ? SAAS_NAV_ITEMS : OSS_NAV_ITEMS;

  if (shouldHideLlmSettings) {
    items = items.filter((item) => item.to !== "/settings");
  }

  if (shouldHideBilling) {
    items = items.filter((item) => item.to !== "/settings/billing");
  }

  return items;
}
