"use client";

import { useState } from 'react';
import Link from 'next/link';
import Leaderboard from '../../components/Leaderboard';

const CHOICES = ['Rock', 'Paper', 'Scissors'];
const ICONS = { 'Rock': '✊', 'Paper': '✋', 'Scissors': '✌️' };

export default function RPS() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState(0);

  const playGame = (choice) => {
    const ai = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    setPlayerChoice(choice);
    setAiChoice(ai);

    if (choice === ai) {
      setResult('Tie!');
    } else if (
      (choice === 'Rock' && ai === 'Scissors') ||
      (choice === 'Paper' && ai === 'Rock') ||
      (choice === 'Scissors' && ai === 'Paper')
    ) {
      setResult('You Win!');
      setScore(s => s + 10);
    } else {
      setResult('You Lose!');
      // Reset score on loss for RPS to make leaderboard competitive (streak based)
      // or just keep it cumulative. Let's make it streak-based.
      if (score > 0) {
          // just end streak, score is kept for leaderboard submission but resets for next round
          // Actually, let's keep it cumulative but you lose points on a loss.
          setScore(s => Math.max(0, s - 5));
      }
    }
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <Link href="/"><button className="back-btn">← Back to Arcade</button></Link>
        <h2>Rock Paper Scissors</h2>
        <div style={{width: '120px', fontSize: '1.2rem', color: 'var(--accent)'}}>
           Score: {score}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', minWidth: '300px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            {CHOICES.map(c => (
              <button 
                key={c}
                className="btn" 
                onClick={() => playGame(c)}
                style={{ fontSize: '2rem', padding: '1rem' }}
              >
                {ICONS[c]}
              </button>
            ))}
          </div>
          
          {playerChoice && (
            <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '3rem', marginBottom: '1rem' }}>
                <div>{ICONS[playerChoice]}</div>
                <div>⚡</div>
                <div>{ICONS[aiChoice]}</div>
              </div>
              <h3 style={{ 
                fontSize: '2rem', 
                color: result === 'You Win!' ? 'var(--success)' : (result === 'Tie!' ? '#94a3b8' : 'var(--danger)')
              }}>
                {result}
              </h3>
            </div>
          )}
          
        </div>

        <Leaderboard gameId="rps" currentScore={score} />
      </div>
    </div>
  );
}
