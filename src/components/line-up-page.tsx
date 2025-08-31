// components/line-up-page.tsx
import LastGames from "./last5games";
import BasketballTimeline from "@/components/basketball-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

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
  homeLineup?: Player[];
  awayLineup?: Player[];
}

export function Tabspage({
  homeTeam = "Home Team",
  homeLogo = "/placeholder.svg",
  awayTeam = "Away Team",
  awayLogo = "/placeholder.svg",
  date = "Date not specified",
  homeLineup = [
    { position: "Guard", player: "Starting Guard" },
    { position: "Guard", player: "Starting Guard" },
    { position: "Forward", player: "Starting Forward" },
    { position: "Forward", player: "Starting Forward" },
    { position: "Center", player: "Starting Center" },
  ],
  awayLineup = [
    { position: "Guard", player: "Starting Guard" },
    { position: "Guard", player: "Starting Guard" },
    { position: "Forward", player: "Starting Forward" },
    { position: "Forward", player: "Starting Forward" },
    { position: "Center", player: "Starting Center" },
  ],
}: TabspageProps) {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-6 mx-auto">
      <Tabs defaultValue="lineups" className="w-full">
        {/* Center tabs */}
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

        <TabsContent value="lineups" className="pt-6">
          {/* Lineups Content */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-center mb-8 text-white">
              Lineups - {date}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Home Team Lineup */}
              <div className="bg-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src={homeLogo}
                    alt={`${homeTeam} Logo`}
                    width={60}
                    height={60}
                    className="mr-4"
                  />
                  <h4 className="text-xl font-bold text-white">{homeTeam}</h4>
                </div>

                <div className="space-y-3">
                  {homeLineup.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-600 p-3 rounded"
                    >
                      <span className="text-orange-400 font-bold text-sm w-16">
                        {player.position}
                      </span>
                      <span className="text-white font-medium flex-1 text-center">
                        {player.player}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Team Lineup */}
              <div className="bg-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src={awayLogo}
                    alt={`${awayTeam} Logo`}
                    width={60}
                    height={60}
                    className="mr-4"
                  />
                  <h4 className="text-xl font-bold text-white">{awayTeam}</h4>
                </div>

                <div className="space-y-3">
                  {awayLineup.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-600 p-3 rounded"
                    >
                      <span className="text-orange-400 font-bold text-sm w-16">
                        {player.position}
                      </span>
                      <span className="text-white font-medium flex-1 text-center">
                        {player.player}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lastgames">
          <div>
            <LastGames />
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div>
            <BasketballTimeline />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
