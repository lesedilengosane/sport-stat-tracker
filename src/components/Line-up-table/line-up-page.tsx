// components/Line-up-table/line-up-page.tsx

import Image from "next/image";
import LastGames from "./last5games";
import BasketballTimeline from "@/components/basketball-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DataTable } from "./LineUp-table";
import { columns } from "@/app/analyst/match-lineup/column";

interface Player {
  position: string;
  player: string;
}

interface TabspageProps {
  homeTeam?: string;
  homeLogo?: string;
  awayTeam?: string;
  awayLogo?: string;
  date?: string;
  homeLineup?: any[]; // typed properly
  awayLineup?: any[];
}

export function Tabspage({
  homeTeam = "Home Team",
  homeLogo = "/placeholder.svg",
  awayTeam = "Away Team",
  awayLogo = "/placeholder.svg",
  date = "Date not specified",
  homeLineup = [],
  awayLineup = [],
}: TabspageProps) {
  return (
    <div className="flex w-full max-w-7xl flex-col gap-6 mx-auto">
      <Tabs defaultValue="lineups" className="w-full">
        {/* Centered styled tabs */}
        <TabsList className="flex justify-center border-b border-gray-200">
          <TabsTrigger
            value="lineups"
            className="relative px-6 py-3 data-[state=active]:text-orange-500 data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-orange-500"
          >
            Lineups
          </TabsTrigger>
          <TabsTrigger
            value="lastgames"
            className="relative px-6 py-3 data-[state=active]:text-orange-500 data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-orange-500"
          >
            Last 5 Games
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="relative px-6 py-3 data-[state=active]:text-orange-500 data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-orange-500"
          >
            Game Summary
          </TabsTrigger>
        </TabsList>

        {/* Lineups Tab with DataTable */}
        <TabsContent value="lineups" className="pt-6 w-full flex">
          <div className="flex w-full gap-4">
            {/* Home Team */}
            <div className="w-1/2 border-2 border-orange-500 rounded-lg p-4">
              <div className="flex items-center justify-center mb-4">
                <Image
                  src={homeLogo}
                  alt={`${homeTeam} Logo`}
                  width={60}
                  height={60}
                  className="mr-2"
                />
                <h4 className="text-xl font-bold">{homeTeam}</h4>
              </div>
              <DataTable columns={columns} data={homeLineup} />
            </div>

            {/* Away Team */}
            <div className="w-1/2 border-2 border-orange-500 rounded-lg p-4">
              <div className="flex items-center justify-center mb-4">
                <Image
                  src={awayLogo}
                  alt={`${awayTeam} Logo`}
                  width={60}
                  height={60}
                  className="mr-2"
                />
                <h4 className="text-xl font-bold">{awayTeam}</h4>
              </div>
              <DataTable columns={columns} data={awayLineup} />
            </div>
          </div>
        </TabsContent>

        {/* Last 5 Games */}
        <TabsContent value="lastgames">
          <LastGames />
        </TabsContent>

        {/* Game Summary */}
        <TabsContent value="summary">
          <BasketballTimeline />
        </TabsContent>
      </Tabs>
    </div>
  );
}
