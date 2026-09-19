"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Leaderboard from '../../components/Leaderboard';

const GRID_SIZE = 10;
const MINES_COUNT = 15;

export default function Minesweeper() {
  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [flags, setFlags] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // 1. Create empty grid
    let newGrid = Array(GRID_SIZE).fill().map((_, r) => 
      Array(GRID_SIZE).fill().map((_, c) => ({
        r, c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
      }))
    );

    // 2. Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // 3. Calculate neighbors
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r+i >= 0 && r+i < GRID_SIZE && c+j >= 0 && c+j < GRID_SIZE) {
                if (newGrid[r+i][c+j].isMine) count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setFlags(0);
  };

  const revealCell = (r, c) => {
    if (gameOver || gameWon || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    let newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[r][c].isMine) {
      // Hit a mine
      setGameOver(true);
      // Reveal all mines
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setGrid(newGrid);
      return;
    }

    // Flood fill algorithm for empty cells
    const floodFill = (row, col) => {
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
      if (newGrid[row][col].isRevealed || newGrid[row][col].isFlagged) return;

      newGrid[row][col].isRevealed = true;
      setScore(s => s + 10);

      if (newGrid[row][col].neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            floodFill(row + i, col + j);
          }
        }
      }
    };

    floodFill(r, c);
    setGrid(newGrid);

    // Check Win Condition
    let unrevealedSafeCells = 0;
    newGrid.forEach(row => row.forEach(cell => {
      if (!cell.isMine && !cell.isRevealed) unrevealedSafeCells++;
    }));

    if (unrevealedSafeCells === 0) {
      setGameWon(true);
      setScore(s => s + 500); // Win bonus
    }
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault();
    if (gameOver || gameWon || grid[r][c].isRevealed) return;

    let newGrid = [...grid.map(row => [...row])];
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;
    setGrid(newGrid);
    setFlags(f => newGrid[r][c].isFlagged ? f + 1 : f - 1);
  };

  const getNumberColor = (num) => {
    const colors = ['#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b', '#0ea5e9', '#0f172a', '#64748b'];
    return colors[num - 1] || 'white';
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <Link href="/"><button className="back-btn">← Back to Arcade</button></Link>
        <h2>Minesweeper</h2>
        <div style={{width: '180px', fontSize: '1.2rem', color: 'var(--accent)', display: 'flex', gap: '15px'}}>
           <span>💣 {MINES_COUNT - flags}</span>
           <span>⭐ {score}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <div style={{
            background: 'var(--grid-border)', padding: '4px', borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {grid.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex' }}>
                {row.map((cell, cIdx) => (
                  <div 
                    key={cIdx} 
                    onClick={() => revealCell(rIdx, cIdx)}
                    onContextMenu={(e) => toggleFlag(e, rIdx, cIdx)}
                    style={{
                      width: '40px', height: '40px', 
                      background: cell.isRevealed ? 'var(--grid-bg)' : '#475569',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', fontWeight: 'bold',
                      cursor: (cell.isRevealed || gameOver || gameWon) ? 'default' : 'pointer',
                      boxShadow: cell.isRevealed ? 'inset 0 0 5px rgba(0,0,0,0.5)' : 'inset 2px 2px 5px rgba(255,255,255,0.2)',
                    }}
                  >
                    {cell.isRevealed ? (
                      cell.isMine ? '💥' : (cell.neighborMines > 0 ? <span style={{color: getNumberColor(cell.neighborMines)}}>{cell.neighborMines}</span> : '')
                    ) : (
                      cell.isFlagged ? '🚩' : ''
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            {gameWon && <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>You Cleared It!</h3>}
            {gameOver && <h3 style={{ fontSize: '2rem', color: 'var(--danger)' }}>Boom! Game Over</h3>}
            {(gameWon || gameOver) && (
              <button className="btn" onClick={initializeGame} style={{ marginTop: '1rem' }}>Play Again</button>
            )}
            {!gameWon && !gameOver && <p style={{ color: '#94a3b8' }}>Left Click to Reveal. Right Click to Flag.</p>}
          </div>
        </div>

        <Leaderboard gameId="minesweeper" currentScore={score} />
      </div>
    </div>
  );
}
