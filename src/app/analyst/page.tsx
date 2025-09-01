// app/analyst/page.tsx
"use client";

import { Tabspage } from "@/components/line-up-page";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Player_details } from "./column";
import { useEffect, useState } from "react";

const AnalystPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Get ALL data from URL parameters
  const gameId = searchParams.get("id") || "";
  const gameDate = searchParams.get("date") || "Date not specified";
  const homeTeamName = searchParams.get("homeTeam") || "Home Team";
  const homeTeamLogo = searchParams.get("homeLogo") || "/placeholder.svg";
  const awayTeamName = searchParams.get("awayTeam") || "Away Team";
  const awayTeamLogo = searchParams.get("awayLogo") || "/placeholder.svg";
  const homeLineupParam = searchParams.get("homeLineup");
  const awayLineupParam = searchParams.get("awayLineup");

  // Parse lineup data
  const homeLineup = homeLineupParam ? JSON.parse(homeLineupParam) : [];
  const awayLineup = awayLineupParam ? JSON.parse(awayLineupParam) : [];

  // Convert lineup data to Player_details format
  const convertLineupToPlayerDetails = (
    lineup: any[],
    team: string
  ): Player_details[] => {
    return lineup.map((player, index) => {
      const nameParts = player.player?.split(" ") || ["Player", "Unknown"];
      const name = nameParts[0] || "Player";
      const surname = nameParts.slice(1).join(" ") || "Unknown";

      return {
        id: `${team}-player-${index}`,
        name: name,
        surname: surname,
        position: player.position || "Unknown",
        avatarUrl: player.avatarUrl || "/avatars/player3.jpg",
      };
    });
  };

  const homeTeamPlayers = convertLineupToPlayerDetails(homeLineup, "home");
  const awayTeamPlayers = convertLineupToPlayerDetails(awayLineup, "away");
  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-blue-900 text-white p-4 flex flex-col items-center justify-center">
        <div className="text-sm mb-2">Last Time Out: 109-113</div>

        <div className="flex items-center justify-between w-full max-w-4xl">
          {/* Home Team */}
          <div className="flex flex-col items-center">
            <Image
              src={homeTeamLogo}
              alt={`${homeTeamName} Logo`}
              width={80}
              height={80}
              className="mb-2"
            />
            <span className="text-lg font-bold font-bebas">{homeTeamName}</span>
          </div>

          {/* Date */}
          <div className="text-center">
            <div className="text-2xl font-bold">{gameDate}</div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center">
            <Image
              src={awayTeamLogo}
              alt={`${awayTeamName} Logo`}
              width={80}
              height={80}
              className="mb-2"
            />
            <span className="text-lg font-bold font-bebas">{awayTeamName}</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/analyst/tracker")}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          ADD STATS
        </button>
      </header>

      <Tabspage data={allPlayers} />
    </div>
  );
};

export default AnalystPage;
