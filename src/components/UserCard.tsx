"use client";

import React from "react";

interface UserCardProps {
  name: string;
  email: string;
  role: string;
}

export default function UserCard({ name, email, role }: UserCardProps) {
  return (
    <section className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md mb-6">
      <div className="text-center">
        {/* Avatar circle with initial */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {name?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">User Information</h2>

        {/* Info rows */}
        <div className="space-y-3 text-left">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Name:</span>
            <span className="text-gray-800">{name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Email:</span>
            <span className="text-gray-800 break-all">{email}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 font-medium">Role:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                role === "Coach"
                  ? "bg-green-100 text-green-800"
                  : role === "Analyst"
                  ? "bg-blue-100 text-blue-800"
                  : role === "Fan"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {role}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
