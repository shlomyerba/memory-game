// 📁 src/MemoryGame.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Card {
  id: number;
  image: string;
  flipped: boolean;
  matched: boolean;
}

interface Player {
  name: string;
  avatar: string;
}

const allCharacters: Record<string, string[]> = {
  'Paddington': Array.from({ length: 18 }, (_, i) => `/img/paddington${i + 1}.png`),
  'Lilo & Stitch': Array.from({ length: 18 }, (_, i) => `/img/liloandstitch${i + 1}.png`),
};

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.play();
};

const generateCards = (theme: string, total: number): Card[] => {
  console.log('pp')
  const images = allCharacters[theme].slice(0, total / 2);
  const paired = [...images, ...images];
  const shuffled = paired.sort(() => Math.random() - 0.5);
  return shuffled.map((img, index) => ({
    id: index,
    image: img,
    flipped: false,
    matched: false,
  }));
};

export default function MemoryGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [theme, setTheme] = useState('Paddington');
  const [cardCount, setCardCount] = useState(12);
  const [playersCount, setPlayersCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Card[]>([]);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    if (gameStarted) {
      setScores(Array(playersCount).fill(0));
      setCards(generateCards(theme, cardCount));
    }
  }, [gameStarted, theme, cardCount, playersCount]);

  const flipCard = (card: Card) => {
    if (selected.length === 2 || card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === card.id ? { ...c, flipped: true } : c);
    setCards(newCards);

    const newSelected = [...selected, { ...card, flipped: true }];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.image === second.image) {
        playSound('/sounds/success.mp3');
        const updated = newCards.map(c => c.image === first.image ? { ...c, matched: true } : c);
        setTimeout(() => {
          setCards(updated);
          const newScores = [...scores];
          newScores[currentPlayer] += 1;
          setScores(newScores);
          setSelected([]);
        }, 1000);
      } else {
        playSound('/sounds/fail.mp3');
        setTimeout(() => {
          const reset = newCards.map(c =>
            c.id === first.id || c.id === second.id ? { ...c, flipped: false } : c
          );
          setCards(reset);
          setSelected([]);
          setCurrentPlayer((currentPlayer + 1) % playersCount);
        }, 1000);
      }
    }
  };

  const calculateGrid = (count: number): [number, number] => {
    let cols = Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);
    return [cols, rows];
  };

  if (!gameStarted) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem', background: 'linear-gradient(to bottom, #bfdbfe, #f0f9ff)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🎴 ברוכים הבאים למשחק הזיכרון!</h1>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label>
            נושא:
            <select value={theme} onChange={e => setTheme(e.target.value)}>
              {Object.keys(allCharacters).map(name => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>

          <label>
            מספר קלפים:
            <select value={cardCount} onChange={e => setCardCount(Number(e.target.value))}>
              {[12, 24, 36].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <label>
            שחקנים:
            <select value={playersCount} onChange={e => setPlayersCount(Number(e.target.value))}>
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${playersCount}, 1fr)`, gap: '1rem' }}>
          {Array.from({ length: playersCount }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <input
                placeholder={`שם שחקן ${i + 1}`}
                style={{ border: '1px solid #ccc', padding: '0.5rem', borderRadius: '4px' }}
                onChange={e => {
                  const updated = [...players];
                  updated[i] = { ...updated[i], name: e.target.value, avatar: updated[i]?.avatar || '' };
                  setPlayers(updated);
                }}
              />
              <input
                placeholder="🔗 קישור לתמונה"
                style={{ border: '1px solid #ccc', padding: '0.5rem', borderRadius: '4px' }}
                onChange={e => {
                  const updated = [...players];
                  updated[i] = { ...updated[i], avatar: e.target.value, name: updated[i]?.name || '' };
                  setPlayers(updated);
                }}
              />
            </div>
          ))}
        </div>

        <button
          style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', borderRadius: '8px' }}
          onClick={() => {
            const filledPlayers = Array.from({ length: playersCount }).map((_, i) => players[i] || { name: `שחקן ${i + 1}`, avatar: '' });
            setPlayers(filledPlayers);
            setGameStarted(true);
          }}
        >🚀 התחל משחק</button>
      </main>
    );
  }

  const [cols, rows] = calculateGrid(cardCount);

  return (
    <main style={{ minHeight: '100vh', padding: '1rem', backgroundColor: '#fef9c3', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {players.map((player, i) => (
          <div key={i} style={{ padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', textAlign: 'center', backgroundColor: currentPlayer === i ? '#93c5fd' : 'white', minWidth: '120px' }}>
            {player.avatar && <img src={player.avatar} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '9999px', margin: '0 auto' }} />}
            <p style={{ fontWeight: 'bold' }}>{player.name}</p>
            <p>זוגות: {scores[i]}</p>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gap: '0.5rem',
        justifyContent: 'center',
        gridTemplateColumns: `repeat(${cols}, minmax(80px, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(80px, 1fr))`,
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {cards.map(card => (
          <motion.div
            key={card.id}
            onClick={() => flipCard(card)}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: card.flipped || card.matched ? 'white' : '#8b5cf6',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {card.flipped || card.matched ? (
              <img src={card.image} alt="card" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
            ) : (
              <span>?</span>
            )}
          </motion.div>
        ))}
      </div>
    </main>
  );
}
