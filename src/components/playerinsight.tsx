
"use client";

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getPlayerPerformance } from "@/app/utils/apiClient";

interface PlayerStats {
  player_id: string;
  player_name: string;
  team_name: string;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  steals: number;
  fouls: number;
}

export default function PlayerInsightsPanel() {
  const [playerData, setPlayerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPlayerPerformance();
        console.log("📊 PlayerInsightsPanel fetched data:", data);
        setPlayerData(data);
      } catch (err: any) {
        console.error("Error fetching player performance:", err);
        setError("Failed to load player insights.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading insights...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!playerData || playerData.length === 0)
    return <p className="text-gray-400 text-center mt-6">No data available.</p>;

  // --- Derived Insights ---
  const topScorers = [...playerData].sort((a, b) => b.points - a.points).slice(0, 5);
  const mostEfficient = [...playerData]
    .map((p) => ({
      ...p,
      efficiency: (p.assists + p.rebounds + p.steals + p.blocks) / (p.fouls + 1),
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 5);

  return (
    <div className="p-6 bg-gray-100 rounded-xl shadow-lg space-y-8">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-800 border-b pb-3">Player Insights</h1>

      {/* Top Scorers */}
      <section>
        <h2 className="text-xl font-medium text-gray-700 mb-3">🏀 Top Scorers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topScorers.map((p, idx) => (
            <div
              key={p.player_id}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                  {idx + 1}. {p.player_name}
                </h3>
                <span className="text-indigo-600 font-bold">{p.points} pts</span>
              </div>
              <p className="text-sm text-gray-500">{p.team_name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Most Efficient */}
      <section>
        <h2 className="text-xl font-medium text-gray-700 mb-3">🔥 Most Efficient Players</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mostEfficient.map((p) => (
            <div
              key={p.player_id}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{p.player_name}</h3>
                <span className="text-green-600 font-bold">
                  {p.efficiency.toFixed(2)} ✨
                </span>
              </div>
              <p className="text-sm text-gray-500">{p.team_name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All Players Table */}
      <section>
        <h2 className="text-xl font-medium text-gray-700 mb-3">📋 All Players Overview</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-200 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-2 text-left">Player</th>
                <th className="px-4 py-2 text-left">Team</th>
                <th className="px-4 py-2">PTS</th>
                <th className="px-4 py-2">AST</th>
                <th className="px-4 py-2">REB</th>
                <th className="px-4 py-2">STL</th>
                <th className="px-4 py-2">BLK</th>
                <th className="px-4 py-2">FLS</th>
              </tr>
            </thead>
            <tbody>
              {playerData.map((p) => (
                <tr key={p.player_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{p.player_name}</td>
                  <td className="px-4 py-2">{p.team_name}</td>
                  <td className="px-4 py-2 text-center">{p.points}</td>
                  <td className="px-4 py-2 text-center">{p.assists}</td>
                  <td className="px-4 py-2 text-center">{p.rebounds}</td>
                  <td className="px-4 py-2 text-center">{p.steals}</td>
                  <td className="px-4 py-2 text-center">{p.blocks}</td>
                  <td className="px-4 py-2 text-center text-red-600">{p.fouls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}