import React, { useState } from "react";

interface TeamDetailsProps {
  teamName: string;
  numPlayers: number | string;
}

const TeamDetails: React.FC<TeamDetailsProps> = ({ teamName, numPlayers }) => {
  const [isHovered, setIsHovered] = useState({ team: false, players: false });

    const containerStyle: React.CSSProperties = {
    display: "flex",
    gap: "25px",
    padding: "30px 20px",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    border: "3px solid #ff6b35",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  };

  const boxStyle: React.CSSProperties = {
    backgroundColor: "#1a1a1a",
    border: "3px solid #ff6b35",
    borderRadius: "16px",
    padding: "30px 40px",
    minWidth: "300px",
    flex: "1",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(255, 107, 53, 0.2)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    cursor: "default",
    position: "relative",
    overflow: "hidden",
  };

  const boxHoverStyle: React.CSSProperties = {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 15px 40px rgba(255, 107, 53, 0.4)",
    borderWidth: "4px",
    borderColor: "#ff8c42",
  };

  const glowEffectStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.2), transparent)",
    transition: "left 0.6s ease",
  };

  const glowHoverStyle: React.CSSProperties = {
    left: "100%",
  };

  const headingStyle: React.CSSProperties = {
    color: "#ff6b35",
    fontSize: "1.1rem",
    marginBottom: "15px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  const teamTextStyle: React.CSSProperties = {
    color: "#ff6b35",
    fontSize: "2rem",
    fontWeight: "bold",
    textShadow: "0 2px 10px rgba(255, 107, 53, 0.3)",
    margin: 0,
  };

  const playersTextStyle: React.CSSProperties = {
    color: "#ffffff",
    fontSize: "2.5rem",
    fontWeight: "bold",
    textShadow: "0 2px 15px rgba(255, 107, 53, 0.5)",
    margin: 0,
    background: "linear-gradient(45deg, #ff6b35, #ff8c42)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const pulseAnimation = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(255, 107, 53, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
    }
    
    @keyframes borderGlow {
      0% { border-color: #ff6b35; }
      50% { border-color: #ff8c42; }
      100% { border-color: #ff6b35; }
    }
  `;

  return (
    <>
      <style>{pulseAnimation}</style>
      <div style={containerStyle}>
        {/* Team Name Box */}
        <div
          style={{
            ...boxStyle,
            animation: isHovered.team ? "borderGlow 1.5s infinite" : "none",
          }}
          onMouseEnter={() => setIsHovered(prev => ({ ...prev, team: true }))}
          onMouseLeave={() => setIsHovered(prev => ({ ...prev, team: false }))}
        >
          <div 
            style={{
              ...glowEffectStyle,
              ...(isHovered.team ? glowHoverStyle : {})
            }}
          />
          <p style={teamTextStyle}>{teamName}</p>
          <div style={{ 
            color: "#adb5bd", 
            fontSize: "0.9rem", 
            marginTop: "10px",
            fontStyle: "italic"
          }}>
            
          </div>
        </div>

        {/* Players Count Box */}
        <div
          style={{
            ...boxStyle,
            animation: isHovered.players ? "pulse 2s infinite, borderGlow 1.5s infinite" : "none",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          }}
          onMouseEnter={() => setIsHovered(prev => ({ ...prev, players: true }))}
          onMouseLeave={() => setIsHovered(prev => ({ ...prev, players: false }))}
        >
          <div 
            style={{
              ...glowEffectStyle,
              ...(isHovered.players ? glowHoverStyle : {})
            }}
          />
          <h2 style={headingStyle}>Squad Size</h2>
          <p style={playersTextStyle}>{numPlayers}</p>
          <div style={{ 
            color: "#adb5bd", 
            fontSize: "0.9rem", 
            marginTop: "10px",
            fontStyle: "italic"
          }}>
            Active Players
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamDetails;