"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import UserCard from "@/components/UserCard";
import Historicaldata from "@/components/historicaldata";
import ExtApi from "@/components/ExtApi";

export default function ProfilePage() {
  const router = useRouter();
  const { user} = useAuth();

  const [blurActive, setBlurActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const name_surname = `${user?.first_name} ${user?.last_name}`;
   const [isLoading, setIsLoading] = useState(true);


  // Animate text/buttons on mount
  useEffect(() => {
    setIsLoaded(true);
    const t1 = setTimeout(() => setShowText(true), 200);
    const t2 = setTimeout(() => setShowButtons(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <><div className="relative w-full min-h-screen overflow-auto bg-black">
      {/* Background Image */}
      <Image
        src="/bgr.jpg" // replace with your hero background
        alt="Basketball player dunking"
        fill
        priority
        onLoad={() => setIsLoaded(true)}
        className={`object-cover transition-all duration-1000 ease-out ${
          blurActive ? "blur-sm" : ""
        } ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
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
          Keep track of your performance, bookings, and history all in one place.
        </p>

        {/* Profile card */}
        {!loading && user && (
          <div className="mb-8 flex justify-center">
            <UserCard
              name={name_surname  || "No name"}
              email={`${name_surname}`+"@gmail.com" || "No email"}
              role={user.user_role || "User"}
            />
          </div>
        )}

        {/* Buttons / actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            className={`bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold hover:scale-105 rounded-xl transition-all duration-700 ${
              showButtons ? "opacity-100" : "opacity-0"
            }`}
            onMouseEnter={() => setBlurActive(true)}
            onMouseLeave={() => setBlurActive(false)}
            onClick={() => router.push("/analyst")}
          >
            Dashboard
          </button>

          <button
            className={`border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 text-lg font-semibold hover:scale-105 rounded-xl transition-all duration-700 ${
              showButtons ? "opacity-100" : "opacity-0"
            }`}
            onMouseEnter={() => setBlurActive(true)}
            onMouseLeave={() => setBlurActive(false)}
            onClick={() => router.push("/players")}
          >
            View Players
          </button>
        </div>

        {/* Extra components */}
        <div className="space-y-8">
          <Historicaldata team="" league="" />
          <ExtApi />
        </div>
      </div>
    </div> </>
    
  );
}
