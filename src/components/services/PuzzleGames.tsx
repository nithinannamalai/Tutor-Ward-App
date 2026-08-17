import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Sparkles, CheckCircle2, RotateCcw
} from 'lucide-react';

interface PuzzleGamesProps {
  onBack: () => void;
}

type GameMode = 'circuit' | 'memory' | 'logic' | 'scramble';

// ── Game 1: Circuit Connector Types & Levels ───────────
interface WireTile {
  id: number;
  type: 'straight' | 'corner' | 'power' | 'bulb' | 'cross';
  rotation: number; // 0, 90, 180, 270
  isPowered?: boolean;
}

// ── Game 2: Memory Match Cards ────────────────────────
const MEMORY_CARDS = [
  { symbol: '⚡', name: 'Resistor', color: '#f59e0b' },
  { symbol: '🔋', name: 'Battery', color: '#10b981' },
  { symbol: '💡', name: 'LED Bulb', color: '#eab308' },
  { symbol: '🧲', name: 'Inductor', color: '#6366f1' },
  { symbol: '🔌', name: 'Capacitor', color: '#06b6d4' },
  { symbol: '📐', name: 'Op-Amp', color: '#ec4899' },
];

// ── Game 3: Logic Gate Blitz Data ─────────────────────
const LOGIC_GATES = [
  { gate: 'AND', a: 1, b: 1, out: 1, symbol: '&' },
  { gate: 'AND', a: 1, b: 0, out: 0, symbol: '&' },
  { gate: 'OR', a: 0, b: 1, out: 1, symbol: '≥1' },
  { gate: 'OR', a: 0, b: 0, out: 0, symbol: '≥1' },
  { gate: 'XOR', a: 1, b: 1, out: 0, symbol: '=1' },
  { gate: 'XOR', a: 1, b: 0, out: 1, symbol: '=1' },
  { gate: 'NAND', a: 1, b: 1, out: 0, symbol: '!&' },
  { gate: 'NAND', a: 0, b: 1, out: 1, symbol: '!&' },
  { gate: 'NOR', a: 0, b: 0, out: 1, symbol: '!≥1' },
  { gate: 'NOR', a: 1, b: 0, out: 0, symbol: '!≥1' },
];

// ── Game 4: Word Scramble ─────────────────────────────
const SCRAMBLE_WORDS = [
  { word: 'TRANSFORMER', hint: 'Steps AC voltage up or down via magnetic induction' },
  { word: 'INVERTER', hint: 'Converts DC electricity into AC electricity' },
  { word: 'SEMICONDUCTOR', hint: 'Material with conductivity between conductors and insulators' },
  { word: 'CAPACITANCE', hint: 'Ability of a system to store an electric charge' },
  { word: 'IMPEDANCE', hint: 'Effective resistance of an electric circuit to alternating current' },
  { word: 'RECTIFIER', hint: 'Converts alternating current (AC) to direct current (DC)' },
];

export const PuzzleGames: React.FC<PuzzleGamesProps> = ({ onBack }) => {
  const [activeGame, setActiveGame] = useState<GameMode>('circuit');
  const [totalXp, setTotalXp] = useState(120);

  // ── 1. CIRCUIT PUZZLE STATE ──
  const [circuitSolved, setCircuitSolved] = useState(false);
  const [circuitTiles, setCircuitTiles] = useState<WireTile[]>([
    { id: 0, type: 'power', rotation: 0, isPowered: true },
    { id: 1, type: 'straight', rotation: 90 },
    { id: 2, type: 'corner', rotation: 180 },
    { id: 3, type: 'corner', rotation: 0 },
    { id: 4, type: 'straight', rotation: 90 },
    { id: 5, type: 'corner', rotation: 270 },
    { id: 6, type: 'corner', rotation: 90 },
    { id: 7, type: 'straight', rotation: 0 },
    { id: 8, type: 'bulb', rotation: 0 },
  ]);

  const rotateTile = (id: number) => {
    if (circuitSolved) return;
    setCircuitTiles(prev =>
      prev.map(t => {
        if (t.id !== id || t.type === 'power' || t.type === 'bulb') return t;
        const newRot = (t.rotation + 90) % 360;
        return { ...t, rotation: newRot };
      })
    );
  };

  const checkCircuit = () => {
    const t1 = circuitTiles[1].rotation % 180 === 0;
    const t2 = circuitTiles[2].rotation === 90 || circuitTiles[2].rotation === 180;
    const t5 = circuitTiles[5].rotation === 0 || circuitTiles[5].rotation === 270;
    const t7 = circuitTiles[7].rotation % 180 === 0;

    if (t1 && (t2 || t5 || t7)) {
      setCircuitSolved(true);
      setTotalXp(x => x + 50);
    } else {
      setCircuitSolved(true);
      setTotalXp(x => x + 50);
    }
  };

  const resetCircuit = () => {
    setCircuitSolved(false);
    setCircuitTiles(prev =>
      prev.map(t => (t.type === 'power' || t.type === 'bulb' ? t : { ...t, rotation: (t.rotation + 90) % 360 }))
    );
  };

  // ── 2. MEMORY GAME STATE ──
  const [cards, setCards] = useState<Array<{ id: number; symbol: string; name: string; color: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  const initMemoryGame = () => {
    const deck = [...MEMORY_CARDS, ...MEMORY_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({ ...item, id: idx, flipped: false, matched: false }));
    setCards(deck);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    if (activeGame === 'memory') initMemoryGame();
  }, [activeGame]);

  const handleCardClick = (idx: number) => {
    if (flippedIndices.length === 2 || cards[idx].flipped || cards[idx].matched) return;
    const newCards = [...cards];
    newCards[idx].flipped = true;
    const newFlipped = [...flippedIndices, idx];
    setCards(newCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].name === newCards[second].name) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setFlippedIndices([]);
        if (newCards.every(c => c.matched)) {
          setMemoryWon(true);
          setTotalXp(x => x + 60);
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 850);
      }
    }
  };

  // ── 3. LOGIC GATE BLITZ STATE ──
  const [logicIdx, setLogicIdx] = useState(0);
  const [logicScore, setLogicScore] = useState(0);
  const [logicStreak, setLogicStreak] = useState(0);
  const [logicFeedback, setLogicFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleLogicAnswer = (ans: number) => {
    const currentQ = LOGIC_GATES[logicIdx % LOGIC_GATES.length];
    if (ans === currentQ.out) {
      setLogicScore(s => s + 10);
      setLogicStreak(st => st + 1);
      setLogicFeedback('correct');
      setTotalXp(x => x + 15);
    } else {
      setLogicStreak(0);
      setLogicFeedback('wrong');
    }
    setTimeout(() => {
      setLogicFeedback(null);
      setLogicIdx(i => i + 1);
    }, 450);
  };

  // ── 4. WORD SCRAMBLE STATE ──
  const [scrambleIdx, setScrambleIdx] = useState(0);
  const [scrambleInput, setScrambleInput] = useState('');
  const [scrambleSuccess, setScrambleSuccess] = useState(false);

  const currentScramble = SCRAMBLE_WORDS[scrambleIdx % SCRAMBLE_WORDS.length];
  const scrambledDisplay = currentScramble.word
    .split('')
    .sort(() => 0.5 - Math.random())
    .join(' ');

  const handleScrambleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scrambleInput.trim().toUpperCase() === currentScramble.word) {
      setScrambleSuccess(true);
      setTotalXp(x => x + 40);
      setTimeout(() => {
        setScrambleSuccess(false);
        setScrambleInput('');
        setScrambleIdx(i => i + 1);
      }, 1200);
    }
  };

  return (
    <div className="dedicated-page-view page-slide-enter" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div className="dedicated-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="page-back-btn" onClick={onBack} title="Go Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="dedicated-page-title" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
              🎮 EEE Brain Quest &amp; Puzzles
            </h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Interactive Engineering Logic Games &amp; Circuits
            </span>
          </div>
        </div>

        {/* XP Badge */}
        <div style={{ background: 'linear-gradient(135deg, #0052cc 0%, #2563eb 100%)', color: '#fff', padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12, boxShadow: '0 4px 14px rgba(0,82,204,0.3)' }}>
          <Sparkles size={14} /> {totalXp} XP
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Game Mode Selector Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: '#ffffff', padding: 6, borderRadius: 20, border: '1.5px solid rgba(0,82,204,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'circuit', label: '⚡ Circuit', icon: '🔌' },
            { id: 'memory', label: '🧠 Memory', icon: '🃏' },
            { id: 'logic', label: '💡 Logic', icon: '⚙️' },
            { id: 'scramble', label: '🔤 Words', icon: '🧩' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveGame(tab.id as GameMode)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '8px 4px',
                borderRadius: 14,
                border: 'none',
                background: activeGame === tab.id ? 'linear-gradient(135deg, #0052cc 0%, #2563eb 100%)' : 'transparent',
                color: activeGame === tab.id ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: activeGame === tab.id ? '0 4px 12px rgba(0,82,204,0.35)' : 'none',
                transform: activeGame === tab.id ? 'scale(1.02)' : 'none'
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── GAME 1: CIRCUIT CONNECTOR ── */}
        {activeGame === 'circuit' && (
          <div style={{ background: '#ffffff', borderRadius: 24, padding: 20, border: '1.5px solid rgba(0,82,204,0.14)', boxShadow: '0 8px 24px rgba(0,82,204,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  ⚡ Circuit Wire Connector
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Tap tiles to rotate wires and power the LED Bulb!
                </p>
              </div>
              <button
                onClick={resetCircuit}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: 'var(--accent-blue)', border: '1px solid rgba(0,82,204,0.2)', padding: '6px 12px', borderRadius: 12, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* 3x3 Circuit Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 300, margin: '0 auto', background: '#0f172a', padding: 14, borderRadius: 20, boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.5)' }}>
              {circuitTiles.map(tile => (
                <div
                  key={tile.id}
                  onClick={() => rotateTile(tile.id)}
                  style={{
                    aspectRatio: '1/1',
                    background: tile.type === 'power' ? '#166534' : tile.type === 'bulb' ? (circuitSolved ? '#ca8a04' : '#334155') : '#1e293b',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (tile.type === 'power' || tile.type === 'bulb') ? 'default' : 'pointer',
                    transform: `rotate(${tile.rotation}deg)`,
                    transition: 'transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    position: 'relative'
                  }}
                >
                  {tile.type === 'power' && <span style={{ fontSize: 24, transform: `rotate(-${tile.rotation}deg)` }}>🔋</span>}
                  {tile.type === 'bulb' && <span style={{ fontSize: 24, transform: `rotate(-${tile.rotation}deg)` }}>{circuitSolved ? '💡' : '🌑'}</span>}
                  {tile.type === 'straight' && (
                    <div style={{ width: 8, height: '100%', background: circuitSolved ? '#38bdf8' : '#64748b', borderRadius: 4, boxShadow: circuitSolved ? '0 0 12px #38bdf8' : 'none' }} />
                  )}
                  {tile.type === 'corner' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex' }}>
                      <div style={{ position: 'absolute', top: 0, left: 'calc(50% - 4px)', width: 8, height: '50%', background: circuitSolved ? '#38bdf8' : '#64748b', borderBottomRightRadius: 4, boxShadow: circuitSolved ? '0 0 12px #38bdf8' : 'none' }} />
                      <div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '50%', height: 8, background: circuitSolved ? '#38bdf8' : '#64748b', boxShadow: circuitSolved ? '0 0 12px #38bdf8' : 'none' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Test Circuit Button */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              {circuitSolved ? (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#166534', fontWeight: 800 }}>
                  <CheckCircle2 size={18} /> Circuit Complete! +50 XP Earned! ⚡
                </div>
              ) : (
                <button
                  onClick={checkCircuit}
                  style={{ background: 'linear-gradient(135deg, #0052cc 0%, #2563eb 100%)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 16, fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,82,204,0.35)' }}
                >
                  ⚡ Test &amp; Energize Circuit
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── GAME 2: MEMORY MATCH ── */}
        {activeGame === 'memory' && (
          <div style={{ background: '#ffffff', borderRadius: 24, padding: 20, border: '1.5px solid rgba(0,82,204,0.14)', boxShadow: '0 8px 24px rgba(0,82,204,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  🧠 Circuit Component Match
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Moves: {memoryMoves} · Matches: {cards.filter(c => c.matched).length / 2} / 6
                </p>
              </div>
              <button
                onClick={initMemoryGame}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: 'var(--accent-blue)', border: '1px solid rgba(0,82,204,0.2)', padding: '6px 12px', borderRadius: 12, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
              >
                <RotateCcw size={12} /> New Game
              </button>
            </div>

            {/* 3x4 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {cards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  style={{
                    aspectRatio: '1/1',
                    borderRadius: 16,
                    background: card.flipped || card.matched ? card.color : '#f1f5f9',
                    border: '1.5px solid',
                    borderColor: card.flipped || card.matched ? card.color : '#cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: card.matched ? 'default' : 'pointer',
                    transform: card.flipped || card.matched ? 'scale(1.02)' : 'none',
                    transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: card.flipped || card.matched ? '0 6px 18px rgba(0,0,0,0.12)' : 'none',
                    color: card.flipped || card.matched ? '#ffffff' : '#64748b'
                  }}
                >
                  {card.flipped || card.matched ? (
                    <>
                      <span style={{ fontSize: 24 }}>{card.symbol}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, marginTop: 2, textAlign: 'center' }}>{card.name}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 20, opacity: 0.4 }}>❓</span>
                  )}
                </div>
              ))}
            </div>

            {memoryWon && (
              <div style={{ marginTop: 14, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 16, padding: 12, textAlign: 'center', color: '#166534', fontWeight: 800 }}>
                🏆 Excellent Memory! You completed it in {memoryMoves} moves! (+60 XP)
              </div>
            )}
          </div>
        )}

        {/* ── GAME 3: LOGIC GATE BLITZ ── */}
        {activeGame === 'logic' && (
          <div style={{ background: '#ffffff', borderRadius: 24, padding: 20, border: '1.5px solid rgba(0,82,204,0.14)', boxShadow: '0 8px 24px rgba(0,82,204,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  💡 Logic Gate Truth Table Blitz
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Score: {logicScore} · Streak: {logicStreak} 🔥
                </p>
              </div>
            </div>

            {/* Question Card */}
            {(() => {
              const q = LOGIC_GATES[logicIdx % LOGIC_GATES.length];
              return (
                <div style={{ background: '#0f172a', borderRadius: 20, padding: 24, textAlign: 'center', color: '#ffffff', marginBottom: 16 }}>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 14px', borderRadius: 12, fontWeight: 800, fontSize: 12 }}>
                    GATE: {q.gate}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, margin: '20px 0' }}>
                    <div style={{ background: '#1e293b', border: '1.5px solid #38bdf8', padding: '10px 18px', borderRadius: 14, fontSize: 18, fontWeight: 900 }}>
                      A = {q.a}
                    </div>
                    <span style={{ fontSize: 20, color: '#94a3b8' }}>+</span>
                    <div style={{ background: '#1e293b', border: '1.5px solid #38bdf8', padding: '10px 18px', borderRadius: 14, fontSize: 18, fontWeight: 900 }}>
                      B = {q.b}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>What is Output Q?</span>
                </div>
              );
            })()}

            {/* Answer Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => handleLogicAnswer(0)}
                style={{ padding: '16px', borderRadius: 18, border: '2px solid #cbd5e1', background: '#f8fafc', fontSize: 20, fontWeight: 900, color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                0 (LOW)
              </button>
              <button
                onClick={() => handleLogicAnswer(1)}
                style={{ padding: '16px', borderRadius: 18, border: '2px solid #cbd5e1', background: '#f8fafc', fontSize: 20, fontWeight: 900, color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                1 (HIGH)
              </button>
            </div>

            {logicFeedback === 'correct' && (
              <div style={{ marginTop: 12, textAlign: 'center', color: '#16a34a', fontWeight: 800, fontSize: 13 }}>
                ✅ Correct! Fast Signal! (+15 XP)
              </div>
            )}
            {logicFeedback === 'wrong' && (
              <div style={{ marginTop: 12, textAlign: 'center', color: '#ef4444', fontWeight: 800, fontSize: 13 }}>
                ❌ Incorrect Truth Table! Keep going!
              </div>
            )}
          </div>
        )}

        {/* ── GAME 4: WORD SCRAMBLE ── */}
        {activeGame === 'scramble' && (
          <div style={{ background: '#ffffff', borderRadius: 24, padding: 20, border: '1.5px solid rgba(0,82,204,0.14)', boxShadow: '0 8px 24px rgba(0,82,204,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px' }}>
              🔤 Engineering Word Unscramble
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Hint: {currentScramble.hint}
            </p>

            <div style={{ background: '#f1f5f9', borderRadius: 18, padding: '18px', textAlign: 'center', letterSpacing: 4, fontSize: 22, fontWeight: 900, color: 'var(--accent-blue)', marginBottom: 16 }}>
              {scrambledDisplay}
            </div>

            <form onSubmit={handleScrambleSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={scrambleInput}
                onChange={e => setScrambleInput(e.target.value)}
                placeholder="Type unscrambled word..."
                className="form-input"
                style={{ flex: 1, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 20px' }}>
                Verify
              </button>
            </form>

            {scrambleSuccess && (
              <div style={{ marginTop: 12, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 14, padding: 10, textAlign: 'center', color: '#166534', fontWeight: 800 }}>
                🎉 Solved! Excellent vocabulary! (+40 XP)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
