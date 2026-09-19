import Link from 'next/link';

export default function Home() {
  const games = [
    { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Classic grid-based snake. Eat apples to grow!' },
    { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '❌⭕', desc: 'Beat the computer in this classic 3x3 game.' },
    { id: 'memory', name: 'Memory Match', icon: '🎴', desc: 'Find all matching pairs as fast as you can.' },
    { id: 'rps', name: 'RPS', icon: '✊✋✌️', desc: 'Rock Paper Scissors against the AI!' },
    { id: '2048', name: '2048', icon: '🔢', desc: 'Slide and merge tiles to reach 2048!' },
    { id: 'minesweeper', name: 'Minesweeper', icon: '💣', desc: 'Clear the board without detonating any mines!' }
  ];

  return (
    <div className="container">
      <h1>Arcade</h1>
      <div className="game-hub">
        {games.map(game => (
          <Link href={`/games/${game.id}`} key={game.id}>
            <div className="game-card">
              <div className="icon">{game.icon}</div>
              <h2>{game.name}</h2>
              <p>{game.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
