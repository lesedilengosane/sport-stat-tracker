'use client'

import Image from "next/image";
import styles from "../landing.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../api/DatabaseApi/supabaseClient";
import { GamesGrid } from "@/components/games-grid"

// Sample game data - replace with your actual data source
const sampleGames = [
  {
    id: "1",
    date: "12 September 2025",
    homeTeam: {
      name: "Lakers",
      logo: "/Los_Angeles_Lakers.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
  },
  {
    id: "2",
    date: "12 September 2025",
    homeTeam: {
      name: "Heat",
      logo: "/Miami_Heat.svg",
    },
    awayTeam: {
      name: "Mavs",
      logo: "/Dallas_Mavericks.svg",
    },
  },
  {
    id: "3",
    date: "12 September 2025",
    homeTeam: {
      name: "Nets",
      logo: "/Brooklyn_Nets.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
  },
  {
    id: "4",
    date: "12 September 2025",
    homeTeam: {
      name: "Lakers",
      logo: "/Los_Angeles_Lakers.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
  },
  {
    id: "5",
    date: "12 September 2025",
    homeTeam: {
      name: "Lakers",
      logo: "/Los_Angeles_Lakers.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
  },
  {
    id: "6",
    date: "12 September 2025",
    homeTeam: {
      name: "Lakers",
      logo: "/Los_Angeles_Lakers.svg",
    },
    awayTeam: {
      name: "Warriors",
      logo: "/Golden_State_Warriors.svg",
    },
  },
]



export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      if (user) {
        // Try to get full_name from user_metadata, fallback to email if not available
        const fullName = user.user_metadata?.full_name || user.email || "User";
        setUserName(fullName.split(" ")[0]); // show first name only
      } else {
        router.push("/"); // redirect if no user
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className={styles.container}>
      <Image src="/bgr.jpg" alt="Background" fill priority className={styles.bgImage} />

      <div className={styles.overlay}>
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto p-6 mb-8">
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-80">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-white placeholder-white/70 outline-none flex-1"
            />
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        <GamesGrid games={sampleGames} />

        <div className="mt-8">
          <button onClick={() => router.push("/")} className={styles.btn}>
            Welcome to your Dashboard, {userName}! Now you may log out
          </button>
        </div>
      </div>
    </div>
  );
}
