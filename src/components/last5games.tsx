// games.json (this could be fetched from an API in real life)
export const lastFiveGamesData = {
  homeTeam: {
    name: "Los Angeles Lakers",
    games: [
      { id: 1, opponent: "Warriors", result: "W", score: "109-105" },
      { id: 2, opponent: "Celtics", result: "L", score: "112-122" },
      { id: 3, opponent: "Clippers", result: "W", score: "109-102" },
      { id: 4, opponent: "Nets", result: "L", score: "115-122" },
      { id: 5, opponent: "Heat", result: "L", score: "108-122" },
    ],
  },
  awayTeam: {
    name: "Miami Heat",
    games: [
      { id: 1, opponent: "Bulls", result: "L", score: "98-122" },
      { id: 2, opponent: "76ers", result: "W", score: "109-104" },
      { id: 3,  opponent: "Spurs", result: "W", score: "109-101" },
      { id: 4,  opponent: "Mavs", result: "W", score: "109-107" },
      { id: 5,  opponent: "Knicks", result: "W", score: "109-98" },
    ],
  },
} as const;

export type GameResult = "W" | "L";

export interface Game {
  id: number;

  opponent: string;
  result: GameResult;
  score: string; // Changed to string to show both scores
}

export default function LastGames() {
  const { homeTeam, awayTeam } = lastFiveGamesData;

  const circleStyle = (result: GameResult): string =>
    `flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold ${
      result === "W" ? "bg-green-500" : "bg-red-500"
    }`;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-center text-2xl font-bold mb-6 text-gray-800">Last Five Games</h2>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Home Team */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-600 mb-4">{homeTeam.name}</h3>
          <div className="space-y-3">
            {homeTeam.games.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className={circleStyle(game.result)}>{game.result}</div>
                  <div className="text-left">
                    <div className="font-medium text-gray-800">vs {game.opponent}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">{game.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Away Team */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-red-600 mb-4">{awayTeam.name}</h3>
          <div className="space-y-3">
            {awayTeam.games.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className={circleStyle(game.result)}>{game.result}</div>
                  <div className="text-left">
                    <div className="font-medium text-gray-800">vs {game.opponent}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">{game.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}