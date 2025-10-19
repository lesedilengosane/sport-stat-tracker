// src\app\coach\[matchid]\page.tsx
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
  params: Promise<{ matchid: string }>;
};

async function getMatchData(matchid: string): Promise<MatchData> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/coach/${matchid}`, {
    cache: "no-store", // This is the reason game events where not appearing for recently recorded games,I was caching responses here so stale data was persisiting
  });

  if (!res.ok) throw new Error("Failed to fetch match data");
  return res.json();
}

export default async function MatchPage({ params }: MatchPagePropsCustom) {
  const { matchid } = await params;

  let matchData: MatchData;

  try {
    matchData = await getMatchData(matchid);
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        Error loading match data:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
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
  const awayTeamId = matchData.Teams.find(
    (t) => t.team_id !== homeTeamId
  )?.team_id;

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
