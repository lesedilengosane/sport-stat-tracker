"use client";

import React from "react";

interface UserCardProps {
  name: string;
  role: string;
}

export default function UserCard({ name, role }: UserCardProps) {
  return (
    <section className="group relative w-full max-w-md mx-auto p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-gray-900 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 shadow-lg flex items-center justify-center text-white text-4xl font-extrabold ring-4 ring-white/30 group-hover:scale-105 transition-transform duration-300">
          {name?.charAt(0).toUpperCase() || "U"}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white/40 shadow-md"></div>
        </div>

        <h2 className="mt-5 text-2xl font-semibold text-gray-900 tracking-wide group-hover:text-black transition-colors">
          {name || "Unknown User"}
        </h2>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-300/40" />

      {/* Role */}
      <div className="text-center">
        <span className="text-gray-500 font-medium block mb-2 uppercase text-xs">
          Role
        </span>
        <span
          className={`inline-block px-6 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 
            ${
              role === "Coach"
                ? "bg-green-100 text-green-800 border border-green-400"
                : role === "Analyst"
                ? "bg-blue-100 text-blue-800 border border-blue-400"
                : role === "Fan"
                ? "bg-purple-100 text-purple-800 border border-purple-400"
                : "bg-gray-100 text-gray-800 border border-gray-400"
            }`}
        >
          {role || "User"}
        </span>
      </div>
    </section>
  );
}
