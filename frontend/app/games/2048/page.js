"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Leaderboard from '../../components/Leaderboard';

const GRID_SIZE = 4;

export default function Game2048() {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);

  const addRandomTile = (currentGrid) => {
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    return currentGrid;
  };

  const resetGame = () => {
    let newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  };

  const move = useCallback((direction) => {
    if (gameOver || gameWon) return;

    let newGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    let pointsEarned = 0;

    const shiftAndMerge = (row) => {
      let newRow = row.filter(val => val !== 0);
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          pointsEarned += newRow[i];
          newRow.splice(i + 1, 1);
        }
      }
      while (newRow.length < GRID_SIZE) newRow.push(0);
      return newRow;
    };

    if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
      for (let r = 0; r < GRID_SIZE; r++) {
        let row = newGrid[r];
        if (direction === 'ArrowRight') row.reverse();
        let newRow = shiftAndMerge(row);
        if (direction === 'ArrowRight') newRow.reverse();
        if (newGrid[r].join(',') !== newRow.join(',')) moved = true;
        newGrid[r] = newRow;
      }
    } else if (direction === 'ArrowUp' || direction === 'ArrowDown') {
      for (let c = 0; c < GRID_SIZE; c++) {
        let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        if (direction === 'ArrowDown') col.reverse();
        let newCol = shiftAndMerge(col);
        if (direction === 'ArrowDown') newCol.reverse();
        for (let r = 0; r < GRID_SIZE; r++) {
          if (newGrid[r][c] !== newCol[r]) moved = true;
          newGrid[r][c] = newCol[r];
        }
      }
    }

    if (moved) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(s => s + pointsEarned);
      
      // Check Win
      let has2048 = false;
      let hasEmpty = false;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newGrid[r][c] === 2048) has2048 = true;
          if (newGrid[r][c] === 0) hasEmpty = true;
        }
      }

      if (has2048) setGameWon(true);
      
      // Check Lose (No empty spaces and no possible merges)
      if (!hasEmpty) {
        let canMerge = false;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (
              (r < GRID_SIZE - 1 && newGrid[r][c] === newGrid[r+1][c]) ||
              (c < GRID_SIZE - 1 && newGrid[r][c] === newGrid[r][c+1])
            ) {
              canMerge = true;
              break;
            }
          }
        }
        if (!canMerge) setGameOver(true);
      }
    }
  }, [grid, gameOver, gameWon]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        move(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileColor = (val) => {
    const colors = {
      0: 'rgba(30, 41, 59, 0.5)',
      2: '#334155',
      4: '#475569',
      8: '#f59e0b',
      16: '#f97316',
      32: '#ea580c',
      64: '#dc2626',
      128: '#eab308',
      256: '#eab308',
      512: '#eab308',
      1024: '#eab308',
      2048: '#eab308',
    };
    return colors[val] || '#eab308';
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <Link href="/"><button className="back-btn">← Back to Arcade</button></Link>
        <h2>2048</h2>
        <div style={{width: '120px', fontSize: '1.2rem', color: 'var(--accent)'}}>
           Score: {score}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <div style={{
            background: 'var(--grid-bg)', padding: '15px', borderRadius: '12px',
            border: '1px solid var(--grid-border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {grid.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex', gap: '10px', marginBottom: rIdx === GRID_SIZE - 1 ? 0 : '10px' }}>
                {row.map((val, cIdx) => (
                  <div key={cIdx} style={{
                    width: '80px', height: '80px', background: getTileColor(val),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: val > 100 ? '2rem' : '2.5rem', fontWeight: 'bold',
                    color: val > 4 ? 'white' : '#94a3b8', borderRadius: '8px',
                    transition: 'all 0.1s ease-in-out',
                    boxShadow: val > 0 ? 'inset 0 0 10px rgba(255,255,255,0.2)' : 'none'
                  }}>
                    {val > 0 ? val : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            {gameWon && <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>You Won!</h3>}
            {gameOver && <h3 style={{ fontSize: '2rem', color: 'var(--danger)' }}>Game Over</h3>}
            {(gameWon || gameOver) && (
              <button className="btn" onClick={resetGame} style={{ marginTop: '1rem' }}>Play Again</button>
            )}
            {!gameWon && !gameOver && <p style={{ color: '#94a3b8' }}>Use Arrow Keys to merge tiles</p>}
          </div>
        </div>

        <Leaderboard gameId="2048" currentScore={score} />
      </div>
    </div>
  );
}
