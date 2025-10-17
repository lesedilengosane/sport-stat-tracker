"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, User, Users, X } from "lucide-react"
import Image from "next/image"
import type { SearchResults, SearchPlayer, SearchTeam } from "@/types/search"

interface SearchDropdownProps {
  query: string
  onClose: () => void
}

export function SearchDropdown({ query, onClose }: SearchDropdownProps) {
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "players" | "teams">("all")
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults(null)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handlePlayerClick = (player: SearchPlayer) => {
    router.push(`/player/${player.player_id}`)
    onClose()
  }

  const handleTeamClick = (team: SearchTeam) => {
    router.push(`/fan/team/${team.team_id}`)
    onClose()
  }

  if (!query || query.length < 2) {
    return null
  }

  const totalResults = (results?.players.length || 0) + (results?.teams.length || 0)
  const playersCount = results?.players.length || 0
  const teamsCount = results?.teams.length || 0

  const filteredPlayers = activeTab === "all" || activeTab === "players" ? results?.players || [] : []
  const filteredTeams = activeTab === "all" || activeTab === "teams" ? results?.teams || [] : []

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white/90 rounded-2xl shadow-2xl border-2 border-orange-500/20 max-h-[500px] overflow-hidden z-50"
    >
      {/* Header with tabs */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Search results for "{query}"</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All <span className="ml-1 text-xs">{totalResults}</span>
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              activeTab === "players" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <User className="h-3 w-3" />
            Players <span className="ml-1 text-xs">{playersCount}</span>
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              activeTab === "teams" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Users className="h-3 w-3" />
            Teams <span className="ml-1 text-xs">{teamsCount}</span>
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-sm">Searching...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No results found for "{query}"</p>
          </div>
        ) : (
          <div className="p-2">
            {/* Players Section */}
            {filteredPlayers.length > 0 && (
              <div className="mb-2">
                {activeTab === "all" && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Players</div>
                )}
                {filteredPlayers.map((player) => (
                  <button
                    key={player.player_id}
                    onClick={() => handlePlayerClick(player)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-orange-100 rounded-lg transition-colors text-left"
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {player.avatar_url ? (
                        <Image
                          src={player.avatar_url || "/placeholder.svg"}
                          alt={`${player.first_name} ${player.last_name}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-orange-100 text-orange-600 font-semibold">
                          {player.first_name[0]}
                          {player.last_name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.position}
                        {player.jersey_number && ` • #${player.jersey_number}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Teams Section */}
            {filteredTeams.length > 0 && (
              <div>
                {activeTab === "all" && filteredPlayers.length > 0 && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teams</div>
                )}
                {filteredTeams.map((team) => (
                  <button
                    key={team.team_id}
                    onClick={() => handleTeamClick(team)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 rounded-lg transition-colors text-left"
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {team.icon_url ? (
                        <Image
                          src={team.icon_url || "/placeholder.svg"}
                          alt={team.team_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-orange-100 text-orange-600 font-semibold">
                          <Users className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{team.team_name}</p>
                      <p className="text-xs text-gray-500">Team</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
