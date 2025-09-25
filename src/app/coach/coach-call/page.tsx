"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type UserInfo = {
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  team_id?: string | null;
  team_name?: string | null;
};

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [blurActive, setBlurActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [creating, setCreating] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const { user } = useAuth();

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
      } = await supabase.auth.getSession();

      if (!session?.user) throw new Error("No session found");

      const res = await fetch("/api/DatabaseApi/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_user_id: session.user.id }),
      });

      if (!res.ok) throw new Error("Failed to fetch user info");
      const { exists, user_id, first_name, last_name, role } = await res.json();

      if (!exists) {
        setUserInfo(null);
        return;
      }

      let team_id: string | null = null;
      let team_name: string | null = null;

      if (role === "Coach") {
        const teamRes = await fetch("/api/coach/getCoachTeam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        });

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          team_id = teamData.team_id || null;
          team_name = teamData.team_name || null;
        }
      }

      setUserInfo({ user_id, first_name, last_name, role, team_id, team_name });
    } catch (err) {
      console.error("Error fetching user info:", err);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachTeam = async () => {
    try {
      if (!userInfo) return;
      const res = await fetch("/api/coach/getCoachTeam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userInfo.user_id }),
      });

      if (!res.ok) throw new Error("Failed to fetch coach team");

      const { team_id, team_name } = await res.json();
      setUserInfo((prev) =>
        prev ? { ...prev, team_id, team_name } : prev
      );
    } catch (err) {
      console.error("Error refreshing coach team:", err);
    }
  };

  const movetoCoachDashboard = () => router.push("/coach");

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !userInfo) return;
    setCreating(true);

    try {
      const res = await fetch("/api/coach/create-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: teamName,
          coach_id: userInfo.user_id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to create team");

      setShowModal(false);
      setTeamName("");
      setTeamLogo("");
      fetchCoachTeam();
    } catch (err) {
      console.error("Error creating team:", err);
      alert("Failed to create team: " + err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!userInfo) return <p className="text-center mt-10">No user info found.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-black via-gray-900 to-indigo-950 relative overflow-hidden">
      {/* Black hole glowing background */}
      <div className="absolute w-[800px] h-[800px] rounded-full 
                bg-gradient-to-r from-black via-orange-700 to-black 
                blur-3xl opacity-60 animate-pulse"></div>
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
      <Button variant="outline" onClick={movetoCoachDashboard} className="flex-1">
        Go to Coach Dashboard
      </Button>
    )}

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogContent className="bg-gray-900 text-gray-100 rounded-2xl shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create Your Team</DialogTitle>
                </DialogHeader>

                <Input
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
                <Input
                  placeholder="Enter the team logo URL (optional)"
                  value={teamLogo}
                  onChange={(e) => setTeamLogo(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />

                <DialogFooter className="mt-4">
                  <Button
                    onClick={handleCreateTeam}
                    disabled={!teamName.trim() || creating}
                    className="w-full"
                  >
                    {creating ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}