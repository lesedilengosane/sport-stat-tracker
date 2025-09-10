// components/BookGameButton.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

interface BookGameButtonProps {
  gameId: string;
}

export default function BookGameButton({ gameId }: BookGameButtonProps) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setRole(null);
        return;
      }

      // Fetch role from user metadata (or from your roles table if you store it there)
      const userRole = user.user_metadata?.role;
      setRole(userRole || null);
    };

    fetchUserRole();
  }, []);

  const handleBookGame = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("booked_matches").insert({
        match_id: gameId,
        user_id: user.id,
        booked_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess("Game successfully booked!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (role !== "Analyst") return null; // only Analysts can see the button

  return (
    <div className="mt-2">
      <button
        onClick={handleBookGame}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Booking..." : "Book Game"}
      </button>
      {success && <p className="text-green-400 mt-2">{success}</p>}
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
}
