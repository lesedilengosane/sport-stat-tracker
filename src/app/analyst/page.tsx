// app/admin-dashboard/page.tsx
import Image from "next/image";
import { Tabspage } from "@/components/Line-up-table/line-up-page";
import { Player_details } from "./column";
import Link from "next/link";

async function getData(): Promise<Player_details[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      name: "Michael",
      surname: "Jordan",
      position: "Shooting Guard",
      avatarUrl: "/avatars/player3.jpg",
    },
    {
      id: "9a12bc34",
      name: "Alice",
      surname: "Smith",
      position: "Point Guard",
      avatarUrl: "/avatars/player2.jpg",
    },
    {
      id: "c67de89f",
      name: "Bob",
      surname: "Johnson",
      position: "Center",
      avatarUrl: "/avatars/player3.jpg",
    },
    {
      id: "ef34ab56",
      name: "Carol",
      surname: "Davis",
      position: "Small Forward",
      avatarUrl: "/avatars/player4.jpg",
    },
    {
      id: "12cd34ef",
      name: "Dave",
      surname: "Wilson",
      position: "Power Forward",
      avatarUrl: "/avatars/player5.jpg",
    },
  ];
}

export default async function AdminDashboard() {
  const my_data = await getData();

  const matchup = {
    date: "12 September 2025",
    homeTeam: {
      name: "Los Angeles Lakers",
      logo: "/images/lakers-logo.png",
    },
    awayTeam: {
      name: "Golden State Warriors",
      logo: "/images/warriors-logo.png",
    },
    lastTimeout: "Last Time Out: 109-113",
  };

  // Define sample lineup data since we're not getting it from URL params
  const homeLineup = [
    { position: "PG", player: "D'Angelo Russell" },
    { position: "SG", player: "Austin Reaves" },
    { position: "SF", player: "Rui Hachimura" },
    { position: "PF", player: "LeBron James" },
    { position: "C", player: "Anthony Davis" },
  ];

  const awayLineup = [
    { position: "PG", player: "Stephen Curry" },
    { position: "SG", player: "Klay Thompson" },
    { position: "SF", player: "Andrew Wiggins" },
    { position: "PF", player: "Draymond Green" },
    { position: "C", player: "Kevon Looney" },
  ];

  // Convert lineup data to Player_details format for the data table
  const convertLineupToPlayerDetails = (
    lineup: any[],
    team: string
  ): Player_details[] => {
    return lineup.map((player, index) => {
      const nameParts = player.player.split(" ");
      const name = nameParts[0] || "Player";
      const surname = nameParts.slice(1).join(" ") || "Unknown";

      return {
        id: `${team}-player-${index}`,
        name: name,
        surname: surname,
        position: player.position,
        avatarUrl: "/avatars/player3.jpg",
      };
    });
  };

  const homeTeamPlayers = convertLineupToPlayerDetails(homeLineup, "home");
  const awayTeamPlayers = convertLineupToPlayerDetails(awayLineup, "away");

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-blue-900 text-white p-4 flex flex-col items-center justify-center">
        <div className="text-sm mb-2">{matchup.lastTimeout}</div>

        <div className="flex items-center justify-between w-full max-w-4xl">
          {/* Home Team */}
          <div className="flex flex-col items-center">
            <Image
              src={matchup.homeTeam.logo}
              alt={`${matchup.homeTeam.name} Logo`}
              width={80}
              height={80}
              className="mb-2"
            />
            <span className="text-lg font-bold font-bebas">
              {matchup.homeTeam.name}
            </span>
          </div>

          {/* Date */}
          <div className="text-center">
            <div className="text-2xl font-bold">{matchup.date}</div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center">
            <Image
              src={matchup.awayTeam.logo}
              alt={`${matchup.awayTeam.name} Logo`}
              width={80}
              height={80}
              className="mb-2"
            />
            <span className="text-lg font-bold font-bebas">
              {matchup.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Use Link instead of button with onClick for server components */}
        <Link
          href="/analyst/tracker"
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
        >
          ADD STATS
        </Link>
      </header>

      {/* Use the Tabspage component with the lineup data */}
      <Tabspage data={[...homeTeamPlayers, ...awayTeamPlayers]} />
    </div>
  );
}
