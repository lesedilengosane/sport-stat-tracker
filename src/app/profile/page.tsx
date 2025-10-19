"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import UserCard from "@/components/UserCard";
import Historicaldata from "@/components/historicaldata";
import ExtApi from "@/components/ExtApi";
import { supabase } from "../api/DatabaseApi/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<{
    user_id: string;
    first_name: string;
    last_name: string;
    role: string;
    team_id?: string | null;
    team_name?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // State for background blur effect and text/buttons animation
  const [blurActive, setBlurActive] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const name_surname = `${userInfo?.first_name} ${userInfo?.last_name}`;

  const fetchUserInfo = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) throw new Error("No session found");

      const res = await fetch("/api/DatabaseApi/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_user_id: session.user.id }),
      });

      if (!res.ok) throw new Error("Failed to fetch user info");
      const { exists, user_id, first_name, last_name, role } = await res.json();

      if (!exists) {
        setUserInfo(null);
        return;
      }

      let team_id: string | null = null;
      let team_name: string | null = null;

      if (role === "Coach") {
        const teamRes = await fetch("/api/coach/getCoachTeam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        });

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          team_id = teamData.team_id || null;
          team_name = teamData.team_name || null;
        }
      }

      setUserInfo({ user_id, first_name, last_name, role, team_id, team_name });
    } catch (err) {
      console.error("Error fetching user info:", err);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const dashboard = () => {
    if (user?.user_role === "Fan") router.push("/fan");
    else if (user?.user_role === "Coach") router.push("/coach");
    else if (user?.user_role === "Analyst") router.push("/analyst");
  };

  // Animate text/buttons on mount
  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 200);
    const t2 = setTimeout(() => setShowButtons(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-auto bg-white">
      {/* Background Image */}
      <Image
        src="/background/ballBG.jpeg"
        alt="Basketball player dunking"
        fill
        priority
        className={`object-cover transition-all duration-1000 ease-out ${
          blurActive ? "blur-sm" : ""
        } ${!loading ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main content */}
      <div className="relative z-10 px-8 md:px-16 py-12 min-h-screen">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1
            className={`text-4xl md:text-6xl font-bold leading-tight transition-all duration-800 ease-out ${
              showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-orange-500">
              {loading ? "Loading..." : `WELCOME, ${name_surname || "PLAYER"}.`}
            </span>
          </h1>
          <h1
            className={`text-4xl md:text-6xl font-bold leading-tight text-white transition-all duration-800 ease-out delay-200 ${
              showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            YOUR STATS. YOUR GAME.
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className={`text-white text-lg md:text-xl mb-8 leading-relaxed text-center transition-all duration-800 ease-out delay-500 ${
            showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Keep track of your performance, bookings, and history all in one
          place.
        </p>

        {/* Profile card */}
        <div className="mb-8 flex justify-center">
          {loading ? (
            // Loading skeleton
            <UserCard name={"Loading..."} role={"Loading..."} />
          ) : 
            <UserCard
              name={name_surname || "No name"}
              role={userInfo?.role || "User"}
            />
          }
        </div>

        {/* Buttons / actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            className={`bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold hover:scale-105 rounded-xl transition-all duration-700 ${
              showButtons ? "opacity-100" : "opacity-0"
            }`}
            onMouseEnter={() => setBlurActive(true)}
            onMouseLeave={() => setBlurActive(false)}
            onClick={() => router.back()}
          >
            Dashboard
          </button>
        </div>

        {/* Extra components */}
        <div className="space-y-8">
          <Historicaldata  />
          <ExtApi />
        </div>
      </div>
    </div>
  );
}
