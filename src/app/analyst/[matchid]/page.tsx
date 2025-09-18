// app/analyst/page.tsx
"use client";

import { Tabspage } from "@/components/line-up-page";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Player_details } from "../column";
import { use, useEffect, useState } from "react";
import * as React from 'react'
import { apiClient } from "@/app/utils/apiClient";


export default async function MatchPage({ params, }:{params:{matchid:string}}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const {matchid}=await params
  

  const [homePlayers, setHomePlayers] = useState<Player_details[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player_details[]>([]);
  const [homeTeam, setHomeTeam] = useState<any>(null);
  const [awayTeam, setAwayTeam] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const res = await fetch(`/api/analyst/${matchid}`);
        if (!res.ok) throw new Error("Failed to fetch match data");
        const data = await res.json();

        console.log("API response:", data);

        setMatch(data.match);

        // Extract Teams
        const home = data.Teams.find(
          (t: any) => t.team_id === data.match.home_team_id
        );
        const away = data.Teams.find(
          (t: any) => t.team_id === data.match.away_team_id
        );
        setHomeTeam(home);
        setAwayTeam(away);

        // Extract Lineups and convert into Player_details[]
        const formatLineup = (lineup: any[], team: string): Player_details[] =>
          lineup.map((player: any, idx: number) => ({
            id: `${team}-${player.player_id || idx}`,
            name: player.player?.first_name || "Player",
            surname: player.player?.last_name || "Unknown",
            position: player.position || "Unknown",
            avatarUrl: "/avatars/player3.jpg", // you can replace with player.avatar_url if stored
          }));

        const homeLineup = data.lineups.filter(
          (l: any) => l.team_id === data.match.home_team_id
        );
        const awayLineup = data.lineups.filter(
          (l: any) => l.team_id === data.match.away_team_id
        );

        setHomePlayers(formatLineup(homeLineup, "home"));
        setAwayPlayers(formatLineup(awayLineup, "away"));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchData();
  }, [params.matchid]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!match || !homeTeam || !awayTeam) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Match not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <header className="bg-blue-900 text-white p-4 flex flex-col items-center justify-center rounded-lg mb-6">
        {/* Example previous result — you can swap this with data.homePrevMatches[0] */}
        <div className="text-sm mb-2">
          Last Time Out: {homeTeam.team_name} vs {awayTeam.team_name}
        </div>

        <div className="flex items-center justify-between w-full max-w-4xl">
          {/* Home Team */}
          <div className="flex flex-col items-center">
            <Image
              src={homeTeam.icon_url || "/placeholder.svg"}
              alt={`${homeTeam.team_name} Logo`}
              width={80}
              height={80}
              className="mb-2"
            />
            <span className="text-lg font-bold font-bebas">
              {homeTeam.team_name}
            </span>
          </div>

          {/* Date */}
          <div className="text-center">
            <div className="text-2xl font-bold">
              {new Date(match.match_date).toLocaleDateString()}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center">
            <Image
              src={awayTeam.icon_url || "/placeholder.svg"}
              alt={`${awayTeam.team_name} Logo`}
              width={80}
              height={80}
              className="mb-2"
            />
            <span className="text-lg font-bold font-bebas">
              {awayTeam.team_name}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            const queryParams = new URLSearchParams({
              gameId: match.match_id,
              date: match.match_date,
              homeTeamId: homeTeam.team_id,
              awayTeamId: awayTeam.team_id,
              homeTeam: homeTeam.team_name,
              awayTeam: awayTeam.team_name,
              homeLogo: homeTeam.icon_url || "/placeholder.svg",
              awayLogo: awayTeam.icon_url || "/placeholder.svg",
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

      <Tabspage homeLineup={homePlayers} awayLineup={awayPlayers} />
    </div>
  );
}