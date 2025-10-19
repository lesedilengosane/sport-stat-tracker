"use client";

import { useEffect, useState } from "react";

export default function MatchStatistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/match-stats"); // 👈 our internal route
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const result = await response.json();
        setStats(result);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch match statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="text-center text-white mt-6 animate-pulse">Loading match statistics...</div>;

  if (error)
    return <div className="text-center text-red-400 mt-6">{error}</div>;

  if (!stats)
    return <div className="text-center text-gray-400 mt-6">No stats found.</div>;

  // Adjust depending on API response shape
  const { Statistics } = stats;
  const home = Statistics?.[0]?.Home;
  const away = Statistics?.[0]?.Away;

  return (
    <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-2xl p-6 mt-8 shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4 text-orange-400">
        ⚽ Live Match Statistics
      </h2>
      <div className="grid grid-cols-3 text-center gap-4">
        <div className="font-semibold text-orange-500">{home?.TeamName ?? "Home"}</div>
        <div className="text-gray-200">Stat</div>
        <div className="font-semibold text-orange-500">{away?.TeamName ?? "Away"}</div>

        {(home?.Stats || []).map((item: any, i: number) => (
          <div key={i} className="contents">
            <div className="text-white">{item.Value ?? "-"}</div>
            <div className="text-gray-300">{item.Type ?? "—"}</div>
            <div className="text-white">{away?.Stats?.[i]?.Value ?? "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
