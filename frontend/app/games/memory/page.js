"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Leaderboard from '../../components/Leaderboard';

const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🥑', '🍍'];

export default function Memory() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initializeGame = () => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((id, index) => ({ id: index, type: id }));
      
    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setScore(0);
    setIsWon(false);
    setDisabled(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (index) => {
    if (disabled || flipped.includes(index) || solved.includes(cards[index].type)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      setMoves(m => m + 1);
      
      const firstType = cards[newFlipped[0]].type;
      const secondType = cards[newFlipped[1]].type;

      if (firstType === secondType) {
        setSolved(prev => {
           const newSolved = [...prev, firstType];
           if (newSolved.length === EMOJIS.length) {
               setIsWon(true);
               // calculate score based on moves (fewer moves = higher score)
               // max theoretical score if perfect is 8 moves
               // 1000 base, minus 20 for every move over 8
               const finalScore = Math.max(100, 1000 - ((moves + 1 - 8) * 40));
               setScore(finalScore);
           }
           return newSolved;
        });
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <Link href="/"><button className="back-btn">← Back to Arcade</button></Link>
        <h2>Memory Match</h2>
        <div style={{width: '120px', fontSize: '1.2rem', color: '#94a3b8'}}>
           Moves: {moves}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: '10px'
          }}>
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || solved.includes(card.type);
              
              return (
                <div 
                  key={card.id} 
                  onClick={() => handleCardClick(index)}
                  style={{
                    height: '80px', 
                    background: isFlipped ? 'var(--card-bg)' : 'var(--secondary)',
                    border: '1px solid var(--grid-border)',
                    borderRadius: '8px', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    cursor: isFlipped ? 'default' : 'pointer',
                    transition: 'transform 0.3s'
                  }}
                >
                  {isFlipped ? card.type : ''}
                </div>
              );
            })}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            {isWon && (
              <>
                <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>You Won!</h3>
                <p>Final Score: {score}</p>
              </>
            )}
            <button className="btn" onClick={initializeGame} style={{ marginTop: '1rem' }}>
               {isWon ? 'Play Again' : 'Restart'}
            </button>
          </div>
        </div>

        <Leaderboard gameId="memory" currentScore={score} />
      </div>
    </div>
  );
}
