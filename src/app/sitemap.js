export const dynamic = "force-static";

const siteUrl = "https://lennard-langenbruch.github.io/wetterstation";

export default function sitemap() {
  const lastModified = new Date();
  return ["/", "/live/", "/hardware/"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === "/live/" ? "hourly" : "weekly",
    priority: path === "/" ? 1 : 0.7
  }));
}
