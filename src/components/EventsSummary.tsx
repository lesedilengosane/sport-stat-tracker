
import { Target, AlertTriangle, Clock, RotateCcw, Trophy, Users, Award, Activity } from "lucide-react";

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

export const basketballEventsMock: BasketballEvent[] = [
  {
    id: "1",
    match_id: "101",
    timestamp: "00:48:00",
    team_id: "A1",
    action: "+3 FG",
    points: 3,
    player_id: "P001",
    players: {
      player_id: "P001",
      first_name: "Jimmy",
      last_name: "Butler",
      position: "SF",
      jersey_number: 22,
      team_id: "A1",
    },
  },
  {
    id: "2",
    match_id: "101",
    timestamp: "00:47:00",
    team_id: "H1",
    action: "Foul",
    points: null,
    player_id: "P002",
    players: {
      player_id: "P002",
      first_name: "Anthony",
      last_name: "Davis",
      position: "PF",
      jersey_number: 3,
      team_id: "H1",
    },
  },
  {
    id: "3",
    match_id: "101",
    timestamp: "00:46:00",
    team_id: "H1",
    action: "+2 FG",
    points: 2,
    player_id: "P003",
    players: {
      player_id: "P003",
      first_name: "LeBron",
      last_name: "James",
      position: "SF",
      jersey_number: 23,
      team_id: "H1",
    },
  },
  {
    id: "4",
    match_id: "101",
    timestamp: "00:45:00",
    team_id: "A1",
    action: "Reb",
    points: null,
    player_id: "P004",
    players: {
      player_id: "P004",
      first_name: "Bam",
      last_name: "Adebayo",
      position: "C",
      jersey_number: 13,
      team_id: "A1",
    },
  },
  {
    id: "5",
    match_id: "101",
    timestamp: "00:44:00",
    team_id: "A1",
    action: "Ast",
    points: null,
    player_id: "P005",
    players: {
      player_id: "P005",
      first_name: "Kyle",
      last_name: "Lowry",
      position: "PG",
      jersey_number: 7,
      team_id: "A1",
    },
  },
  {
    id: "6",
    match_id: "101",
    timestamp: "00:43:00",
    team_id: "H1",
    action: "Blk",
    points: null,
    player_id: "P006",
    players: {
      player_id: "P006",
      first_name: "Anthony",
      last_name: "Davis",
      position: "PF",
      jersey_number: 3,
      team_id: "H1",
    },
  },
  {
    id: "7",
    match_id: "101",
    timestamp: "00:42:00",
    team_id: "H1",
    action: "TO",
    points: null,
    player_id: "P007",
    players: {
      player_id: "P007",
      first_name: "Russell",
      last_name: "Westbrook",
      position: "PG",
      jersey_number: 0,
      team_id: "H1",
    },
  },
  {
    id: "8",
    match_id: "101",
    timestamp: "00:41:00",
    team_id: "A1",
    action: "Stl",
    points: null,
    player_id: "P008",
    players: {
      player_id: "P008",
      first_name: "Tyler",
      last_name: "Herro",
      position: "SG",
      jersey_number: 14,
      team_id: "A1",
    },
  },
  {
    id: "9",
    match_id: "101",
    timestamp: "00:40:00",
    team_id: "H1",
    action: "+1 FT",
    points: 1,
    player_id: "P009",
    players: {
      player_id: "P009",
      first_name: "Austin",
      last_name: "Reaves",
      position: "SG",
      jersey_number: 15,
      team_id: "H1",
    },
  },
  {
    id: "10",
    match_id: "101",
    timestamp: "00:39:00",
    team_id: "A1",
    action: "+2 FG",
    points: 2,
    player_id: "P010",
    players: {
      player_id: "P010",
      first_name: "Duncan",
      last_name: "Robinson",
      position: "SF",
      jersey_number: 55,
      team_id: "A1",
    },
  },
];


const getEventIcon = (action: BasketballEvent["action"]) => {
  switch (action) {
    case "+1 FT":
    case "+2 FG":
    case "+3 FG":
      return <Target className="w-4 h-4 text-green-600" />; // scoring
    case "Foul":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "Reb":
      return <Award className="w-4 h-4 text-blue-500" />; // rebound
    case "Ast":
      return <Users className="w-4 h-4 text-purple-500" />; // assist
    case "Stl":
      return <Activity className="w-4 h-4 text-yellow-500" />; // steal
    case "Blk":
      return <Trophy className="w-4 h-4 text-indigo-500" />; // block
    case "TO":
      return <RotateCcw className="w-4 h-4 text-gray-500" />; // turnover
    default:
      return <Clock className="w-4 h-4 text-gray-400" />; // fallback
  }
};

const getEventColor = (action: BasketballEvent["action"]) => {
  switch (action) {
    case "+1 FT":
    case "+2 FG":
    case "+3 FG":
      return "text-green-400"; // scoring
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
      return "text-gray-400"; // fallback
  }
};

interface TimelineProps {
  events: BasketballEvent[];
  homeTeam?: string;
  awayTeam?: string;
}
export default function BasketballTimeline({ events, homeTeam, awayTeam }: TimelineProps) {
  const sortedEvents = events.sort((a, b) => new Date(`1970/01/01 ${b.timestamp}`).getTime() - new Date(`1970/01/01 ${a.timestamp}`).getTime())

return (
    <div className="w-full max-w-5xl mx-auto rounded-lg p-8 border border-gray-200">
      {/* Game Header */}
      <div className="text-center mb-6">
        <div className="text-gray-900 text-lg font-bold mb-2">FT 108-112</div>
        <div className="text-gray-600 text-sm">Lakers vs Heat</div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Center divider line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-orange-500 transform -translate-x-1/2"></div>

        <div className="space-y-6">
          {sortedEvents.map((event) => {
            const isHome = event.team_id === "H1";
            const playerName = event.players
              ? `${event.players.first_name} ${event.players.last_name}`
              : "";

            return (
              <div
                key={event.id}
                className="grid grid-cols-2 gap-8 relative items-center"
              >
                {/* Center time label */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 rounded text-gray-700 text-sm font-mono">
                  {event.timestamp}
                </div>

                {/* Home side (left) */}
                <div className="flex justify-end pr-8">
                  {isHome && (
                    <div className="flex items-center space-x-3 text-left max-w-[250px]">
                      <div
                        className={`${getEventColor(event.action)} flex-shrink-0`}
                      >
                        {getEventIcon(event.action)}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {playerName && (
                            <span className="text-gray-600">{playerName} </span>
                          )}
                          <span className={getEventColor(event.action)}>
                            {event.action}
                          </span>
                          {event.points && (
                            <span className="ml-2 text-green-600 font-bold">
                              +{event.points}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Away side (right) */}
                <div className="flex justify-start pl-8">
                  {!isHome && (
                    <div className="flex items-center space-x-3 text-right max-w-[250px]">
                      <div>
                        <div className="font-semibold">
                          {playerName && (
                            <span className="text-gray-600">{playerName} </span>
                          )}
                          <span className={getEventColor(event.action)}>
                            {event.action}
                          </span>
                          {event.points && (
                            <span className="ml-2 text-green-600 font-bold">
                              +{event.points}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`${getEventColor(event.action)} flex-shrink-0`}
                      >
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
          Lakers 108 - 112 Heat
        </div>
      </div>
    </div>
  );
}
