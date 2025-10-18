// app/analyst/[matchid]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MatchDetails from "./MatchDetails";
import { MatchMetaData } from "@/types/basketball";

interface PlayerDetails {
  id: string;
  name: string;
  surname: string;
  position: string;
  avatarUrl: string;
}

interface LineupPlayer {
  player_id: string;
  position: string;
  player?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface MatchData {
  Teams: any[];
  lineups: {
    homeLineup: LineupPlayer[];
    awayLineup: LineupPlayer[];
  };
  homePrevMatches: any[];
  awayPrevMatches: any[];
  MatchEvents: any[];
  matchMetaData: MatchMetaData;
}

type MatchPagePropsCustom = {
  params: { matchid: string };
};

export default function MatchPage({ params }: MatchPagePropsCustom) {
  const { matchid } = params;
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

useEffect(() => {
  if (!matchid) return;

  const cached = sessionStorage.getItem(`matchData-${matchid}`);
  if (cached) {
    setMatchData(JSON.parse(cached));
    setIsLoading(false); // cached → no loading needed
    return;
  }

  const fetchMatchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/analyst/${matchid}`);
      if (!res.ok) throw new Error("Failed to fetch match data");
      const data: MatchData = await res.json();
      
      setMatchData(data);

      // ✅ cache it so next time we don't fetch again
      sessionStorage.setItem(`matchData-${matchid}`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  fetchMatchData();
}, [matchid]);


  // ---------------- Loading Spinner ----------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          {/* Bouncing basketball */}
          <div className="mx-auto mb-6 w-12 h-12 rounded-full bg-orange-500 relative animate-bounce-ball"></div>
          <h1 className="text-2xl font-bold text-orange-500 mb-2">
            Loading match details...
          </h1>
          <p className="text-gray-300">
            Please wait while we fetch all match information. This should only take a few seconds.
          </p>
        </div>

        <style jsx>{`
          @keyframes bounce-ball {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-40px); }
          }
          .animate-bounce-ball {
            animation: bounce-ball 0.6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // ---------------- Error Handling ----------------
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        Error loading match data: {error}
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        No match data available.
      </div>
    );
  }

  // ---------------- Map Lineups ----------------
  const homeTeamId = matchData.Teams[0]?.team_id;
  const awayTeamId = matchData.Teams.find((t) => t.team_id !== homeTeamId)?.team_id;

  const mapLineup = (lineup: any[], team: string): PlayerDetails[] =>
    lineup.map((l, idx) => ({
      id: l.player_id || `${team}-player-${idx}`,
      name: l.player?.first_name || "Player",
      surname: l.player?.last_name || "Unknown",
      position: l.position || "Unknown",
      avatarUrl: l.player?.avatar_url || "/avatars/player3.jpg",
    }));

  const homePlayers = mapLineup(matchData.lineups.homeLineup || [], "home");
  const awayPlayers = mapLineup(matchData.lineups.awayLineup || [], "away");

  // ---------------- Render MatchDetails ----------------
  return (
    <MatchDetails
      matchId={matchid}
      homePlayers={homePlayers}
      awayPlayers={awayPlayers}
      homeTeam={matchData.Teams.find((t) => t.team_id === homeTeamId)}
      awayTeam={matchData.Teams.find((t) => t.team_id === awayTeamId)}
      homePrevMatches={matchData.homePrevMatches}
      awayPrevMatches={matchData.awayPrevMatches}
      MatchEvents={matchData.MatchEvents}
      metadata={matchData.matchMetaData}
    />
  );
}

