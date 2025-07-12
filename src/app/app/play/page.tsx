// Play.jsx

import GameCard from './_components/GameCard'; // Make sure the path is correct

const recently_played_games = {
  1: {
    name: "Discernment",
    image: "/images/placeholder.png",
    description: "Discernment is an easy-to-learn and entertaining game...",
  }
};

const testing_games = {
  1: {
    name: "Discernment",
    image: "/images/placeholder.png",
    description: "Discernment is an easy-to-learn and entertaining game...",
  },
  2: {
    name: "Write the Word",
    image: "/images/wordicon.jpg",
    description: "Write the Word is a fun and challenging game...",
  },
};

export default function Play() {
  return (
    <div className="p-6 font-sans">
      <div className="mb-8">
        <h1 className="text-black text-xl font-bold mb-4 dark:text-white">Recently played</h1>
        <div className="flex space-x-4">
          {Object.values(recently_played_games).map((game) => (
            <GameCard key={game.name} game={game} />
          ))}
        </div>
      </div>
      
      <div>
        <h1 className="text-black text-xl font-bold mb-4 dark:text-white">All Games</h1>
        <div className="flex flex-wrap gap-4">
          {Object.values(testing_games).map((game) => (
            <GameCard key={game.name} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}