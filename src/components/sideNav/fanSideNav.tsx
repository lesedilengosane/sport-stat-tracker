"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, Calendar, Trophy, Menu, X, LogOut } from "lucide-react"
import { supabase } from "@/app/api/DatabaseApi/supabaseClient"

const fanNavItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "players", label: "Players", icon: Users },
  { id: "standings", label: "Standings", icon: Trophy },
  {id: "teams", label: "Teams", icon: Users}
]

interface FanSideNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function FanSideNav({ activeTab, onTabChange }: FanSideNavProps) {
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 rounded-full 
          bg-white/10 backdrop-blur-md border border-orange-400/30 
          text-orange-500 shadow-lg transition-all duration-300 
          hover:scale-110 hover:shadow-orange-500/20"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/25 z-30" onClick={() => setIsOpen(false)} />}

      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-sm border-r border-orange-400/30 shadow-lg shadow-orange-500/10 z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 pt-16 h-full flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-black uppercase tracking-wide drop-shadow">Fan</h2>
            <h2 className="text-xl font-bold text-orange-400 uppercase tracking-wide drop-shadow">Dashboard</h2>
          </div>

          <nav className="space-y-2 flex-1">
            {fanNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left",
                    "hover:bg-white/10 hover:text-white hover:translate-x-1",
                    isActive ? "bg-white/15 text-white shadow-lg border-1" : "text-black",
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-black hover:text-white/60 hover:bg-white/20 hover:translate-x-1 w-full"
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
