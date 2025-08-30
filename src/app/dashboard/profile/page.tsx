'use client'

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

const Profile = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Step 1: Get logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError.message);
          setError("Failed to get user information");
          return;
        }

        if (!user) {
          setError("No user logged in");
          return;
        }

        setUserEmail(user.email || "No email");
        setUserName(user.user_metadata?.full_name || user.user_metadata?.name || "No name");

        // Step 2: Use your API route to fetch user role
        const response = await fetch('/api/DatabaseApi/checkUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ auth_user_id: user.id }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          setError(result.error);
          setRole("Error");
          return;
        }

        if (result.exists) {
          setRole(result.role || "No role assigned");
        } else {
          setRole("User not found in database");
          console.warn("User not found in users table");
        }

      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Failed to load profile data");
        setRole("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600 text-lg">
          Welcome to your profile page, {userName}!
        </p>
      </header>

      <section className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <article className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Information</h2>
          
          <div className="space-y-3 text-left">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Name:</span>
              <span className="text-gray-800">{userName}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Email:</span>
              <span className="text-gray-800 break-all">{userEmail}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Role:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                role === "Coach" 
                  ? "bg-green-100 text-green-800" 
                  : role === "Analyst" 
                  ? "bg-blue-100 text-blue-800" 
                  : role === "Fan" 
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {role}
              </span>
            </div>
          </div>
        </article>
      </section>

      <footer className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Need help? Contact support
        </p>
      </footer>
    </main>
  );
};

export default Profile;