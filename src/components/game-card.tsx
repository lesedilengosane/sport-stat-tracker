import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../app/api/DatabaseApi/supabaseClient";
import { BookingApiClient } from "../app/utils/BookGames";


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

interface GameCardProps {
  match_id: string;
  date: string;
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  location: string;
  booked: boolean;
  homeLineup?: Player[];
  awayLineup?: Player[];
}

export function GameCard({
  match_id,
  date,
  time,
  homeTeam,
  awayTeam,
  location,
  booked: initialBooked = false,
}: GameCardProps) {
  const router = useRouter();
  const [analystId, setAnalystId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState<boolean>(initialBooked);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch current user + role
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setAnalystId(data.user.id);

          // Fetch role from 'users' table
          const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("auth_user_id", data.user.id)
            .maybeSingle();

          if (!error && userData) {
            setUserRole(userData.role);
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }

    fetchUser();
  }, []);

  // Sync prop changes with state
  useEffect(() => {
    setIsBooked(initialBooked);
  }, [initialBooked]);

  const handleCardClick = () => {
    // Navigate to details page
    router.push(`/analyst/${match_id}`);
  };

  const handleBookClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!analystId) {
      alert("You must be logged in as an analyst to book.");
      return;
    }

    if (isBooked) {
      return;
    }

    setLoading(true);
    try {
      const result = await BookingApiClient.bookGame(match_id, analystId);
      if (result.success) {
        setIsBooked(true);
        alert(result.message || "Game booked successfully!");
      } else {
        if (
          result.message === "This match already has an analyst assigned ❌"
        ) {
          setIsBooked(true);
        }
        alert(result.message || "Booking failed");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("An error occurred while booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/analyst/${match_id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`bg-white border-[#FE563F] p-3 text-black transition-all duration-300 ease-in-out ${
        isBooked
          ? "opacity-80 cursor-pointer hover:scale-[1.02] hover:shadow-lg"
          : "hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer"
      }`}
    >
      {/* Date and Time */}
      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{time}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center flex-1">
          <div className="w-18 h-18 relative mb-0.5">
            <Image
              src={homeTeam.logo || "/placeholder.svg"}
              alt={`${homeTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs text-black font-medium text-center">
            {homeTeam.name}
          </span>
        </div>

        <div className="text-slate-400 font-bold text-sm mx-2">vs</div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-18 h-18 relative mb-0.5">
            <Image
              src={awayTeam.logo || "/placeholder.svg"}
              alt={`${awayTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs text-black font-medium text-center">
            {awayTeam.name}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center justify-center text-slate-400 text-xs mt-2">
        <span>{location}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between text-xs font-medium mt-3">
        {userRole === "Coach" ? (
          <div className="flex justify-center w-full">
            <button
              onClick={handleViewDetails}
              className="text-blue-400 hover:underline"
            >
              View Details
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleViewDetails}
              className="text-blue-400 hover:underline"
            >
              View Details
            </button>

            {isBooked ? (
              <div className="flex items-center gap-1 text-green-500">
                <Check size={14} />
                <span>Booked</span>
              </div>
            ) : (
              <button
                onClick={handleBookClick}
                disabled={loading}
                className="text-yellow-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Booking..." : "Book for Analysis"}
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}