// src/components/line-up-page.tsx
// components/Tabspage.tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./Line-up-table/LineUp-table";
import { columns, Player_details } from "@/app/analyst/column";
import { LastMatchesTable, MatchDetails as PrevMatch } from "@/components/LastMatchesTable";
import { useRouter } from "next/navigation";
import BasketballTimeline from "./EventsSummary";
import { MatchMetaData } from "@/types/basketball";
import BasketballCourtLineup from "./CourtLineUp";
import { LastMatchesCards } from "./lastmatchesCard";

interface LineupProps {
  homeLineup?: Player_details[];
  awayLineup?: Player_details[];
  homeTeam?: string;
  homeTeamID:string;
  awayTeamID:string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  date?: string;
  homePrevMatches?: PrevMatch[];
  awayPrevMatches?: PrevMatch[];
  MatchEvents?:any[];
  metadata:MatchMetaData

}

export function Tabspage({
  homeLineup = [],
  awayLineup = [],
  homeTeam = "Home Team",
  awayTeam = "Away Team",
  homeTeamID,
  awayTeamID,
  homeLogo,
  awayLogo,
  date,
  homePrevMatches = [],
  awayPrevMatches = [],
  MatchEvents=[],
  metadata,
}: LineupProps) {
  const router=useRouter()

  console.log({
  currMatchId: metadata.match_id,
  hasEvents: !!MatchEvents,
  eventsLength: MatchEvents.length,
  sampleEvent: MatchEvents[0],
});



  //console.log(`The metadata object inside Tabs page,this is before being passed to the summary component`,JSON.stringify(metadata, null, 2))
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
  {date && <h2 className="text-center text-white text-xl font-bold mb-6">{date}</h2>}

  <BasketballCourtLineup
    homeTeam={homeTeam}
    awayTeam={awayTeam}
    homeLineup={homeLineup}       // order-preserved array: first 5 = starters
    awayLineup={awayLineup}
    onPlayerClick={(id) => router.push(`/player/${id}`)}
    courtImageUrl="/court.png"    // optional; fallback used if not present
  />
</TabsContent>
        


        {/* Last Games Tab */}
        <TabsContent value="lastgames" className="w-full">
  <div className="flex flex-col md:flex-row gap-8 mt-6">
    <div className="w-full md:w-1/2">
      <LastMatchesCards
        data={homePrevMatches}
        title={`Last 5 games - ${homeTeam}`}
        currentTeam={homeTeam}
        onMatchClick={(match) => router.push(`/analyst/${match.match_id}`)}
      />
    </div>
    <div className="w-full md:w-1/2">
      <LastMatchesCards
        data={awayPrevMatches}
        title={`Last 5 games - ${awayTeam}`}
        currentTeam={awayTeam}
        onMatchClick={(match) => router.push(`/analyst/${match.match_id}`)}
      />
    </div>
  </div>
</TabsContent>
       

        {/* Game Summary Tab */}
        <TabsContent value="summary">
  <div className="text-center text-white p-8">
    <h2 className="text-xl font-bold mb-4">Game Summary</h2>
    {MatchEvents && MatchEvents.length > 0 ? (
      <BasketballTimeline MatchEvents={MatchEvents} homeTeamName={homeTeam} awayTeamName={awayTeam} homeTeamID={homeTeamID} awayTeamID={awayTeamID} metadata={metadata}/>
    ) : (
      <p>No events available for this match.</p>
    )}
  </div>
</TabsContent>
      </Tabs>
    </div>
  );
}
