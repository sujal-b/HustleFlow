"use client";

import { useState, useEffect } from 'react';

const confettiColors = ['#29ABE2', '#F2994A', '#8E44AD', '#2ECC71', '#E74C3C'];
const totalConfetti = 100;

export function Confetti() {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const newPieces = Array.from({ length: totalConfetti }).map((_, i) => ({
        id: i,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 4}s`,
        animationDelay: `${Math.random() * 1}s`,
      }));
      setPieces(newPieces);
    }
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute top-[-20px] w-2 h-4 rounded-sm animate-fall"
          style={{
            backgroundColor: piece.color,
            left: piece.left,
            animationDuration: piece.animationDuration,
            animationDelay: piece.animationDelay,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
}
