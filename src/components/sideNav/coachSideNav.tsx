"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, BarChart3, Trophy, Users, Settings, Menu, X, LogOut } from "lucide-react"
import { supabase } from "@/app/api/DatabaseApi/supabaseClient"

const coachNavItems = [
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "all-games", label: "All Games", icon: Trophy },
  { id: "team-management", label: "Team Management", icon: Settings },
  { id: "team-stats", label: "Team Stats", icon: BarChart3 },
  { id: "players", label: "Players", icon: Users },
]

interface CoachSideNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function CoachSideNav({ activeTab, onTabChange }: CoachSideNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    setIsOpen(false)
  }

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-black/80 backdrop-blur-sm border border-orange-500/20 rounded-lg text-orange-500 hover:bg-orange-500/10 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}

      {/* Sidenav */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-black/90 backdrop-blur-sm border-r border-orange-500/20 z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 pt-16 h-full flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-orange-500 uppercase tracking-wide">Coach Dashboard</h2>
          </div>

          <nav className="space-y-2 flex-1">
            {coachNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left",
                    "hover:bg-orange-500/10 hover:text-orange-400 hover:translate-x-1",
                    isActive
                      ? "bg-orange-500/20 text-orange-400 border-l-4 border-orange-500"
                      : "text-gray-300 hover:text-orange-400",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-orange-500/20">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-red-400 hover:bg-red-500/10 hover:translate-x-1 w-full"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
