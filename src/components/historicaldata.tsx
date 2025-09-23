'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Link from 'next/link';

interface BasketballGame {
  score_away: string;
  score_home: string;
  id: number;
  team_home: string;
  team_away: string;
  league: string;
  game_date: string;
  venue: string | null;
}

interface PlayerDetails {
  player_id: string;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
}

interface PlayerStat {
  players: PlayerDetails | null;
  id: string;
  points: number;
  threePointsMade: number;
  threePointsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
}

export default function PreviousMatches({ team, league }: { team: string; league: string }) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/history?team=${encodeURIComponent(team)}&league=${encodeURIComponent(league)}&limit=${limit}`
        );
        const json = await res.json();
        setGames(json.data || []);
      } catch (err) {
        console.error('Fetch error (games):', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [team, league, limit]);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      setLoadingPlayerStats(true);
      try {
        const res = await fetch(`/api/player_stats`);
        const json = await res.json();
        setPlayerStats(json.data || []);
      } catch (err) {
        console.error('Fetch error (player stats):', err);
      } finally {
        setLoadingPlayerStats(false);
      }
    };
    fetchPlayerStats();
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl text-gray-100">
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="mb-6 flex justify-center rounded-xl bg-gray-800/70 shadow-md backdrop-blur">
          <TabsTrigger
            value="matches"
            className="px-6 py-2 text-lg font-semibold rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Previous Matches
          </TabsTrigger>
          <TabsTrigger
            value="players"
            className="px-6 py-2 text-lg font-semibold rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Player Stats
          </TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches">
          <Card className="border-0 shadow-md rounded-2xl bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Recent Games
              </CardTitle>
              <CardDescription className="text-gray-300">
                Showing last <strong>{limit}</strong> games for {team} in {league}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-2">
                <Label htmlFor="limit" className="text-gray-200 font-medium">
                  Show last
                </Label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="rounded-lg bg-gray-900 text-white border-gray-600 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring focus:ring-orange-400"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <option key={n} value={n}>{n} games</option>
                  ))}
                </select>
              </div>

              {loading && <p className="text-gray-400">Loading...</p>}
              {!loading && games.length === 0 && (
                <p className="text-gray-400">No previous matches found.</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="p-5 rounded-xl shadow hover:shadow-lg bg-gradient-to-br from-gray-800 to-gray-700 transition-all duration-300"
                  >
                    <h3 className="text-lg font-bold text-white">
                      {game.team_home} vs {game.team_away}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {new Date(game.game_date).toDateString()} — {game.venue || "TBD"}
                    </p>
                    <p className="mt-3 text-2xl font-extrabold text-orange-400">
                      {game.score_home ?? "-"} : {game.score_away ?? "-"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Player Stats Tab */}
        <TabsContent value="players">
          <Card className="border-0 shadow-md rounded-2xl bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Player Statistics
              </CardTitle>
              <CardDescription className="text-gray-300">
                From the latest recorded matches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPlayerStats && <p className="text-gray-400">Loading player stats...</p>}
              {!loadingPlayerStats && playerStats.length === 0 && (
                <p className="text-gray-400">No player stats available.</p>
              )}

              {!loadingPlayerStats && playerStats.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-700 rounded-lg">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-200">Player</th>
                        <th className="p-3 text-gray-200">PTS</th>
                        <th className="p-3 text-gray-200">3PM / 3PA</th>
                        <th className="p-3 text-gray-200">FTM / FTA</th>
                        <th className="p-3 text-gray-200">REB</th>
                        <th className="p-3 text-gray-200">AST</th>
                        <th className="p-3 text-gray-200">STL</th>
                        <th className="p-3 text-gray-200">BLK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {playerStats.map((stat) => (
                        <tr key={stat.id} className="hover:bg-gray-700/60 transition">
                          <td className="p-3 font-medium text-white">
                            <Link
                              href={`/players/${stat.players?.player_id}`}
                              className="text-orange-400 hover:underline"
                            >
                              {stat.players?.first_name} {stat.players?.last_name}
                            </Link>
                            <span className="ml-1 text-gray-400">
                              #{stat.players?.jersey_number}
                            </span>
                          </td>
                          <td className="p-3 text-center">{stat.points}</td>
                          <td className="p-3 text-center">
                            {stat.threePointsMade} / {stat.threePointsAttempted}
                          </td>
                          <td className="p-3 text-center">
                            {stat.freeThrowsMade} / {stat.freeThrowsAttempted}
                          </td>
                          <td className="p-3 text-center">{stat.rebounds}</td>
                          <td className="p-3 text-center">{stat.assists}</td>
                          <td className="p-3 text-center">{stat.steals}</td>
                          <td className="p-3 text-center">{stat.blocks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
