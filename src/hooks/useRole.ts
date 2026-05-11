import { useAuth, UserRole } from '@/context/AuthContext';

/**
 * Returns the current user's role type string (e.g. 'admin', 'manager', 'director')
 */
export function useRole(): string | null {
  const { user } = useAuth();
  return user?.role?.type ?? null;
}

/**
 * Returns true if current user has at least one of the allowed roles.
 * @param allowedRoles - list of role type strings to allow
 */
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const role = useRole();
  if (!role) return false;
  return allowedRoles.includes(role as UserRole);
}
