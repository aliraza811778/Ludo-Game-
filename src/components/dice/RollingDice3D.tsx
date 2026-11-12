import React, { useRef } from 'react';

interface RollingDice3DProps {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  position: 'bottom-left' | 'top-left' | 'top-right' | 'bottom-right';
}

/**
 * Ultra-crisp Vector Die Face SVG with soft rounded cube gradient & glossy pips
 */
export const DieFaceSVG: React.FC<{
  value: number;
  className?: string;
}> = ({ value, className = 'w-full h-full' }) => {
  const c = 24;
  const l = 13;
  const r = 35;
  const t = 13;
  const b = 35;

  const pipConfigs: Record<number, Array<[number, number]>> = {
    1: [[c, c]],
    2: [
      [l, t],
      [r, b],
    ],
    3: [
      [l, t],
      [c, c],
      [r, b],
    ],
    4: [
      [l, t],
      [r, t],
      [l, b],
      [r, b],
    ],
    5: [
      [l, t],
      [r, t],
      [c, c],
      [l, b],
      [r, b],
    ],
    6: [
      [l, t],
      [r, t],
      [l, c],
      [r, c],
      [l, b],
      [r, b],
    ],
  };

  const pips = pipConfigs[value] || pipConfigs[1];
  const isOne = value === 1;

  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Die Surface */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="9.5"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1.2"
      />

      {/* Top Gloss Highlights */}
      <path d="M10,4 L38,4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <path d="M4,10 L4,38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />

      {/* Crisp solid pips matching reference video */}
      {pips.map(([x, y], idx) => (
        <circle key={`pip-${idx}`} cx={x} cy={y} r={isOne ? 6.2 : 4.2} fill={isOne ? '#e52521' : '#141416'} />
      ))}
    </svg>
  );
};

export const RollingDice3D: React.FC<RollingDice3DProps> = ({
  value,
  isRolling,
  canRoll,
  onRoll,
}) => {
  const rollCountRef = useRef(0);
  if (isRolling) {
    rollCountRef.current++;
  }

  // Derive distinct die faces for all 6 sides of the 3D cube
  const front = Math.min(Math.max(1, value), 6);
  const back = 7 - front;
  const remaining = [1, 2, 3, 4, 5, 6].filter((n) => n !== front && n !== back);
  const top = remaining[0];
  const bottom = remaining[1];
  const left = remaining[2];
  const right = remaining[3];

  return (
    <div
      onClick={() => canRoll && !isRolling && onRoll()}
      className={`relative w-full h-full flex items-center justify-center select-none ${
        canRoll && !isRolling ? 'cursor-pointer' : isRolling ? 'cursor-wait' : 'cursor-default'
      }`}
      style={{ perspective: '600px' }}
    >
      <style>{`
        @keyframes diceTumble {
          0% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
          }
          20% {
            transform: translateY(-22px) rotateX(200deg) rotateY(180deg) rotateZ(10deg) scale(1.1);
          }
          50% {
            transform: translateY(-28px) rotateX(460deg) rotateY(420deg) rotateZ(-6deg) scale(1.15);
          }
          80% {
            transform: translateY(-6px) rotateX(660deg) rotateY(640deg) rotateZ(0deg) scale(1.04);
          }
          92% {
            transform: translateY(0px) rotateX(720deg) rotateY(720deg) rotateZ(0deg) scale(1.05, 0.95);
          }
          100% {
            transform: translateY(0px) rotateX(720deg) rotateY(720deg) rotateZ(0deg) scale(1, 1);
          }
        }

        @keyframes diceShadowBounce {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }
          25% {
            transform: scale(0.65);
            opacity: 0.25;
          }
          50% {
            transform: scale(0.5);
            opacity: 0.18;
          }
          85% {
            transform: scale(1.15);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 0.55;
          }
        }
      `}</style>

      {/* Floor Contact Shadow */}
      <div
        key={isRolling ? `shadow-roll-${rollCountRef.current}` : 'shadow-idle'}
        className={`absolute rounded-full bg-black/40 blur-[2px] pointer-events-none w-10 h-3 ${
          isRolling ? 'animate-[diceShadowBounce_440ms_cubic-bezier(0.25,0.9,0.3,1)_forwards]' : ''
        }`}
        style={{
          bottom: '2px',
          opacity: 0.55,
        }}
      />

      {/* 3D CUBE CONTAINER - Mathematically level & square landing at exact 720deg (0% side tilt) */}
      <div
        key={isRolling ? `dice-roll-${rollCountRef.current}` : 'dice-idle'}
        className={`relative w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] flex items-center justify-center ${
          canRoll && !isRolling ? 'hover:scale-105 active:scale-95' : ''
        } ${isRolling ? 'animate-[diceTumble_440ms_cubic-bezier(0.25,0.9,0.3,1)_forwards]' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
          willChange: 'transform',
        }}
      >
        {/* Face 1 (Front - Exactly displays rolled value, 100% square on landing) */}
        <div
          className="absolute inset-0 rounded-[9px] bg-white border border-[#cbd5e1] shadow-md flex items-center justify-center overflow-hidden"
          style={{ transform: 'translateZ(23px)', backfaceVisibility: 'hidden', willChange: 'transform' }}
        >
          <DieFaceSVG value={front} />
        </div>

        {/* Face 2 (Right) */}
        <div
          className="absolute inset-0 rounded-[9px] bg-white border border-[#cbd5e1] shadow-md flex items-center justify-center overflow-hidden"
          style={{ transform: 'rotateY(90deg) translateZ(23px)', backfaceVisibility: 'hidden', willChange: 'transform' }}
        >
          <DieFaceSVG value={right} />
        </div>

        {/* Face 3 (Top) */}
        <div
          className="absolute inset-0 rounded-[9px] bg-white border border-[#cbd5e1] shadow-md flex items-center justify-center overflow-hidden"
          style={{ transform: 'rotateX(90deg) translateZ(23px)', backfaceVisibility: 'hidden', willChange: 'transform' }}
        >
          <DieFaceSVG value={top} />
        </div>

        {/* Face 4 (Bottom) */}
        <div
          className="absolute inset-0 rounded-[9px] bg-white border border-[#cbd5e1] shadow-md flex items-center justify-center overflow-hidden"
          style={{ transform: 'rotateX(-90deg) translateZ(23px)', backfaceVisibility: 'hidden', willChange: 'transform' }}
        >
          <DieFaceSVG value={bottom} />
        </div>

        {/* Face 5 (Left) */}
        <div
          className="absolute inset-0 rounded-[9px] bg-white border border-[#cbd5e1] shadow-md flex items-center justify-center overflow-hidden"
          style={{ transform: 'rotateY(-90deg) translateZ(23px)', backfaceVisibility: 'hidden', willChange: 'transform' }}
        >
          <DieFaceSVG value={left} />
        </div>

        {/* Face 6 (Back) */}
        <div
          className="absolute inset-0 rounded-[9px] bg-white border border-[#cbd5e1] shadow-md flex items-center justify-center overflow-hidden"
          style={{ transform: 'rotateY(180deg) translateZ(23px)', backfaceVisibility: 'hidden', willChange: 'transform' }}
        >
          <DieFaceSVG value={back} />
        </div>
      </div>
    </div>
  );
};
