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
  isBooked?: boolean;
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
  isBooked: initialBooked = false,
}: GameCardProps) {
  const router = useRouter();
  const [analystId, setAnalystId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState<boolean>(initialBooked);
  const [loading, setLoading] = useState<boolean>(false);
  console.log(`Inside the game cards,the matchID is :${match_id}`)
  // fetch current user + role
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setAnalystId(data.user.id);

        // fetch role from 'users' table
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_user_id", data.user.id)
          .maybeSingle();

        if (!error && userData) {
          setUserRole(userData.role); // e.g., "Coach" or "Analyst"
        }
      }
    }

    fetchUser();
  }, []);

  const handleCardClick = () => {
    if (isBooked) return;
    router.push(`/analyst/${match_id}`);
  };
 
  const handleBookClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!analystId) {
      alert("You must be logged in as an analyst to book.");
      return;
    }
    setLoading(true);
    try {
      const result = await BookingApiClient.bookGame(match_id, analystId);
      if (result.success) {
        setIsBooked(true);
        alert(result.message);
      } else {
        if (
          result.message === "This match already has an analyst assigned ❌"
        ) {
          setIsBooked(true);
        }
        alert(result.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`bg-slate-800 border-slate-700 p-3 text-white transition-all duration-300 ease-in-out ${
        isBooked
          ? "opacity-80 cursor-not-allowed"
          : "hover:scale-105 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer"
      }`}
    >
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

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 relative mb-1">
            <Image
              src={homeTeam.logo || "/placeholder.svg"}
              alt={`${homeTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs font-medium">{homeTeam.name}</span>
        </div>

        <div className="text-slate-400 font-bold text-sm mx-2">vs</div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 relative mb-1">
            <Image
              src={awayTeam.logo || "/placeholder.svg"}
              alt={`${awayTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs font-medium">{awayTeam.name}</span>
        </div>
      </div>

      <div className="text-xs text-slate-400">{location}</div>

      <div className="flex items-center justify-between text-xs font-medium mt-2">
        {userRole === "Coach" ? (
          <div className="flex justify-center w-full">
            <button className="text-blue-400 hover:underline">
              View Details
            </button>
          </div>
        ) : (
          <>
            <button className="text-blue-400 hover:underline">
              View Details
            </button>

            {isBooked ? (
              <div className="flex items-center gap-1 text-yellow-400">
                <Check size={14} />
                <span>Booked</span>
              </div>
            ) : (
              <button
                onClick={handleBookClick}
                disabled={loading}
                className="text-yellow-400 hover:underline disabled:opacity-50"
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
