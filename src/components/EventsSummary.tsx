import {
  Target,
  AlertTriangle,
  Clock,
  RotateCcw,
  Trophy,
  Users,
  Award,
  Activity,
} from "lucide-react";
import { MatchMetaData } from "@/types/basketball";

export interface BasketballEvent {
  id: string;
  match_id: string;
  timestamp: string;
  team_id: string;
  action:
    | "+1 FT"
    | "+2 FG"
    | "+3 FG"
    | "Reb"
    | "Ast"
    | "Stl"
    | "Blk"
    | "TO"
    | "Foul";
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
      return <Target className="w-4 h-4 text-green-400" />;
    case "Foul":
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case "Reb":
      return <Award className="w-4 h-4 text-blue-400" />;
    case "Ast":
      return <Users className="w-4 h-4 text-cyan-400" />;
    case "Stl":
      return <Activity className="w-4 h-4 text-purple-400" />;
    case "Blk":
      return <Trophy className="w-4 h-4 text-indigo-400" />;
    case "TO":
      return <RotateCcw className="w-4 h-4 text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

// 🕒 Helper: format timestamps to look nice
const formatTimestamp = (timestamp: string) => {
  const [h, m, s] = timestamp.split(":").map(Number);
  const mins = h * 60 + m;
  return `${mins}m ${s.toString().padStart(2, "0")}s`;
};

interface TimelineProps {
  MatchEvents: BasketballEvent[];
  homeTeamID: string;
  awayTeamID: string;
  homeTeamName?: string;
  awayTeamName?: string;
  metadata?: MatchMetaData;
}

export default function BasketballTimeline({
  MatchEvents,
  homeTeamName,
  awayTeamName,
  homeTeamID,
  awayTeamID,
  metadata,
}: TimelineProps) {
  const sortedEvents = MatchEvents.sort(
    (a, b) =>
      new Date(`1970/01/01 ${b.timestamp}`).getTime() -
      new Date(`1970/01/01 ${a.timestamp}`).getTime()
  );

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl p-8 bg-gray-900 border border-gray-700 shadow-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-orange-400 mb-1">
          Match Timeline
        </h2>
        <p className="text-gray-400 text-sm">
          {homeTeamName} vs {awayTeamName}
        </p>
      </div>

      {/* Timeline container */}
      <div className="relative">
        {/* vertical dotted line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dotted border-gray-600 transform -translate-x-1/2 z-0"></div>

        <div className="space-y-10">
          {sortedEvents.map((event, idx) => {
            const isHome = event.team_id === homeTeamID;
            const playerName = event.players
              ? `${event.players.first_name} ${event.players.last_name}`
              : "";
            const formattedTime = formatTimestamp(event.timestamp);

            return (
              <div key={event.id} className="grid grid-cols-3 items-center relative">
                {/* Left Side (Home) */}
                <div className="flex justify-end pr-4">
                  {isHome && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 max-w-[260px] shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3">
                        <div>{getEventIcon(event.action)}</div>
                        <div>
                          <div className="text-sm font-semibold text-gray-100">
                            {playerName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {event.action}
                            {event.points && (
                              <span className="ml-1 text-green-400 font-semibold">
                                +{event.points}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Timestamp */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="w-3 h-3 rounded-full bg-orange-500 z-20"></div>
                  <div className="mt-2 text-xs text-gray-400 font-mono">
                    {formattedTime}
                  </div>
                  {idx < sortedEvents.length - 1 && (
                    <div className="w-px h-8 border-l border-dotted border-gray-600"></div>
                  )}
                </div>

                {/* Right Side (Away) */}
                <div className="flex justify-start pl-4">
                  {!isHome && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 max-w-[260px] shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-100">
                            {playerName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {event.action}
                            {event.points && (
                              <span className="ml-1 text-green-400 font-semibold">
                                +{event.points}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>{getEventIcon(event.action)}</div>
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
      <div className="text-center mt-10 pt-6 border-t border-gray-700">
        <div className="text-sm text-gray-400 mb-1">Final Score</div>
        <div className="text-2xl font-bold text-gray-100">
          {homeTeamName}{" "}
          <span className="text-green-400">{metadata?.home_score ?? 0}</span> -{" "}
          <span className="text-red-400">{metadata?.away_score ?? 0}</span>{" "}
          {awayTeamName}
        </div>
      </div>
    </div>
  );
}
