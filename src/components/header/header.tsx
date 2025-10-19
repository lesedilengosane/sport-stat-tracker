"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { SearchDropdown } from "@/components/header/searchDropdown";

interface DashboardHeaderProps {
  placeholder?: string;
}

export function DashboardHeader({ placeholder = "Search players and teams..." }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const username = user ? `${user.first_name} ${user.last_name}` : "User";
  const userRole = user?.user_role || "User";

  // Update loading based on auth state
  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearchOpen(e.target.value.length >= 2);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length >= 2) setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm border-b border-orange-200 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left spacer for hamburger menu */}
        <div className="w-16" />

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8 relative" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-4xl placeholder-gray-400 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {isSearchOpen && (
            <SearchDropdown query={searchQuery} onClose={handleCloseSearch} />
          )}
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {!user?.first_name || !user?.last_name ? (
              <>
                {/* Loading skeleton for name */}
                <div className="h-5 w-32 bg-orange-500/30 rounded animate-pulse" />
                {/* Loading skeleton for avatar */}
                <div className="h-10 w-10 rounded-full bg-orange-500/30 animate-pulse" />
              </>
            ) : (
              <>
                <span className="text-sm text-orange-500">
                  Hello, {user.first_name} {user.last_name}
                </span>
                <Badge
                  className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium text-md hover:cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  {user.first_name[0].toUpperCase()}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
