import { Clock, Target, AlertTriangle, RotateCcw, Users, Trophy } from "lucide-react"

export interface BasketballEvent {
  id: string
  minute: number
  quarter: 1 | 2 | 3 | 4 | "OT"
  type: "score" | "foul" | "timeout" | "substitution" | "technical" | "quarter_end"
  team: "home" | "away"
  player?: string
  points?: number
  description: string
}

const basketballTimelineData: BasketballEvent[] = [
  {
    id: "1",
    minute: 48,
    quarter: 4,
    type: "score",
    team: "away",
    player: "J. Butler",
    points: 3,
    description: "3-pointer",
  },
  { id: "2", minute: 47, quarter: 4, type: "timeout", team: "home", description: "Timeout called" },
  { id: "3", minute: 45, quarter: 4, type: "foul", team: "home", player: "A. Davis", description: "Personal foul" },
  { id: "4", minute: 43, quarter: 4, type: "score", team: "home", player: "L. James", points: 2, description: "Layup" },
  {
    id: "5",
    minute: 41,
    quarter: 4,
    type: "substitution",
    team: "away",
    player: "T. Herro",
    description: "Substitution in",
  },
  {
    id: "6",
    minute: 38,
    quarter: 4,
    type: "technical",
    team: "home",
    player: "R. Westbrook",
    description: "Technical foul",
  },
  {
    id: "7",
    minute: 36,
    quarter: 4,
    type: "score",
    team: "away",
    player: "B. Adebayo",
    points: 2,
    description: "Dunk",
  },
  { id: "8", minute: 36, quarter: 3, type: "quarter_end", team: "home", description: "End of 3rd Quarter" },
  {
    id: "9",
    minute: 35,
    quarter: 3,
    type: "score",
    team: "home",
    player: "A. Reaves",
    points: 3,
    description: "3-pointer",
  },
  { id: "10", minute: 33, quarter: 3, type: "foul", team: "away", player: "K. Lowry", description: "Shooting foul" },
]

const getEventIcon = (type: BasketballEvent["type"]) => {
  switch (type) {
    case "score":
      return <Target className="w-4 h-4" />
    case "foul":
      return <AlertTriangle className="w-4 h-4" />
    case "timeout":
      return <Clock className="w-4 h-4" />
    case "substitution":
      return <RotateCcw className="w-4 h-4" />
    case "technical":
      return <AlertTriangle className="w-4 h-4" />
    case "quarter_end":
      return <Trophy className="w-4 h-4" />
    default:
      return <Users className="w-4 h-4" />
  }
}

const getEventColor = (type: BasketballEvent["type"]) => {
  switch (type) {
    case "score":
      return "text-green-400"
    case "foul":
      return "text-yellow-400"
    case "timeout":
      return "text-blue-400"
    case "substitution":
      return "text-cyan-400"
    case "technical":
      return "text-red-400"
    case "quarter_end":
      return "text-purple-400"
    default:
      return "text-gray-400"
  }
}

export default function BasketballTimeline() {
  const sortedEvents = basketballTimelineData.sort((a, b) => b.minute - a.minute)

  return (
    <div className="w-full max-w-10xl mx-auto  rounded-lg p-8 border border-gray-200">
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
          {sortedEvents.map((event) => (
            <div key={event.id} className="grid grid-cols-2 gap-8 relative">
              {/* Home side (left) */}
              <div className="flex justify-end pr-8">
                {event.team === "home" && (
                  <div className="flex items-center space-x-3 text-left max-w-[250px]">
                    <span className="text-gray-600 text-sm font-mono">{event.minute}'</span>
                    <div className={`${getEventColor(event.type)} flex-shrink-0`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {event.player && <span className="text-gray-600">{event.player} </span>}
                        <span className={getEventColor(event.type)}>{event.description}</span>
                        {event.points && <span className="ml-2 text-green-600 font-bold">+{event.points}</span>}
                      </div>
                      <div className="text-xs text-gray-500">Q{event.quarter}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Away side (right) */}
              <div className="flex justify-start pl-8">
                {event.team === "away" && (
                  <div className="flex items-center space-x-3 text-right max-w-[250px]">
                    <div>
                      <div className="font-semibold">
                        {event.player && <span className="text-gray-600">{event.player} </span>}
                        <span className={getEventColor(event.type)}>{event.description}</span>
                        {event.points && <span className="ml-2 text-green-600 font-bold">+{event.points}</span>}
                      </div>
                      <div className="text-xs text-gray-500">Q{event.quarter}</div>
                    </div>
                    <div className={`${getEventColor(event.type)} flex-shrink-0`}>
                      {getEventIcon(event.type)}
                    </div>
                    <span className="text-gray-600 text-sm font-mono">{event.minute}'</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Score */}
      <div className="text-center mt-6 pt-4 border-t border-gray-300">
        <div className="text-gray-600 text-sm">Final Score</div>
        <div className="text-gray-900 text-xl font-bold">Lakers 108 - 112 Heat</div>
      </div>
    </div>
  )
}
