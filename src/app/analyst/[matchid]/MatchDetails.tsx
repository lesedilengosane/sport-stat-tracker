// app/analyst/[matchid]/MatchDetails.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tabspage } from "@/components/line-up-page";

interface PlayerDetails {
  id: string;
  name: string;
  surname: string;
  position: string;
  avatarUrl: string;
}
interface Match {
  match_id: string
  match_date: string
  location: string | null
  home_score: number
  away_score: number
  status: string
  home_team_id: string
  away_team_id: string
}


interface Team {
  team_id: string;
  team_name: string;
  coach_id?: string;
  icon_url?: string;
}

interface MatchDetailsProps {
  matchId: string;
  homePlayers: PlayerDetails[];
  awayPlayers: PlayerDetails[];
  homeTeam: Team;
  awayTeam: Team;
  homePrevMatches: Match[];
  awayPrevMatches: Match[];
}

export default function MatchDetails({
  matchId,
  homePlayers,
  awayPlayers,
  homeTeam,
  awayTeam,
  homePrevMatches,
  awayPrevMatches,
}: MatchDetailsProps) {
  const router = useRouter();
  const [homeLineup, setHomeLineup] = useState<PlayerDetails[]>(homePlayers);
  const [awayLineup, setAwayLineup] = useState<PlayerDetails[]>(awayPlayers);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <header className="bg-blue-900 text-white p-4 flex flex-col items-center justify-center rounded-lg mb-6">
        
        <div className="flex items-center justify-between w-full max-w-4xl">
          <div className="flex flex-col items-center">
            <Image src={homeTeam.icon_url || "/placeholder.svg"} alt={homeTeam.team_name} width={80} height={80} className="mb-2" />
            <span className="text-lg font-bold font-bebas">{homeTeam.team_name}</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{homePrevMatches[0]?.match_date || "Date not specified"}</div>
          </div>
          <div className="flex flex-col items-center">
            <Image src={awayTeam.icon_url || "/placeholder.svg"} alt={awayTeam.team_name} width={80} height={80} className="mb-2" />
            <span className="text-lg font-bold font-bebas">{awayTeam.team_name}</span>
          </div>
        </div>

        <button
          onClick={() => {
            const queryParams = new URLSearchParams({
              gameId: matchId,
              homeTeamId: homeTeam.team_id,
              awayTeamId: awayTeam.team_id,
              homeTeam: homeTeam.team_name,
              awayTeam: awayTeam.team_name,
              homeLogo: homeTeam.icon_url || "/placeholder.svg",
              awayLogo: awayTeam.icon_url || "/placeholder.svg",
              homeLineup: JSON.stringify(homeLineup),
              awayLineup: JSON.stringify(awayLineup),
            }).toString();

            router.push(`/analyst/${matchId}/tracker?${queryParams}`);
          }}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          ADD STATS
        </button>
      </header>

      <Tabspage homeLineup={homeLineup} awayLineup={awayLineup} />
    </div>
  );
}
