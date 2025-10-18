"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { supabase } from "@/app/api/DatabaseApi/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, X } from "lucide-react"
import { Label } from "@/components/ui/label"

type UserInfo = {
  user_id: string
  first_name: string
  last_name: string
  role: string
  team_id?: string | null
  team_name?: string | null
}

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [blurActive, setBlurActive] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamLogoFile, setTeamLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    setIsLoaded(true)
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 500)

    const buttonTimer = setTimeout(() => {
      setShowButtons(true)
    }, 1400)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(buttonTimer)
    }
  }, [])

  const fetchUserInfo = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) throw new Error("No session found")

      const res = await fetch("/api/DatabaseApi/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_user_id: session.user.id }),
      })

      if (!res.ok) throw new Error("Failed to fetch user info")
      const { exists, user_id, first_name, last_name, role } = await res.json()

      if (!exists) {
        setUserInfo(null)
        return
      }

      let team_id: string | null = null
      let team_name: string | null = null

      if (role === "Coach") {
        const teamRes = await fetch("/api/coach/getCoachTeam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        })

        if (teamRes.ok) {
          const teamData = await teamRes.json()
          team_id = teamData.team_id || null
          team_name = teamData.team_name || null
        }
      }

      setUserInfo({ user_id, first_name, last_name, role, team_id, team_name })
    } catch (err) {
      console.error("Error fetching user info:", err)
      setUserInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchCoachTeam = async () => {
    try {
      if (!userInfo) return
      const res = await fetch("/api/coach/getCoachTeam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userInfo.user_id }),
      })

      if (!res.ok) throw new Error("Failed to fetch coach team")

      const { team_id, team_name } = await res.json()
      setUserInfo((prev) => (prev ? { ...prev, team_id, team_name } : prev))
    } catch (err) {
      console.error("Error refreshing coach team:", err)
    }
  }

  const movetoCoachDashboard = () => router.push("/coach")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (PNG, JPEG, or SVG)")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      setTeamLogoFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setTeamLogoFile(null)
    setLogoPreview(null)
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !userInfo) return
    setCreating(true)
    setUploading(true)

    try {
      let iconUrl = null

      // Upload logo to Supabase storage if file is selected
      if (teamLogoFile) {
        const fileExt = teamLogoFile.name.split(".").pop()
        const fileName = `${userInfo.user_id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        console.log("[v0] Uploading team logo to Supabase storage...")

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("teamLogos")
          .upload(filePath, teamLogoFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error("[v0] Upload error:", uploadError)
          throw new Error(`Failed to upload logo: ${uploadError.message}`)
        }

        console.log("[v0] Upload successful:", uploadData)

        // Get public URL for the uploaded file
        const {
          data: { publicUrl },
        } = supabase.storage.from("teamLogos").getPublicUrl(filePath)

        iconUrl = publicUrl
        console.log("[v0] Public URL:", iconUrl)
      }

      setUploading(false)

      // Create team with logo URL
      const res = await fetch("/api/coach/create-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: teamName,
          coach_id: userInfo.user_id,
          icon_url: iconUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Failed to create team")

      setShowModal(false)
      setTeamName("")
      setTeamLogoFile(null)
      setLogoPreview(null)
      fetchCoachTeam()
    } catch (err) {
      console.error("Error creating team:", err)
      alert("Failed to create team: " + err)
    } finally {
      setCreating(false)
      setUploading(false)
    }
  }

  useEffect(() => {
    fetchUserInfo()
  }, [])

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (!userInfo) return <p className="text-center mt-10">No user info found.</p>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-black via-gray-900 to-indigo-950 relative overflow-hidden">
      {/* Black hole glowing background */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full 
                bg-gradient-to-r from-black via-orange-700 to-black 
                blur-3xl opacity-60 animate-pulse"
      ></div>
      {/* Background Image */}
      <Image
        src="/bgrs.jpeg"
        alt="Basketball player dunking"
        fill
        priority
        className={`object-cover transition-all duration-1000 ease-out ${blurActive ? "blur-sm" : ""} ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
        }`}
      />
      {/* Profile Card */}
      <div className="relative z-10 max-w-xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 shadow-[0_0_40px_rgba(139,92,246,0.6)] space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">
            {userInfo.first_name} {userInfo.last_name}
          </h1>
          <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full">
            {userInfo.role}
          </Badge>
          <p className="text-sm text-gray-400">
            {/* User ID: <span className="text-gray-200">{userInfo.user_id}</span> */}
          </p>

          {userInfo.role === "Coach" && (
            <div className="mt-4 space-y-2">
              <p>
                {/* <span className="font-semibold">Team ID:</span>{" "}  */}
                {/*userInfo.team_id ? (
                  <span className="text-green-400">{userInfo.team_id}</span>
                ) : (
                  <span className="text-red-400">No team assigned</span>
                )*/}
              </p>
              <p>
                <span className="font-semibold">Team Name:</span>{" "}
                {userInfo.team_name ? (
                  <span className="text-green-400">{userInfo.team_name}</span>
                ) : (
                  <span className="text-red-400">No team assigned</span>
                )}
              </p>
            </div>
          )}
        </div>

        {userInfo.role === "Coach" && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setShowModal(true)} className="flex-1">
              Create Team
            </Button>
            {/* Only show this button if both team_id and team_name are set */}
            {userInfo.team_id && userInfo.team_name && (
              <Button variant="outline" onClick={movetoCoachDashboard} className="flex-1 bg-transparent">
                Go to Coach Dashboard
              </Button>
            )}

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogContent className="bg-gray-900 text-gray-100 rounded-2xl shadow-lg border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create Your Team</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Team Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-gray-100"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label htmlFor="team-logo">Team Logo</Label>

                    {!logoPreview ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id="team-logo"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("team-logo")?.click()}
                          className="w-full bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo (PNG, JPEG, SVG)
                        </Button>
                      </div>
                    ) : (
                      <div className="relative w-full h-32 rounded-lg border border-gray-700 bg-gray-800 overflow-hidden">
                        <Image
                          src={logoPreview || "/placeholder.svg"}
                          alt="Team logo preview"
                          fill
                          className="object-contain p-2"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">Optional. Max file size: 5MB</p>
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button onClick={handleCreateTeam} disabled={!teamName.trim() || creating} className="w-full">
                    {uploading ? "Uploading..." : creating ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}
