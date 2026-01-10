export function isPlatformAdmin(email?: string | null) {
  if (!email) return false;

  const needle = email.trim().toLowerCase();
  const allowed =
    process.env.PLATFORM_ADMIN_EMAILS?.split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean) || [];

  return allowed.includes(needle);
}
