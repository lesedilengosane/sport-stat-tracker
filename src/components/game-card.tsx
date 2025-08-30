import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation";

interface Team {
  name: string
  logo: string
}

interface GameCardProps {
  date: string
  homeTeam: Team
  awayTeam: Team
}

export function GameCard({ date, homeTeam, awayTeam }: GameCardProps) {
  const router = useRouter();

  return (
    <Card 
    onClick={() => router.push("/analyst")}
    className="bg-slate-800 border-slate-700 p-4 text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-slate-900/50 hover:bg-slate-750 cursor-pointer">
      
      <div className="text-sm text-slate-400 mb-4">{date}</div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative mb-2">
            <Image
              src={homeTeam.logo || "/placeholder.svg"}
              alt={`${homeTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-sm font-medium">{homeTeam.name}</span>
        </div>

        <div className="text-slate-400 font-bold text-lg mx-4">vs</div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative mb-2">
            <Image
              src={awayTeam.logo || "/placeholder.svg"}
              alt={`${awayTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-sm font-medium">{awayTeam.name}</span>
        </div>
      </div>
    </Card>
  )
}
