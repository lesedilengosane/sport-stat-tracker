"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { supabase } from "../api/DatabaseApi/supabaseClient"
import { CoachSideNav } from "@/components/sideNav/coachSideNav"
import { DashboardHeader } from "@/components/header/header"
import { useState } from "react"
import TeamManagement from "@/components/coachComponents/teamManagement"

export default function CoachDashboard() {
  const router = useRouter()
  const { userName, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("schedule")

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-orange-500 text-xl">Loading...</div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "schedule":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Team Schedule</h2>
              <p className="text-gray-300">This is where the team schedule and upcoming games will be displayed</p>
            </div>
          </div>
        )
      case "all-games":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">All Games</h2>
              <p className="text-gray-300">This is where all past and future games will be displayed</p>
            </div>
          </div>
        )
      case "team-management":
        return (
          <div className="max-w-6xl mx-auto ">
            <TeamManagement/>
          </div>
        )
      case "team-stats":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Team Statistics</h2>
              <p className="text-gray-300">
                This is where comprehensive team statistics and performance metrics will be shown
              </p>
            </div>
          </div>
        )
      case "players":
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Team Players</h2>
              <p className="text-gray-300">This is where player roster and individual statistics will be managed</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative min-h-screen">
      <CoachSideNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <Image src="/bgr.jpg" alt="Background" fill priority className="object-cover" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen bg-black/30 backdrop-blur-sm">
        <DashboardHeader placeholder="Search players and teams..." />

        {renderTabContent()}
      </div>
    </div>
  )
}
