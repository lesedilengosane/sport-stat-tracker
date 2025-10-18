import React from 'react';
import { Star } from 'lucide-react';

interface MatchDetails {
  match_id: string;
  home_team_name: string;
  away_team_name: string;
  home_icon_url: string;
  away_icon_url: string;
  home_score: number;
  away_score: number;
  match_date: string;
  completed: boolean;
}

interface LastMatchesCardsProps {
  data: MatchDetails[];
  title: string;
  currentTeam: string;
  onMatchClick: (match: MatchDetails) => void;
}

export const LastMatchesCards = ({ data, title, currentTeam, onMatchClick }: LastMatchesCardsProps) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
      <div className="space-y-3">
        {data.map((match) => {
          // Normalize team names for comparison (trim whitespace and compare case-insensitive)
          const normalizedCurrent = currentTeam?.trim().toLowerCase();
          const normalizedHome = match.home_team_name?.trim().toLowerCase();
          const normalizedAway = match.away_team_name?.trim().toLowerCase();
          
          const isHomeTeam = normalizedHome === normalizedCurrent;
          const isAwayTeam = normalizedAway === normalizedCurrent;
          
          // Determine which team is current and which is opponent
          let teamScore, opponentScore, opponentName, opponentIcon, currentTeamIcon, displayCurrentTeam;
          
          if (isHomeTeam) {
            displayCurrentTeam = match.home_team_name;
            teamScore = match.home_score;
            opponentScore = match.away_score;
            opponentName = match.away_team_name;
            opponentIcon = match.away_icon_url;
            currentTeamIcon = match.home_icon_url;
          } else {
            displayCurrentTeam = match.away_team_name;
            teamScore = match.away_score;
            opponentScore = match.home_score;
            opponentName = match.home_team_name;
            opponentIcon = match.home_icon_url;
            currentTeamIcon = match.away_icon_url;
          }
          
          const result = match.completed 
            ? (teamScore > opponentScore ? 'W' : teamScore < opponentScore ? 'L' : 'T')
            : 'N/A';
          
          return (
            <div
              key={match.match_id}
              onClick={() => onMatchClick(match)}
              className="bg-zinc-900 rounded-lg p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Left side - Current Team */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-xs text-gray-400 w-8">
                    {match.completed ? 'FT' : 'SCH'}
                  </div>
                  <img 
                    src={currentTeamIcon} 
                    alt={currentTeam}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-white font-medium">{currentTeam}</span>
                </div>

                {/* Score */}
                <div className="text-white font-bold text-xl mx-4">
                  {match.completed ? teamScore : '-'}
                </div>

                {/* Star icon */}
                <Star className="w-5 h-5 text-gray-600 mx-2" />
              </div>

              {/* Opponent */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8" /> {/* Spacer to align with top row */}
                  <img 
                    src={opponentIcon} 
                    alt={opponentName}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-white font-medium">{opponentName}</span>
                </div>

                {/* Opponent Score */}
                <div className="text-white font-bold text-xl mx-4">
                  {match.completed ? opponentScore : '-'}
                </div>

                {/* Spacer for alignment */}
                <div className="w-5 mx-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};