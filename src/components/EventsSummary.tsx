
import { Target, AlertTriangle, Clock, RotateCcw, Trophy, Users, Award, Activity } from "lucide-react";
import { MatchMetaData } from "@/types/basketball";

export interface BasketballEvent {
  id: string;
  match_id: string;
  timestamp: string;
  team_id: string;
  action: "+1 FT"| "+2 FG" | "+3 FG" | "Reb" | "Ast" | "Stl"| "Blk"|"TO"|"Foul";
  points: number | null;
  player_id: string | null;
  players: {
    player_id: string;
    first_name: string;
    last_name: string;
    position: string;
    jersey_number: number;
    team_id: string;
  } | null;
}

const getEventIcon = (action: BasketballEvent["action"]) => {
  switch (action) {
    case "+1 FT":
    case "+2 FG":
    case "+3 FG":
      return <Target className="w-4 h-4 text-green-600" />;
    case "Foul":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "Reb":
      return <Award className="w-4 h-4 text-blue-500" />;
    case "Ast":
      return <Users className="w-4 h-4 text-purple-500" />;
    case "Stl":
      return <Activity className="w-4 h-4 text-yellow-500" />;
    case "Blk":
      return <Trophy className="w-4 h-4 text-indigo-500" />;
    case "TO":
      return <RotateCcw className="w-4 h-4 text-gray-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getEventColor = (action: BasketballEvent["action"]) => {
  switch (action) {
    case "+1 FT":
    case "+2 FG":
    case "+3 FG":
      return "text-green-400";
    case "Foul":
      return "text-yellow-400";
    case "Reb":
      return "text-blue-400";
    case "Ast":
      return "text-cyan-400";
    case "Stl":
      return "text-purple-400";
    case "Blk":
      return "text-indigo-400";
    case "TO":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

interface TimelineProps {
  events: BasketballEvent[];
  homeTeamID: string;
  awayTeamID: string;
  homeTeamName?: string;
  awayTeamName?: string;
  metadata?:MatchMetaData
}

export default function BasketballTimeline({
  events,
  homeTeamName,
  awayTeamName,
  homeTeamID,
  awayTeamID,
  metadata,
}: TimelineProps) {
  const sortedEvents = events.sort(
    (a, b) =>
      new Date(`1970/01/01 ${b.timestamp}`).getTime() -
      new Date(`1970/01/01 ${a.timestamp}`).getTime()
  );
  //console.log(`The metadata object inside the summary component ->\n ${metadata}`)

  return (
    <div className="w-full max-w-5xl mx-auto rounded-lg p-8 border border-gray-200">
      {/* Game Header */}
      <div className="text-center mb-6">
        <div className="text-gray-900 text-lg font-bold mb-2">FT 108-112</div>
        <div className="text-gray-600 text-sm">
          {homeTeamName} vs {awayTeamName}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Center vertical line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-orange-500 transform -translate-x-1/2 z-0"></div>

        <div className="space-y-6">
          {sortedEvents.map((event) => {
            const isHome = event.team_id === homeTeamID; // ✅ use actual homeTeamID
            const playerName = event.players
              ? `${event.players.first_name} ${event.players.last_name}`
              : "";

            return (
              <div key={event.id} className="grid grid-cols-3 items-center relative">
                {/* Home event */}
                <div className="flex justify-end pr-4">
                  {isHome && (
                    <div className="flex items-center space-x-3 text-left max-w-[250px]">
                      <div className={`${getEventColor(event.action)} flex-shrink-0`}>
                        {getEventIcon(event.action)}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {playerName && <span className="text-gray-600">{playerName} </span>}
                          <span className={getEventColor(event.action)}>{event.action}</span>
                          {event.points && <span className="ml-2 text-green-600 font-bold">+{event.points}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Center timestamp and dot */}
                <div className="flex justify-center relative z-10">
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-500 z-20"></div>
                  <div className="bg-white px-2 rounded text-gray-700 text-sm font-mono z-30 relative">
                    {event.timestamp}
                  </div>
                </div>

                {/* Away event */}
                <div className="flex justify-start pl-4">
                  {!isHome && (
                    <div className="flex items-center space-x-3 text-right max-w-[250px]">
                      <div>
                        <div className="font-semibold">
                          {playerName && <span className="text-gray-600">{playerName} </span>}
                          <span className={getEventColor(event.action)}>{event.action}</span>
                          {event.points && <span className="ml-2 text-green-600 font-bold">+{event.points}</span>}
                        </div>
                      </div>
                      <div className={`${getEventColor(event.action)} flex-shrink-0`}>
                        {getEventIcon(event.action)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Score */}
      <div className="text-center mt-6 pt-4 border-t border-gray-300">
        <div className="text-gray-600 text-sm">Final Score</div>
        <div className="text-gray-900 text-xl font-bold">
          {homeTeamName} {metadata?.home_score ?? 0} - {metadata?.away_score ?? 0} {awayTeamName}
        </div>
      </div>
    </div>
  );
}
