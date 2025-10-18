
// MatchesContext.tsx
"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Game } from "@/types/basketball"; // adjust to your actual type
import { apiClient } from "../utils/apiClient";
interface MatchesContextType {
  allGames: Game[];
  matches: Game[];
  isLoading: boolean;
  error: string | null;
  fetchMatches: (forceRefresh?: boolean) => Promise<void>;
  triggerRefetch: () => void;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export const MatchesProvider = ({ children }: { children: React.ReactNode }) => {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [matches, setMatches] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);
  const gamesCache = useRef<Game[] | null>(null);
  const [cacheBuster, setCacheBuster] = useState(0);

  const fetchMatches = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!forceRefresh) {
        const cachedGames = sessionStorage.getItem("matches");
        if (cachedGames) {
          const parsedGames: Game[] = JSON.parse(cachedGames);
          gamesCache.current = parsedGames;
          hasFetched.current = true;
          setAllGames(parsedGames);
          setMatches(parsedGames);
          return;
        }
        if (hasFetched.current && gamesCache.current) {
          setAllGames(gamesCache.current);
          setMatches(gamesCache.current);
          return;
        }
      }

      const matchesData = await apiClient.getMatches();
      if (!matchesData || matchesData.length === 0) {
        setAllGames([]);
        setMatches([]);
        return;
      }

      const teamIds = [
        ...new Set([
          ...matchesData.map((m: any) => m.home_team_id),
          ...matchesData.map((m: any) => m.away_team_id),
        ]),
      ];

      const teamsData = await apiClient.getTeamsByIds(teamIds);
      const teamsMap = new Map();
      teamsData?.forEach((team: any) => teamsMap.set(team.team_id, team));

      const databaseGames: Game[] = matchesData.map((match: any) => {
        const homeTeam = teamsMap.get(match.home_team_id) || {};
        const awayTeam = teamsMap.get(match.away_team_id) || {};
        return {
          match_id: match.match_id,
          analyst: match.analyst,
          completed: match.completed,
          booked: match.booked,
          away_score: match.away_score,
          home_score: match.home_score,
          location: match.location,
          date: new Date(match.match_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: new Date(match.match_date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          homeTeam: {
            id: match.home_team_id,
            name: homeTeam.name || homeTeam.team_name || "Unknown Team",
            logo: homeTeam.icon_url || "/default_team.svg",
          },
          awayTeam: {
            id: match.away_team_id,
            name: awayTeam.name || awayTeam.team_name || "Unknown Team",
            logo: awayTeam.icon_url || "/default_team.svg",
          },
        };
      });

      gamesCache.current = databaseGames;
      hasFetched.current = true;
      sessionStorage.setItem("matches", JSON.stringify(databaseGames));
      setAllGames(databaseGames);
      setMatches(databaseGames);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches from database.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRefetch = () => setCacheBuster((prev) => prev + 1);

  // refetch whenever cacheBuster changes
  useEffect(() => {
    fetchMatches(true);
  }, [cacheBuster]);

  return (
    <MatchesContext.Provider value={{ allGames, matches, isLoading, error, fetchMatches, triggerRefetch }}>
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatches = () => {
  const context = useContext(MatchesContext);
  if (!context) throw new Error("useMatches must be used within MatchesProvider");
  return context;
};
