// src/components/line-up-page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./Line-up-table/LineUp-table";
import { columns, Player_details } from "@/app/analyst/column";

interface LineupProps {
  homeLineup?: Player_details[];
  awayLineup?: Player_details[];
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  date?: string;
}

export function Tabspage({
  homeLineup = [],
  awayLineup = [],
  homeTeam = "Home Team",
  awayTeam = "Away Team",
  homeLogo,
  awayLogo,
  date,
}: LineupProps) {
  return (
    <div className="flex w-full max-w-7xl flex-col gap-6 mx-auto p-6">
      <Tabs defaultValue="lineups">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="lastgames">Last 5 games</TabsTrigger>
          <TabsTrigger value="summary">Game summary</TabsTrigger>
        </TabsList>

        {/* Lineups Tab */}
        <TabsContent value="lineups" className="w-full">
          {date && (
            <h2 className="text-center text-white text-xl font-bold mb-6">
              {date}
            </h2>
          )}

          <div className="flex w-full gap-6">
            {/* Home Team */}
            <div className="w-1/2">
              <div className="flex flex-col items-center mb-4">
                {homeLogo && (
                  <img
                    src={homeLogo}
                    alt={`${homeTeam} Logo`}
                    className="w-16 h-16 mb-2 rounded-full"
                  />
                )}
                <h3 className="text-lg font-bold text-white">{homeTeam}</h3>
              </div>
              <DataTable columns={columns} data={homeLineup} />
            </div>

            {/* Away Team */}
            <div className="w-1/2">
              <div className="flex flex-col items-center mb-4">
                {awayLogo && (
                  <img
                    src={awayLogo}
                    alt={`${awayTeam} Logo`}
                    className="w-16 h-16 mb-2 rounded-full"
                  />
                )}
                <h3 className="text-lg font-bold text-white">{awayTeam}</h3>
              </div>
              <DataTable columns={columns} data={awayLineup} />
            </div>
          </div>
        </TabsContent>

        {/* Last Games Tab */}
        <TabsContent value="lastgames">
          <div className="text-center text-white p-8">
            <h2 className="text-xl font-bold">Last 5 Games</h2>
            <p className="mt-4">Game statistics will be displayed here</p>
          </div>
        </TabsContent>

        {/* Game Summary Tab */}
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
