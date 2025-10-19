"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
  team_id: string;
  points?: number;
  team_name?: string;
  image?: string;
}

interface Team {
  team_id: string;
  team_name: string;
  players?: Player[];
  icon_url: string;
  total_points?: number;
}

interface Match {
  match_id: string;
  match_date: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
}

export default function HistoricalData() {
  const [activeTab, setActiveTab] = useState("matches");
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        setTeams(data.teams || []);
        setPlayers(data.players || []);
        setMatches(data.matches || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Apply filter dynamically based on tab
  const applyFilter = (
    data: any[],
    key: string,
    numericKey: string | null = null
  ) => {
    switch (filter) {
      case "asc":
        return [...data].sort((a, b) =>
          numericKey ? a[numericKey] - b[numericKey] : a[key].localeCompare(b[key])
        );
      case "desc":
        return [...data].sort((a, b) =>
          numericKey ? b[numericKey] - a[numericKey] : b[key].localeCompare(a[key])
        );
      case "first5":
        return [...data].slice(0, 5);
      case "last5":
        return [...data].slice(-5);
      case "highest":
        return numericKey
          ? [...data].sort((a, b) => (b[numericKey] || 0) - (a[numericKey] || 0)).slice(0, 5)
          : [...data].slice(0, 5);
      case "lowest":
        return numericKey
          ? [...data].sort((a, b) => (a[numericKey] || 0) - (b[numericKey] || 0)).slice(0, 5)
          : [...data].slice(0, 5);
      default:
        return data;
    }
  };

  const filteredTeams = applyFilter(teams, "team_name", "total_points");
  const filteredPlayers = applyFilter(players, "last_name", "points");
  const filteredMatches = applyFilter(
    matches,
    "match_date",
    "home_score" // You could adjust to sort by total score if needed
  );

  const placeholderTeam =
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
  const placeholderPlayer =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <div className="relative z-10 min-h-screen bg-gradient-to-br from-gray-50 to-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <Tabs
          defaultValue="matches"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Tabs */}
          <div className="flex justify-center">
            <TabsList className="bg-white border shadow rounded-xl">
              <TabsTrigger
                value="matches"
                className="px-6 py-2 font-medium data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition"
              >
                Matches
              </TabsTrigger>
              <TabsTrigger
                value="players"
                className="px-6 py-2 font-medium data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition"
              >
                Players
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="px-6 py-2 font-medium data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition"
              >
                Teams
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filter */}
          <div className="flex justify-end mt-6 pr-2">
            <div className="flex items-center gap-3">
              <Label className="text-gray-700 font-medium">Filter:</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-44 bg-white border-gray-300 shadow-sm">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="first5">First 5</SelectItem>
                  <SelectItem value="last5">Last 5</SelectItem>
                  <SelectItem value="highest">Highest Points</SelectItem>
                  <SelectItem value="lowest">Lowest Points</SelectItem>
                  <SelectItem value="all">Show All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* MATCHES */}
          <TabsContent value="matches" className="mt-8">
            <Card className="bg-white border shadow-lg rounded-2xl">
              <CardHeader className="text-center border-b">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Match History
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Filtered by: <span className="font-semibold">{filter}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-orange-500 w-6 h-6" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMatches.map((m) => (
                      <div
                        key={m.match_id}
                        className="p-6 rounded-xl bg-orange-50 border border-orange-200 shadow-sm hover:shadow-lg transition-all text-center"
                      >
                        <h3 className="text-lg font-bold text-gray-800">
                          {m.home_team_name} vs {m.away_team_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(m.match_date).toDateString()}
                        </p>
                        <p className="mt-3 text-2xl font-bold text-orange-600">
                          {m.home_score} : {m.away_score}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PLAYERS */}
          <TabsContent value="players" className="mt-8">
            <Card className="bg-white border shadow-lg rounded-2xl">
              <CardHeader className="text-center border-b">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Player Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-orange-500 w-6 h-6" />
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                        <tr>
                          <th className="px-5 py-3">Player</th>
                          <th className="px-5 py-3">Team</th>
                          <th className="px-5 py-3">Points</th>
                          <th className="px-5 py-3">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPlayers.map((p) => (
                          <tr
                            key={p.player_id}
                            className="hover:bg-orange-50 border-t"
                          >
                            <td className="px-5 py-3 flex items-center gap-3 font-medium text-gray-900">
                              <Image
                                src={p.image || placeholderPlayer}
                                alt={`${p.first_name} ${p.last_name}`}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                              />
                              <Link
                                href={`/player/${p.player_id}`}
                                className="text-orange-500 hover:underline"
                              >
                                {p.first_name} {p.last_name}
                              </Link>
                            </td>
                            <td className="px-5 py-3 flex items-center gap-3 text-gray-700">
                              <Link
                                href={`/team/${p.team_id}`}
                                className="flex items-center gap-2"
                              >
                                {p.team_name || "N/A"}
                              </Link>
                            </td>
                            <td className="px-5 py-3 font-semibold text-gray-800">
                              {p.points ?? "-"}
                            </td>
                            <td className="px-5 py-3 text-gray-600">
                              {p.position}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEAMS */}
          <TabsContent value="teams" className="mt-8">
            <Card className="bg-white border shadow-lg rounded-2xl">
              <CardHeader className="text-center border-b">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-orange-500 w-6 h-6" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTeams.map((t) => (
                      <Link
                        key={t.team_id}
                        href={`/team/${t.team_id}`}
                        className="block"
                      >
                        <Card className="bg-orange-50 border border-orange-200 shadow-sm hover:shadow-lg transition-all">
                          <CardContent className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                              <Image
                                src={t.icon_url || placeholderTeam}
                                alt={t.team_name}
                                width={64}
                                height={64}
                                className="rounded-xl object-contain bg-white p-2 border"
                              />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">
                              {t.team_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Players</p>
                            <p className="mt-2 text-2xl font-bold text-orange-600">
                              {t.players?.length ?? 0}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
