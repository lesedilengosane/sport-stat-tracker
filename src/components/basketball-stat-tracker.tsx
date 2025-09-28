// src\components\basketball-stat-tracker.tsx

"use client";
import Image from "next/image";
import { useState, useMemo } from "react";
import type { GameEvent, PlayerStats, GameData } from "@/types/basketball";
import TeamPlayerCard from "./ui/team-player-card";
import GameHistory from "./ui/game-history";
import ActionButtons from "./ui/action-buttons";

interface BasketballStatTrackerProps {
  gameData: GameData;
  onBack?: () => void;
  onSave?: (gameData: any) => void;
}

export default function BasketballStatTracker({
  gameData,
  onBack,
  onSave,
}: BasketballStatTrackerProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>({});
  const match_id = gameData.match_id;
  const [gameScore, setGameScore] = useState({ home: 0, away: 0 });
  const analyst=gameData.analyst

  const initializePlayerStats = (player_id: string, match_id: string): PlayerStats => ({
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

  const getPlayerTeamId = (playerId: string): string | null => {
    if (gameData.homeTeam.players.some((p) => p.player_id === playerId)) return gameData.homeTeam.team_id;
    if (gameData.awayTeam.players.some((p) => p.player_id === playerId)) return gameData.awayTeam.team_id;
    return null;
  };

  const allPlayerStats = useMemo(() => {
    const allPlayers = [...gameData.homeTeam.players, ...gameData.awayTeam.players];
    const computedStats: Record<string, PlayerStats> = {};

    allPlayers.forEach((player) => {
      computedStats[player.player_id] =
        playerStats[player.player_id] || initializePlayerStats(player.player_id, match_id);
    });

    return computedStats;
  }, [playerStats, gameData.homeTeam.players, gameData.awayTeam.players]);

  const getPlayerStats = (playerId: string): PlayerStats => {
    return allPlayerStats[playerId] || initializePlayerStats(playerId, match_id);
  };

  const addGameEvent = (action: string, points = 0) => {
    if (!selectedPlayer) return alert("Please select a player first");

    const player = [...gameData.homeTeam.players, ...gameData.awayTeam.players]
      .find((p) => p.player_id === selectedPlayer);
    if (!player) return;

    const teamId = getPlayerTeamId(selectedPlayer);
    if (!teamId) return;

    const event: GameEvent = {
      id: Date.now().toString(),
      timestamp:  new Date().toISOString(),
      team_id: teamId,
      match_id,
      player_id: selectedPlayer,
      playerName: player.name,
      action,
      points,
    };

    setGameEvents((prev) => [event, ...prev]);

    const currentStats = getPlayerStats(selectedPlayer);
    const updatedStats = { ...initializePlayerStats(selectedPlayer, match_id), ...currentStats };

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

    setPlayerStats((prev) => ({ ...prev, [selectedPlayer]: updatedStats }));

    if (points > 0) {
      const scoreKey = teamId === gameData.homeTeam.team_id ? "home" : "away";
      setGameScore((prev) => ({ ...prev, [scoreKey]: prev[scoreKey] + points }));
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer((prevSelected) => prevSelected === playerId ? "" : playerId);
  };

  const handleSave = () => {
    const completeGameData = {
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      match_id,
      analyst,
      homeTeam: {
        name: gameData.homeTeam.name,
        team_id: gameData.homeTeam.team_id,
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
        team_id: gameData.awayTeam.team_id,
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
      link.download = `game-stats-${gameData.match_id}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden p-4">
      <div className="max-w-7xl mx-auto">
        {/* Background Image */}
        <div className="fixed inset-0 z-0">
          <Image src="/background/rim.jpeg" alt="Background" fill priority className="object-cover" />
    
          {/*Overlay */}   
            <div className="absolute inset-0 bg-white/20 backdrop-blur-lg"></div>
      </div>

      
        {/* Header Buttons */}
        <div className="flex items-center justify-between mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 border border-white/20 rounded-2xl bg-white/20 backdrop-blur-md hover:text-gray-300 hover:bg-white/30 text-black font-medium shadow-sm transition-all duration-200 hover:shadow-md"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleSave}
            className="border border-white/20 rounded-2xl bg-[#FE563F]/40 backdrop-blur-md hover:bg-white/25 hover:text-orange-400 text-white font-medium shadow-sm px-8 py-3 transition-all duration-200 hover:shadow-md"
          >
            Save Game
          </button>
        </div>

        {/* Main Glass Card */}
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Team Header Section */}
          <div className="bg-gradient-to-r from-blue-100/30 via-white/10 to-red-100/30 p-8 border-b border-white/20 backdrop-blur-lg">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-20">
                {/* Home Team */}
                <div className="flex items-center gap-6">
                  <img
                    src="/generic-basketball-logo.png"
                    alt="Home Logo"
                    className="w-16 h-16 drop-shadow-md"
                  />
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-black mb-3 tracking-tight">
                      {gameData.homeTeam.name}
                    </h2>
                    <div className="w-24 h-20 bg-blue-200/20 border-1 border-white/40 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md">
                      <span className="text-4xl font-bold text-white">
                        {gameScore.home}
                      </span>
                    </div>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-black/60 mb-2">
                    VS
                  </div>
                  <div className="text-sm text-[#FE563F] font-medium">
                    Live Game
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-black mb-3 tracking-tight">
                      {gameData.awayTeam.name}
                    </h2>
                    <div className="w-24 h-20 bg-red-200/20 border-2 border-red-300/40 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md">
                      <span className="text-4xl font-bold text-white">
                        {gameScore.away}
                      </span>
                    </div>
                  </div>
                  <img
                    src="/miami-heat-logo.png"
                    alt="Away Logo"
                    className="w-16 h-16 drop-shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-8">
            <div className="flex gap-8 h-[700px]">
              {/* Action Buttons */}
              <div className="w-36 flex-shrink-0">
                <div className="sticky top-0">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">
                    Actions
                  </h3>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-3 shadow-lg">
                    <ActionButtons
                      onAction={addGameEvent}
                      disabled={!selectedPlayer}
                    />
                  </div>
                </div>
              </div>

              {/* Player Cards */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-10 h-full">
                  {/* Home Players */}
                  <div className="border-r-2 border-white/20 pr-8">
                    <h3 className="text-xl font-bold text-blue-200 mb-6 text-center">
                      {gameData.homeTeam.name} Players
                    </h3>
                    <div className="overflow-y-auto h-[calc(100%-3rem)] pb-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                      <TeamPlayerCard
                        team={gameData.homeTeam}
                        selectedPlayer={selectedPlayer}
                        onPlayerSelect={handlePlayerSelect}
                        getPlayerStats={getPlayerStats}
                        teamColor="blue"
                      />
                    </div>
                  </div>

                  {/* Away Players */}
                  <div className="pl-8">
                    <h3 className="text-xl font-bold text-red-200 mb-6 text-center">
                      {gameData.awayTeam.name} Players
                    </h3>
                    <div className="overflow-y-auto h-[calc(100%-3rem)] pb-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                      <TeamPlayerCard
                        team={gameData.awayTeam}
                        selectedPlayer={selectedPlayer}
                        onPlayerSelect={handlePlayerSelect}
                        getPlayerStats={getPlayerStats}
                        teamColor="red"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Game History */}
              <div className="w-72 flex-shrink-0">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">
                  Game History
                </h3>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 h-full shadow-lg">
                  <GameHistory events={gameEvents} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
