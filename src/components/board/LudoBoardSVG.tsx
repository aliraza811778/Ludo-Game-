import React, { useEffect, useRef, useState } from 'react';
import { Pawn, PlayerColor } from '../../logic/ludoEngine';
import { soundFx } from '../../audio/soundManager';

export interface MovingPawnData {
  id: number;
  color: PlayerColor;
  fromStep: number;
  toStep: number;
}

export interface LudoBoardSVGProps {
  className?: string;
  pawns?: Pawn[];
  moveablePawnIds?: number[]; // IDs of pawns that can move in the current turn
  currentTurnColor?: PlayerColor;
  onPawnClick?: (pawn: Pawn) => void;
  movingPawn?: MovingPawnData | null;
  onMovementComplete?: (finalStep: number) => void;
}

export const LudoBoardSVG: React.FC<LudoBoardSVGProps> = ({
  className = 'w-full h-full',
  pawns,
  moveablePawnIds = [],
  currentTurnColor,
  onPawnClick,
  movingPawn,
  onMovementComplete,
}) => {
  const cellSize = 46;
  const boardSize = 690; // 15 * 46

  // Exact reference colors
  const red = '#e52521';
  const green = '#00a348';
  const blue = '#008ce6';
  const yellow = '#f6c300';
  const darkYellow = '#d69e00';
  const blackLine = '#111111'; // Crisp high-contrast black grid line

  const colorGradMap: Record<PlayerColor, string> = {
    red: 'pawnGradRed',
    green: 'pawnGradGreen',
    blue: 'pawnGradBlue',
    yellow: 'pawnGradYellow',
  };
  const strokeMap: Record<PlayerColor, string> = {
    red: '#8a0c10',
    green: '#005927',
    blue: '#005999',
    yellow: '#ad7e00',
  };
  const ringThemeMap: Record<PlayerColor, { mainColor: string }> = {
    red: { mainColor: '#e52521' },
    green: { mainColor: '#00a348' },
    blue: { mainColor: '#008ce6' },
    yellow: { mainColor: '#f6c300' },
  };

  // 4 Nest coordinates centered comfortably inside each 4x4 white box
  const redNestCoords = [
    { cx: 94, cy: 114 },
    { cx: 182, cy: 114 },
    { cx: 94, cy: 196 },
    { cx: 182, cy: 196 },
  ];

  const greenNestCoords = [
    { cx: 508, cy: 114 },
    { cx: 596, cy: 114 },
    { cx: 508, cy: 196 },
    { cx: 596, cy: 196 },
  ];

  const blueNestCoords = [
    { cx: 94, cy: 528 },
    { cx: 182, cy: 528 },
    { cx: 94, cy: 610 },
    { cx: 182, cy: 610 },
  ];

  const yellowNestCoords = [
    { cx: 508, cy: 528 },
    { cx: 596, cy: 528 },
    { cx: 508, cy: 610 },
    { cx: 596, cy: 610 },
  ];

  // Map step index to grid row and col
  const getPawnGridPos = (c: PlayerColor, s: number): { row: number; col: number } | null => {
    if (s < 0) return null;
    if (s <= 50) {
      const offsets: Record<PlayerColor, number> = { blue: 0, red: 13, green: 26, yellow: 39 };
      const globalIdx = (offsets[c] + s) % 52;
      const trackList: Array<{ row: number; col: number }> = [
        { row: 13, col: 6 }, { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 9, col: 6 },
        { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 }, { row: 8, col: 0 },
        { row: 7, col: 0 }, { row: 6, col: 0 },
        { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
        { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
        { row: 0, col: 7 }, { row: 0, col: 8 },
        { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 },
        { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 }, { row: 6, col: 14 },
        { row: 7, col: 14 }, { row: 8, col: 14 },
        { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
        { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 14, col: 8 },
        { row: 14, col: 7 }, { row: 14, col: 6 },
      ];
      return trackList[globalIdx] || null;
    }
    const straightIndex = Math.max(0, Math.min(s - 51, 5));
    const straightMap: Record<PlayerColor, Array<{ row: number; col: number }>> = {
      blue: [{ row: 13, col: 7 }, { row: 12, col: 7 }, { row: 11, col: 7 }, { row: 10, col: 7 }, { row: 9, col: 7 }, { row: 8, col: 7.5 }],
      red: [{ row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7.5, col: 6 }],
      green: [{ row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7.5 }],
      yellow: [{ row: 7, col: 13 }, { row: 7, col: 12 }, { row: 7, col: 11 }, { row: 7, col: 10 }, { row: 7, col: 9 }, { row: 7.5, col: 8 }],
    };
    return straightMap[c]?.[straightIndex] || null;
  };

  const calculatePawnCoords = (pawn: Pawn, allPawns: Pawn[]) => {
    if (pawn.step === -1) {
      const nestCoordsMap: Record<PlayerColor, Array<{ cx: number; cy: number }>> = {
        red: redNestCoords,
        green: greenNestCoords,
        blue: blueNestCoords,
        yellow: yellowNestCoords,
      };
      const nestPos = nestCoordsMap[pawn.color][pawn.id] || { cx: 0, cy: 0 };
      return { cx: nestPos.cx, cy: nestPos.cy, scale: 1.16, isInHome: true };
    }

    const gridPos = getPawnGridPos(pawn.color, pawn.step);
    if (!gridPos) return null;

    const sameCellPawns = allPawns.filter((other) => {
      if (other.step < 0) return false;
      const otherPos = getPawnGridPos(other.color, other.step);
      return otherPos !== null && otherPos.row === gridPos.row && otherPos.col === gridPos.col;
    });

    let scale = pawn.step === 56 ? 0.95 : 1.16;
    let offsetX = 0;
    let offsetY = 0;

    if (pawn.step === 56) {
      const idx = sameCellPawns.findIndex((p) => p.color === pawn.color && p.id === pawn.id);
      if (sameCellPawns.length === 2) {
        scale = 0.82;
        offsetX = idx === 0 ? -6.5 : 6.5;
        offsetY = idx === 0 ? -3 : 3;
      } else if (sameCellPawns.length === 3) {
        scale = 0.72;
        const trioOffsets = [
          { ox: 0, oy: -7 },
          { ox: -7, oy: 5 },
          { ox: 7, oy: 5 },
        ];
        if (idx >= 0 && idx < trioOffsets.length) {
          offsetX = trioOffsets[idx].ox;
          offsetY = trioOffsets[idx].oy;
        }
      } else if (sameCellPawns.length >= 4) {
        scale = 0.62;
        const quadOffsets = [
          { ox: -6.5, oy: -6.5 },
          { ox: 6.5, oy: -6.5 },
          { ox: -6.5, oy: 6.5 },
          { ox: 6.5, oy: 6.5 },
        ];
        if (idx >= 0 && idx < quadOffsets.length) {
          offsetX = quadOffsets[idx].ox;
          offsetY = quadOffsets[idx].oy;
        }
      }
    } else if (sameCellPawns.length > 1) {
      const idx = sameCellPawns.findIndex((p) => p.color === pawn.color && p.id === pawn.id);
      if (sameCellPawns.length === 2) {
        scale = 0.90;
        offsetX = idx === 0 ? -7.5 : 7.5;
        offsetY = idx === 0 ? -3.5 : 3.5;
      } else if (sameCellPawns.length === 3) {
        scale = 0.78;
        const trioOffsets = [
          { ox: 0, oy: -8 },
          { ox: -8, oy: 6 },
          { ox: 8, oy: 6 },
        ];
        if (idx >= 0 && idx < trioOffsets.length) {
          offsetX = trioOffsets[idx].ox;
          offsetY = trioOffsets[idx].oy;
        }
      } else if (sameCellPawns.length >= 4) {
        scale = 0.68;
        const quadOffsets = [
          { ox: -7.5, oy: -7.5 },
          { ox: 7.5, oy: -7.5 },
          { ox: -7.5, oy: 7.5 },
          { ox: 7.5, oy: 7.5 },
        ];
        if (idx >= 0 && idx < quadOffsets.length) {
          offsetX = quadOffsets[idx].ox;
          offsetY = quadOffsets[idx].oy;
        }
      }
    }

    const cx = gridPos.col * cellSize + cellSize / 2 + offsetX;
    const cy = gridPos.row * cellSize + cellSize / 2 + offsetY;
    return { cx, cy, scale, isInHome: false };
  };

  // Footprint ripple state: soft translucent ripple left at vacated tiles
  const [trailFootprints, setTrailFootprints] = useState<
    Array<{ id: string; color: PlayerColor; cx: number; cy: number }>
  >([]);

  // Refs for 60fps GPU-accelerated moving pawn DOM node
  const movingGroupRef = useRef<SVGGElement | null>(null);
  const movingBodyRef = useRef<SVGGElement | null>(null);
  const movingShadowRef = useRef<SVGEllipseElement | null>(null);

  // Compute exact waypoints along the track for smooth continuous interpolation
  const calculateWaypoints = (
    color: PlayerColor,
    id: number,
    fromStep: number,
    toStep: number,
    allPawns: Pawn[]
  ): Array<{ cx: number; cy: number }> => {
    const waypoints: Array<{ cx: number; cy: number }> = [];

    if (fromStep === -1) {
      const nestMap: Record<PlayerColor, Array<{ cx: number; cy: number }>> = {
        red: redNestCoords,
        green: greenNestCoords,
        blue: blueNestCoords,
        yellow: yellowNestCoords,
      };
      waypoints.push(nestMap[color][id] || { cx: 0, cy: 0 });
      const p0 = getPawnGridPos(color, 0);
      if (p0) {
        waypoints.push({
          cx: p0.col * cellSize + cellSize / 2,
          cy: p0.row * cellSize + cellSize / 2,
        });
      }
      return waypoints;
    }

    for (let s = fromStep; s <= toStep; s++) {
      if (s === toStep) {
        const finalCoords = calculatePawnCoords({ id, color, step: toStep }, allPawns);
        if (finalCoords) {
          waypoints.push({ cx: finalCoords.cx, cy: finalCoords.cy });
        } else {
          const p = getPawnGridPos(color, s);
          if (p) waypoints.push({ cx: p.col * cellSize + cellSize / 2, cy: p.row * cellSize + cellSize / 2 });
        }
      } else {
        const p = getPawnGridPos(color, s);
        if (p) {
          waypoints.push({ cx: p.col * cellSize + cellSize / 2, cy: p.row * cellSize + cellSize / 2 });
        }
      }
    }

    return waypoints;
  };

  // 60FPS / 120FPS HARDWARE-ACCELERATED PAWN MOVEMENT ENGINE (0% JITTER, 0% STUTTER)
  useEffect(() => {
    if (!movingPawn) {
      if (trailFootprints.length > 0) setTrailFootprints([]);
      return;
    }

    const { color, id, fromStep, toStep } = movingPawn;
    const isUnlocking = fromStep === -1;
    const waypoints = calculateWaypoints(color, id, fromStep, toStep, pawns || []);

    if (waypoints.length < 2) {
      onMovementComplete?.(toStep);
      return;
    }

    // Exact measured duration from reference video: 240ms per tile, 380ms for nest unlock
    const hopDuration = isUnlocking ? 380 : 240;
    const totalSegments = waypoints.length - 1;
    const totalDuration = totalSegments * hopDuration;

    // Immediately snap moving element to starting position
    const startW = waypoints[0];
    if (movingGroupRef.current) {
      movingGroupRef.current.setAttribute('transform', `translate(${startW.cx}, ${startW.cy})`);
    }
    if (movingBodyRef.current) {
      movingBodyRef.current.setAttribute('transform', 'translate(0, 0)');
    }
    if (movingShadowRef.current) {
      movingShadowRef.current.setAttribute('transform', 'scale(1)');
      movingShadowRef.current.setAttribute('opacity', '0.65');
    }

    let animId: number;
    let startTime: number | null = null;
    let lastPlayedSegment = 0; // Starts at 0 so audio tick fires precisely on each cell touchdown

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }
      const elapsed = timestamp - startTime;

      if (elapsed >= totalDuration) {
        // Final touchdown!
        const dest = waypoints[waypoints.length - 1];
        if (movingGroupRef.current) {
          movingGroupRef.current.setAttribute('transform', `translate(${dest.cx}, ${dest.cy})`);
        }
        if (movingBodyRef.current) {
          movingBodyRef.current.setAttribute('transform', 'translate(0, 0)');
        }
        if (movingShadowRef.current) {
          movingShadowRef.current.setAttribute('transform', 'scale(1)');
          movingShadowRef.current.setAttribute('opacity', '0.65');
        }
        soundFx.playPawnStep();
        onMovementComplete?.(toStep);
        return;
      }

      const segment = Math.min(Math.floor(elapsed / hopDuration), totalSegments - 1);
      const segmentProgress = (elapsed - segment * hopDuration) / hopDuration;

      // Touchdown event on each cell: play sound & leave soft footprint ripple
      if (segment > lastPlayedSegment) {
        soundFx.playPawnStep();
        const vacated = waypoints[segment];
        if (vacated) {
          setTrailFootprints([{
            id: `fp-${color}-${segment}-${Date.now()}`,
            color,
            cx: vacated.cx,
            cy: vacated.cy,
          }]);
        }
        lastPlayedSegment = segment;
      }

      const w0 = waypoints[segment];
      const w1 = waypoints[segment + 1];

      // Seamless, uninterrupted continuous linear glide between coordinates
      const curX = w0.cx + (w1.cx - w0.cx) * segmentProgress;
      const curY = w0.cy + (w1.cy - w0.cy) * segmentProgress;

      // Parabolic vertical hop: smooth natural arc peaking at mid-flight
      const maxH = isUnlocking ? 36 : 24;
      const hopY = Math.sin(segmentProgress * Math.PI) * maxH;

      // Ground contact shadow dynamically contracts & lightens with elevation
      const shadowScale = 1 - Math.sin(segmentProgress * Math.PI) * 0.42;
      const shadowOpacity = 0.65 - Math.sin(segmentProgress * Math.PI) * 0.35;

      if (movingGroupRef.current) {
        movingGroupRef.current.setAttribute('transform', `translate(${curX}, ${curY})`);
      }
      if (movingBodyRef.current) {
        movingBodyRef.current.setAttribute('transform', `translate(0, ${-hopY})`);
      }
      if (movingShadowRef.current) {
        movingShadowRef.current.setAttribute('transform', `scale(${shadowScale})`);
        movingShadowRef.current.setAttribute('opacity', `${shadowOpacity}`);
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [movingPawn]);

  // Helper for drawing White 3D teardrop goti matching the approved HUD goti exactly
  const renderInteractivePawn = (
    cx: number,
    cy: number,
    color: PlayerColor,
    pawnObj?: Pawn,
    isMoveable: boolean = false,
    scale: number = 1.16,
    isInHome: boolean = false
  ) => {
    const colorGradId = colorGradMap[color];
    const strokeColor = strokeMap[color];
    const ringTheme = ringThemeMap[color];
    const key = pawnObj ? `pawn-${pawnObj.color}-${pawnObj.id}` : `pawn-${cx}-${cy}`;

    return (
      <g
        key={key}
        transform={`translate(${cx}, ${cy})`}
        onClick={(e) => {
          if (pawnObj && isMoveable && onPawnClick) {
            e.stopPropagation();
            onPawnClick(pawnObj);
          }
        }}
        className={isMoveable ? 'cursor-pointer' : undefined}
      >
        {/* Crisp solid black ground contact shadow ONLY when out on the board (NO shadow in home nests) */}
        {!isInHome && (
          <ellipse
            cx="0"
            cy="2"
            rx={15.5 * scale}
            ry={6.8 * scale}
            fill="#000000"
            opacity={0.65}
            style={{ transformOrigin: '0px 2px' }}
          />
        )}

        {/* Permanent solid floor base disc underneath goti anchoring it to the square floor */}
        {!isInHome && (
          <ellipse
            cx="0"
            cy="1"
            rx={13.5 * scale}
            ry={6.5 * scale}
            fill={strokeColor}
            opacity="0.75"
          />
        )}

        {/* Moveable Indicator: Vibrant circular spotlight ring ON THE FLOOR directly underneath goti */}
        {isMoveable && (
          <g pointerEvents="none">
            {/* Soft pulsing floor spotlight glow */}
            <ellipse
              cx="0"
              cy="1"
              rx={21 * scale}
              ry={11 * scale}
              fill={ringTheme.mainColor}
              opacity="0.38"
              className="animate-[floorSpotlightPulse_900ms_ease-in-out_infinite]"
            />
            {/* Crisp vibrant floor ring directly beneath goti */}
            <ellipse
              cx="0"
              cy="1"
              rx={17.5 * scale}
              ry={9 * scale}
              fill="none"
              stroke={ringTheme.mainColor}
              strokeWidth={2.8 * scale}
              strokeDasharray={`${5 * scale} ${3.5 * scale}`}
              strokeLinecap="round"
              className="animate-[floorRingSpin_2.5s_linear_infinite]"
            />
            {/* Inner bright white accent floor ring */}
            <ellipse
              cx="0"
              cy="1"
              rx={12 * scale}
              ry={6.2 * scale}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.8 * scale}
              opacity="0.9"
            />
          </g>
        )}

        {/* Smooth 3D White Teardrop Goti Body with dynamic scale anchored at tip */}
        <g transform={`scale(${scale})`}>
          <path
            d="M 0, -51 C -10.3, -51 -18.5, -42.8 -18.5, -33 C -18.5, -22.2 -7.6, -9.2 0, 0 C 7.6, -9.2 18.5, -22.2 18.5, -33 C 18.5, -42.8 10.3, -51 0, -51 Z"
            fill="url(#whiteGotiGrad)"
            stroke="#334155"
            strokeWidth="1.2"
          />

          {/* Clean Inner Colored Circle */}
          <circle
            cx="0"
            cy="-33"
            r="13.6"
            fill={`url(#${colorGradId})`}
            stroke={strokeColor}
            strokeWidth="0.8"
          />
        </g>
      </g>
    );
  };

  // Helper for drawing 4 colored circles inside white box
  const renderNestSpot = (cx: number, cy: number, mainColor: string, darkColor: string) => {
    return (
      <g key={`nest-${cx}-${cy}`}>
        {/* Main colored outer disc */}
        <circle cx={cx} cy={cy} r="20" fill={mainColor} />
        {/* Inner concentric darker accent ring */}
        <circle cx={cx} cy={cy} r="14" fill="none" stroke={darkColor} strokeWidth="2.8" />
        {/* Center colored core */}
        <circle cx={cx} cy={cy} r="9" fill={mainColor} />
      </g>
    );
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${boardSize} ${boardSize}`}
      className={`${className} overflow-visible`}
      style={{ overflow: 'visible' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Pawn glossy radial gradients */}
        <radialGradient id="pawnGradRed" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ff4d53" />
          <stop offset="70%" stopColor="#c40c14" />
          <stop offset="100%" stopColor="#8c0006" />
        </radialGradient>

        <radialGradient id="pawnGradGreen" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#28d672" />
          <stop offset="70%" stopColor="#00853a" />
          <stop offset="100%" stopColor="#005927" />
        </radialGradient>

        <radialGradient id="pawnGradBlue" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#3db4ff" />
          <stop offset="70%" stopColor="#0072c4" />
          <stop offset="100%" stopColor="#005999" />
        </radialGradient>

        <radialGradient id="pawnGradYellow" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff16b" />
          <stop offset="70%" stopColor="#e6b800" />
          <stop offset="100%" stopColor="#ad7e00" />
        </radialGradient>

        {/* White 3D Goti Body Gradient */}
        <linearGradient id="whiteGotiGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f2f4f8" />
          <stop offset="85%" stopColor="#dbe0e8" />
          <stop offset="100%" stopColor="#bcc5d1" />
        </linearGradient>
      </defs>

      {/* Physics-driven floor spotlight pulse & soft footprint ripple animations */}
      <style>{`
        @keyframes floorSpotlightPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.32;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.58;
          }
        }

        @keyframes floorRingSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes footprintFadeFast {
          0% {
            opacity: 0.45;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(1.12);
          }
        }
      `}</style>

      {/* Base White Canvas */}
      <rect width={boardSize} height={boardSize} fill="#ffffff" />

      {/* 1. Red Base (Top-Left 6x6) */}
      <rect x="0" y="0" width={6 * cellSize} height={6 * cellSize} fill={red} stroke={blackLine} strokeWidth="2.5" />
      <rect x={cellSize} y={cellSize} width={4 * cellSize} height={4 * cellSize} fill="#ffffff" rx="8" stroke={blackLine} strokeWidth="2" />
      <text
        x="23"
        y={3 * cellSize}
        fontFamily="Arial, system-ui, sans-serif"
        fontSize="24"
        fontWeight="900"
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="2.5"
        paintOrder="stroke fill"
        transform={`rotate(-90 23 ${3 * cellSize})`}
        textAnchor="middle"
        dominantBaseline="central"
      >
        Player 2
      </text>

      {/* 2. Green Base (Top-Right 6x6) */}
      <rect x={9 * cellSize} y="0" width={6 * cellSize} height={6 * cellSize} fill={green} stroke={blackLine} strokeWidth="2.5" />
      <rect x={10 * cellSize} y={cellSize} width={4 * cellSize} height={4 * cellSize} fill="#ffffff" rx="8" stroke={blackLine} strokeWidth="2" />
      <text
        x={12 * cellSize}
        y="23"
        fontFamily="Arial, system-ui, sans-serif"
        fontSize="24"
        fontWeight="900"
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="2.5"
        paintOrder="stroke fill"
        transform={`rotate(180 ${12 * cellSize} 23)`}
        textAnchor="middle"
        dominantBaseline="central"
      >
        Player 3
      </text>

      {/* 3. Yellow Base (Bottom-Right 6x6) */}
      <rect x={9 * cellSize} y={9 * cellSize} width={6 * cellSize} height={6 * cellSize} fill={yellow} stroke={blackLine} strokeWidth="2.5" />
      <rect x={10 * cellSize} y={10 * cellSize} width={4 * cellSize} height={4 * cellSize} fill="#ffffff" rx="8" stroke={blackLine} strokeWidth="2" />
      <text
        x={boardSize - 23}
        y={12 * cellSize}
        fontFamily="Arial, system-ui, sans-serif"
        fontSize="24"
        fontWeight="900"
        fill="#000000"
        transform={`rotate(90 ${boardSize - 23} ${12 * cellSize})`}
        textAnchor="middle"
        dominantBaseline="central"
      >
        Player 4
      </text>

      {/* 4. Blue Base (Bottom-Left 6x6) */}
      <rect x="0" y={9 * cellSize} width={6 * cellSize} height={6 * cellSize} fill={blue} stroke={blackLine} strokeWidth="2.5" />
      <rect x={cellSize} y={10 * cellSize} width={4 * cellSize} height={4 * cellSize} fill="#ffffff" rx="8" stroke={blackLine} strokeWidth="2" />
      <text
        x={3 * cellSize}
        y={boardSize - 23}
        fontFamily="Arial, system-ui, sans-serif"
        fontSize="24"
        fontWeight="900"
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="2.5"
        paintOrder="stroke fill"
        textAnchor="middle"
        dominantBaseline="central"
      >
        Player 1
      </text>

      {/* 4 Colored Target Circles (Nest Spots) */}
      {redNestCoords.map((pos) => renderNestSpot(pos.cx, pos.cy, red, '#8a0c10'))}
      {greenNestCoords.map((pos) => renderNestSpot(pos.cx, pos.cy, green, '#005927'))}
      {yellowNestCoords.map((pos) => renderNestSpot(pos.cx, pos.cy, yellow, '#ad7e00'))}
      {blueNestCoords.map((pos) => renderNestSpot(pos.cx, pos.cy, blue, '#005999'))}

      {/* Colored Home Straight Columns */}
      <rect x={cellSize} y={7 * cellSize} width={5 * cellSize} height={cellSize} fill={red} stroke={blackLine} strokeWidth="1.5" />
      <rect x={cellSize} y={6 * cellSize} width={cellSize} height={cellSize} fill={red} stroke={blackLine} strokeWidth="1.5" />

      <rect x={7 * cellSize} y={cellSize} width={cellSize} height={5 * cellSize} fill={green} stroke={blackLine} strokeWidth="1.5" />
      <rect x={8 * cellSize} y={cellSize} width={cellSize} height={cellSize} fill={green} stroke={blackLine} strokeWidth="1.5" />

      <rect x={9 * cellSize} y={7 * cellSize} width={5 * cellSize} height={cellSize} fill={yellow} stroke={blackLine} strokeWidth="1.5" />
      <rect x={13 * cellSize} y={8 * cellSize} width={cellSize} height={cellSize} fill={yellow} stroke={blackLine} strokeWidth="1.5" />

      <rect x={7 * cellSize} y={9 * cellSize} width={cellSize} height={5 * cellSize} fill={blue} stroke={blackLine} strokeWidth="1.5" />
      <rect x={6 * cellSize} y={13 * cellSize} width={cellSize} height={cellSize} fill={blue} stroke={blackLine} strokeWidth="1.5" />

      {/* Center Home Triangles */}
      <polygon points={`${6 * cellSize},${6 * cellSize} ${6 * cellSize},${9 * cellSize} ${7.5 * cellSize},${7.5 * cellSize}`} fill={red} stroke={blackLine} strokeWidth="2" />
      <polygon points={`${6 * cellSize},${6 * cellSize} ${9 * cellSize},${6 * cellSize} ${7.5 * cellSize},${7.5 * cellSize}`} fill={green} stroke={blackLine} strokeWidth="2" />
      <polygon points={`${9 * cellSize},${6 * cellSize} ${9 * cellSize},${9 * cellSize} ${7.5 * cellSize},${7.5 * cellSize}`} fill={yellow} stroke={blackLine} strokeWidth="2" />
      <polygon points={`${6 * cellSize},${9 * cellSize} ${9 * cellSize},${9 * cellSize} ${7.5 * cellSize},${7.5 * cellSize}`} fill={blue} stroke={blackLine} strokeWidth="2" />
      <line x1={6 * cellSize} y1={6 * cellSize} x2={9 * cellSize} y2={9 * cellSize} stroke={blackLine} strokeWidth="2.2" />
      <line x1={6 * cellSize} y1={9 * cellSize} x2={9 * cellSize} y2={6 * cellSize} stroke={blackLine} strokeWidth="2.2" />
      <rect x={6 * cellSize} y={6 * cellSize} width={3 * cellSize} height={3 * cellSize} fill="none" stroke={blackLine} strokeWidth="2.5" />

      {/* Track Grid Lines */}
      <g stroke={blackLine} strokeWidth="1.6" shapeRendering="crispEdges">
        {[6, 7, 8, 9].map((col) => (
          <React.Fragment key={`v-${col}`}>
            <line x1={col * cellSize} y1="0" x2={col * cellSize} y2={6 * cellSize} />
            <line x1={col * cellSize} y1={9 * cellSize} x2={col * cellSize} y2={15 * cellSize} />
          </React.Fragment>
        ))}

        {[0, 1, 2, 3, 4, 5, 6].map((row) => (
          <line key={`h-top-${row}`} x1={6 * cellSize} y1={row * cellSize} x2={9 * cellSize} y2={row * cellSize} />
        ))}
        {[9, 10, 11, 12, 13, 14, 15].map((row) => (
          <line key={`h-bot-${row}`} x1={6 * cellSize} y1={row * cellSize} x2={9 * cellSize} y2={row * cellSize} />
        ))}

        {[6, 7, 8, 9].map((row) => (
          <React.Fragment key={`h-${row}`}>
            <line x1="0" y1={row * cellSize} x2={6 * cellSize} y2={row * cellSize} />
            <line x1={9 * cellSize} y1={row * cellSize} x2={15 * cellSize} y2={row * cellSize} />
          </React.Fragment>
        ))}

        {[0, 1, 2, 3, 4, 5, 6].map((col) => (
          <line key={`v-left-${col}`} x1={col * cellSize} y1={6 * cellSize} x2={col * cellSize} y2={9 * cellSize} />
        ))}
        {[9, 10, 11, 12, 13, 14, 15].map((col) => (
          <line key={`v-right-${col}`} x1={col * cellSize} y1={6 * cellSize} x2={col * cellSize} y2={9 * cellSize} />
        ))}

        <rect x="0" y="0" width={boardSize} height={boardSize} fill="none" stroke={blackLine} strokeWidth="3" />
      </g>

      {/* 4 Star Safe Squares */}
      {[
        { cx: (2 + 0.5) * cellSize, cy: (8 + 0.5) * cellSize, fill: red, stroke: '#8a0c10' },
        { cx: (6 + 0.5) * cellSize, cy: (2 + 0.5) * cellSize, fill: green, stroke: '#005927' },
        { cx: (12 + 0.5) * cellSize, cy: (6 + 0.5) * cellSize, fill: yellow, stroke: '#ad7e00' },
        { cx: (8 + 0.5) * cellSize, cy: (12 + 0.5) * cellSize, fill: blue, stroke: '#005999' },
      ].map((s, idx) => (
        <polygon
          key={`star-${idx}`}
          points={`
            ${s.cx},${s.cy - 16.5}
            ${s.cx + 5},${s.cy - 5.2}
            ${s.cx + 16.5},${s.cy - 4.2}
            ${s.cx + 7.8},${s.cy + 4.8}
            ${s.cx + 10.5},${s.cy + 16.5}
            ${s.cx},${s.cy + 9.5}
            ${s.cx - 10.5},${s.cy + 16.5}
            ${s.cx - 7.8},${s.cy + 4.8}
            ${s.cx - 16.5},${s.cy - 4.2}
            ${s.cx - 5},${s.cy - 5.2}
          `}
          fill={s.fill}
          stroke={s.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      ))}

      {/* 4 Directional Entry Arrows */}
      <path
        d={`M12,${7.5 * cellSize} L34,${7.5 * cellSize} M26,${7.5 * cellSize - 6} L34,${7.5 * cellSize} L26,${7.5 * cellSize + 6}`}
        stroke={red}
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${7.5 * cellSize},12 L${7.5 * cellSize},34 M${7.5 * cellSize - 6},26 L${7.5 * cellSize},34 L${7.5 * cellSize + 6},26`}
        stroke={green}
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${15 * cellSize - 12},${7.5 * cellSize} L${15 * cellSize - 34},${7.5 * cellSize} M${15 * cellSize - 26},${7.5 * cellSize - 6} L${15 * cellSize - 34},${7.5 * cellSize} L${15 * cellSize - 26},${7.5 * cellSize + 6}`}
        stroke={darkYellow}
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${7.5 * cellSize},${15 * cellSize - 12} L${7.5 * cellSize},${15 * cellSize - 34} M${7.5 * cellSize - 6},${15 * cellSize - 26} L${7.5 * cellSize},${15 * cellSize - 34} L${7.5 * cellSize + 6},${15 * cellSize - 26}`}
        stroke={blue}
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Soft, light translucent floor ripple - immediately vanishes as goti steps to the next box */}
      {trailFootprints.map((fp) => {
        const footprintColorMap: Record<PlayerColor, { ring: string; fill: string }> = {
          green: { ring: '#00c853', fill: 'rgba(0,200,83,0.30)' },
          red: { ring: '#ff2a3b', fill: 'rgba(255,42,59,0.30)' },
          blue: { ring: '#0091ea', fill: 'rgba(0,145,234,0.30)' },
          yellow: { ring: '#ffd000', fill: 'rgba(255,208,0,0.35)' },
        };
        const colors = footprintColorMap[fp.color] || footprintColorMap.blue;
        return (
          <g
            key={fp.id}
            transform={`translate(${fp.cx}, ${fp.cy})`}
            pointerEvents="none"
          >
            <g className="animate-[footprintFadeFast_280ms_ease-out_forwards]">
              <circle cx="0" cy="0" r="14" fill={colors.fill} stroke={colors.ring} strokeWidth="1.6" opacity="0.65" />
            </g>
          </g>
        );
      })}

      {/* STATIC PAWNS - Stable DOM nodes; excludes the actively animating pawn */}
      {pawns && pawns.length > 0 ? (
        pawns.map((pawn) => {
          if (movingPawn && movingPawn.color === pawn.color && movingPawn.id === pawn.id) {
            return null; // Rendered by the 60fps moving layer below
          }
          const coords = calculatePawnCoords(pawn, pawns);
          if (!coords) return null;
          const isMoveable = currentTurnColor === pawn.color && moveablePawnIds.includes(pawn.id);
          return renderInteractivePawn(
            coords.cx,
            coords.cy,
            pawn.color,
            pawn,
            isMoveable,
            coords.scale,
            coords.isInHome
          );
        })
      ) : (
        <>
          {redNestCoords.map((pos) => renderInteractivePawn(pos.cx, pos.cy, 'red', undefined, false, 1.16, true))}
          {greenNestCoords.map((pos) => renderInteractivePawn(pos.cx, pos.cy, 'green', undefined, false, 1.16, true))}
          {blueNestCoords.map((pos) => renderInteractivePawn(pos.cx, pos.cy, 'blue', undefined, false, 1.16, true))}
          {yellowNestCoords.map((pos) => renderInteractivePawn(pos.cx, pos.cy, 'yellow', undefined, false, 1.16, true))}
        </>
      )}

      {/* 60FPS / 120FPS DEDICATED HARDWARE-ACCELERATED ANIMATED MOVING PAWN (RENDERED ON TOP) */}
      {movingPawn && (
        <g
          ref={movingGroupRef}
          style={{ willChange: 'transform' }}
          pointerEvents="none"
        >
          {/* Ground Contact Shadow */}
          <ellipse
            ref={movingShadowRef}
            cx="0"
            cy="2"
            rx={15.5 * 1.16}
            ry={6.8 * 1.16}
            fill="#000000"
            opacity={0.65}
            style={{ transformOrigin: '0px 2px' }}
          />

          {/* Floor base disc anchoring goti to cell floor */}
          <ellipse
            cx="0"
            cy="1"
            rx={13.5 * 1.16}
            ry={6.5 * 1.16}
            fill={strokeMap[movingPawn.color]}
            opacity="0.75"
          />

          {/* Vertical Hopping Body */}
          <g ref={movingBodyRef} style={{ transformOrigin: '0px 0px' }}>
            <g transform="scale(1.16)">
              <path
                d="M 0, -51 C -10.3, -51 -18.5, -42.8 -18.5, -33 C -18.5, -22.2 -7.6, -9.2 0, 0 C 7.6, -9.2 18.5, -22.2 18.5, -33 C 18.5, -42.8 10.3, -51 0, -51 Z"
                fill="url(#whiteGotiGrad)"
                stroke="#334155"
                strokeWidth="1.2"
              />
              <circle
                cx="0"
                cy="-33"
                r="13.6"
                fill={`url(#${colorGradMap[movingPawn.color]})`}
                stroke={strokeMap[movingPawn.color]}
                strokeWidth="0.8"
              />
            </g>
          </g>
        </g>
      )}
    </svg>
  );
};
