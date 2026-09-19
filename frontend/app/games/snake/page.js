"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Leaderboard from '../../components/Leaderboard';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const directionRef = useRef(direction);
  
  useEffect(() => {
      directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsPlaying(true);
  };

  const handleKeyDown = useCallback((e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    if (!isPlaying) return;

    const currentDir = directionRef.current;
    switch (e.key) {
      case 'ArrowUp':
        if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
        break;
    }
  }, [isPlaying]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, 150 - Math.floor(score / 2));
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, food, generateFood, score]);

  return (
    <div className="game-screen">
      <div className="game-header">
        <Link href="/"><button className="back-btn">← Back to Arcade</button></Link>
        <h2>Snake</h2>
        <div style={{width: '120px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)'}}>
           Score: {score}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <div style={{
            display: 'grid', 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`, 
            gridTemplateRows: `repeat(${GRID_SIZE}, 20px)`,
            background: 'var(--grid-bg)', 
            border: '2px solid var(--grid-border)', 
            borderRadius: '4px'
          }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              
              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;

              let bgColor = 'transparent';
              if (isHead) bgColor = 'var(--success)';
              else if (isSnake) bgColor = '#4ade80';
              else if (isFood) bgColor = 'var(--danger)';

              return (
                <div key={i} style={{
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: bgColor,
                  borderRadius: isFood ? '50%' : (isSnake ? '4px' : '0')
                }} />
              );
            })}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            {!isPlaying && !gameOver && (
              <button className="btn" onClick={resetGame}>Start Game</button>
            )}
            {gameOver && (
              <>
                <h3 style={{ fontSize: '2rem', color: 'var(--danger)' }}>Game Over!</h3>
                <button className="btn" onClick={resetGame} style={{ marginTop: '1rem' }}>Play Again</button>
              </>
            )}
          </div>
        </div>

        <Leaderboard gameId="snake" currentScore={score} />
      </div>
    </div>
  );
}
