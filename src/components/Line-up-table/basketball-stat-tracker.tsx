"use client"

import { useState, useMemo } from "react"
import type { GameEvent, PlayerStats, GameData } from "@/types/basketball"
import TeamPlayerCard from "../ui/team-player-card"
import GameHistory from "../ui/game-history"
import ActionButtons from "../ui/action-buttons"

interface BasketballStatTrackerProps {
  gameData: GameData
  onBack?: () => void
  onSave?: (gameData: any) => void
}

export default function BasketballStatTracker({ gameData, onBack, onSave }: BasketballStatTrackerProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([])
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>({})
  const [gameScore, setGameScore] = useState({ home: 0, away: 0 })
  const match_id=gameData.match_id

  const initializePlayerStats = (player_id: string,match_id:string): PlayerStats => ({
    match_id,
    player_id,
    points: 0,
    assists: 0,
    rebounds: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    twoPointsMade: 0,
    twoPointsAttempted: 0,
    threePointsMade: 0,
    threePointsAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
  });

  // Get team for a player
  const getPlayerTeam = (playerId: string): "home" | "away" | null => {
    if (gameData.homeTeam.players.some((p) => p.player_id === playerId)) return "home";
    if (gameData.awayTeam.players.some((p) => p.player_id === playerId)) return "away";
    return null;
  };

  const allPlayerStats = useMemo(() => {
    const allPlayers = [
      ...gameData.homeTeam.players,
      ...gameData.awayTeam.players,
    ];
    const computedStats: Record<string, PlayerStats> = {};

    allPlayers.forEach((player) => {
      computedStats[player.player_id] =
        playerStats[player.player_id] || initializePlayerStats(player.player_id,match_id);
    });

    return computedStats;
  }, [playerStats, gameData.homeTeam.players, gameData.awayTeam.players]);

  const getPlayerStats = (playerId: string): PlayerStats => {
    return allPlayerStats[playerId] || initializePlayerStats(playerId,match_id);
  };

  const addGameEvent = (action: string, points = 0) => {
    if (!selectedPlayer) {
      alert("Please select a player first");
      return;
    }

    const player = [
      ...gameData.homeTeam.players,
      ...gameData.awayTeam.players,
    ].find((p) => p.player_id === selectedPlayer);
    if (!player) return;

    const teamId = getPlayerTeam(selectedPlayer);
    if (!teamId) return;

    const event: GameEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      team_id:teamId,
      match_id:match_id,
      player_id: selectedPlayer,
      playerName: player.name,
      action,
      points,
    };

    setGameEvents((prev) => [event, ...prev]);

    // Create a completely new stats object to avoid reference issues
    const currentStats = getPlayerStats(selectedPlayer);
    const updatedStats = {
      ...initializePlayerStats(selectedPlayer,match_id),
      ...currentStats,
    };

    switch (action) {
      case "+1 FT":
        updatedStats.freeThrowsMade += 1;
        updatedStats.freeThrowsAttempted += 1;
        updatedStats.points += 1;
        break;
      case "+2 FG":
        updatedStats.twoPointsMade += 1;
        updatedStats.twoPointsAttempted += 1;
        updatedStats.points += 2;
        break;
      case "+3 FG":
        updatedStats.threePointsMade += 1;
        updatedStats.threePointsAttempted += 1;
        updatedStats.points += 3;
        break;
      case "Reb":
        updatedStats.rebounds += 1;
        break;
      case "Ast":
        updatedStats.assists += 1;
        break;
      case "Stl":
        updatedStats.steals += 1;
        break;
      case "Blk":
        updatedStats.blocks += 1;
        break;
      case "TO":
        updatedStats.turnovers += 1;
        break;
      case "Foul":
        updatedStats.fouls += 1;
        break;
    }

    // Update player stats immutably
    setPlayerStats((prev) => ({
      ...prev,
      [selectedPlayer]: updatedStats,
    }));

    if (points > 0) {
      setGameScore((prev) => ({
        ...prev,
        [teamId]: prev[teamId] + points,
      }));
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    // Only allow selecting one player at a time
    setSelectedPlayer((prevSelected) =>
      prevSelected === playerId ? "" : playerId
    );
  };

  const handleSave = () => {
    const completeGameData = {
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      match_id:match_id,
      //season:"2023", I do not need the location and season because they already exist in the DB
      //location:gameData,//I need to add a valid location
      homeTeam: {
        name: gameData.homeTeam.name,
        team_id:gameData.homeTeam.team_id,
        score: gameScore.home,
        players: gameData.homeTeam.players.map((player) => ({
          player_id: player.player_id,
          name: player.name,
          position: player.position,
          jerseyNumber: player.jerseyNumber,
          stats: getPlayerStats(player.player_id),
        })),
      },
      awayTeam: {
        team_id:gameData.awayTeam.team_id,
        name: gameData.awayTeam.name,
        score: gameScore.away,
        players: gameData.awayTeam.players.map((player) => ({
          player_id: player.player_id,
          name: player.name,
          position: player.position,
          jerseyNumber: player.jerseyNumber,
          stats: getPlayerStats(player.player_id),
        })),
      },
      events: gameEvents,
      finalScore: `${gameScore.home}-${gameScore.away}`,
    };

    if (onSave) {
      onSave(completeGameData);
    } else {
      const dataStr = JSON.stringify(completeGameData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `game-stats-${gameData.match_id}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            Save Game
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-8 border-b border-slate-200">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-20">
                {/* Home Team */}
                <div className="flex items-center gap-6">
                  <img src="/generic-basketball-logo.png" alt="Lakers Logo" className="w-16 h-16 drop-shadow-md" />
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-blue-600 mb-3 tracking-tight">{gameData.homeTeam.name}</h2>
                    <div className="w-24 h-20 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-bold text-blue-800">{gameScore.home}</span>
                    </div>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-slate-400 mb-2">VS</div>
                  <div className="text-sm text-slate-500 font-medium">Live Game</div>
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-red-600 mb-3 tracking-tight">{gameData.awayTeam.name}</h2>
                    <div className="w-24 h-20 bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-bold text-red-800">{gameScore.away}</span>
                    </div>
                  </div>
                  <img src="/miami-heat-logo.png" alt="Heat Logo" className="w-16 h-16 drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-8 h-[700px]">
              {/* Action Buttons */}
              <div className="w-36 flex-shrink-0">
                <div className="sticky top-0">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Actions</h3>
                  <ActionButtons onAction={addGameEvent} disabled={!selectedPlayer} />
                </div>
              </div>

              {/* Player Cards */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-10 h-full">
                  <div className="border-r-2 border-slate-200 pr-8">
                    <h3 className="text-xl font-bold text-blue-600 mb-6 text-center">
                      {gameData.homeTeam.name} Players
                    </h3>
                    <div className="overflow-y-auto h-[calc(100%-3rem)] pb-4">
                      <TeamPlayerCard
                        team={gameData.homeTeam}
                        selectedPlayer={selectedPlayer}
                        onPlayerSelect={setSelectedPlayer}
                        getPlayerStats={getPlayerStats}
                        teamColor="blue"
                      />
                    </div>
                  </div>

                  <div className="pl-8">
                    <h3 className="text-xl font-bold text-red-600 mb-6 text-center">
                      {gameData.awayTeam.name} Players
                    </h3>
                    <div className="overflow-y-auto h-[calc(100%-3rem)] pb-4">
                      <TeamPlayerCard
                        team={gameData.awayTeam}
                        selectedPlayer={selectedPlayer}
                        onPlayerSelect={setSelectedPlayer}
                        getPlayerStats={getPlayerStats}
                        teamColor="red"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Game History */}
              <div className="w-72 flex-shrink-0">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Game History</h3>
                <GameHistory events={gameEvents} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



