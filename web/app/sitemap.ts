import type { MetadataRoute } from "next";
import { getLeaderboard } from "@/lib/data";

const BASE_URL = "https://www.indiasocialbench.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const board = getLeaderboard();
  const lastModified = new Date(board.generated_at);
  const staticPages = ["", "/scenarios", "/methodology", "/about"];
  const modelPages = board.models.map((model) => "/model/" + model.slug);
  const transcriptPages = board.models.flatMap((model) =>
    model.items.map((item) => "/transcript/" + item.item_id + "/" + model.slug),
  );

  return [...staticPages, ...modelPages, ...transcriptPages].map((path) => ({
    url: BASE_URL + path,
    lastModified,
  }));
}
