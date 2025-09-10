'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface BasketballGame {
  score_away: string;
  score_home: string;
  id: number;
  team: string;
  team_home: string;
  team_away: string;
  opponent: string;
  league: string;
  game_date: string;
  team_score: number | null;
  opponent_score: number | null;
  venue: string | null;
}

interface PlayerDetails {
  player_id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
}

interface PlayerStat {
  id: string;
  match_id: string;
  player_id: string;
  points: number;
  twoPointsMade: number;
  twoPointsAttempted: number;
  threePointsMade: number;
  threePointsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  rebounds: number;
  
  assists: number;
  steals: number;
  blocks: number;
  created_at: string;
}

export default function PreviousMatches({ team, league }: { team: string; league: string }) {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [playerDetails, setPlayerDetails] = useState<PlayerDetails[]>([]);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(true);
  const [loadingPlayerDetails, setLoadingPlayerDetails] = useState(true);

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/history?team=${encodeURIComponent(team)}&league=${encodeURIComponent(league)}&limit=${limit}`
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
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

  // Fetch player stats
  useEffect(() => {
    const fetchPlayerStats = async () => {
      setLoadingPlayerStats(true);
      try {
        const res = await fetch(`/api/player_stats`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
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

  // Fetch player details
  useEffect(() => {
    const fetchPlayerDetails = async () => {
      setLoadingPlayerDetails(true);
      try {
        const res = await fetch(`/api/players`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setPlayerDetails(json.data || []);
      } catch (err) {
        console.error('Fetch error (player details):', err);
      } finally {
        setLoadingPlayerDetails(false);
      }
    };
    fetchPlayerDetails();
  }, []);

  useEffect(() => {
  console.log("Player details:", playerDetails);
  console.log("Player stats:", playerStats);
}, [playerDetails, playerStats]);


 // Merge player stats with details
const mergedPlayerStats = playerStats.map((stat) => {
  const player = playerDetails.find((p) => p.player_id === stat.player_id);

  return {
    ...stat,
    firstname: player ? player.first_name : "Unknown",
    lastname: player ? player.last_name : "Player",
    jersey: player ? `#${player.jersey_number}` : "",
    position: player?.position || "",
    team_id: player?.team_id || null,
  };
});


  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <Tabs defaultValue="matches">
        {/* Tabs header */}
        <TabsList>
          <TabsTrigger value="matches">Previous Matches</TabsTrigger>
          <TabsTrigger value="players">Player Stats</TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Previous Matches</CardTitle>
              <CardDescription>
                View the last <strong>{limit}</strong> games for {team} in {league}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controls */}
              <div className="flex items-center gap-2">
                <Label htmlFor="limit">Show last</Label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n} games</option>
                  ))}
                </select>
              </div>

              {/* Loading and Errors */}
              {loading && <p>Loading...</p>}
              {!loading && games.length === 0 && <p>No previous matches found.</p>}

              {/* Grid of games */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 border rounded-lg shadow bg-white flex flex-col"
                  >
                    <p className="font-bold text-lg">
                      {game.team_home} vs {game.team_away}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(game.game_date).toDateString()} — {game.venue || 'TBD'}
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {game.score_home ?? '-'} : {game.score_away ?? '-'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Player Stats Tab */}
<TabsContent value="players">
  <Card>
    <CardHeader>
      <CardTitle>Player Statistics</CardTitle>
      <CardDescription>
        Stats from the latest recorded matches.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {loadingPlayerStats && <p>Loading player stats...</p>}
      {!loadingPlayerStats && playerStats.length === 0 && (
        <p>No player stats available.</p>
      )}
      {!loadingPlayerStats && playerStats.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Player</th>
                <th className="p-2 border">Points</th>
                <th className="p-2 border">3PM / 3PA</th>
                <th className="p-2 border">FTM / FTA</th>
                <th className="p-2 border">Rebounds </th>
                <th className="p-2 border">Assists</th>
                <th className="p-2 border">Steals</th>
                <th className="p-2 border">Blocks</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.map((stat: any) => (
                <tr key={stat.id} className="text-center">
                  <td className="p-2 border font-medium">
                    {stat.players?.first_name} {stat.players?.last_name}{" "}
                    <span className="text-gray-500">
                      #{stat.players?.jersey_number}
                    </span>
                  </td>
                  <td className="p-2 border">{stat.points}</td>
                  <td className="p-2 border">
                    {stat.threePointsMade} / {stat.threePointsAttempted}
                  </td>
                  <td className="p-2 border">
                    {stat.freeThrowsMade} / {stat.freeThrowsAttempted}
                  </td>
                  <td className="p-2 border">
                    {stat.rebounds} 
                  </td>
                  <td className="p-2 border">{stat.assists}</td>
                  <td className="p-2 border">{stat.steals}</td>
                  <td className="p-2 border">{stat.blocks}</td>
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
