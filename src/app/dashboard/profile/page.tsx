'use client'

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/api/DatabaseApi/supabaseClient";

const Profile = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [teams, setTeams] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("");

  // Separate loading states
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingLeagues, setLoadingLeagues] = useState<boolean>(true);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(true);
  const [loadingStandings, setLoadingStandings] = useState<boolean>(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);
        if (!user) throw new Error("No user logged in");

        setUserEmail(user.email || "No email");
        setUserName(user.user_metadata?.full_name || user.user_metadata?.name || "No name");

        const response = await fetch('/api/DatabaseApi/checkUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auth_user_id: user.id }),
        });
        const result = await response.json();
        if (result.error) setRole("Error");
        else if (result.exists) setRole(result.role || "No role assigned");
        else setRole("User not found");

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load user data");
        setRole("Error");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoadingLeagues(true);
        const res = await fetch("/api/sports/leagues");
        const data = await res.json();
        const leagueList = Array.isArray(data.result) ? data.result : [];
        setLeagues(leagueList);
        if (leagueList.length > 0) setSelectedLeague(leagueList[0].league_key);
      } catch (err) {
        console.error("Error fetching leagues:", err);
        setLeagues([]);
      } finally {
        setLoadingLeagues(false);
      }
    };
    fetchLeagues();
  }, []);

  // Fetch teams
  // Fetch teams whenever selectedLeague changes
useEffect(() => {
  if (!selectedLeague) return;

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const res = await fetch(`/api/sports/teams?league_id=${selectedLeague}`);
      const data = await res.json();
      const teamsList = Array.isArray(data.result) ? data.result : [];
      setTeams(teamsList);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  fetchTeams();
}, [selectedLeague]);


  // Filter teams by selected league
  const filteredTeams = Array.isArray(teams) 
    ? teams.filter(team => team.league_key === selectedLeague) 
    : [];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      {/* User Info */}
      {loadingUser ? (
        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading user info...</p>
        </div>
      ) : (
        <section className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md mb-6">
          <div className="text-center">
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
                  role === "Coach" ? "bg-green-100 text-green-800" :
                  role === "Analyst" ? "bg-blue-100 text-blue-800" :
                  role === "Fan" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {role}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Leagues, Teams, Standings */}
      <section className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">
        {/* Leagues */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Leagues</h2>
        {loadingLeagues ? (
          <p>Loading leagues...</p>
        ) : leagues.length > 0 ? (
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 mb-4 w-full"
          >
            {leagues.map((league: any) => (
              <option key={league.league_key} value={league.league_key}>
                {league.league_name}
              </option>
            ))}
          </select>
        ) : (
          <p>No leagues available</p>
        )}

        {/* Teams */}
<h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Teams</h2>
{loadingTeams ? (
  <p>Loading teams...</p>
) : teams.length > 0 ? (
  <ul className="list-disc list-inside">
    {teams.map((team: any) => (
      <li key={team.team_key}>
        {team.team_name}
        {team.team_logo && (
          <img
            src={team.team_logo}
            alt={team.team_name}
            className="inline-block w-6 h-6 ml-2 rounded-full"
          />
        )}
      </li>
    ))}
  </ul>
) : (
  <p>No teams available for this league</p>
)}

      </section>
    </main>
  );
};

export default Profile;
