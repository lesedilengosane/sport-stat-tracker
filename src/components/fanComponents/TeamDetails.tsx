"use client";

import { useEffect, useState } from "react";
import { PlayersStats } from "@/types/player";
import Link from "next/link";

interface TeamDetailsProps {
  teamId: string;
}

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

export default function TeamDetails({ teamId }: TeamDetailsProps) {
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
        const resPlayers = await fetch("/api/pl");
        if (!resPlayers.ok) throw new Error("Failed to fetch players");
        const playersData: PlayersStats[] = await resPlayers.json();

        const teamPlayers = playersData.filter((p) => p.team_id === teamId);

        const resTeam = await fetch("/api/all");
        if (!resTeam.ok) throw new Error("Failed to fetch team data");
        const { coaches, teams, matches } = await resTeam.json();

        // Find the team by its ID
        const teamData = teams.find((t: any) => t.team_id === teamId);

        // Try to find its coach (optional)
        const teamCoach = coaches.find((c: any) => c.team_id === teamId);

        const teamInfo: Team = {
        name: teamData?.team_name || "Unknown Team",
        coach: teamCoach
         ? `${teamCoach.users.first_name} ${teamCoach.users.last_name}`
          : "No Coach",
        icon_url: teamData?.icon_url || null,
        };


        const teamMatches = matches.filter(
          (m: Match) =>
            m.home_team?.team_id === teamId || m.away_team?.team_id === teamId
        );

        setPlayers(teamPlayers);
        setTeam(teamInfo);
        setMatches(teamMatches);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchData();
  }, [teamId]);

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>;
  /*if (players.length === 0)
    return <p className="text-center mt-10 text-white">No players found for this team.</p>;
*/
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

  return (
    <div className="min-h-screen backdrop-blur-lg bg-white/10 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-white/10 text-white border-b border-gray-700 px-6 py-8">
        <div className="flex items-center gap-6">
          {team.icon_url && (
            <img
              src={team.icon_url}
              alt={team.name}
              className="w-24 h-24 object-contain bg-white/10 rounded-lg p-2"
            />
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🏀</span>
              <h1 className="text-4xl font-bold text-orange-400 drop-shadow-md">{team.name}</h1>
            </div>
            <p className="text-lg text-gray-300">Coach: {team.coach}</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/10 border-b border-gray-700 px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { label: "Games Played", value: matches.length },
            { label: "Record", value: `${wins}-${losses}` },
            { label: "Total Points", value: totalPoints },
            { label: "Total Assists", value: totalAssists },
            { label: "Total Rebounds", value: totalRebounds },
            { label: "Blocks + Steals", value: totalBlocks + totalSteals },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 border-b border-gray-700 sticky top-0 z-10">
        <div className="flex gap-8 px-4">
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

      {/* Content */}
      <div className="px-4 py-8">
        {activeTab === "roster" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Team Roster</h2>
            <div className="bg-white/10 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-white/5">
                  <tr>
                    {["#", "Player", "Position", "PTS", "AST", "REB", "BLK", "STL"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-gray-700">
                  {players.map((p) => (
                    <tr key={p.player_id} className="hover:bg-white/10 transition-colors">
                      <td className="px-6 py-4 text-sm text-white">{p.jersey_number}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/players/${p.player_id}`} className="text-orange-400 hover:text-orange-300">
                          {p.first_name} {p.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{p.position}</td>
                      <td className="px-6 py-4 text-sm text-white">{p.points}</td>
                      <td className="px-6 py-4 text-sm text-white">{p.assists}</td>
                      <td className="px-6 py-4 text-sm text-white">{p.rebounds}</td>
                      <td className="px-6 py-4 text-sm text-white">{p.blocks}</td>
                      <td className="px-6 py-4 text-sm text-white">{p.steals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Match Schedule</h2>
            <div className="space-y-4">
              {matches.map((m) => {
                const isHome = m.home_team.team_name === team.name;
                const opponent = isHome ? m.away_team : m.home_team;
                const teamScore = isHome ? m.home_score : m.away_score;
                const opponentScore = isHome ? m.away_score : m.home_score;
                const win = (teamScore ?? 0) > (opponentScore ?? 0);

                return (
                  <div
                    key={m.match_id}
                    className="bg-white/10 rounded-xl border border-gray-700 p-6 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-sm text-gray-300">
                          {new Date(m.match_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white">{team.name}</span>
                          <span className="text-gray-500">vs</span>
                          <span className="text-sm font-semibold text-white">{opponent.team_name}</span>
                        </div>
                      </div>
                      {m.completed && (
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-white">
                            {teamScore} - {opponentScore}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              win
                                ? "bg-green-900/60 text-green-400"
                                : "bg-red-900/60 text-red-400"
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
        )}

        {activeTab === "stats" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Team Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Offensive Stats",
                  stats: [
                    { label: "Total Points", value: totalPoints },
                    { label: "Total Assists", value: totalAssists },
                    { label: "PPG", value: matches.length ? (totalPoints / matches.length).toFixed(1) : "0.0" },
                    { label: "APG", value: matches.length ? (totalAssists / matches.length).toFixed(1) : "0.0" },
                  ],
                },
                {
                  title: "Defensive Stats",
                  stats: [
                    { label: "Total Rebounds", value: totalRebounds },
                    { label: "Total Blocks", value: totalBlocks },
                    { label: "Total Steals", value: totalSteals },
                    { label: "RPG", value: matches.length ? (totalRebounds / matches.length).toFixed(1) : "0.0" },
                  ],
                },
              ].map((card) => (
                <div key={card.title} className="bg-white/10 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{card.title}</h3>
                  <div className="space-y-3">
                    {card.stats.map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-gray-300">{s.label}</span>
                        <span className="text-xl font-bold text-orange-400">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
