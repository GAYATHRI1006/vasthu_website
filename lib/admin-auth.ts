import type { Session, User } from "@supabase/supabase-js";
import { env } from "@/lib/env";

type AdminLikeUser = Pick<User, "email" | "app_metadata" | "user_metadata">;

function getConfiguredAdminEmails() {
  return new Set(
    (env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminUser(user: AdminLikeUser | null | undefined) {
  if (!user) {
    return false;
  }

  const email = user.email?.trim().toLowerCase();
  const appRole =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role.trim().toLowerCase()
      : "";
  const userRole =
    typeof user.user_metadata?.role === "string"
      ? user.user_metadata.role.trim().toLowerCase()
      : "";

  if (user.app_metadata?.is_admin === true || user.user_metadata?.is_admin === true) {
    return true;
  }

  if (appRole === "admin" || userRole === "admin") {
    return true;
  }

  if (!email) {
    return false;
  }

  return getConfiguredAdminEmails().has(email);
}

export function hasAdminAccess(session: Pick<Session, "user"> | null) {
  return isAdminUser(session?.user);
}
