// components/Header.js

import Image from 'next/image';

const Admindashboard = () => {
  // Sample data based on the image – you can make this dynamic via props or API
  const matchup = {
    date: '12 September 2025',
    homeTeam: {
      name: 'Los Angeles Lakers',
      logo: '/images/lakers-logo.png', // Replace with your actual logo path
      lineup: [
        { position: 'PG', player: 'Luka Dončić' },
        { position: 'SG', player: 'Austin Reaves' },
        { position: 'SF', player: 'Rui Hachimura' },
        { position: 'PF', player: 'LeBron James' },
        { position: 'C', player: 'Dorian Finney-Smith' },
      ],
    },
    awayTeam: {
      name: 'Golden State Warriors',
      logo: '/images/warriors-logo.png', // Replace with your actual logo path
      lineup: [
        { position: 'PG', player: 'Stephen Curry' },
        { position: 'SG', player: 'Brandin Podziemski' },
        { position: 'SF', player: 'Buddy Hield' },
        { position: 'PF', player: 'Jimmy Butler' }, // Note: Image says "Jimy Butler" – assuming typo
        { position: 'C', player: 'Draymond Green' },
      ],
    },
    lastTimeout: 'Last Time Out: 109-113',
    sections: ['LINE UPS', 'LAST FIVE GAMES'],
  };

  return (
    <header className="bg-blue-900 text-white p-4 flex flex-col items-center justify-center">
      {/* Top Row: Last Timeout */}
      <div className="text-sm mb-2">{matchup.lastTimeout}</div>

      {/* Main Matchup Row */}
      <div className="flex items-center justify-between w-full max-w-4xl">
        {/* Home Team */}
        <div className="flex flex-col items-center">
          <Image
            src={matchup.homeTeam.logo}
            alt={`${matchup.homeTeam.name} Logo`}
            width={80}
            height={80}
            className="mb-2"
          />
          <span className="text-lg font-bold font-bebas">{matchup.homeTeam.name}</span>
        </div>

        {/* Date and Sections */}
        <div className="text-center">
          <div className="text-2xl font-bold">{matchup.date}</div>
          <div className="flex justify-center space-x-4 mt-2">
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center">
          <Image
            src={matchup.awayTeam.logo}
            alt={`${matchup.awayTeam.name} Logo`}
            width={80}
            height={80}
            className="mb-2"
          />
          <span className="text-lg font-bold font-bebas">{matchup.awayTeam.name}</span>
        </div>
      </div>
      

      {/* Add Stats Button */}
      <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
        ADD STATS
      </button>
    </header>
  );
};

export default Admindashboard;