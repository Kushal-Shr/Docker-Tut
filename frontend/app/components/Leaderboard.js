"use client";

import { useState, useEffect } from 'react';

export default function Leaderboard({ gameId, currentScore }) {
  const [scores, setScores] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const apiUrl = 'http://localhost:8000';

  useEffect(() => {
    fetchLeaderboard();
  }, [gameId]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${apiUrl}/leaderboard/${gameId}`);
      const data = await res.json();
      if (data.leaderboard) {
        setScores(data.leaderboard);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitScore = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/score/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: playerName, score: currentScore })
      });
      const data = await res.json();
      if (data.success) {
        setScores(data.leaderboard);
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="leaderboard">
      <h2>Top Scores</h2>
      
      {currentScore > 0 && !submitted && (
        <form className="submit-score-form" onSubmit={submitScore}>
          <input 
            type="text" 
            placeholder="Your Name" 
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            maxLength={10}
          />
          <button type="submit">Submit {currentScore}</button>
        </form>
      )}

      {scores.length === 0 ? (
        <p style={{ color: '#94a3b8', marginTop: '1rem' }}>No scores yet. Be the first!</p>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {scores.map((s, i) => (
            <div key={i} className="leaderboard-entry">
              <span className="rank">#{i + 1}</span>
              <span className="player">{s.player}</span>
              <span className="score">{s.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
