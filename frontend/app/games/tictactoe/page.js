"use client";

import { useState } from 'react';
import Link from 'next/link';
import Leaderboard from '../../components/Leaderboard';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState(0);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'Draw';
    return null;
  };

  const handleClick = (i) => {
    if (board[i] || winner) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
      if (win === 'X') setScore(s => s + 100);
      else if (win === 'Draw') setScore(s => s + 20);
    }
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <Link href="/"><button className="back-btn">← Back to Arcade</button></Link>
        <h2>Tic-Tac-Toe</h2>
        <div style={{width: '120px'}}></div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '10px', 
            background: 'var(--grid-border)', padding: '10px', borderRadius: '12px'
          }}>
            {board.map((cell, i) => (
              <button 
                key={i} 
                onClick={() => handleClick(i)}
                style={{
                  height: '100px', fontSize: '3rem', background: 'var(--grid-bg)', 
                  border: 'none', borderRadius: '8px', color: cell === 'X' ? 'var(--accent)' : 'var(--danger)',
                  cursor: winner ? 'default' : 'pointer'
                }}
              >
                {cell}
              </button>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            {winner ? (
              <>
                <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>
                  {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
                </h3>
                <button className="btn" onClick={reset} style={{ marginTop: '1rem' }}>Play Again</button>
              </>
            ) : (
              <h3>Next Player: {isXNext ? 'X' : 'O'}</h3>
            )}
          </div>
        </div>

        <Leaderboard gameId="tictactoe" currentScore={score} />
      </div>
    </div>
  );
}
