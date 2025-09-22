"use client";

import React from "react";

interface UserCardProps {
  name: string;
  email: string;
  role: string;
}

export default function UserCard({ name, email, role }: UserCardProps) {
  return (
    <section className="group relative w-full max-w-md mx-auto p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl text-gray-100 border border-gray-700 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 shadow-lg flex items-center justify-center text-white text-4xl font-extrabold ring-4 ring-gray-800/60 group-hover:scale-105 transition-transform duration-300">
          {name?.charAt(0).toUpperCase() || "U"}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 shadow-md"></div>
        </div>

        <h2 className="mt-5 text-2xl font-semibold text-gray-100 tracking-wide group-hover:text-white transition-colors">
          {name || "Unknown User"}
        </h2>
        <p className="text-gray-400 text-sm mt-1">{email || "No email"}</p>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-700" />

      {/* Role */}
      <div className="text-center">
        <span className="text-gray-400 font-medium block mb-2">Role</span>
        <span
          className={`inline-block px-5 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-colors
            ${
              role === "Coach"
                ? "bg-green-700 text-green-100"
                : role === "Analyst"
                ? "bg-blue-700 text-blue-100"
                : role === "Fan"
                ? "bg-purple-700 text-purple-100"
                : "bg-gray-700 text-gray-100"
            }`}
        >
          {role || "User"}
        </span>
      </div>
    </section>
  );
}
