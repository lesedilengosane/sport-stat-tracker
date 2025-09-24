"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../api/DatabaseApi/supabaseClient";
import { useAuth } from "@/app/context/AuthContext"; // ✅ Correct context
import { CoachSideNav } from "@/components/sideNav/coachSideNav";
import { DashboardHeader } from "@/components/header/header";
import  TeamManagement  from "@/components/coachComponents/teamManagement";
import UnassignedPlayersDialog from "@/components/coachComponents/teamManagement";
import { GamesGrid } from "@/components/games-grid";
import { GameCardSkeleton } from "@/components/Loading-Card/game-card-skeleton";

// Types
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
  const { user } = useAuth();
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const [teamID, setTeamID] = useState<string>("");

  const name = user?.first_name + " " + user?.last_name || "User";
  const user_ID = user?.user_id || "No ID";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Convert raw lineup data
  const convertToPlayerDetails = (lineup: any[], team: "home" | "away") =>
    lineup.map((player, index) => ({
      player_id: `${team}-player-${index}`,
      name: player.player || "Unknown",
      position: player.position || "Unknown",
    }));

  // Fetch games for coach
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
        .eq("auth_user_id", user.id || user_ID)
        .maybeSingle();

      if (coachError) throw new Error("Failed to fetch coach info");
      if (!coachData) {
        setAllGames([]);
        return;
      }

      const coachId = coachData.user_id || user_ID;

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
  const fetchCoachTeam = async () => {
    if (!user) return;

    try {
      // Get the logged-in user's ID
      const userId = user.user_id;

      // Fetch the team assigned to this coach
      const { data: teamData, error } = await supabase
        .from("teams")
        .select("team_id")
        .eq("coach_id", userId)
        .maybeSingle(); // returns single team or null

      if (error) throw error;

      if (teamData) {
        setTeamID(teamData.team_id);
      } else {
        console.warn("No team found for this coach");
      }
    } catch (err) {
      console.error("Failed to fetch coach team:", err);
    }
  };

  fetchCoachTeam();
}, [user]);


  useEffect(() => {
    if (activeTab === "schedule") fetchCoachGames();
  }, [activeTab]);

  // Tab rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case "schedule":
        return isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto p-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <GamesGrid games={allGames} />
        );

      case "all-games":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">All Games</h2>
              <p className="text-gray-300">
                This is where all past and future games will be displayed
              </p>
            </div>
          </div>
        );

      case "team-management":
       return teamID ? (
    <UnassignedPlayersDialog coachTeamId={teamID} />
  ) : (
    <p className="text-gray-300 text-center mt-4">
      Loading team info...
    </p>
  );
;

      case "team-stats":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Team Statistics
              </h2>
              <p className="text-gray-300">
                This is where comprehensive team statistics and performance
                metrics will be shown
              </p>
            </div>
          </div>
        );

      case "players":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Team Players</h2>
              <p className="text-gray-300">
                This is where player roster and individual statistics will be
                managed
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
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