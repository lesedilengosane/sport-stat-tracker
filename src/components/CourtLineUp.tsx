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
  { left: "25%", top: "15%" },  // PG - Point Guard (top of key)
  { left: "15%", top: "50%" },  // SG - Shooting Guard (left wing)
  { left: "40%", top: "35%" },  // SF - Small Forward (right wing)
  { left: "25%", top: "85%" },  // PF - Power Forward (left corner/low post)
  { left: "40%", top: "65%" },  // C - Center (right corner/low post)
]

const starterSlotsAway = [
  { left: "75%", top: "15%" },  // PG - Point Guard (top of key)
  { left: "85%", top: "50%" },  // SG - Shooting Guard (right wing)
  { left: "60%", top: "35%" },  // SF - Small Forward (left wing)
  { left: "75%", top: "85%" },  // PF - Power Forward (right corner/low post)
  { left: "60%", top: "65%" },  // C - Center (left corner/low post)
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

  const formatPlayerName = (name: string, surname: string) => {
    const firstName = name?.split(' ')[0] || name
    const lastName = surname || name?.split(' ').slice(1).join(' ') || ''
    return { firstName, lastName }
  }

  const renderPlayerChip = (p: PlayerDetails) => {
    const { firstName, lastName } = formatPlayerName(p.name, p.surname)
    const displayName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName

    return (
      <div
        className="flex flex-col items-center cursor-pointer select-none group"
        onClick={() => onPlayerClick?.(p.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") onPlayerClick?.(p.id)
        }}
      >
        <div className="relative">
          {p.avatarUrl ? (
            <div className="relative">
              <Image
                src={p.avatarUrl || "/placeholder.svg"}
                alt={p.name}
                width={80}
                height={80}
                className="rounded-full border-3 border-orange-500 shadow-lg group-hover:border-orange-600 transition-all duration-200"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white shadow-sm">
                {p.position}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg border-3 border-orange-500 shadow-lg group-hover:border-orange-600 transition-all duration-200">
                {firstName?.charAt(0)}{lastName?.charAt(0)}
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white shadow-sm">
                {p.position}
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 text-center max-w-[100px]">
          <div className="font-bold text-black text-sm leading-tight bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-orange-200 shadow-sm">
            {displayName}
          </div>
        </div>
      </div>
    )
  }

  const renderSubPlayer = (p: PlayerDetails) => {
    const { firstName, lastName } = formatPlayerName(p.name, p.surname)
    const displayName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName

    return (
      <div
        key={p.id}
        onClick={() => onPlayerClick?.(p.id)}
        className="cursor-pointer bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-3 border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-sm group"
      >
        {p.avatarUrl ? (
          <Image
            src={p.avatarUrl || "/placeholder.svg"}
            alt={p.name}
            width={48}
            height={48}
            className="rounded-full border-2 border-orange-500 group-hover:border-orange-600 transition-all duration-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold border-2 border-orange-500 group-hover:border-orange-600 transition-all duration-200">
            {firstName?.charAt(0)}{lastName?.charAt(0)}
          </div>
        )}
        <div className="text-black">
          <div className="font-semibold text-sm">{displayName}</div>
          <div className="text-xs text-gray-600 bg-orange-100 px-1.5 py-0.5 rounded-full border border-orange-200">
            {p.position}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-black bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-200">{homeTeam}</h3>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-black bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-200">{awayTeam}</h3>
        </div>
      </div>

      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border-3 border-orange-400 shadow-2xl">
        <Image
          src="/court/court3.jpg"
          alt="Basketball court"
          fill
          className="object-cover"
          priority
        />

        {/* Subtle overlay for better player visibility */}
        <div className="absolute inset-0 bg-black/5 z-10" />

        {/* Home half starters (left) */}
        <div className="absolute inset-0 z-20">
          {homeStarters.map((player, idx) => {
            const slot = starterSlotsHome[idx] || starterSlotsHome[0]
            return (
              <div
                key={player.id}
                style={{ left: slot.left, top: slot.top }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 hover:z-30"
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
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 hover:z-30"
              >
                {renderPlayerChip(player)}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-bold text-black mb-4 uppercase tracking-wide bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-200 inline-block">
            Home Subs
          </h4>
          <div className="flex flex-wrap gap-3 mt-2">
            {homeSubs.length === 0 ? (
              <div className="text-sm text-black/60 italic bg-white/80 px-3 py-2 rounded-lg border border-orange-200">
                No substitutes
              </div>
            ) : (
              homeSubs.map(renderSubPlayer)
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-black mb-4 uppercase tracking-wide bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-200 inline-block float-right">
            Away Subs
          </h4>
          <div className="flex flex-wrap gap-3 mt-2 justify-end clear-both">
            {awaySubs.length === 0 ? (
              <div className="text-sm text-black/60 italic bg-white/80 px-3 py-2 rounded-lg border border-orange-200">
                No substitutes
              </div>
            ) : (
              awaySubs.map(renderSubPlayer)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}