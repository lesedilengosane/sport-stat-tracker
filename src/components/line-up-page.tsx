// src/components/line-up-page.tsx
// components/Tabspage.tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./Line-up-table/LineUp-table";
import { columns, Player_details } from "@/app/analyst/column";
import { LastMatchesTable, MatchDetails as PrevMatch } from "@/components/LastMatchesTable";
import { useRouter } from "next/navigation";
import BasketballTimeline from "./EventsSummary";

interface LineupProps {
  homeLineup?: Player_details[];
  awayLineup?: Player_details[];
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  date?: string;
  homePrevMatches?: PrevMatch[];
  awayPrevMatches?: PrevMatch[];
  eventsData?:any[];

}

export function Tabspage({
  homeLineup = [],
  awayLineup = [],
  homeTeam = "Home Team",
  awayTeam = "Away Team",
  homeLogo,
  awayLogo,
  date,
  homePrevMatches = [],
  awayPrevMatches = [],
  eventsData=[],
}: LineupProps) {
  const router=useRouter()
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
            <h2 className="text-center text-white text-xl font-bold mb-6">{date}</h2>
          )}

          <div className="flex w-full gap-6">
            <div className="w-1/2">
              <DataTable columns={columns} data={homeLineup}
              onRowClick={(row)=>router.push(`/players/${row.original.id}`)}
               />
            </div>

            <div className="w-1/2">
            
              <DataTable columns={columns} data={awayLineup} onRowClick={(row)=>router.push(`/players/${row.original.id}`)}
               />
            </div>
          </div>
        </TabsContent>

        {/* Last Games Tab */}
        <TabsContent value="lastgames" className="w-full">
          <div className="flex flex-col md:flex-row gap-8 mt-6">
            <div className="w-full md:w-1/2">
              <LastMatchesTable
                data={homePrevMatches}
                title={`Last 5 games - ${homeTeam}`}
                onRowClick={(match) => router.push(`/analyst/${match.match_id}`)}
              />
            </div>
            <div className="w-full md:w-1/2">
              <LastMatchesTable
                data={awayPrevMatches}
                title={`Last 5 games - ${awayTeam}`}
                onRowClick={(match) => router.push(`/analyst/${match.match_id}`)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Game Summary Tab */}
        <TabsContent value="summary">
  <div className="text-center text-white p-8">
    <h2 className="text-xl font-bold mb-4">Game Summary</h2>
    {eventsData && eventsData.length > 0 ? (
      <BasketballTimeline events={eventsData} homeTeam={homeTeam} awayTeam={awayTeam} />
    ) : (
      <p>No events available for this match.</p>
    )}
  </div>
</TabsContent>
      </Tabs>
    </div>
  );
}
