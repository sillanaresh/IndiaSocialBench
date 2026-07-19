import LeaderboardTable from "@/components/LeaderboardTable";
import { getLeaderboard } from "@/lib/data";

export default function Home() {
  const board = getLeaderboard();
  return (
    <div>
      <div style={{ marginTop: 44 }}>
        <h1>Does your model understand India?</h1>
        <p className="lede">
          BhavBench scores language models on the emotional and cultural intelligence of real Indian
          conversations — indirect refusals, family negotiations, honor and shame, grief etiquette,
          money between friends — across matched English, Hinglish, and Hindi variants of every
          scenario.
        </p>
      </div>

      {board.sample && (
        <div className="banner">
          <strong>Sample data.</strong> Every model below is a synthetic placeholder run through the
          real pipeline to demonstrate the benchmark. Live frontier-model results land here after the
          first funded run — no real model has been scored yet.
        </div>
      )}

      <LeaderboardTable board={board} />

      <p className="small faint">
        Dataset {`v${board.dataset_hash}`} · generated {board.generated_at.slice(0, 10)} · 18 base
        scenarios · 50 items · 2 judges per item ·{" "}
        <a href="/methodology/">how scoring works</a>
      </p>
    </div>
  );
}
