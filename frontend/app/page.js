"use client";

import { useState, useEffect, useCallback } from 'react';

// Grid size
const GRID_W = 10;
const GRID_H = 10;

// Emojis for representation
const INGREDIENTS = {
  bun: '🍞',
  lettuce: '🥬',
  tomato: '🍅',
  raw_meat: '🥩',
  cooked_meat: '🍔',
  rice: '🍚',
  fish: '🐟',
  water: '💧'
};

const STATIONS = [
  { x: 1, y: 1, type: 'fridge', icon: '🧊', yields: 'raw_meat' },
  { x: 2, y: 1, type: 'fridge', icon: '🧊', yields: 'bun' },
  { x: 3, y: 1, type: 'fridge', icon: '🧊', yields: 'lettuce' },
  { x: 4, y: 1, type: 'fridge', icon: '🧊', yields: 'tomato' },
  { x: 5, y: 1, type: 'fridge', icon: '🧊', yields: 'rice' },
  { x: 6, y: 1, type: 'fridge', icon: '🧊', yields: 'fish' },
  { x: 1, y: 8, type: 'stove', icon: '🔥', converts: { raw_meat: 'cooked_meat' } },
  { x: 5, y: 5, type: 'plating', icon: '🍽️' },
  { x: 8, y: 8, type: 'window', icon: '🔔' },
];

const WALLS = [
  { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 },
  { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 },
  { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 }, { x: 0, y: 8 },
  { x: 9, y: 1 }, { x: 9, y: 2 }, { x: 9, y: 3 }, { x: 9, y: 4 }, { x: 9, y: 5 }, { x: 9, y: 6 }, { x: 9, y: 7 }, { x: 9, y: 8 },
];

export default function Game() {
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 7 });
  const [carrying, setCarrying] = useState([]); // Array to carry multiple items
  const [plate, setPlate] = useState([]); // Items on plating station
  const [orders, setOrders] = useState([]);
  const [score, setScore] = useState(0);

  // Defaulting to localhost:8000 for browser client
  const apiUrl = 'http://localhost:8000';

  useEffect(() => {
    // Poll for orders every 2 seconds
    const interval = setInterval(() => {
      fetch(`${apiUrl}/orders`)
        .then(res => res.json())
        .then(data => {
          if (data.orders) setOrders(data.orders);
          if (data.score !== undefined) setScore(data.score);
        })
        .catch(err => console.error("API error:", err));
    }, 2000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleKeyDown = useCallback((e) => {
    // Prevent default scrolling for space and arrows
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    setPlayerPos(prev => {
      let nx = prev.x;
      let ny = prev.y;

      if (e.key === 'ArrowUp') ny -= 1;
      if (e.key === 'ArrowDown') ny += 1;
      if (e.key === 'ArrowLeft') nx -= 1;
      if (e.key === 'ArrowRight') nx += 1;

      // Check walls
      if (WALLS.some(w => w.x === nx && w.y === ny)) return prev;
      // Check stations
      if (STATIONS.some(s => s.x === nx && s.y === ny)) return prev;
      // Bounds
      if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) return prev;

      return { x: nx, y: ny };
    });

    if (e.key === ' ') {
      // Interact
      setPlayerPos(prev => {
        // Find adjacent station (radius 1)
        const station = STATIONS.find(s => 
          Math.abs(s.x - prev.x) <= 1 && Math.abs(s.y - prev.y) <= 1
        );

        if (station) {
          if (station.type === 'fridge') {
            setCarrying(curr => [...curr, station.yields]); // allow picking up multiple
          } else if (station.type === 'stove') {
            setCarrying(curr => {
              if (curr.length > 0) {
                 const lastItem = curr[curr.length - 1];
                 if (station.converts[lastItem]) {
                    const newArr = [...curr];
                    newArr[newArr.length - 1] = station.converts[lastItem];
                    return newArr;
                 }
              }
              return curr;
            });
          } else if (station.type === 'plating') {
            // Drop everything onto plate, or pick up everything from plate
            setCarrying(curr => {
              if (curr.length > 0) {
                setPlate(p => [...p, ...curr]);
                return [];
              } else if (plate.length > 0) {
                const pickedUp = [...plate];
                setPlate([]);
                return pickedUp;
              }
              return curr;
            });
          } else if (station.type === 'window') {
            // Serve plate
            setCarrying(curr => {
              if (curr.length > 0) {
                fetch(`${apiUrl}/serve`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ingredients: curr })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                     setScore(data.score);
                  } else {
                     // Incorrect dish, penalty? Handled by backend if we want.
                  }
                });
                return []; // consumed (even if incorrect, it gets thrown away)
              }
              return curr;
            });
          }
        }
        return prev;
      });
    }
  }, [plate, apiUrl]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const cells = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const isWall = WALLS.some(w => w.x === x && w.y === y);
      const station = STATIONS.find(s => s.x === x && s.y === y);
      
      let className = 'cell';
      if (isWall) className += ' wall';
      if (station) className += ' station';

      let content = null;
      if (station) {
         if (station.type === 'plating') {
             content = plate.length > 0 ? (INGREDIENTS[plate[0]] || plate[0]) + (plate.length > 1 ? '+' : '') : station.icon;
         } else {
             content = station.icon;
         }
      }

      cells.push(
        <div key={`${x}-${y}`} className={className}>
          {content}
        </div>
      );
    }
  }

  return (
    <div className="game-container">
      <div className="kitchen-grid">
        {cells}
        <div 
          className="player" 
          style={{ transform: `translate(${playerPos.x * 54}px, ${playerPos.y * 54}px)` }}
        >
          👨‍🍳
          {carrying.length > 0 && (
            <div className="player-carrying">
              {INGREDIENTS[carrying[0]] || carrying[0]}
              {carrying.length > 1 && '+'}
            </div>
          )}
        </div>
      </div>
      
      <div className="hud-panel">
        <div className="score-board">
          Score: {score}
        </div>
        <h3>Active Orders</h3>
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <h3>{order.name}</h3>
              <div>
                {order.ingredients.map((ing, i) => (
                  <span key={i} className="ingredient-badge">
                    {INGREDIENTS[ing] || ing} {ing.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="instructions">No orders yet...</div>}
        </div>
        <div className="instructions">
          <strong>How to Play:</strong><br/><br/>
          <strong>Arrow Keys:</strong> Move Chef<br/>
          <strong>Spacebar:</strong> Interact<br/>
          <br/>
          1. Get ingredients from Fridges (🧊).<br/>
          2. Cook Meat (🥩) at the Stove (🔥).<br/>
          3. Combine items at the Plating Station (🍽️).<br/>
          4. Deliver completed dishes to the Window (🔔).
        </div>
      </div>
    </div>
  );
}
