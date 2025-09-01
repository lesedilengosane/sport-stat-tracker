// app/analyst/page.tsx
"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

const Admindashboard = () => {
  const searchParams = useSearchParams();

  // Get team data from URL parameters
  const homeTeamName = searchParams.get("homeTeam") || "Home Team";
  const homeTeamLogo = searchParams.get("homeLogo") || "/placeholder.svg";
  const awayTeamName = searchParams.get("awayTeam") || "Away Team";
  const awayTeamLogo = searchParams.get("awayLogo") || "/placeholder.svg";
  const gameDate = searchParams.get("date") || "Date not specified";

  // Parse lineup data
  const homeLineupParam = searchParams.get("homeLineup");
  const awayLineupParam = searchParams.get("awayLineup");

  const homeLineup = homeLineupParam
    ? JSON.parse(homeLineupParam)
    : [
        { position: "PG", player: "Point Guard" },
        { position: "SG", player: "Shooting Guard" },
        { position: "SF", player: "Small Forward" },
        { position: "PF", player: "Power Forward" },
        { position: "C", player: "Center" },
      ];

  const awayLineup = awayLineupParam
    ? JSON.parse(awayLineupParam)
    : [
        { position: "PG", player: "Point Guard" },
        { position: "SG", player: "Shooting Guard" },
        { position: "SF", player: "Small Forward" },
        { position: "PF", player: "Power Forward" },
        { position: "C", player: "Center" },
      ];

  return (
    <div>
      <header className="bg-blue-900 text-white p-4 flex flex-col items-center justify-center">
        {/* Top Row: Last Timeout */}
        <div className="text-sm mb-2">Last Time Out: 109-113</div>

        {/* Main Matchup Row */}
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

          {/* Date and Sections */}
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

        {/* Add Stats Button */}
        <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
          ADD STATS
        </button>
      </header>
    </div>
  );
};

export default Admindashboard;
