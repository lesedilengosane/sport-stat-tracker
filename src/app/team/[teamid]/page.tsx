"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PlayersStats } from "@/types/player";

interface Team {
  team_id?: string;
  name: string;
  coach: string;
  icon_url?: string | null;
}

interface Match {
  match_id: string;
  home_team: { team_name: string; team_id: string };
  away_team: { team_name: string; team_id: string };
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  completed: boolean;
}

export default function TeamPage() {
  const params = useParams();
  const TEAM_ID = params?.teamid as string; // ✅ correct param name for [teamid]
  
  const [players, setPlayers] = useState<PlayersStats[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [team, setTeam] = useState<Team>({
    name: "Loading...",
    coach: "Loading...",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"roster" | "schedule" | "stats">("roster");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!TEAM_ID) {
          console.error("❌ TEAM_ID is undefined");
          setError("Invalid team ID.");
          return;
        }

        console.log("✅ Fetching data for TEAM_ID:", TEAM_ID);

        const [resPlayers, resTeam] = await Promise.all([
          fetch("/api/pl"),
          fetch("/api/all"),
        ]);

        if (!resPlayers.ok) throw new Error("Failed to fetch players");
        if (!resTeam.ok) throw new Error("Failed to fetch teams and matches");

        const playersData: PlayersStats[] = await resPlayers.json();
        const { coaches, matches } = await resTeam.json();

        const teamPlayers = playersData.filter((p) => p.team_id === TEAM_ID);

        const teamCoach = coaches.find(
          (c: any) => c.teams?.team_id === TEAM_ID
        );

        const teamInfo: Team = {
          team_id: TEAM_ID,
          name: teamCoach?.teams?.team_name || "Unknown Team",
          coach: teamCoach
            ? `${teamCoach.users.first_name} ${teamCoach.users.last_name}`
            : "No Coach",
          icon_url: teamCoach?.teams?.icon_url || null,
        };

        const teamMatches = matches.filter(
          (m: Match) =>
            m.home_team?.team_id === TEAM_ID || m.away_team?.team_id === TEAM_ID
        );

        setPlayers(teamPlayers);
        setTeam(teamInfo);
        setMatches(teamMatches);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [TEAM_ID]);

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-400">{error}</p>;

  // --- Handle no players found ---
  if (players.length === 0)
    return (
      <p className="text-center mt-10 text-white">
        No players found for this team.
      </p>
    );

  // --- Aggregate stats ---
  const totalPoints = players.reduce((sum, p) => sum + p.points, 0);
  const totalAssists = players.reduce((sum, p) => sum + p.assists, 0);
  const totalRebounds = players.reduce((sum, p) => sum + p.rebounds, 0);
  const totalBlocks = players.reduce((sum, p) => sum + p.blocks, 0);
  const totalSteals = players.reduce((sum, p) => sum + p.steals, 0);

  const wins = matches.filter(
    (m) =>
      (m.home_team.team_name === team.name &&
        (m.home_score ?? 0) > (m.away_score ?? 0)) ||
      (m.away_team.team_name === team.name &&
        (m.away_score ?? 0) > (m.home_score ?? 0))
  ).length;

  const losses = matches.filter(
    (m) =>
      (m.home_team.team_name === team.name &&
        (m.home_score ?? 0) < (m.away_score ?? 0)) ||
      (m.away_team.team_name === team.name &&
        (m.away_score ?? 0) < (m.home_score ?? 0))
  ).length;

  // --- Main render ---
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HEADER */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center gap-6">
          {team.icon_url && (
            <img
              src={team.icon_url}
              alt={team.name}
              className="w-24 h-24 object-contain bg-gray-700 rounded-lg p-2"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold text-orange-400">{team.name}</h1>
            <p className="text-lg text-gray-400">Coach: {team.coach}</p>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-400">{matches.length}</div>
            <div className="text-sm text-gray-400">Games Played</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{wins}-{losses}</div>
            <div className="text-sm text-gray-400">Record</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{totalPoints}</div>
            <div className="text-sm text-gray-400">Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{totalAssists}</div>
            <div className="text-sm text-gray-400">Assists</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{totalRebounds}</div>
            <div className="text-sm text-gray-400">Rebounds</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {totalBlocks + totalSteals}
            </div>
            <div className="text-sm text-gray-400">Blocks + Steals</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          {["roster", "schedule", "stats"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-orange-400 text-orange-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "roster" && (
          <RosterTab players={players} />
        )}
        {activeTab === "schedule" && (
          <ScheduleTab matches={matches} team={team} />
        )}
        {activeTab === "stats" && (
          <StatsTab
            totalPoints={totalPoints}
            totalAssists={totalAssists}
            totalRebounds={totalRebounds}
            totalBlocks={totalBlocks}
            totalSteals={totalSteals}
            matches={matches}
          />
        )}
      </div>
    </div>
  );
}

/* --- Components --- */
function RosterTab({ players }: { players: PlayersStats[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Team Roster</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              {["#", "Player", "Position", "PTS", "AST", "REB", "BLK", "STL"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {players.map((p) => (
              <tr key={p.player_id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{p.jersey_number}</td>
                <td className="px-6 py-4">
                  <Link href={`/players/${p.player_id}`} className="text-orange-400 hover:text-orange-300">
                    {p.first_name} {p.last_name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{p.position}</td>
                <td className="px-6 py-4 text-sm">{p.points}</td>
                <td className="px-6 py-4 text-sm">{p.assists}</td>
                <td className="px-6 py-4 text-sm">{p.rebounds}</td>
                <td className="px-6 py-4 text-sm">{p.blocks}</td>
                <td className="px-6 py-4 text-sm">{p.steals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScheduleTab({ matches, team }: { matches: Match[]; team: Team }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Match Schedule</h2>
      <div className="space-y-4">
        {matches.map((m) => {
          const isHome = m.home_team.team_id === team.team_id;
          const opponent = isHome ? m.away_team : m.home_team;
          const teamScore = isHome ? m.home_score : m.away_score;
          const opponentScore = isHome ? m.away_score : m.home_score;
          const win = (teamScore ?? 0) > (opponentScore ?? 0);
          return (
            <div key={m.match_id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">
                    {new Date(m.match_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-white">
                    {team.name} vs {opponent.team_name}
                  </div>
                </div>
                {m.completed && (
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold">
                      {teamScore} - {opponentScore}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        win
                          ? "bg-green-900 text-green-400"
                          : "bg-red-900 text-red-400"
                      }`}
                    >
                      {win ? "W" : "L"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsTab({
  totalPoints,
  totalAssists,
  totalRebounds,
  totalBlocks,
  totalSteals,
  matches,
}: {
  totalPoints: number;
  totalAssists: number;
  totalRebounds: number;
  totalBlocks: number;
  totalSteals: number;
  matches: Match[];
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Team Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Offensive Stats</h3>
          <p>Total Points: {totalPoints}</p>
          <p>Total Assists: {totalAssists}</p>
          <p>PPG: {(totalPoints / (matches.length || 1)).toFixed(1)}</p>
          <p>APG: {(totalAssists / (matches.length || 1)).toFixed(1)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Defensive Stats</h3>
          <p>Total Rebounds: {totalRebounds}</p>
          <p>Total Blocks: {totalBlocks}</p>
          <p>Total Steals: {totalSteals}</p>
          <p>RPG: {(totalRebounds / (matches.length || 1)).toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
