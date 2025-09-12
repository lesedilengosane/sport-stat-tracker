// app/analyst/page.tsx
"use client";

import { Tabspage } from "@/components/line-up-page";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Player_details } from "../column";
import { useEffect, useState } from "react";
import { apiClient } from "@/app/utils/apiClient";

const AnalystPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Get data from URL parameters
  const gameId = searchParams.get("id") || "";
  const gameDate = searchParams.get("date") || "Date not specified";
  const homeTeamId = searchParams.get("homeTeamId") || "";
  const awayTeamId = searchParams.get("awayTeamId") || "";
  const homeTeamName = searchParams.get("homeTeam") || "";
  const homeTeamLogo = searchParams.get("homeLogo") || "/placeholder.svg";
  const awayTeamName = searchParams.get("awayTeam") || "";
  const awayTeamLogo = searchParams.get("awayLogo") || "/placeholder.svg";
  const homeLineupParam = searchParams.get("homeLineup");
  const awayLineupParam = searchParams.get("awayLineup");

  const [homePlayers, setHomePlayers] = useState<Player_details[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player_details[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log("Home Team ID:", homeTeamId);
        console.log("Away Team ID:", awayTeamId);

        // Parse lineup data
        const homeLineup = homeLineupParam ? JSON.parse(homeLineupParam) : [];
        const awayLineup = awayLineupParam ? JSON.parse(awayLineupParam) : [];

        // Create fallback players from URL data
        const createFallbackPlayers = (
          lineup: any[],
          team: string
        ): Player_details[] => {
          return lineup.map((player, index) => {
            const nameParts = player.player?.split(" ") || [
              "Player",
              "Unknown",
            ];
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

        const homeFallback = createFallbackPlayers(homeLineup, "home");
        const awayFallback = createFallbackPlayers(awayLineup, "away");

        if (!homeTeamId || !awayTeamId) {
          console.log("Using fallback lineup data");
          setHomePlayers(homeFallback);
          setAwayPlayers(awayFallback);
          setIsLoading(false);
          return;
        }

        // Only fetch for the two teams we need
        const playersMap = await apiClient.getPlayersByTeamIds([
          homeTeamId,
          awayTeamId,
        ]);

        console.log("Players Map:", playersMap);
        console.log("Home team players from API:", playersMap.get(homeTeamId));
        console.log("Away team players from API:", playersMap.get(awayTeamId));

        // Convert API data to the format your DataTable expects
        const formatApiPlayers = (players: any[]): Player_details[] => {
          return players.map((player, index) => ({
            id: player.id || `player-${index}`,
            name: player.first_name || player.name || "Player",
            surname: player.last_name || player.surname || "Unknown",
            position: player.position || "Unknown",
            avatarUrl:
              player.avatar_url || player.avatarUrl || "/avatars/player3.jpg",
          }));
        };

        const homeApiPlayers = playersMap.get(homeTeamId) || [];
        const awayApiPlayers = playersMap.get(awayTeamId) || [];

        const homeFormatted = formatApiPlayers(homeApiPlayers);
        const awayFormatted = formatApiPlayers(awayApiPlayers);

        console.log("Formatted home players:", homeFormatted);
        console.log("Formatted away players:", awayFormatted);

        // Use API data if available, otherwise use fallback
        setHomePlayers(homeFormatted.length > 0 ? homeFormatted : homeFallback);
        setAwayPlayers(awayFormatted.length > 0 ? awayFormatted : awayFallback);
      } catch (err) {
        console.error("Error fetching players:", err);
        // Fallback to URL data
        const homeLineup = homeLineupParam ? JSON.parse(homeLineupParam) : [];
        const awayLineup = awayLineupParam ? JSON.parse(awayLineupParam) : [];

        const createFallbackPlayers = (
          lineup: any[],
          team: string
        ): Player_details[] => {
          return lineup.map((player, index) => {
            const nameParts = player.player?.split(" ") || [
              "Player",
              "Unknown",
            ];
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

        setHomePlayers(createFallbackPlayers(homeLineup, "home"));
        setAwayPlayers(createFallbackPlayers(awayLineup, "away"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [homeTeamId, awayTeamId, homeLineupParam, awayLineupParam]); // Only depend on URL params

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  console.log("Final Home Players to display:", homePlayers);
  console.log("Final Away Players to display:", awayPlayers);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <header className="bg-blue-900 text-white p-4 flex flex-col items-center justify-center rounded-lg mb-6">
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
          onClick={() => {
            // Pass ALL game data as URL parameters to the tracker
            const queryParams = new URLSearchParams({
              gameId: gameId,
              date: gameDate,
              homeTeamId: homeTeamId,
              awayTeamId: awayTeamId,
              homeTeam: homeTeamName,
              awayTeam: awayTeamName,
              homeLogo: homeTeamLogo,
              awayLogo: awayTeamLogo,
              homeLineup: JSON.stringify(homePlayers),
              awayLineup: JSON.stringify(awayPlayers),
            }).toString();

            router.push(`/analyst/tracker?${queryParams}`);
          }}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          ADD STATS
        </button>
      </header>

      <Tabspage
        // homeTeam={homeTeamName}
        // homeLogo={homeTeamLogo}
        // awayTeam={awayTeamName}
        // awayLogo={awayTeamLogo}
        // date={gameDate}
        homeLineup={homePlayers}
        awayLineup={awayPlayers}
      />
    </div>
  );
};

export default AnalystPage;
