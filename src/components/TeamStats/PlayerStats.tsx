import React, { useState } from 'react';

interface PlayerStat {
  apg: number;
  ppg: number;
  rpg: number;
  fouls: number;
  blocks: number;
  points: number;
  steals: number;
  assists: number;
  position: string;
  rebounds: number;
  last_name: string;
  player_id: string;
  turnovers: number;
  first_name: string;
  fg_percentage: number;
  jersey_number: number;
  twoPointsMade: number;
  freeThrowsMade: number;
  matches_played: number;
  threePointsMade: number;
  twoPointsAttempted: number;
  freeThrowsAttempted: number;
  three_pt_percentage: number;
  threePointsAttempted: number;
}

interface PlayerStatsProps {
  playerStats: PlayerStat[];
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ playerStats }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStat | null>(null);

  if (!playerStats || playerStats.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={noDataStyle}>
          <p style={noDataText}>No player statistics available</p>
        </div>
      </div>
    );
  }

  // Calculate player efficiency rating (simplified PER)
  const calculateEfficiency = (player: PlayerStat): number => {
    const positiveStats = player.points + player.rebounds + player.assists + player.steals + player.blocks;
    const negativeStats = player.turnovers + (player.fouls * 0.5);
    const efficiency = positiveStats - negativeStats;
    return Math.round(efficiency * 100) / 100;
  };

  // Add efficiency to each player
  const playersWithEfficiency = playerStats.map(player => ({
    ...player,
    efficiency: calculateEfficiency(player)
  }));

  // Sort players by different categories
  const topScorers = [...playersWithEfficiency].sort((a, b) => b.ppg - a.ppg);
  const topRebounders = [...playersWithEfficiency].sort((a, b) => b.rpg - a.rpg);
  const topPlaymakers = [...playersWithEfficiency].sort((a, b) => b.apg - a.apg);
  const topDefenders = [...playersWithEfficiency].sort((a, b) => (b.steals + b.blocks) - (a.steals + a.blocks));
  const mostEfficient = [...playersWithEfficiency].sort((a, b) => b.efficiency - a.efficiency);
  const bestShooters = [...playersWithEfficiency].sort((a, b) => b.fg_percentage - a.fg_percentage);

  // Get team MVP (highest efficiency)
  const teamMVP = mostEfficient[0];

  // Stats categories for ranking tables
  const statCategories = [
    { key: 'scoring', title: '🏆 Top Scorers', data: topScorers, stat: 'ppg', suffix: ' PPG' },
    { key: 'rebounding', title: '📊 Top Rebounders', data: topRebounders, stat: 'rpg', suffix: ' RPG' },
    { key: 'playmaking', title: '🎯 Top Playmakers', data: topPlaymakers, stat: 'apg', suffix: ' APG' },
    { key: 'defense', title: '🛡️ Top Defenders', data: topDefenders, stat: 'defense', suffix: ' DEF' },
    { key: 'efficiency', title: '⭐ Most Efficient', data: mostEfficient, stat: 'efficiency', suffix: ' EFF' },
    { key: 'shooting', title: '🎯 Best Shooters', data: bestShooters, stat: 'fg_percentage', suffix: '% FG' }
  ];

  const renderPlayerCard = (player: PlayerStat, rank: number) => {
    const isSelected = selectedPlayer?.player_id === player.player_id;
    const defensiveRating = player.steals + player.blocks;
    
    return (
      <div
        key={player.player_id}
        style={{
          ...playerCardStyle,
          ...(isSelected ? playerCardSelectedStyle : {}),
          borderLeft: `6px solid ${getRankColor(rank)}`
        }}
        onClick={() => setSelectedPlayer(isSelected ? null : player)}
      >
        <div style={playerCardHeaderStyle}>
          <div style={rankBadgeStyle}>
            <span style={rankNumberStyle}>#{rank}</span>
          </div>
          <div style={playerInfoStyle}>
            <div style={playerNameStyle}>
              {player.first_name} {player.last_name}
            </div>
            <div style={playerDetailsStyle}>
              #{player.jersey_number} • {player.position}
            </div>
          </div>
        </div>
        
        {isSelected && (
          <div style={playerDetailStatsStyle}>
            <div style={statGridStyle}>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Points</span>
                <span style={statValueStyle}>{player.points}</span>
              </div>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Rebounds</span>
                <span style={statValueStyle}>{player.rebounds}</span>
              </div>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Assists</span>
                <span style={statValueStyle}>{player.assists}</span>
              </div>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Steals</span>
                <span style={statValueStyle}>{player.steals}</span>
              </div>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Blocks</span>
                <span style={statValueStyle}>{player.blocks}</span>
              </div>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>FG%</span>
                <span style={statValueStyle}>{player.fg_percentage}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRankingTable = (category: typeof statCategories[0]) => {
    const showAll = expandedCategory === category.key;
    const displayData = showAll ? category.data : category.data.slice(0, 3);
    const statKey = category.stat as keyof PlayerStat;

    return (
      <div key={category.key} style={rankingTableStyle}>
        <div 
          style={tableHeaderStyle}
          onClick={() => setExpandedCategory(expandedCategory === category.key ? null : category.key)}
        >
          <h3 style={tableTitleStyle}>{category.title}</h3>
          <div style={expandButtonStyle}>
            {showAll ? '▲' : '▼'}
          </div>
        </div>
        
        <div style={tableContentStyle}>
          {displayData.map((player, index) => (
            <div key={player.player_id} style={tableRowStyle}>
              <div style={rankCellStyle}>
                <span style={getRankStyle(index + 1)}>#{index + 1}</span>
              </div>
              <div style={nameCellStyle}>
                <span style={playerNameSmallStyle}>
                  {player.first_name} {player.last_name}
                </span>
                <span style={playerDetailsSmallStyle}>
                  #{player.jersey_number} • {player.position}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {category.data.length > 3 && (
          <div 
            style={seeAllStyle}
            onClick={() => setExpandedCategory(expandedCategory === category.key ? null : category.key)}
          >
            {showAll ? 'Show Less' : `See All ${category.data.length} Players`}
          </div>
        )}
      </div>
    );
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#ff6b35'; // Orange
    }
  };

  const getRankStyle = (rank: number): React.CSSProperties => ({
    fontWeight: 'bold',
    color: getRankColor(rank),
    fontSize: rank <= 3 ? '1.1rem' : '1rem'
  });

  return (
    <div style={containerStyle}>
      {/* Team MVP Spotlight */}
      {teamMVP && (
        <div style={mvpSectionStyle}>
          <div style={mvpHeaderStyle}>
            <span style={mvpBadgeStyle}>🌟 TEAM MVP</span>
            <h2 style={mvpTitleStyle}>Player Spotlight</h2>
          </div>
          <div style={mvpCardStyle}>
            <div style={mvpContentStyle}>
              <div style={mvpPlayerInfoStyle}>
                <div style={mvpNameStyle}>
                  {teamMVP.first_name} {teamMVP.last_name}
                </div>
                <div style={mvpDetailsStyle}>
                  #{teamMVP.jersey_number} • {teamMVP.position} • {teamMVP.matches_played} Games
                </div>
                <div style={mvpStatsStyle}>
                  <div style={mvpStatItemStyle}>
                    <span style={mvpStatValueStyle}>{teamMVP.ppg}</span>
                    <span style={mvpStatLabelStyle}>Points/G</span>
                  </div>
                  <div style={mvpStatItemStyle}>
                    <span style={mvpStatValueStyle}>{teamMVP.rpg}</span>
                    <span style={mvpStatLabelStyle}>Rebounds/G</span>
                  </div>
                  <div style={mvpStatItemStyle}>
                    <span style={mvpStatValueStyle}>{teamMVP.apg}</span>
                    <span style={mvpStatLabelStyle}>Assists/G</span>
                  </div>
                  <div style={mvpStatItemStyle}>
                    <span style={mvpStatValueStyle}>{teamMVP.efficiency}</span>
                    <span style={mvpStatLabelStyle}>Efficiency</span>
                  </div>
                </div>
              </div>
              <div style={mvpEfficiencyStyle}>
                <div style={efficiencyCircleStyle}>
                  <span style={efficiencyValueStyle}>{teamMVP.efficiency}</span>
                  <span style={efficiencyLabelStyle}>EFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Players Grid */}
      <div style={topPlayersSectionStyle}>
        <h3 style={sectionTitleStyle}>🎯 Top Performers</h3>
        <div style={topPlayersGridStyle}>
          {mostEfficient.slice(0, 4).map((player, index) => renderPlayerCard(player, index + 1))}
        </div>
      </div>

      {/* Statistical Rankings */}
      <div style={rankingsSectionStyle}>
        <h3 style={sectionTitleStyle}>📈 Statistical Rankings</h3>
        <div style={rankingsGridStyle}>
          {statCategories.map(category => renderRankingTable(category))}
        </div>
      </div>

      {/* Team Summary */}
      <div style={teamSummaryStyle}>
        <div style={summaryItemStyle}>
          <span style={summaryValueStyle}>{playersWithEfficiency.length}</span>
          <span style={summaryLabelStyle}>Total Players</span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryValueStyle}>
            {Math.round(playersWithEfficiency.reduce((sum, p) => sum + p.ppg, 0) / playersWithEfficiency.length)}
          </span>
          <span style={summaryLabelStyle}>Avg PPG</span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryValueStyle}>
            {playersWithEfficiency.reduce((sum, p) => sum + p.points, 0)}
          </span>
          <span style={summaryLabelStyle}>Total Points</span>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  border: '3px solid #ff6b35',
  borderRadius: '20px',
  padding: '30px',
  marginTop: '20px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
};

// MVP Section Styles
const mvpSectionStyle: React.CSSProperties = {
  marginBottom: '30px',
};

const mvpHeaderStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '20px',
};

const mvpBadgeStyle: React.CSSProperties = {
  backgroundColor: '#ff6b35',
  color: 'white',
  padding: '5px 15px',
  borderRadius: '20px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const mvpTitleStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  margin: '10px 0 0 0',
};

const mvpCardStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  border: '3px solid #ff6b35',
  borderRadius: '20px',
  padding: '30px',
  boxShadow: '0 10px 40px rgba(255, 107, 53, 0.3)',
};

const mvpContentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '30px',
};

const mvpPlayerInfoStyle: React.CSSProperties = {
  flex: 1,
};

const mvpNameStyle: React.CSSProperties = {
  color: '#ff6b35',
  fontSize: '2.2rem',
  fontWeight: 'bold',
  marginBottom: '5px',
};

const mvpDetailsStyle: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '1.1rem',
  marginBottom: '20px',
};

const mvpStatsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '15px',
};

const mvpStatItemStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '15px',
  backgroundColor: '#2d2d2d',
  borderRadius: '10px',
};

const mvpStatValueStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  display: 'block',
};

const mvpStatLabelStyle: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const mvpEfficiencyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const efficiencyCircleStyle: React.CSSProperties = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  border: '4px solid #ff6b35',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)',
};

const efficiencyValueStyle: React.CSSProperties = {
  color: '#ff6b35',
  fontSize: '2rem',
  fontWeight: 'bold',
};

const efficiencyLabelStyle: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

// Top Players Styles
const topPlayersSectionStyle: React.CSSProperties = {
  marginBottom: '30px',
};

const sectionTitleStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '20px',
  textAlign: 'center',
};

const topPlayersGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
};

const playerCardStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  border: '2px solid #ff6b35',
  borderRadius: '15px',
  padding: '20px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.2)',
};

const playerCardSelectedStyle: React.CSSProperties = {
  transform: 'translateY(-5px)',
  boxShadow: '0 10px 30px rgba(255, 107, 53, 0.4)',
};

const playerCardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '15px',
};

const rankBadgeStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#ff6b35',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const rankNumberStyle: React.CSSProperties = {
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.2rem',
};

const playerInfoStyle: React.CSSProperties = {
  flex: 1,
};

const playerNameStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  marginBottom: '2px',
};

const playerDetailsStyle: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '0.9rem',
};

const efficiencyBadgeStyle: React.CSSProperties = {
  backgroundColor: '#ff6b35',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '15px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
};

const playerDetailStatsStyle: React.CSSProperties = {
  marginTop: '15px',
  paddingTop: '15px',
  borderTop: '1px solid #444',
};

const statGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
};

const statItemStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '8px',
  backgroundColor: '#2d2d2d',
  borderRadius: '8px',
};

const statLabelStyle: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '0.7rem',
  display: 'block',
  textTransform: 'uppercase',
};

const statValueStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: 'bold',
  display: 'block',
};

// Rankings Styles
const rankingsSectionStyle: React.CSSProperties = {
  marginBottom: '30px',
};

const rankingsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '20px',
};

const rankingTableStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  border: '2px solid #ff6b35',
  borderRadius: '15px',
  overflow: 'hidden',
};

const tableHeaderStyle: React.CSSProperties = {
  backgroundColor: '#2d2d2d',
  padding: '15px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  borderBottom: '1px solid #444',
};

const tableTitleStyle: React.CSSProperties = {
  color: '#ff6b35',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  margin: 0,
};

const expandButtonStyle: React.CSSProperties = {
  color: '#ff6b35',
  fontSize: '1.2rem',
  fontWeight: 'bold',
};

const tableContentStyle: React.CSSProperties = {
  padding: '10px 0',
};

const tableRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 20px',
  borderBottom: '1px solid #2d2d2d',
  transition: 'background-color 0.2s ease',
};

const tableRowStyleHover: React.CSSProperties = {
  backgroundColor: '#2d2d2d',
};

const rankCellStyle: React.CSSProperties = {
  width: '60px',
};

const nameCellStyle: React.CSSProperties = {
  flex: 1,
};

const playerNameSmallStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: 'bold',
  display: 'block',
};

const playerDetailsSmallStyle: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '0.8rem',
  display: 'block',
};

const statCellStyle: React.CSSProperties = {
  textAlign: 'right',
  minWidth: '80px',
};

const statValueLargeStyle: React.CSSProperties = {
  color: '#ff6b35',
  fontSize: '1.1rem',
  fontWeight: 'bold',
};

const seeAllStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '15px',
  color: '#ff6b35',
  cursor: 'pointer',
  fontWeight: 'bold',
  borderTop: '1px solid #444',
  transition: 'background-color 0.2s ease',
};

// Team Summary Styles
const teamSummaryStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  backgroundColor: '#1a1a1a',
  border: '2px solid #ff6b35',
  borderRadius: '15px',
  padding: '20px',
};

const summaryItemStyle: React.CSSProperties = {
  textAlign: 'center',
};

const summaryValueStyle: React.CSSProperties = {
  color: '#ff6b35',
  fontSize: '2rem',
  fontWeight: 'bold',
  display: 'block',
};

const summaryLabelStyle: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

// No Data Styles
const noDataStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px',
  color: '#666',
  fontStyle: 'italic',
};

const noDataText: React.CSSProperties = {
  fontSize: '1.1rem',
  margin: 0,
};

export default PlayerStats;

