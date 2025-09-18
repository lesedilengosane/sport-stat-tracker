// components/game-card.tsx
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Check } from "lucide-react";

interface Team {
  team_id: string; // ← Add this property
  name: string;
  logo: string;
}

interface Player {
  player_id: string;
  name: string;
  position?: string;
}

interface GameCardProps {
  match_id:string;
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
  isBooked = false,
}: GameCardProps) {
  const router = useRouter();

  const handleClick = () => {

    if (isBooked) return; // prevent navigation if booked
    console.log('This is before clicking game card->GameCard match_id:', match_id);
    router.push(`/analyst/${match_id}`)
    //router.push(`/analyst?${queryParams}`);
  };

  return (
    <Card
      onClick={handleClick}
      className={`bg-slate-800 border-slate-700 p-3 text-white transition-all duration-300 ease-in-out ${
        isBooked
          ? "opacity-80 cursor-not-allowed"
          : "hover:scale-105 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer"
      }`}
    >
      {/* Date + Time */}
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
      <div className="flex items-center justify-between ">
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

      {/* Location */}
      <div className="text-xs text-slate-400 ">{location}</div>

      {/* Action buttons */}
      <div className="flex items-center justify-between text-xs font-medium">
        <button className="text-blue-400 hover:underline">View Details</button>
        {isBooked ? (
          <div className="flex items-center gap-1 text-yellow-400">
            <Check size={14} />
            <span>Booked</span>
          </div>
        ) : (
          <button className="text-yellow-400 hover:underline">
            Book for Analysis
          </button>
        )}
      </div>
    </Card>
  );
}
