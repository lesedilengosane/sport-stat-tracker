"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PlayersStats } from "@/types/player";
import Link from "next/link";

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
  const { id: TEAM_ID } = useParams();
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

        const teamPlayers = playersData.filter((p) => p.team_id === TEAM_ID);

        const resTeam = await fetch("/api/all");
        if (!resTeam.ok) throw new Error("Failed to fetch team data");
        const { coaches, matches } = await resTeam.json();

        const teamCoach = coaches.find((c: any) => c.teams?.team_id === TEAM_ID);

        const teamInfo: Team = {
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
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (TEAM_ID) fetchData();
  }, [TEAM_ID]);

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>;
  if (players.length === 0)
    return (
      <p className="text-center mt-10 text-white">
        No players found for this team.
      </p>
    );

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
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gray-800 text-white border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {team.icon_url && (
              <img
                src={team.icon_url}
                alt={team.name}
                className="w-24 h-24 object-contain bg-gray-700 rounded-lg p-2"
              />
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🏀</span>
                <h1 className="text-4xl font-bold text-orange-400">{team.name}</h1>
              </div>
              <p className="text-lg text-gray-400">Coach: {team.coach}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{matches.length}</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{wins}-{losses}</div>
              <div className="text-sm text-gray-400">Record</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{totalPoints}</div>
              <div className="text-sm text-gray-400">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{totalAssists}</div>
              <div className="text-sm text-gray-400">Total Assists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{totalRebounds}</div>
              <div className="text-sm text-gray-400">Total Rebounds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{totalBlocks + totalSteals}</div>
              <div className="text-sm text-gray-400">Blocks + Steals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("roster")}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === "roster"
                  ? "border-orange-400 text-orange-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Roster
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === "schedule"
                  ? "border-orange-400 text-orange-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === "stats"
                  ? "border-orange-400 text-orange-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Roster Tab */}
        {activeTab === "roster" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Team Roster</h2>
            <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      PTS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      AST
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      REB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      BLK
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      STL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {players.map((p) => (
                    <tr key={p.player_id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {p.jersey_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/players/${p.player_id}`}
                          className="text-sm font-medium text-orange-400 hover:text-orange-300"
                        >
                          {p.first_name} {p.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {p.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {p.points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {p.assists}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {p.rebounds}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {p.blocks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {p.steals}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
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
                    className="bg-gray-800 rounded-lg shadow p-6 hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-sm text-gray-400">
                          {new Date(m.match_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white">
                            {team.name}
                          </span>
                          <span className="text-gray-500">vs</span>
                          <span className="text-sm font-semibold text-white">
                            {opponent.team_name}
                          </span>
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
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Team Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Offensive Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Points</span>
                    <span className="text-xl font-bold text-orange-400">{totalPoints}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Assists</span>
                    <span className="text-xl font-bold text-orange-400">{totalAssists}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">PPG</span>
                    <span className="text-xl font-bold text-orange-400">
                      {matches.length > 0 ? (totalPoints / matches.length).toFixed(1) : "0.0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">APG</span>
                    <span className="text-xl font-bold text-orange-400">
                      {matches.length > 0 ? (totalAssists / matches.length).toFixed(1) : "0.0"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Defensive Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Rebounds</span>
                    <span className="text-xl font-bold text-orange-400">{totalRebounds}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Blocks</span>
                    <span className="text-xl font-bold text-orange-400">{totalBlocks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Steals</span>
                    <span className="text-xl font-bold text-orange-400">{totalSteals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">RPG</span>
                    <span className="text-xl font-bold text-orange-400">
                      {matches.length > 0 ? (totalRebounds / matches.length).toFixed(1) : "0.0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}