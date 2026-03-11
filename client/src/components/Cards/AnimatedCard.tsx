import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { PlayingCard, type Card } from '../Cards/PlayingCard';

interface AnimatedCardProps {
  card: Card;
  width?: number;
  height?: number;
  faceDown?: boolean;
  /** Animate card dealing from a source position (the dealer pod) */
  dealFrom?: { x: number; y: number };
  /** Delay before the deal animation starts (stagger per card) */
  dealDelay?: number;
  /** After deal, flip from face-down to face-up */
  flipDelay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  card, width = 52, height = 74, faceDown = false,
  dealFrom, dealDelay = 0, flipDelay,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Deal animation: fly from dealer position to this position
  useEffect(() => {
    if (!dealFrom || !cardRef.current) return;
    const el = cardRef.current;

    // Start from dealer position (relative translate)
    animate(el, 
      { x: [dealFrom.x, 0], y: [dealFrom.y, 0], opacity: [0, 1], scale: [0.6, 1] },
      { delay: dealDelay, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
    );
  }, [dealFrom, dealDelay]);

  // Flip animation: rotate from 90deg → 0deg (reveals face)
  useEffect(() => {
    if (!innerRef.current || flipDelay === undefined) return;
    const el = innerRef.current;

    // First set it face-down
    el.style.transform = 'rotateY(90deg)';
    
    const timer = setTimeout(() => {
      animate(el, { rotateY: [90, 0] }, { duration: 0.3, ease: 'easeOut', delay: 0 });
    }, (flipDelay + dealDelay) * 1000 + 300);

    return () => clearTimeout(timer);
  }, [flipDelay, dealDelay]);

  // Merge faceDown into the card object for PlayingCard
  const displayCard = { ...card, faceDown: faceDown || card.faceDown };

  return (
    <div ref={cardRef} style={{ perspective: 600, display: 'inline-block' }}>
      <div ref={innerRef} style={{ transformStyle: 'preserve-3d', display: 'inline-block' }}>
        <PlayingCard card={displayCard} width={width} height={height} />
      </div>
    </div>
  );
};

// ─── Chip burst animation ─────────────────────────────────────────────────────
interface ChipProps {
  color?: string;
  size?: number;
}

/** Single animated chip that flies from bottom to pot */
export const FlyingChip: React.FC<ChipProps & { delay?: number; targetX?: number; targetY?: number }> = ({
  color = '#f59e0b', size = 14, delay = 0, targetX = 0, targetY = -120,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    animate(
      el,
      { x: [0, targetX], y: [0, targetY], opacity: [1, 0], scale: [1, 0.5] },
      { delay, duration: 0.6, ease: 'easeIn' }
    );
  }, [delay, targetX, targetY]);

  return (
    <div ref={ref} style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color})`,
      border: '1.5px solid rgba(255,255,255,0.25)',
      boxShadow: `0 2px 6px rgba(0,0,0,0.5), 0 0 4px ${color}66`,
      position: 'absolute', pointerEvents: 'none',
    }} />
  );
};

// ─── Pot pulse on update ──────────────────────────────────────────────────────
export const usePotPulse = (pot: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef(pot);

  useEffect(() => {
    if (pot !== prev.current && ref.current) {
      animate(ref.current, 
        { scale: [1, 1.25, 1], textShadow: ['0 0 8px rgba(52,211,153,0.3)', '0 0 30px rgba(52,211,153,0.9)', '0 0 8px rgba(52,211,153,0.3)'] },
        { duration: 0.5, ease: 'easeOut' }
      );
    }
    prev.current = pot;
  }, [pot]);

  return ref;
};
