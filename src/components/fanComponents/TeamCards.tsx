"use client";

import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, SortAsc } from 'lucide-react';

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

type SortOption = 'name-asc' | 'name-desc' | 'players-asc' | 'players-desc' | 'coach-asc' | 'coach-desc';

const AllTeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  
  const router = useRouter();

  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        setError(null);
        console.log('Fetching ALL teams from API...');
        
        // Use the API route to fetch all teams
        const response = await fetch('/api/teams');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch teams: ${response.status} ${response.statusText}`);
        }
        
        const teamsData = await response.json();
        console.log('Teams data from API:', teamsData);

        // Handle both array response and nested data structures
        const teamsArray = Array.isArray(teamsData) ? teamsData : teamsData.teams || teamsData.data || [];
        
        console.log('Processed teams array:', teamsArray);
        setTeams(teamsArray);
        setFilteredTeams(teamsArray);
      } catch (err: any) {
        console.error("Error fetching all teams from API:", err);
        setError(err.message || 'Failed to load teams from API');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTeams();
  }, []);

  // Filter and sort teams based on search term and sort option
  useEffect(() => {
    let result = teams;

    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(team => 
        team.team_name.toLowerCase().includes(lowercasedSearch) ||
        (team.coach_id && team.coach_id.toLowerCase().includes(lowercasedSearch)) ||
        (team.players && team.players.some(player => 
          player.first_name.toLowerCase().includes(lowercasedSearch) ||
          player.last_name.toLowerCase().includes(lowercasedSearch) ||
          player.position.toLowerCase().includes(lowercasedSearch)
        ))
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.team_name.localeCompare(b.team_name);
        case 'name-desc':
          return b.team_name.localeCompare(a.team_name);
        case 'players-asc':
          return (a.players?.length || 0) - (b.players?.length || 0);
        case 'players-desc':
          return (b.players?.length || 0) - (a.players?.length || 0);
        case 'coach-asc':
          return (a.coach_id || '').localeCompare(b.coach_id || '');
        case 'coach-desc':
          return (b.coach_id || '').localeCompare(a.coach_id || '');
        default:
          return 0;
      }
    });

    setFilteredTeams(result);
  }, [teams, searchTerm, sortOption]);

  const handleTeamClick = (teamId: string) => {
    router.push(`/team/${teamId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortOption('name-asc');
  };

  const refreshTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const teamsData = await response.json();
      const teamsArray = Array.isArray(teamsData) ? teamsData : teamsData.teams || teamsData.data || [];
      setTeams(teamsArray);
      setFilteredTeams(teamsArray);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh teams');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-300 text-lg mb-4">Loading all teams from API...</p>
          <div className="animate-pulse text-gray-500">Fetching team data from /api/teams...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-400 text-lg mb-4">Error loading teams</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="space-x-4">
            <Button 
              onClick={refreshTeams}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-400 mb-2">
            All Teams in Database
          </h1>
          <p className="text-gray-400">
            Showing {filteredTeams.length} of {teams.length} team{teams.length !== 1 ? 's' : ''} from API
          </p>
          <Button 
            onClick={refreshTeams}
            variant="outline" 
            size="sm"
            className="mt-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
          >
            Refresh Teams
          </Button>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search all teams, players, coaches, or positions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-64">
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="name-asc">Team Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Team Name (Z-A)</SelectItem>
                <SelectItem value="players-asc">Players (Fewest First)</SelectItem>
                <SelectItem value="players-desc">Players (Most First)</SelectItem>
                <SelectItem value="coach-asc">Coach (A-Z)</SelectItem>
                <SelectItem value="coach-desc">Coach (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || sortOption !== 'name-asc') && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* No Results Message */}
        {filteredTeams.length === 0 && teams.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No teams found matching your search.</p>
            <Button
              onClick={clearFilters}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Teams Grid */}
        {filteredTeams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.map((team) => (
              <Card
                key={team.team_id}
                className="cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700 shadow-lg hover:shadow-xl"
              >
                <CardContent className="p-6 text-center space-y-4">
                  {/* Team Name */}
                  <h2 className="text-xl font-semibold text-white truncate">
                    {team.team_name}
                  </h2>
                  
                  {/* Coach */}
                  <p className="text-gray-400 text-sm">
                    Coach: <span className="text-blue-400">{team.coach_id || 'Unassigned'}</span>
                  </p>
                  
                  {/* Player Count */}
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {team.players?.length || 0} player{(team.players?.length || 0) !== 1 ? 's' : ''}
                  </div>

                  {/* Positions (if any players) */}
                  {team.players && team.players.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Positions: {Array.from(new Set(team.players.map(p => p.position))).join(', ')}
                    </div>
                  )}

                  {/* View Team Button */}
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-2"
                    onClick={() => handleTeamClick(team.team_id)}
                  >
                    View Team Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Teams in Database */}
        {teams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No teams found in the database.</p>
            <p className="text-gray-500 text-sm">The API returned an empty teams list.</p>
            <Button 
              onClick={refreshTeams}
              className="bg-orange-600 hover:bg-orange-700 text-white mt-4"
            >
              Refresh Teams
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllTeamsPage;