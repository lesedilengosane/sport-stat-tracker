// app/analyst/[matchid]/MatchDetails.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tabspage } from "@/components/line-up-page";
import { MatchMetaData } from "@/types/basketball";
import { useAuth } from "@/app/context/AuthContext";
import { useMatches } from "@/app/context/MatchesContext";



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
  home_team: { team_name: string; icon_url?: string };
  away_team: { team_name: string; icon_url?: string };
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
  homePrevMatches?: any[];
  awayPrevMatches?: any[];
  MatchEvents?:any[];
  metadata:MatchMetaData
}

export default function MatchDetails({
  matchId,
  homePlayers,
  awayPlayers,
  homeTeam,
  awayTeam,
  homePrevMatches,
  awayPrevMatches,
  MatchEvents,
  metadata
}: MatchDetailsProps) {
  const router = useRouter();
  const [homeLineup, setHomeLineup] = useState<PlayerDetails[]>(homePlayers);
  const [awayLineup, setAwayLineup] = useState<PlayerDetails[]>(awayPlayers);
  const {user}=useAuth()
  const [isLoading,setIsLoading]=useState(true)
  const {allGames}=useMatches()
  const currGame = allGames.find(
  (game) => game.match_id === matchId
);

 

  return (
    <div className="relative min-h-screen">
      {/* Sticky Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background/gameCard.jpeg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        {/* Glassy overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>
      </div>

      {/* Page Content */}
      <div className="relative z-10 p-4">
        {/* Glassy Header */}
        <header className="bg-white/10   p-6 flex flex-col items-center justify-center rounded-xl mb-6 shadow-lg shadow-orange-500/10">
          <div className="flex items-center justify-between w-full max-w-4xl">
            {/* Home Team */}
            <div className="flex flex-col items-center">
              <Image
                src={homeTeam.icon_url || "/placeholder.svg"}
                alt={homeTeam.team_name}
                width={80}
                height={80}
                className="mb-2 rounded-full border border-white/20 shadow-md"
              />
              <span className="text-lg font-bold font-bebas text-black drop-shadow">
                {homeTeam.team_name}
              </span>
            </div>

            {/* Match Date */}
            <div className="text-center text-black drop-shadow">
  {homePrevMatches && homePrevMatches[0]?.match_date ? (
    <>
      {/* Date line */}
      <div className="text-2xl font-bold">
        {new Date(homePrevMatches[0].match_date).toLocaleDateString("en-ZA", {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Africa/Johannesburg",
        })}
      </div>
      {/* Time line */}
      <div className="text-lg font-medium text-gray-700">
        {new Date(homePrevMatches[0].match_date).toLocaleTimeString("en-ZA", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Africa/Johannesburg",
        })}
      </div>
    </>
  ) : (
    "Date not specified"
  )}
</div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center">
              <Image
                src={awayTeam.icon_url || "/placeholder.svg"}
                alt={awayTeam.team_name}
                width={80}
                height={80}
                className="mb-2 rounded-full border border-white/20 shadow-md"
              />
              <span className="text-lg font-bold font-bebas text-black drop-shadow">
                {awayTeam.team_name}
              </span>
            </div>
          </div>

          {/* Add Stats Button renders when the game is booked by You and not completed */}
          { currGame?.booked==true && currGame.analyst==user?.auth_user_id && !currGame.completed&&(
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
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    Open Tracker
  </button>
)}
        
        </header>

        {/* Lineups Tab Page */}
        <div className="bg-white/5 backdrop-blur-xl border border-orange-400/20 rounded-xl p-4 shadow-lg shadow-orange-500/10">
          <Tabspage
  homeLineup={homeLineup}
  awayLineup={awayLineup}
  homeTeam={homeTeam.team_name}
  homeTeamID={homeTeam.team_id}
  awayTeamID={awayTeam.team_id}
  awayTeam={awayTeam.team_name}
  homeLogo={homeTeam.icon_url}
  awayLogo={awayTeam.icon_url}
  homePrevMatches={homePrevMatches}
  awayPrevMatches={awayPrevMatches}
  eventsData={MatchEvents}
  metadata={metadata}
/>
        </div>
      </div>
    </div>
  );
}

