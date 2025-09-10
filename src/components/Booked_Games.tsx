"use client";
import { useEffect, useState } from "react";

interface Game {
  id: number;
  team_home: string;
  team_away: string;
  score_home: number;
  score_away: number;
  game_date: string;
}

interface BookedMatch {
  id: string;
  created_at: string;
  basketball_history: Game;
}

interface User {
  id: string;
  role: string;
}

export default function BookedMatches({ user }: { user: User }) {
  const [booked, setBooked] = useState<BookedMatch[]>([]);

  useEffect(() => {
    const fetchBooked = async () => {
      const res = await fetch(
        `/api/Booked_Games?userId=${user.id}&role=${user.role}`
      );
      const data = await res.json();
      setBooked(data);
    };
    fetchBooked();
  }, [user]);

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-bold">Booked Matches</h2>
      {booked.length === 0 ? (
        <p>No booked matches yet.</p>
      ) : (
        booked.map((bm) => (
          <div
            key={bm.id}
            className="p-3 border rounded-md shadow-sm bg-gray-50"
          >
            <p className="font-semibold">
              {bm.basketball_history.team_home} vs{" "}
              {bm.basketball_history.team_away}
            </p>
            <p>
              {new Date(bm.basketball_history.game_date).toDateString()} — Score:{" "}
              {bm.basketball_history.score_home} :{" "}
              {bm.basketball_history.score_away}
            </p>
            <small className="text-gray-500">
              Booked on {new Date(bm.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}
