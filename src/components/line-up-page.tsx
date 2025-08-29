import { AppWindowIcon, CodeIcon } from "lucide-react"
import LastGames, { type Game, type GameResult } from './last5games';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function Tabspage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 mx-auto">
      <Tabs defaultValue="account" className="w-full">
        {/* Center tabs */}
        <TabsList className="flex justify-center border-b border-gray-200">
          <TabsTrigger
            value="lineups"
            className="relative px-4 py-2 data-[state=active]:text-orange-500 data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-orange-500"
          >
            Lineups
          </TabsTrigger>
          <TabsTrigger
            value="lastgames"
            className="relative px-4 py-2 data-[state=active]:text-orange-500 data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-orange-500"
          >
            Last 5 Games
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="relative px-4 py-2 data-[state=active]:text-orange-500 data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-orange-500"
          >
            Game Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lineups">
          <div>
            <h1>This is the lineups page</h1>
          </div>
        </TabsContent>

        <TabsContent value="lastgames">
          <div>
            <h1>This is the last 5 games tab</h1>
            <LastGames />
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div>
            <h1>This is the game summary</h1>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
