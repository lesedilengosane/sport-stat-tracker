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
  const [matchSortBy, setMatchSortBy] = useState<"date" | "score">("date");

  // New sort selections
  const [playerSortBy, setPlayerSortBy] = useState<"name" | "points">("name");
  const [teamSortBy, setTeamSortBy] = useState<"name" | "players">("name");

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

  const applyFilter = (
    data: any[],
    key: string,
    numericKey: string | null = null,
    tab: string = "general",
    sortBy?: string
  ) => {
    let result = [...data];

    if (tab === "matches") {
      const getNumeric = (m: Match) => m.home_score + m.away_score;
      switch (filter) {
        case "asc":
          result.sort((a, b) =>
            matchSortBy === "date"
              ? new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
              : getNumeric(a) - getNumeric(b)
          );
          break;
        case "desc":
          result.sort((a, b) =>
            matchSortBy === "date"
              ? new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
              : getNumeric(b) - getNumeric(a)
          );
          break;
        case "first5":
          result = result.slice(0, 5);
          break;
        case "last5":
          result = result.slice(-5);
          break;
        case "highest":
          if (matchSortBy === "score")
            result = result.sort((a, b) => getNumeric(b) - getNumeric(a)).slice(0, 5);
          break;
        case "lowest":
          if (matchSortBy === "score")
            result = result.sort((a, b) => getNumeric(a) - getNumeric(b)).slice(0, 5);
          break;
      }
    } else {
      let numeric = numericKey;
      if (tab === "players") {
        numeric = playerSortBy === "points" ? "points" : null;
        key = playerSortBy === "name" ? "last_name" : key;
      } else if (tab === "teams") {
        numeric = teamSortBy === "players" ? "players_count" : null;
        key = teamSortBy === "name" ? "team_name" : key;
      }

      result = result.map((item) => {
        if (tab === "teams") item.players_count = item.players?.length || 0;
        return item;
      });

      switch (filter) {
        case "asc":
          result.sort((a, b) =>
            numeric ? a[numeric] - b[numeric] : a[key].localeCompare(b[key])
          );
          break;
        case "desc":
          result.sort((a, b) =>
            numeric ? b[numeric] - a[numeric] : b[key].localeCompare(a[key])
          );
          break;
        case "first5":
          result = result.slice(0, 5);
          break;
        case "last5":
          result = result.slice(-5);
          break;
        case "highest":
          if (numeric) result = result.sort((a, b) => b[numeric] - a[numeric]).slice(0, 5);
          break;
        case "lowest":
          if (numeric) result = result.sort((a, b) => a[numeric] - b[numeric]).slice(0, 5);
          break;
      }
    }

    return result;
  };

  const filteredMatches = applyFilter(matches, "match_date", "total_score", "matches");
  const filteredPlayers = applyFilter(players, "last_name", "points", "players");
  const filteredTeams = applyFilter(teams, "team_name", "total_points", "teams");

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

          {/* Filters */}
          <div className="flex justify-end mt-6 pr-2 gap-4">
            {activeTab === "matches" && (
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 font-medium">Sort By:</Label>
                <Select
                  value={matchSortBy}
                  onValueChange={(v) => setMatchSortBy(v as "date" | "score")}
                >
                  <SelectTrigger className="w-36 bg-white border-gray-300 shadow-sm">
                    <SelectValue placeholder="Select sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="score">Total Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Players sort */}
            {activeTab === "players" && (
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 font-medium">Sort By:</Label>
                <Select
                  value={playerSortBy}
                  onValueChange={(v) => setPlayerSortBy(v as "name" | "points")}
                >
                  <SelectTrigger className="w-40 bg-white border-gray-300 shadow-sm">
                    <SelectValue placeholder="Player sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Player Surname</SelectItem>
                    <SelectItem value="points">Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Teams sort */}
            {activeTab === "teams" && (
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 font-medium">Sort By:</Label>
                <Select
                  value={teamSortBy}
                  onValueChange={(v) => setTeamSortBy(v as "name" | "players")}
                >
                  <SelectTrigger className="w-44 bg-white border-gray-300 shadow-sm">
                    <SelectValue placeholder="Team sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Team Name</SelectItem>
                    <SelectItem value="players">Number of Players</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Common filter */}
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
                  <SelectItem value="highest">Highest</SelectItem>
                  <SelectItem value="lowest">Lowest</SelectItem>
                  <SelectItem value="all">Show All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Matches tab unchanged */}
          <TabsContent value="matches" className="mt-8">
            <Card className="bg-white border shadow-lg rounded-2xl">
              <CardHeader className="text-center border-b">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Match History
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Filtered by: <span className="font-semibold">{filter}</span> | Sort by:{" "}
                  <span className="font-semibold">{matchSortBy}</span>
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

          {/* Players tab */}
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
                            <td className="px-5 py-3 text-gray-700">
                              <Link
                                href={`/team/${p.team_id}`}
                                className="text-orange-500 hover:underline"
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

          {/* Teams tab */}
          <TabsContent value="teams" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeams.map((t) => (
                <Link key={t.team_id} href={`/team/${t.team_id}`}>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
