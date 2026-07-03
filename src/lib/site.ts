export const SITE_NAME = "CampusAI Tools";
export const SITE_AUTHOR = "CampusAI Tools";
export const SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL ?? "https://campusai.tools").replace(
  /\/$/,
  "",
);
export const SITE_DEFAULT_DESCRIPTION =
  "Free browser-based tools for students and developers. No signup required. CGPA calculator, attendance tracker, resume ATS checker, and JSON formatter.";
export const SITE_OG_IMAGE_PATH = "/og-cover.svg";
export const SITE_OG_IMAGE_ALT =
  "CampusAI Tools preview banner with a dark gradient background and the text CampusAI Tools.";

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
