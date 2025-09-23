//app/components/coachComponent/teamManagement
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Plus } from "lucide-react"

export default function TeamManagement() {
  const [lineup, setLineup] = useState({})

  const handleSaveLineup = () => {
    console.log("Saving lineup:", lineup)
    // TODO: Implement save functionality
  }

  const handleAddPlayer = () => {
    console.log("Add player clicked")
    // TODO: Implement add player functionality
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Save Button */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <Button onClick={handleSaveLineup} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Lineup
        </Button>
      </div>

      {/* Main Content - 70-30 Split */}
      <div className="flex gap-6 h-[calc(100vh-140px)]">
        {/* Basketball Court - 70% */}
        <div className="flex-[7] relative">
          <Card className="h-full overflow-hidden p-0">
            <CardContent className="p-0 h-full relative">
              {/* Basketball Court Background */}
              <div
                className="absolute inset-0 bg-[length:100%_100%] bg-no-repeat"
                style={{
                    backgroundImage: "url('/court/aerialView.png')",
                }}
                >
                {/* Overlay for better visibility if needed */}
                <div className="absolute inset-0 bg-black/10"></div>

              

                
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reserves Section - 30% */}
        <div className="flex-[3]">
          <ReservesComponent onAddPlayer={handleAddPlayer} />
        </div>
      </div>
    </div>
  )
}

// Reserves Component
function ReservesComponent({ onAddPlayer }: { onAddPlayer: () => void }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">Reserves</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between p-6 pb-2">
        {/* Players Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg">Players should appear here</p>
          </div>
        </div>

        {/* Add Player Button */}
        <div className="mt-6 mb-0 ">
          <Button
            onClick={onAddPlayer}
            className="w-full flex items-center justify-center gap-2 bg-transparent"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
