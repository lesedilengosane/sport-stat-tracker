
import { AppWindowIcon, CodeIcon } from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
export function Tabspage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="lastgames">last 5 games</TabsTrigger>
          <TabsTrigger value="summary">Game summary</TabsTrigger>
        </TabsList>
        <TabsContent value="lineups">
            <div>

                <h1>This is the lineups page</h1>
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
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

