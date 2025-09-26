import React from 'react';

interface Match {
  result: string;
  match_id: string;
  completed: boolean;
  away_score: number;
  home_score: number;
  match_date: string;
  away_team_id: string;
  home_team_id: string;
  away_team_name: string;
  home_team_name: string;
}

interface TeamSummaryProps {
  lastFiveGames: Match[];
}

const TeamSummary: React.FC<TeamSummaryProps> = ({ lastFiveGames }) => {
  if (!lastFiveGames || lastFiveGames.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={noGamesStyle}>
          <p style={noGamesText}>No recent games played</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const wins = lastFiveGames.filter(game => game.result === 'Win').length;
  const losses = lastFiveGames.filter(game => game.result === 'Loss').length;
  const draws = lastFiveGames.filter(game => game.result === 'Draw').length;
  const winRate = lastFiveGames.length > 0 ? (wins / lastFiveGames.length) * 100 : 0;
  
  // Calculate average points
  const totalPointsFor = lastFiveGames.reduce((total, game) => {
    const isHome = game.home_team_name === 'Test Team A';
    return total + (isHome ? game.home_score : game.away_score);
  }, 0);
  
  const totalPointsAgainst = lastFiveGames.reduce((total, game) => {
    const isHome = game.home_team_name === 'Test Team A';
    return total + (isHome ? game.away_score : game.home_score);
  }, 0);
  
  const avgPointsFor = Math.round(totalPointsFor / lastFiveGames.length);
  const avgPointsAgainst = Math.round(totalPointsAgainst / lastFiveGames.length);
  
  // Current streak
  const currentStreak = lastFiveGames.reduce((streak, game) => {
    if (game.result === lastFiveGames[0].result) {
      return streak + 1;
    }
    return streak;
  }, 0);

  const streakType = lastFiveGames[0]?.result.toLowerCase() || '';

  // Win/Loss bar visualization
  const winLossBars = lastFiveGames.map((game, index) => (
    <div
      key={game.match_id}
      style={{
        ...gameBarStyle,
        backgroundColor: game.result === 'Win' ? '#10b981' : 
                        game.result === 'Loss' ? '#ef4444' : '#f59e0b',
        transform: `scale(${0.9 + (index * 0.02)})`,
        zIndex: lastFiveGames.length - index,
      }}
      title={`${game.result} vs ${game.home_team_name === 'Test Team A' ? game.away_team_name : game.home_team_name}`}
    >
      <span style={gameBarText}>{game.result.charAt(0)}</span>
    </div>
  ));

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>Team Performance Summary</h2>
        <div style={subtitleStyle}>Last 5 Games Analysis</div>
      </div>

      {/* Main Stats Grid */}
      <div style={statsGridStyle}>
        {/* Win/Loss Record */}
        <div style={statCardStyle}>
          <div style={statHeaderStyle}>Record</div>
          <div style={recordContainerStyle}>
            <div style={winLossStyle}>
              <span style={winStyle}>{wins}W</span>
              <span style={lossStyle}>{losses}L</span>
              {draws > 0 && <span style={drawStyle}>{draws}D</span>}
            </div>
            <div style={winRateStyle}>
              {winRate.toFixed(1)}% Win Rate
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div style={statCardStyle}>
          <div style={statHeaderStyle}>Current Streak</div>
          <div style={{
            ...streakStyle,
            color: streakType === 'win' ? '#10b981' : 
                   streakType === 'loss' ? '#ef4444' : '#f59e0b'
          }}>
            {currentStreak} {streakType}
            <div style={streakFireStyle}>🔥</div>
          </div>
        </div>

        {/* Average Points */}
        <div style={statCardStyle}>
          <div style={statHeaderStyle}>Scoring Average</div>
          <div style={pointsStyle}>
            <div style={pointsForStyle}>
              <span style={pointsLabel}>Points For</span>
              <span style={pointsValue}>{avgPointsFor}</span>
            </div>
            <div style={pointsAgainstStyle}>
              <span style={pointsLabel}>Points Against</span>
              <span style={pointsValue}>{avgPointsAgainst}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game-by-Game Visualization */}
      <div style={gamesSectionStyle}>
        <div style={gamesHeaderStyle}>Last 5 Games</div>
        <div style={gamesBarsContainerStyle}>
          {winLossBars}
        </div>
        
        {/* Game Details */}
        <div style={gamesListStyle}>
          {lastFiveGames.map((game, index) => (
            <div key={game.match_id} style={gameItemStyle}>
              <div style={{
                ...resultIndicatorStyle,
                backgroundColor: game.result === 'Win' ? '#10b981' : 
                                game.result === 'Loss' ? '#ef4444' : '#f59e0b'
              }} />
              <div style={gameInfoStyle}>
                <div style={gameResultStyle}>
                  <span style={{
                    color: game.result === 'Win' ? '#10b981' : 
                           game.result === 'Loss' ? '#ef4444' : '#f59e0b',
                    fontWeight: 'bold'
                  }}>
                    {game.result}
                  </span>
                  <span style={gameScoreStyle}>
                    {game.home_team_name === 'Test Team A' ? game.home_score : game.away_score} - 
                    {game.home_team_name === 'Test Team A' ? game.away_score : game.home_score}
                  </span>
                </div>
                <div style={gameOpponentStyle}>
                  vs {game.home_team_name === 'Test Team A' ? game.away_team_name : game.home_team_name}
                </div>
                <div style={gameDateStyle}>
                  {new Date(game.match_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Meter */}
      <div style={performanceMeterStyle}>
        <div style={meterHeaderStyle}>Performance Meter</div>
        <div style={meterBarStyle}>
          <div 
            style={{
              ...meterFillStyle,
              width: `${winRate}%`,
              backgroundColor: winRate >= 60 ? '#10b981' : 
                             winRate >= 40 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
        <div style={meterLabelsStyle}>
          <span>Poor</span>
          <span>Average</span>
          <span>Excellent</span>
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

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '30px',
  borderBottom: '2px solid #ff6b35',
  paddingBottom: '15px',
};

const titleStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  margin: 0,
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const subtitleStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '1rem',
  marginTop: '5px',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '30px',
};

const statCardStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  border: '2px solid #ff6b35',
  borderRadius: '15px',
  padding: '20px',
  textAlign: 'center',
  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.2)',
  transition: 'transform 0.3s ease',
};

const statHeaderStyle: React.CSSProperties = {
  color: '#ff6b35',
  fontSize: '1.1rem',
  fontWeight: '600',
  marginBottom: '15px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const recordContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const winLossStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '15px',
  fontSize: '1.3rem',
  fontWeight: 'bold',
};

const winStyle: React.CSSProperties = {
  color: '#10b981',
  textShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
};

const lossStyle: React.CSSProperties = {
  color: '#ef4444',
  textShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
};

const drawStyle: React.CSSProperties = {
  color: '#f59e0b',
  textShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
};

const winRateStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #ff6b35, #ff8c42)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const streakStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
};

const streakFireStyle: React.CSSProperties = {
  fontSize: '1.5rem',
};

const pointsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const pointsForStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const pointsAgainstStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const pointsLabel: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '0.9rem',
};

const pointsValue: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '1.3rem',
  fontWeight: 'bold',
};

const gamesSectionStyle: React.CSSProperties = {
  marginBottom: '30px',
};

const gamesHeaderStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '1.3rem',
  fontWeight: '600',
  marginBottom: '15px',
  textAlign: 'center',
};

const gamesBarsContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '5px',
  marginBottom: '20px',
  height: '60px',
  alignItems: 'flex-end',
};

const gameBarStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
};

const gameBarText: React.CSSProperties = {
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.2rem',
};

const gamesListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const gameItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#2d2d2d',
  borderRadius: '10px',
  padding: '15px',
  border: '1px solid #444',
};

const resultIndicatorStyle: React.CSSProperties = {
  width: '8px',
  height: '40px',
  borderRadius: '4px',
  marginRight: '15px',
};

const gameInfoStyle: React.CSSProperties = {
  flex: 1,
};

const gameResultStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '5px',
};

const gameScoreStyle: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: '1.1rem',
};

const gameOpponentStyle: React.CSSProperties = {
  color: '#adb5bd',
  fontSize: '0.9rem',
};

const gameDateStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '0.8rem',
  fontStyle: 'italic',
};

const performanceMeterStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  border: '2px solid #ff6b35',
  borderRadius: '15px',
  padding: '20px',
};

const meterHeaderStyle: React.CSSProperties = {
  color: '#ff6b35',
  fontSize: '1.1rem',
  fontWeight: '600',
  marginBottom: '15px',
  textAlign: 'center',
};

const meterBarStyle: React.CSSProperties = {
  width: '100%',
  height: '20px',
  backgroundColor: '#374151',
  borderRadius: '10px',
  overflow: 'hidden',
  marginBottom: '10px',
};

const meterFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '10px',
  transition: 'all 0.5s ease',
  boxShadow: '0 0 10px currentColor',
};

const meterLabelsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#adb5bd',
  fontSize: '0.8rem',
};

const noGamesStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px',
  color: '#666',
  fontStyle: 'italic',
};

const noGamesText: React.CSSProperties = {
  fontSize: '1.1rem',
  margin: 0,
};

export default TeamSummary;