// app/admin-dashboard/page.tsx (or wherever your dashboard lives)

import Image from "next/image";
import { Tabspage } from "@/components/Line-up-table/line-up-page";
import { columns, Player_details } from "./match-lineup/column";

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

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
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

        <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
          ADD STATS
        </button>
      </header>

      {/* Body Section (Tabs + Tables) */}
      <main className="px-4">
        <Tabspage data={my_data} />
      </main>
    </div>
  );
}
