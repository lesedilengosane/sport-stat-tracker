// components/LastMatchesTable.tsx
"use client";

export type GameResult = "W" | "L";

export interface MatchDetails {
  match_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  match_date: string;
  completed: boolean;
  home_team: {
    team_id: string;
    team_name: string;
    icon_url: string;
    coach_id: string;
  };
  away_team: {
    team_id: string;
    team_name: string;
    icon_url: string;
    coach_id: string;
  };
}

interface LastMatchesTableProps {
  data: MatchDetails[];
  title: string;
  currentTeam: string;
  onMatchClick?: (match: MatchDetails) => void;
}

export function LastMatchesTable({ data, title, currentTeam, onMatchClick }: LastMatchesTableProps) {
  // Transform the match data to the new format
  const teamGames = {
    name: currentTeam,
    games: data.slice(0, 5).map((match, index) => {
      // Determine if it's a win or loss for the current team
      const isHomeTeam = match.home_team.team_name === currentTeam;
      const teamScore = isHomeTeam ? match.home_score : match.away_score;
      const opponentScore = isHomeTeam ? match.away_score : match.home_score;
      const result: GameResult = teamScore > opponentScore ? "W" : "L";
      
      // Get opponent name and logo - FIXED: using nested objects
      const opponent = isHomeTeam ? match.away_team.team_name : match.home_team.team_name;
      const opponentLogo = isHomeTeam ? match.away_team.icon_url : match.home_team.icon_url;
      
      return {
        id: index + 1,
        match_id: match.match_id,
        opponent,
        opponentLogo,
        result,
        score: `${teamScore}-${opponentScore}`,
        date: match.match_date,
        isHomeGame: isHomeTeam
      };
    })
  };

  const circleStyle = (result: GameResult): string =>
    `flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold ${
      result === "W" ? "bg-green-500" : "bg-red-500"
    }`;

  const handleGameClick = (match: MatchDetails) => {
    if (onMatchClick) {
      onMatchClick(match);
    }
  };

  // Add debug logging to see what data we're receiving
  console.log('LastMatchesTable data:', {
    currentTeam,
    receivedData: data,
    transformedGames: teamGames.games
  });

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg border border-orange-200">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-orange-600 mb-4 border-b border-orange-200 pb-2">
          {teamGames.name}
        </h3>
        <div className="space-y-3">
          {teamGames.games.map((game) => (
            <div 
              key={game.id} 
              className={`flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100 transition-all duration-200 ${
                onMatchClick ? 'cursor-pointer hover:bg-orange-100 hover:border-orange-300 hover:shadow-md' : ''
              }`}
              onClick={() => handleGameClick(data.find(m => m.match_id === game.match_id)!)}
            >
              <div className="flex items-center space-x-4">
                <div className={circleStyle(game.result)}>{game.result}</div>
                <div className="flex items-center space-x-3">
                  {game.opponentLogo && (
                    <img
                      src={game.opponentLogo}
                      alt={`${game.opponent} logo`}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-medium text-gray-800">vs {game.opponent}</div>
                  </div>
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
  );
}