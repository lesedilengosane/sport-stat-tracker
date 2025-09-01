// src/components/line-up-page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./Line-up-table/LineUp-table";
import { columns, Player_details } from "@/app/analyst/column";

interface lineupProps {
  data: Player_details[];
}

export function Tabspage({ data }: lineupProps) {
  const homeTeamPlayers = data.filter((player) => player.id.includes("home"));
  const awayTeamPlayers = data.filter((player) => player.id.includes("away"));

  return (
    <div className="flex w-full max-w-7xl flex-col gap-6 mx-auto p-6">
      <Tabs defaultValue="lineups">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="lastgames">Last 5 games</TabsTrigger>
          <TabsTrigger value="summary">Game summary</TabsTrigger>
        </TabsList>

        <TabsContent value="lineups" className="w-full">
          <div className="flex w-full gap-6">
            <div className="w-1/2">
              <h3 className="text-lg font-bold mb-4 text-center text-white">
                Home Team
              </h3>
              <DataTable columns={columns} data={homeTeamPlayers} />
            </div>
            <div className="w-1/2">
              <h3 className="text-lg font-bold mb-4 text-center text-white">
                Away Team
              </h3>
              <DataTable columns={columns} data={awayTeamPlayers} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lastgames">
          <div className="text-center text-white p-8">
            <h2 className="text-xl font-bold">Last 5 Games</h2>
            <p className="mt-4">Game statistics will be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="text-center text-white p-8">
            <h2 className="text-xl font-bold">Game Summary</h2>
            <p className="mt-4">Game summary will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
