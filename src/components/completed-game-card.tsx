
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Check, MapPin, ChevronRight } from "lucide-react";
import { CompletedGameCardProps } from "@/types/basketball";
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



export function CompletedGameCard({
  match_id,
  date,
  time,
  completed,
  homeTeam,
  away_score,
  home_score,
  awayTeam,
  location,
  booked: initialBooked = false,
}: CompletedGameCardProps) {
  const router = useRouter();
  const [analystId, setAnalystId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState<boolean>(initialBooked);
  const [loading, setLoading] = useState<boolean>(false);

  const homeWon = home_score > away_score;
  const awayWon = away_score > home_score;

const handleCardClick = () => {

    router.push(`/analyst/${match_id}`);
  };

  

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-xl hover:shadow-slate-900/20 transition-all duration-300 cursor-pointer">
      {/* Header - Date and Status */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar size={12} />
          <span>{date}</span>
        </div>
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
          FINAL
        </span>
      </div>

      {/* Teams and Scores */}
      <div className="flex items-center justify-between mb-3">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 relative mb-1">
            <img
              src={homeTeam.logo}
              alt={`${homeTeam.name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
          <span className={`text-xs font-medium text-center ${homeWon ? 'text-black' : 'text-gray-400'}`}>
            {homeTeam.name}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center mx-3">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${homeWon ? 'text-black' : 'text-gray-400'}`}>
              {home_score}
            </span>
            <span className="text-slate-400 text-sm">-</span>
            <span className={`text-2xl font-bold ${awayWon ? 'text-black' : 'text-gray-400'}`}>
              {away_score}
            </span>
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 relative mb-1">
            <img
              src={awayTeam.logo}
              alt={`${awayTeam.name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
          <span className={`text-xs font-medium text-center ${awayWon ? 'text-black' : 'text-gray-400'}`}>
            {awayTeam.name}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center justify-center text-slate-400 text-xs mb-2">
        <MapPin size={12} className="mr-1" />
        <span>{location}</span>
      </div>

      {/* View Details Button */}
      <div className="flex justify-center pt-2 border-t border-gray-100">
        <button
          onClick={handleCardClick}
          className="flex items-center gap-1 text-blue-400 hover:underline text-xs font-medium"
        >
          <span>View Details</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
