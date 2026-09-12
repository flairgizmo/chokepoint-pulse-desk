import { writeFileSync } from "node:fs";
import { EPISODES } from "../src/data/podcast.ts";

writeFileSync(
  "/tmp/qntdesk-podcast.json",
  JSON.stringify(
    EPISODES.map((e) => ({
      n: e.n,
      slug: `ep-${String(e.n).padStart(2, "0")}`,
      title: e.title,
      script: e.script,
    })),
  ),
);
console.log("wrote", EPISODES.length);
