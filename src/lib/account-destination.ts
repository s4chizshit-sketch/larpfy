/** Presentation only: the database remains authoritative for admin permissions. */
export function accountDestination(isAdmin: boolean, redirect?: "billing") {
  if (isAdmin) return "/admin" as const;
  return redirect === "billing" ? "/dashboard/billing" as const : "/dashboard" as const;
}