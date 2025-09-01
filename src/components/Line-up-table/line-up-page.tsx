import { AppWindowIcon, CodeIcon } from "lucide-react"
import BasketballTimeline from "@/components/basketball-timeline"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { DataTable } from "./LineUp-table"
import { columns } from "@/app/analyst/match-lineup/column"

//pass the lineups data as props

type lineupProps={
  data:any[];
}

export function Tabspage({data}:lineupProps) {
  return (
    <div className="flex w-full max-w-7xl flex-col gap-6 mx-auto">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="lastgames">last 5 games</TabsTrigger>
          <TabsTrigger value="summary">Game summary</TabsTrigger>
        </TabsList>
<TabsContent value="lineups" className="w-full flex">
  <div className="flex w-full gap-4">
    <div className="w-1/2 border-2 border-orange-500 rounded-lg p-4">
      <DataTable columns={columns} data={data} />
    </div>
    <div className="w-1/2 border-2 border-orange-500 rounded-lg p-4">
      <DataTable columns={columns} data={data} />
    </div>
  </div>
</TabsContent>
        <TabsContent value="lastgames">
          <div>
            <h1>This is the last 5 games tab</h1>
            
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div>
            <h1>This is the game summary</h1>
            <BasketballTimeline />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
