"use client"
import Image from "next/image"

type PlayerDetails = {
  id: string
  avatarUrl?: string
  name: string
  surname: string
  position: string
}

interface Props {
  homeTeam: string
  awayTeam: string
  homeLineup: PlayerDetails[] // full list: first 5 = starters, rest = subs
  awayLineup: PlayerDetails[]
  onPlayerClick?: (id: string) => void
  courtImageUrl?: string // optional background image
}

const starterSlotsHome = [
  { left: "15%", top: "20%" }, // Top left corner
  { left: "25%", top: "40%" }, // Mid-left high
  { left: "35%", top: "50%" }, // Center-left
  { left: "25%", top: "60%" }, // Mid-left low
  { left: "15%", top: "80%" }, // Bottom left corner
]

const starterSlotsAway = [
  { left: "85%", top: "20%" }, // Top right corner
  { left: "75%", top: "40%" }, // Mid-right high
  { left: "65%", top: "50%" }, // Center-right
  { left: "75%", top: "60%" }, // Mid-right low
  { left: "85%", top: "80%" }, // Bottom right corner
]

export default function BasketballCourtLineup({
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  onPlayerClick,
  courtImageUrl = "/court2.png",
}: Props) {
  // first 5 = starters; rest = subs
  const homeStarters = homeLineup.slice(0, 5)
  const homeSubs = homeLineup.slice(5)

  const awayStarters = awayLineup.slice(0, 5)
  const awaySubs = awayLineup.slice(5)

  const renderPlayerChip = (p: PlayerDetails) => (
    <div
      className="flex flex-col items-center cursor-pointer select-none"
      onClick={() => onPlayerClick?.(p.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onPlayerClick?.(p.id)
      }}
    >
      {p.avatarUrl ? (
        <Image
          src={p.avatarUrl || "/placeholder.svg"}
          alt={p.name}
          width={80}
          height={80}
          className="rounded-full border-2 border-white shadow-lg"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-base font-bold text-black border-2 border-white shadow-lg">
          {p.name?.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="mt-1.5 text-xs text-black text-center drop-shadow-lg">
        <div className="font-bold leading-tight">{p.name}</div>
        {p.surname && <div className="text-[10px] text-black/90">{p.surname}</div>}
      </div>
    </div>
  )

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-black">{homeTeam}</h3>
        <h3 className="text-lg font-bold text-black">{awayTeam}</h3>
      </div>

      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border-2 border-gray-800 shadow-2xl">
        <Image
          src={"/court/court3.jpg" || "/placeholder.svg"}
          alt="Basketball court"
          fill
          className="object-cover"
          priority
        />

        {/* Subtle overlay for better player visibility */}
        <div className="absolute inset-0 bg-black/10 z-10 " />

        {/* Home half starters (left) */}
        <div className="absolute inset-0 z-20">
          {homeStarters.map((player, idx) => {
            const slot = starterSlotsHome[idx] || starterSlotsHome[0]
            return (
              <div
                key={player.id}
                style={{ left: slot.left, top: slot.top }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              >
                {renderPlayerChip(player)}
              </div>
            )
          })}

          {/* Away starters (right) */}
          {awayStarters.map((player, idx) => {
            const slot = starterSlotsAway[idx] || starterSlotsAway[0]
            return (
              <div
                key={player.id}
                style={{ left: slot.left, top: slot.top }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              >
                {renderPlayerChip(player)}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-bold text-black mb-3 uppercase tracking-wide">Home Subs</h4>
          <div className="flex flex-wrap gap-3">
            {homeSubs.length === 0 ? (
              <div className="text-sm text-black/60 italic">No substitutes</div>
            ) : (
              homeSubs.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onPlayerClick?.(p.id)}
                  className="cursor-pointer bg-white/10 backdrop-blur-sm px-3 py-2.5 rounded-lg flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                >
                  {p.avatarUrl ? (
                    <Image
                      src={p.avatarUrl || "/placeholder.svg"}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="rounded-full border border-white/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold text-black">
                      {p.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm text-black">
                    <div className="font-semibold">{p.name}</div>
                    {p.surname && <div className="text-xs text-black/70">{p.surname}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-black mb-3 uppercase tracking-wide text-right">Away Subs</h4>
          <div className="flex flex-wrap gap-3 justify-end">
            {awaySubs.length === 0 ? (
              <div className="text-sm text-white/60 italic">No substitutes</div>
            ) : (
              awaySubs.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onPlayerClick?.(p.id)}
                  className="cursor-pointer bg-white/10 backdrop-blur-sm px-3 py-2.5 rounded-lg flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                >
                  {p.avatarUrl ? (
                    <Image
                      src={p.avatarUrl || "/placeholder.svg"}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="rounded-full border border-white/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold text-white">
                      {p.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm text-black">
                    <div className="font-semibold">{p.name}</div>
                    {p.surname && <div className="text-xs text-black/70">{p.surname}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
