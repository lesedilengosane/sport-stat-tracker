"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, SortAsc, ArrowLeft } from "lucide-react";
import TeamDetails from "./TeamDetails";

interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
}

interface Team {
  team_id: string;
  team_name: string;
  coach_id: string;
  players: Player[];
}

type SortOption =
  | "name-asc"
  | "name-desc"
  | "players-asc"
  | "players-desc"
  | "coach-asc"
  | "coach-desc";

export default function TeamCards() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        setError(null);
        const response = await fetch("/api/teams");
        if (!response.ok) throw new Error(`Failed to fetch teams: ${response.status}`);
        const data = await response.json();

        const teamsArray = Array.isArray(data)
          ? data
          : data.teams || data.data || [];

        setTeams(teamsArray);
        setFilteredTeams(teamsArray);
      } catch (err: any) {
        setError(err.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };

    fetchAllTeams();
  }, []);

  // Filter + Sort logic
  useEffect(() => {
    let result = teams;

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.team_name.toLowerCase().includes(lower) ||
          (t.coach_id && t.coach_id.toLowerCase().includes(lower)) ||
          (t.players &&
            t.players.some(
              (p) =>
                p.first_name.toLowerCase().includes(lower) ||
                p.last_name.toLowerCase().includes(lower) ||
                p.position.toLowerCase().includes(lower)
            ))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.team_name.localeCompare(b.team_name);
        case "name-desc":
          return b.team_name.localeCompare(a.team_name);
        case "players-asc":
          return (a.players?.length || 0) - (b.players?.length || 0);
        case "players-desc":
          return (b.players?.length || 0) - (a.players?.length || 0);
        case "coach-asc":
          return (a.coach_id || "").localeCompare(b.coach_id || "");
        case "coach-desc":
          return (b.coach_id || "").localeCompare(a.coach_id || "");
        default:
          return 0;
      }
    });

    setFilteredTeams(result);
  }, [teams, searchTerm, sortOption]);

  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleBackToList = () => {
    setSelectedTeamId(null);
  };

  // === Team Details View ===
  if (selectedTeamId) {
    return (
      <div className="relative z-10 min-h-screen">
        <Button
          onClick={handleBackToList}
          variant="outline"
          className="mb-6 bg-white/30 border-gray-300 text-gray-800 hover:bg-white/60"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Teams
        </Button>
        <TeamDetails teamId={selectedTeamId} />
      </div>
    );
  }

  // === Loading & Error States ===
  if (loading)
    return (
      <div className="text-center text-gray-700 mt-10">Loading teams...</div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10">
        <p>{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
        >
          Reload
        </Button>
      </div>
    );

  // === Team List View ===
  return (
    <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            All Teams
          </h1>
          <p className="text-gray-700">
            Showing {filteredTeams.length} of {teams.length} teams
          </p>
        </div>

        {/* Search + Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search teams, coaches, or players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={sortOption}
              onValueChange={(v) => setSortOption(v as SortOption)}
            >
              <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900">
                <SortAsc className="h-4 w-4 mr-2 text-gray-600" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-900">
                <SelectItem value="name-asc">Team Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Team Name (Z-A)</SelectItem>
                <SelectItem value="players-asc">Fewest Players</SelectItem>
                <SelectItem value="players-desc">Most Players</SelectItem>
                <SelectItem value="coach-asc">Coach (A-Z)</SelectItem>
                <SelectItem value="coach-desc">Coach (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team.team_id}
              className="cursor-pointer hover:scale-105 transition-all duration-300 bg-white/60 backdrop-blur-md border border-gray-300 shadow-lg"
            >
              <CardContent className="p-6 text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {team.team_name}
                </h2>
                <p className="text-gray-600 text-sm">
                  Coach:{" "}
                  <span className="text-orange-500">
                    {team.coach_id || "Unassigned"}
                  </span>
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2 text-orange-400" />
                  {team.players?.length || 0} players
                </div>
                <Button
                  onClick={() => handleTeamClick(team.team_id)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2"
                >
                  View Team Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
