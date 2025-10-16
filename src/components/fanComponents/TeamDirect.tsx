"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/teams");
        if (!res.ok){
            console.log("No response")
            console.error("No error")
        };
        const data = await res.json();

        // Expecting data = [{ team_id, team_name, coach_id, players: [...] }]
        setTeams(data);
      } catch (err: any) {
        console.error("Error fetching teams:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-300">Loading teams...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>;
  if (teams.length === 0) return <p className="text-center mt-10 text-gray-400">No teams found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <h1 className="text-3xl font-bold text-center text-orange-400 mb-8">All Teams</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {teams.map((team) => (
          <Card
            key={team.team_id}
            className="cursor-pointer hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700 shadow-lg"
          >
            <CardContent className="p-6 text-center space-y-3">
              <h2 className="text-xl font-semibold text-white">{team.team_name}</h2>
              <p className="text-gray-400">
                Coach: <span className="text-blue-400">{team.coach_id}</span>
              </p>

              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white mt-4"
                onClick={() => router.push(`/team/${team.team_id}`)}
              >
                View Team
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
