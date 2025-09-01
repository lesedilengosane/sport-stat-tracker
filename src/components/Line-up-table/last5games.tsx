
// games.json (this could be fetched from an API in real life)
export const lastFiveGamesData = {
  homeTeam: {
    name: "Los Angeles Lakers",
    games: [
      { id: 1, date: "2025-02-01", opponent: "Warriors", result: "W", score: 109 },
      { id: 2, date: "2025-01-28", opponent: "Celtics", result: "L", score: 122 },
      { id: 3, date: "2025-01-25", opponent: "Clippers", result: "W", score: 109 },
      { id: 4, date: "2025-01-22", opponent: "Nets", result: "L", score: 122 },
      { id: 5, date: "2025-01-20", opponent: "Heat", result: "L", score: 122 },
    ],
  },
  awayTeam: {
    name: "Miami Heat",
    games: [
      { id: 1, date: "2025-02-01", opponent: "Bulls", result: "L", score: 122 },
      { id: 2, date: "2025-01-28", opponent: "76ers", result: "W", score: 109 },
      { id: 3, date: "2025-01-25", opponent: "Spurs", result: "W", score: 109 },
      { id: 4, date: "2025-01-22", opponent: "Mavs", result: "W", score: 109 },
      { id: 5, date: "2025-01-20", opponent: "Knicks", result: "W", score: 109 },
    ],
  },
} as const;  // 👈 makes `result` be typed as "W" | "L" not string


export type GameResult = "W" | "L";

export interface Game {
  id: number;
  date: string;
  opponent: string;
  result: GameResult;
  score: number;
}

export default function LastGames() {
  const { homeTeam, awayTeam } = lastFiveGamesData;

  const circleStyle = (result: GameResult): string =>
    `flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold ${
      result === "W" ? "bg-green-500" : "bg-red-500"
    }`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-center text-lg font-bold mb-4">Last Five Games</h2>
      <div className="grid grid-cols-2 gap-8">
        {/* Home Team */}
        <div className="flex flex-col space-y-3 border-r-4 border-orange-500 pr-6">
          {homeTeam.games.map((game) => (
            <div key={game.id} className="flex items-center space-x-20">
              <div className={circleStyle(game.result)}>{game.result}</div>
              <span className="text-lg font-semibold">{game.score}</span>
            </div>
          ))}
        </div>

        {/* Away Team */}
        <div className="flex flex-col space-y-3 items-end pl-6">
          {awayTeam.games.map((game) => (
            <div key={game.id} className="flex items-center space-x-20">
              <div className={circleStyle(game.result)}>{game.result}</div>
              <span className="text-lg font-semibold">{game.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}