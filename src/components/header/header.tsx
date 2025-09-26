"use client"
import { Search, Bell } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { routerServerGlobal } from "next/dist/server/lib/router-utils/router-server-context"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  placeholder?: string
}

export function DashboardHeader({ placeholder = "Search players and teams..." }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const router = useRouter();

  const username = user?.first_name + " " + user?.last_name || "User"
  const userRole = user?.user_role || "User";

  return (
    <div className="bg-white/50 backdrop-blur-sm border-b border-orange-500/20 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left spacer for hamburger menu */}
        <div className="w-16"></div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] border border-black/5 rounded-4xl text- placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4">

          <div className="flex items-center gap-3">
            <span className="text-sm text-orange-500">Hello, {user?.first_name + " " + user?.last_name || "User"}</span>
            <Badge className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium  text-md hover:cursor-pointer" onClick={() => router.push("/profile")}>
              {user?.first_name?.[0]?.toUpperCase() || "U"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
