import { useMemo } from "react";
import { OrganizationUserRole } from "#/types/org";
import { rolePermissions, Permission } from "#/utils/org/permissions";

export const usePermission = (role: OrganizationUserRole) => {
  /* Memoize permissions for the role */
  const currentPermissions = useMemo<Permission[]>(
    () => rolePermissions[role] as Permission[],
    [role],
  );

  /* Check if the user has a specific permission */
  const hasPermission = (permission: Permission): boolean =>
    currentPermissions.includes(permission);

  return { hasPermission };
};
