"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient"
import TeamDetails from "./TeamDetails";
import TeamSummary from "./TeamSummary";
import PlayerStats from "./PlayerStats";

export interface TeamStatsData {
  team_id: string;
  team_name: string;
  num_players: number;
  last_5_matches: any; // JSON from API
  player_stats: any;   // JSON from API
}

interface TeamStatsProps {
  authUserId?: string;
  teamId?: string;
}

export default function TeamStats({ authUserId, teamId }: TeamStatsProps) {
  const [teamStats, setTeamStats] = useState<TeamStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamStats() {
      setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        const authUserId = session?.user.id;
      try {
        const res = await fetch("/api/TeamStats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth_user_id: authUserId, team_id: teamId }),
        });
        const data = await res.json();
        setTeamStats(data);
      } catch (err) {
        console.error("Error fetching team stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamStats();
  }, [authUserId, teamId]);

 return (
    
  <div className="team-stats-root">
    <TeamDetails 
      teamName={teamStats?.team_name || "Unknown Team"} 
      numPlayers={teamStats?.num_players ?? "-"} 
    />

      {/* child component for team summary stats */}
    <div id="team-summary" className="team-summary" style={{ marginTop: "20px" }}>
        <TeamSummary lastFiveGames={teamStats?.last_5_matches || []} />
    </div>

    <div id="player-stats" className="player-stats" style={{ marginTop: "20px" }}>
        <PlayerStats playerStats={teamStats?.player_stats || []} />
    </div>
  </div>
);
}
