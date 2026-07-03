import { absoluteUrl, SITE_NAME, SITE_OG_IMAGE_ALT, SITE_OG_IMAGE_PATH } from "./site";

type MetaEntry =
  { title: string } | { name: string; content: string } | { property: string; content: string };
type LinkEntry = { rel: string; href: string };
type ScriptEntry = { type: "application/ld+json"; children: string };

type BuildPageHeadOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  ogType?: "article" | "website";
  noIndex?: boolean;
  imagePath?: string;
  scripts?: ScriptEntry[];
};

export function buildPageHead({
  title,
  description,
  path,
  keywords,
  ogType = "website",
  noIndex = false,
  imagePath = SITE_OG_IMAGE_PATH,
  scripts = [],
}: BuildPageHeadOptions) {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = absoluteUrl(imagePath);

  const meta: MetaEntry[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: canonicalUrl },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:image", content: imageUrl },
    { property: "og:image:alt", content: SITE_OG_IMAGE_ALT },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  if (keywords) {
    meta.push({ name: "keywords", content: keywords });
  }

  if (noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  return {
    meta,
    links: [{ rel: "canonical", href: canonicalUrl }] satisfies LinkEntry[],
    scripts,
  };
}

export function jsonLdScript(data: object): ScriptEntry {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}
