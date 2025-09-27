// app/analyst/[matchid]/page.tsx
import MatchDetails from "./MatchDetails";

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
}

type MatchPagePropsCustom = {
  params: { matchid: string };
};

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchid: string }>;
}) {
  const { matchid } = await params;
  console.log(`This is after extracting matchid---matchID : ${matchid}\n`)

  try {
    console.log(`This is before fetching data---matchID : ${matchid}`)
    const res = await fetch(`http://localhost:3000/api/analyst/${matchid}`);
    if (!res.ok) throw new Error("Failed to fetch match data");
    const data: MatchData = await res.json();
    console.log(`This is if the data was fetched successfully : ${matchid}`)
    // Identify home and away team IDs
    const homeTeamId = data.Teams[0]?.team_id;
    const awayTeamId = data.Teams.find((t) => t.team_id !== homeTeamId)?.team_id;

    // Split lineups for each team
    const homeLineupRaw = data.lineups.homeLineup || [];
  const awayLineupRaw = data.lineups.awayLineup || [];;

    // Map lineups to PlayerDetails objects
    const mapLineup = (lineup: any[], team: string): PlayerDetails[] =>
      lineup.map((l, idx) => ({
        id: l.player_id || `${team}-player-${idx}`,
        name: l.player?.first_name || "Player",
        surname: l.player?.last_name || "Unknown",
        position: l.position || "Unknown",
        avatarUrl: l.player?.avatar_url || "/avatars/player3.jpg", // fallback
      }));

    const homePlayers = mapLineup(homeLineupRaw, "home");
    const awayPlayers = mapLineup(awayLineupRaw, "away");

    return (
      <MatchDetails
        matchId={matchid}
        homePlayers={homePlayers}
        awayPlayers={awayPlayers}
        homeTeam={data.Teams.find((t) => t.team_id === homeTeamId)}
        awayTeam={data.Teams.find((t) => t.team_id === awayTeamId)}
        homePrevMatches={data.homePrevMatches}
        awayPrevMatches={data.awayPrevMatches}
      />
    );
  } catch (err) {
    return <div className="min-h-screen bg-gray-900 text-white p-4">Error loading match data</div>;
  }
}
