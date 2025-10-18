
"use client";
import Image from "next/image";
import React from "react";

type PlayerDetails = {
  id: string;
  avatarUrl?: string;
  name: string;
  surname: string;
  position: string;
};

interface Props {
  homeTeam: string;
  awayTeam: string;
  homeLineup: PlayerDetails[]; // full list: first 5 = starters, rest = subs
  awayLineup: PlayerDetails[];
  onPlayerClick?: (id: string) => void;
  courtImageUrl?: string; // optional background image
}

const starterSlotsHome = [
  // positions are purely visual placeholders; order matters (index => slot)
  { left: "20%", top: "70%" },
  { left: "40%", top: "55%" },
  { left: "60%", top: "45%" },
  { left: "40%", top: "30%" },
  { left: "20%", top: "15%" },
];

const starterSlotsAway = [
  { left: "80%", top: "15%" },
  { left: "60%", top: "30%" },
  { left: "40%", top: "45%" },
  { left: "60%", top: "55%" },
  { left: "80%", top: "70%" },
];

export default function BasketballCourtLineup({
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  onPlayerClick,
  courtImageUrl = "/public/Basketball-court-Diagram-1024x658.jpg",
}: Props) {
  // first 5 = starters; rest = subs
  const homeStarters = homeLineup.slice(0, 5);
  const homeSubs = homeLineup.slice(5);

  const awayStarters = awayLineup.slice(0, 5);
  const awaySubs = awayLineup.slice(5);

  const renderPlayerChip = (p: PlayerDetails) => (
    <div
      className="flex flex-col items-center cursor-pointer select-none"
      onClick={() => onPlayerClick?.(p.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onPlayerClick?.(p.id);
      }}
    >
      {p.avatarUrl ? (
        <Image
          src={p.avatarUrl}
          alt={p.name}
          width={44}
          height={44}
          className="rounded-full border border-white/30 shadow-sm"
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/90 border border-white/20">
          {p.name?.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="mt-1 text-xs text-white/90 text-center">
        <div className="font-semibold leading-snug">{p.name}</div>
        {p.surname && <div className="text-[11px] text-white/60">{p.surname}</div>}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{homeTeam}</h3>
        <h3 className="text-lg font-bold text-white">{awayTeam}</h3>
      </div>

      {/* Court container */}
      <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-gray-700">
        {/* background (optional) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${courtImageUrl})`,
            filter: "brightness(.75)",
          }}
        />

        {/* overlay to tint halves slightly */}
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="bg-gradient-to-r from-black/20 to-transparent" />
          <div className="bg-gradient-to-l from-black/10 to-transparent" />
        </div>

        {/* Home half starters (left) */}
        <div className="absolute inset-0">
          {homeStarters.map((player, idx) => {
            const slot = starterSlotsHome[idx] || starterSlotsHome[starterSlotsHome.length - 1];
            return (
              <div
                key={player.id}
                style={{ left: slot.left, top: slot.top }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
              >
                {renderPlayerChip(player)}
              </div>
            );
          })}

          {/* Away starters (right) */}
          {awayStarters.map((player, idx) => {
            const slot = starterSlotsAway[idx] || starterSlotsAway[starterSlotsAway.length - 1];
            return (
              <div
                key={player.id}
                style={{ left: slot.left, top: slot.top }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
              >
                {renderPlayerChip(player)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Substitutes section */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-white/90 mb-2">Home Subs</h4>
          <div className="flex flex-wrap gap-3">
            {homeSubs.length === 0 ? (
              <div className="text-sm text-white/60">No substitutes</div>
            ) : (
              homeSubs.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onPlayerClick?.(p.id)}
                  className="cursor-pointer bg-white/5 px-3 py-2 rounded-lg flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    {p.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-sm text-white/90">
                    <div className="font-medium">{p.name}</div>
                    {p.surname && <div className="text-[12px] text-white/60">{p.surname}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/90 mb-2">Away Subs</h4>
          <div className="flex flex-wrap gap-3 justify-end">
            {awaySubs.length === 0 ? (
              <div className="text-sm text-white/60">No substitutes</div>
            ) : (
              awaySubs.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onPlayerClick?.(p.id)}
                  className="cursor-pointer bg-white/5 px-3 py-2 rounded-lg flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    {p.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-sm text-white/90">
                    <div className="font-medium">{p.name}</div>
                    {p.surname && <div className="text-[12px] text-white/60">{p.surname}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
