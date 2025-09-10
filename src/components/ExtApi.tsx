import React, { useState, useEffect } from 'react'
import Image from 'next/image';

interface League {
  league_key: string;
  league_name: string;
}

interface Team {
  team_key: string;
  team_name: string;
  league_key: string;
  team_logo?: string;
}

const ExtApi = () => {
      const [teams, setTeams] = useState<Team[]>([]);
      const [leagues, setLeagues] = useState<League[]>([]);
      const [selectedLeague, setSelectedLeague] = useState<string>("");
      const [loadingLeagues, setLoadingLeagues] = useState<boolean>(true);
      const [loadingTeams, setLoadingTeams] = useState<boolean>(true);

      // Fetch leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoadingLeagues(true);
        const res = await fetch("/api/sports/leagues");
        const data = await res.json();
        const leagueList: League[] = Array.isArray(data.result) ? data.result : [];
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

  // Fetch teams whenever selectedLeague changes
  useEffect(() => {
    if (!selectedLeague) return;

    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const res = await fetch(`/api/sports/teams?league_id=${selectedLeague}`);
        const data = await res.json();
        const teamsList: Team[] = Array.isArray(data.result) ? data.result : [];
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
  return (
    <> {/* Leagues & Teams */}
      <section className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Leagues</h2>
        {loadingLeagues ? (
          <p>Loading leagues...</p>
        ) : leagues.length > 0 ? (
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 mb-4 w-full"
          >
            {leagues.map((league) => (
              <option key={league.league_key} value={league.league_key}>
                {league.league_name}
              </option>
            ))}
          </select>
        ) : (
          <p>No leagues available</p>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Teams</h2>
        {loadingTeams ? (
          <p>Loading teams...</p>
        ) : teams.length > 0 ? (
          <ul className="list-disc list-inside">
            {teams.map((team) => (
              <li key={team.team_key} className="flex items-center">
                {team.team_name}
                {team.team_logo && (
                  <Image
                    src={team.team_logo}
                    alt={team.team_name}
                    width={24}
                    height={24}
                    className="ml-2 rounded-full"
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No teams available for this league</p>
        )}
      </section></>
  )
}

export default ExtApi