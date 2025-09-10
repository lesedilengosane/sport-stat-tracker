"use client";

import React, { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const [userName, setUserName] = useState<string>("User");
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
        // Grab full name or email fallback
        const fullName =
          user.user_metadata?.full_name || user.email || "User";
        setUserName(fullName.split(" ")[0]);

        // Grab profile image (you can store this in user_metadata when signing up)
        setProfileImage(user.user_metadata?.avatar_url || null);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* App name */}
        <div>
          <h1 className="text-xl font-bold text-white">StatTracker</h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams, players, games..."
              className="w-full bg-gray-700 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-white">Hello, {userName}</span>
          <Link href="/dashboard/profile">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-white shadow-md cursor-pointer"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {userName[0]?.toUpperCase() || "U"}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
