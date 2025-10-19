'use client';

import React, { useState, useEffect } from 'react';
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
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [loadingLeagues, setLoadingLeagues] = useState<boolean>(true);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(true);

  // Fetch leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoadingLeagues(true);
        const res = await fetch('/api/sports/leagues');
        const data = await res.json();
        const leagueList: League[] = Array.isArray(data.result) ? data.result : [];
        setLeagues(leagueList);
        if (leagueList.length > 0) setSelectedLeague(leagueList[0].league_key);
      } catch (err) {
        console.error('Error fetching leagues:', err);
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
        console.error('Error fetching teams:', err);
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, [selectedLeague]);

  return (
    <section className="relative w-full max-w-6xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl text-gray-100 border border-gray-700 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      
      <h2 className="text-3xl font-semibold text-white mb-6 tracking-wide">
        Leagues
      </h2>

      {loadingLeagues ? (
        <p className="text-gray-400">Loading leagues...</p>
      ) : leagues.length > 0 ? (
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="w-full mb-8 rounded-xl bg-gray-800 text-gray-100 border border-gray-700 px-5 py-3 focus:ring-2 focus:ring-orange-400 transition-colors"
        >
          {leagues.map((league) => (
            <option key={league.league_key} value={league.league_key}>
              {league.league_name}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-gray-400">No leagues available</p>
      )}

      <h2 className="text-3xl font-semibold text-white mb-6 tracking-wide">Teams</h2>

      {loadingTeams ? (
        <p className="text-gray-400">Loading teams...</p>
      ) : teams.length > 0 ? (
        <ul className="space-y-4">
          {teams.map((team) => (
            <li
              key={team.team_key}
              className="flex items-center p-4 rounded-xl bg-gray-800/70 hover:bg-gray-700 transition-shadow shadow-md"
            >
              <span className="font-medium text-gray-100">{team.team_name}</span>
              {team.team_logo && (
                <Image
                  src={team.team_logo}
                  alt={team.team_name}
                  width={36}
                  height={36}
                  className="ml-4 rounded-full border border-gray-600"
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No teams available for this league</p>
      )}
    </section>
  );
};

export default ExtApi;
