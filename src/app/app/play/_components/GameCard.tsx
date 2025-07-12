function GameCard({ game }: { game: { name: string; image: string } }) {
    return (
      // Add "group" to the parent container to enable group-hover on children
      <div key={game.name} className="group relative w-36 h-36 rounded-lg overflow-hidden shadow-lg">
        
        {/* The image now has transition and group-hover:scale properties */}
        <img 
          src={game.image} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" 
        />
  
        {/* A gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
  
        {/* Position the game name at the bottom */}
        <h2 className="absolute bottom-0 left-0 p-2 text-white text-md font-semibold">
          {game.name}
        </h2>
      </div>
    );
  }
  
  export default GameCard;