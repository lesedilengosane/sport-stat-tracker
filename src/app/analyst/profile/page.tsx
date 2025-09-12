"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";
import UserCard from "@/components/UserCard";
import Historicaldata from "@/components/historicaldata";
import Booked_Games from "@/components/Booked_Games";
import ExtApi from "@/components/ExtApi";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);
        if (!user) throw new Error("No user logged in");

        setUser(user);
        setUserEmail(user.email || "No email");
        setUserName(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "No name"
        );

        const res = await fetch("/api/DatabaseApi/checkUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auth_user_id: user.id }),
        });
        const result = await res.json();
        if (result.error) setRole("Error");
        else if (result.exists) setRole(result.role || "No role assigned");
        else setRole("User not found");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load user data";
        console.error(message);
        setRole("Error");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      {loadingUser ? (
        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading user info...</p>
        </div>
      ) : (
        <UserCard name={userName} email={userEmail} role={role} />
      )}

      {/* Keep the rest of the page features */}
      <Historicaldata team={""} league={""} />
      <ExtApi />
    </main>
  );
};

export default Profile;
