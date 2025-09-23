"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../api/DatabaseApi/supabaseClient";
import { GamesGrid } from "@/components/games-grid";
import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton";
import { useAuth } from "../contexts/AuthContext";
import { CoachSideNav } from "@/components/sideNav/coachSideNav";
import { DashboardHeader } from "@/components/header/header";

interface Team {
  team_id: string;
  name: string;
  logo: string;
}

interface Player {
  player_id: string;
  name: string;
  position?: string;
}

interface Game {
  id: string;
  date: string;
  time: string;
  location: string;
  homeTeam: Team;
  awayTeam: Team;
  homeLineup?: Player[];
  awayLineup?: Player[];
  isBooked?: boolean;
}

export default function CoachDashboard() {
  const router = useRouter();
  const { userName, loading } = useAuth();
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const convertToPlayerDetails = (lineup: any[], team: "home" | "away") =>
    lineup.map((player, index) => ({
      player_id: `${team}-player-${index}`,
      name: player.player || "Unknown",
      position: player.position || "Unknown",
    }));

  const fetchCoachGames = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("No signed-in user found");

      const { data: coachData, error: coachError } = await supabase
        .from("users")
        .select("user_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (coachError) throw new Error("Failed to fetch coach info");
      if (!coachData) {
        setAllGames([]);
        return;
      }

      const coachId = coachData.user_id;

      const { data: teams, error: teamError } = await supabase
        .from("teams")
        .select("team_id, team_name, icon_url")
        .eq("coach_id", coachId);

      if (teamError) throw new Error("Failed to fetch coach teams");
      if (!teams || teams.length === 0) {
        setAllGames([]);
        return;
      }

      const teamIds = teams.map((t) => t.team_id);
      const teamsMap = new Map<string, Team>();
      teams.forEach((team) =>
        teamsMap.set(team.team_id, {
          team_id: team.team_id,
          name: team.team_name,
          logo: team.icon_url || "/default_team.svg",
        })
      );

      const orFilters = teamIds
        .map((id) => `home_team_id.eq.${id},away_team_id.eq.${id}`)
        .join(",");
      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .or(orFilters)
        .order("match_date", { ascending: true });

      if (matchError) throw new Error("Failed to fetch matches");

      const games: Game[] = (matches || []).map((match: any) => ({
        id: match.match_id,
        date: new Date(match.match_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: new Date(match.match_date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        location: match.location || "Unknown",
        homeTeam: teamsMap.get(match.home_team_id) || {
          team_id: match.home_team_id,
          name: "Unknown Team",
          logo: "/default_team.svg",
        },
        awayTeam: teamsMap.get(match.away_team_id) || {
          team_id: match.away_team_id,
          name: "Unknown Team",
          logo: "/default_team.svg",
        },
        homeLineup: convertToPlayerDetails(match.homeLineup || [], "home"),
        awayLineup: convertToPlayerDetails(match.awayLineup || [], "away"),
      }));

      setAllGames(games);
    } catch (err: any) {
      setError("Failed to load games.");
      setAllGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "schedule") fetchCoachGames();
  }, [activeTab]);

  const renderTabContent = () => {
    if (activeTab !== "schedule") return null;

    return isLoading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto p-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    ) : (
      <GamesGrid games={allGames} />
    );
  };

  return (
    <div className="relative min-h-screen">
      <CoachSideNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="fixed inset-0 z-0">
        <Image
          src="/bgr.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="relative z-10 min-h-screen bg-black/30 backdrop-blur-sm">
        <DashboardHeader placeholder="Search players and teams..." />

        {error && (
          <div className="max-w-6xl mx-auto mb-6 pt-6">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {renderTabContent()}
      </div>
    </div>
  );
}
