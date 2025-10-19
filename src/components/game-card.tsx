//src\components\game-card.tsx
"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Check } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { supabase } from "../app/api/DatabaseApi/supabaseClient";
import { BookingApiClient } from "../app/utils/BookGames";
import { useMatches } from "@/app/context/MatchesContext";
import { toast } from "sonner";
import { useAuth } from "../app/context/AuthContext";

/* -------------------------------------------------------------
   📦 Interfaces
------------------------------------------------------------- */
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

/* -------------------------------------------------------------
   💨 Shimmer Loader (shared)
------------------------------------------------------------- */
const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.375rem;
}
`;

export const GameCardSkeleton = memo(() => (
  <>
    <style>{shimmerStyles}</style>
    <Card className="bg-white border-[#FE563F] p-3 overflow-hidden animate-pulse">
      <div className="mb-2 flex justify-between">
        <div className="skeleton h-3 w-16"></div>
        <div className="skeleton h-3 w-10"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center flex-1 gap-1">
          <div className="skeleton rounded-full h-12 w-12"></div>
          <div className="skeleton h-2.5 w-16"></div>
        </div>
        <div className="skeleton h-2 w-6"></div>
        <div className="flex flex-col items-center flex-1 gap-1">
          <div className="skeleton rounded-full h-12 w-12"></div>
          <div className="skeleton h-2.5 w-16"></div>
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <div className="skeleton h-3 w-24"></div>
      </div>
      <div className="mt-3 flex justify-between">
        <div className="skeleton h-3 w-16"></div>
        <div className="skeleton h-3 w-20"></div>
      </div>
    </Card>
  </>
));
GameCardSkeleton.displayName = "GameCardSkeleton";

/* -------------------------------------------------------------
   🧩 Memoized Subcomponents (pure + lightweight)
------------------------------------------------------------- */
const BaseGameCard = memo(
  ({
    children,
    isBooked,
    onClick,
  }: {
    children: React.ReactNode;
    isBooked: boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  }) => (
    <Card
      onClick={onClick}
      className={`bg-white border-[#FE563F] p-3 text-black transition-transform duration-200 ease-in-out ${
        isBooked
          ? "opacity-80 hover:scale-[1.02] hover:shadow-lg"
          : "hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20"
      } cursor-pointer`}
    >
      {children}
    </Card>
  )
);
BaseGameCard.displayName = "BaseGameCard";

const TeamsDisplay = memo(
  ({ homeTeam, awayTeam }: { homeTeam: Team; awayTeam: Team }) => (
    <div className="flex items-center justify-between relative">
      {[homeTeam, awayTeam].map((team, i) => (
        <div
          key={team.team_id || i}
          className="flex flex-col items-center flex-1"
        >
          <div className="relative w-16 h-16 mb-1">
            <Image
              src={team.logo || "/placeholder.svg"}
              alt={`${team.name} logo`}
              fill
              loading="lazy"
              sizes="64px"
              className="object-contain"
            />
          </div>
          <span className="text-xs text-black font-medium text-center">
            {team.name}
          </span>
        </div>
      ))}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-slate-400 font-bold text-sm">
        vs
      </div>
    </div>
  )
);
TeamsDisplay.displayName = "TeamsDisplay";

const DateTimeDisplay = memo(
  ({ date, time }: { date: string; time: string }) => (
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
  )
);
DateTimeDisplay.displayName = "DateTimeDisplay";

const LocationDisplay = memo(({ location }: { location: string }) => (
  <div className="flex items-center justify-center text-slate-400 text-xs mt-2">
    <span>{location}</span>
  </div>
));
LocationDisplay.displayName = "LocationDisplay";

/* -------------------------------------------------------------
   🎮 Game Card Component
------------------------------------------------------------- */
export function GameCard({
  match_id,
  date,
  time,
  homeTeam,
  awayTeam,
  location,
  booked,
}: GameCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isBooked, setIsBooked] = useState(booked);
  const [booking, setBooking] = useState(false);
  const { triggerRefetch } = useMatches();

  const handleBookClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user?.auth_user_id || isBooked) return;

      setBooking(true);
      try {
        const result = await BookingApiClient.bookGame(
          match_id,
          user.auth_user_id
        );
        if (result.success) {
          setIsBooked(true);
          triggerRefetch();
          toast.success("Game Booked Successfully.", {
            description: "Refreshing...",
          });
        } else {
          alert(result.message || "Booking failed.");
        }
      } catch {
        alert("Booking failed. Please try again.");
      } finally {
        setBooking(false);
      }
    },
    [user?.auth_user_id, isBooked, match_id, triggerRefetch]
  );

  const handleView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/analyst/${match_id}`);
    },
    [router, match_id]
  );

  return (
    <BaseGameCard isBooked={isBooked} onClick={handleView}>
      <DateTimeDisplay date={date} time={time} />
      <TeamsDisplay homeTeam={homeTeam} awayTeam={awayTeam} />
      <LocationDisplay location={location} />
      <div className="flex items-center justify-between text-xs font-medium mt-3">
        <button onClick={handleView} className="text-blue-400 hover:underline">
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
            disabled={booking || !user?.auth_user_id}
            className="text-yellow-500 hover:underline disabled:opacity-50"
          >
            {booking ? "Booking..." : "Book for Analysis"}
          </button>
        )}
      </div>
    </BaseGameCard>
  );
}
