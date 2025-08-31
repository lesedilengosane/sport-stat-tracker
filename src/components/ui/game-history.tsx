import type { GameEvent } from "@/types/basketball"

interface GameHistoryProps {
  events: GameEvent[]
}

export default function GameHistory({ events }: GameHistoryProps) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg h-96 flex flex-col">
      <h3 className="text-lg font-bold text-purple-600 mb-4 text-center p-4 pb-0">history</h3>

      <div className="h-80 overflow-y-scroll scrollbar-hide space-y-2 px-4 pb-4">
        {events.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">No events yet</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-gray-800">{event.playerName}</span>
                <span className="text-xs text-gray-500">{event.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600">{event.action}</span>
                {event.points > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    +{event.points} pts
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
