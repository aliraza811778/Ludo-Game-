import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from './SelectorPage';
import { LudoBoardSVG, MovingPawnData } from '../board/LudoBoardSVG';
import { TeardropPinSVG } from '../pawns/TeardropPinSVG';
import { RollingDice3D } from '../dice/RollingDice3D';
import { PlayerColor, Pawn, canPawnMove, TRACK_COORDS, COLOR_OFFSETS } from '../../logic/ludoEngine';
import { soundFx } from '../../audio/soundManager';

interface PlayScreenProps {
  config: GameConfig;
  onBack: () => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ config, onBack }) => {
  // Determine active players based on playerCount selected in SelectorPage:
  // 2 Players: Blue (P1) and Green (P3) (Opposite diagonal corners in Ludo)
  // 3 Players: Blue (P1), Red (P2), Green (P3)
  // 4 Players: Blue (P1), Red (P2), Green (P3), Yellow (P4)
  const activePlayers: PlayerColor[] = React.useMemo(() => {
    if (config?.playerCount === 2) {
      return ['blue', 'green'];
    }
    if (config?.playerCount === 3) {
      return ['blue', 'red', 'green'];
    }
    return ['blue', 'red', 'green', 'yellow'];
  }, [config?.playerCount]);

  // Pawns state: 4 pawns per color initialized inside home nest (step = -1)
  const [pawns, setPawns] = useState<Pawn[]>(() => {
    const initialPawns: Pawn[] = [];
    const colors: PlayerColor[] = ['red', 'green', 'blue', 'yellow'];
    colors.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        initialPawns.push({
          id: i,
          color,
          step: -1, // -1 = inside home base
        });
      }
    });
    return initialPawns;
  });

  // Turn state & Dice value
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [isMovingPawn, setIsMovingPawn] = useState<boolean>(false);
  const [movingPawn, setMovingPawn] = useState<MovingPawnData | null>(null);

  const rollTimeoutRef = useRef<number | null>(null);

  const activeColor = activePlayers[currentTurnIndex] || 'blue';

  // Compute moveable pawns for the current active color and rolled dice
  const moveablePawnIds = React.useMemo<number[]>(() => {
    if (!hasRolled || isRolling || isMovingPawn) return [];
    const activeColorPawns = pawns.filter((p) => p.color === activeColor);
    return activeColorPawns
      .filter((p) => canPawnMove(p, diceValue))
      .map((p) => p.id);
  }, [hasRolled, isRolling, isMovingPawn, pawns, activeColor, diceValue]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    };
  }, []);

  // Advance turn to next player in sequence
  const advanceTurn = () => {
    setHasRolled(false);
    setCurrentTurnIndex((prev) => (prev + 1) % activePlayers.length);
  };

  // Handle pawn click: initiates 60fps hardware-accelerated movement in LudoBoardSVG
  const handlePawnClick = (pawn: Pawn) => {
    if (!hasRolled || isRolling || isMovingPawn || pawn.color !== activeColor) return;
    if (!moveablePawnIds.includes(pawn.id)) return;

    const targetStep = pawn.step === -1 ? 0 : pawn.step + diceValue;
    setIsMovingPawn(true);
    setMovingPawn({
      id: pawn.id,
      color: pawn.color,
      fromStep: pawn.step,
      toStep: targetStep,
    });
  };

  // Called when goti completes its continuous 60fps movement and touches down on destination
  const handleMovementComplete = (finalStep: number) => {
    if (!movingPawn) return;
    const movingColor = movingPawn.color;
    const movingId = movingPawn.id;

    let bonusTurn = diceValue === 6;

    if (finalStep === 56) {
      bonusTurn = true;
      soundFx.playFanfare();
    }

    let targetGlobalCoord: number | null = null;
    if (finalStep >= 0 && finalStep <= 50) {
      targetGlobalCoord = (COLOR_OFFSETS[movingColor] + finalStep) % 52;
    }

    const isSafeSquare = targetGlobalCoord !== null && TRACK_COORDS[targetGlobalCoord]?.isSafe;

    setPawns((prevPawns) => {
      return prevPawns.map((p) => {
        // Update the moved pawn to its final destination step
        if (p.color === movingColor && p.id === movingId) {
          return { ...p, step: finalStep };
        }
        // Capture opponent pawn if landing on same non-safe square
        if (
          !isSafeSquare &&
          targetGlobalCoord !== null &&
          p.color !== movingColor &&
          p.step >= 0 &&
          p.step <= 50
        ) {
          const opponentGlobal = (COLOR_OFFSETS[p.color] + p.step) % 52;
          if (opponentGlobal === targetGlobalCoord) {
            bonusTurn = true;
            soundFx.playCoin();
            return { ...p, step: -1 };
          }
        }
        return p;
      });
    });

    window.setTimeout(() => {
      setIsMovingPawn(false);
      setMovingPawn(null);

      if (bonusTurn) {
        setHasRolled(false);
      } else {
        advanceTurn();
      }
    }, 180);
  };

  // Dice roll function: generates true non-repeating random values (1 to 6)
  const handleRollDice = (color: PlayerColor) => {
    if (isRolling || hasRolled || isMovingPawn || color !== activeColor) return;

    // Pick roll value right at start so 3D tumbling cube lands on this exact face
    const finalValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(finalValue);
    setIsRolling(true);
    soundFx.playDiceRoll();

    // Roll duration: 440ms (exact sync with smooth 3D tumble animation)
    rollTimeoutRef.current = window.setTimeout(() => {
      setIsRolling(false);
      setHasRolled(true);

      // Check valid moves
      const activeColorPawns = pawns.filter((p) => p.color === activeColor);
      const validMoves = activeColorPawns.filter((p) => canPawnMove(p, finalValue));

      if (validMoves.length === 0) {
        // No moves possible: advance turn automatically after pause (zero pawn sound)
        window.setTimeout(() => {
          advanceTurn();
        }, 850);
      }
      // When validMoves exist, the player taps their pawn manually to move/unlock it!
    }, 440);
  };

  // Helper to render HUD for each color with safe z-indexing & turn indicator arrow
  const renderHUD = (
    color: PlayerColor,
    position: 'bottom-left' | 'top-left' | 'top-right' | 'bottom-right'
  ) => {
    const isPlayerActive = activePlayers.includes(color);
    const isCurrentTurn = isPlayerActive && activeColor === color;
    const canShowArrow = isCurrentTurn && !hasRolled && !isRolling && !isMovingPawn;

    const hudThemes: Record<
      PlayerColor,
      {
        border: string;
        shadowActive: string;
        shadowInactive: string;
        label: string;
      }
    > = {
      blue: {
        border: 'border-[#0099ff]',
        shadowActive: 'shadow-[0_0_14px_rgba(0,153,255,0.9)]',
        shadowInactive: 'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
        label: 'Player 1',
      },
      red: {
        border: 'border-[#ff2a3b]',
        shadowActive: 'shadow-[0_0_14px_rgba(255,42,59,0.9)]',
        shadowInactive: 'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
        label: 'Player 2',
      },
      green: {
        border: 'border-[#00d05a]',
        shadowActive: 'shadow-[0_0_14px_rgba(0,208,90,0.9)]',
        shadowInactive: 'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
        label: 'Player 3',
      },
      yellow: {
        border: 'border-[#ffd000]',
        shadowActive: 'shadow-[0_0_14px_rgba(255,208,0,0.9)]',
        shadowInactive: 'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
        label: 'Player 4',
      },
    };

    const theme = hudThemes[color];
    const isTrayOnRight = position === 'bottom-left' || position === 'top-left';

    return (
      <div className={`relative flex items-center ${isCurrentTurn ? 'z-40' : 'z-20'}`}>
        {/* Animated Bouncing Turn Arrow pointing directly at active dice tray */}
        {canShowArrow && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center justify-center ${
              isTrayOnRight ? '-right-9 sm:-right-10' : '-left-9 sm:-left-10'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center filter drop-shadow-[0_2px_8px_rgba(255,165,0,0.9)] ${
                isTrayOnRight
                  ? 'animate-[arrowNudgeLeft_600ms_ease-in-out_infinite]'
                  : 'animate-[arrowNudgeRight_600ms_ease-in-out_infinite]'
              }`}
            >
              <svg
                viewBox="0 0 32 32"
                className="w-full h-full"
                style={{ transform: isTrayOnRight ? 'scaleX(-1)' : 'none' }}
              >
                <defs>
                  <linearGradient id={`arrowGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff4500" />
                    <stop offset="55%" stopColor="#ff9800" />
                    <stop offset="100%" stopColor="#ffeb3b" />
                  </linearGradient>
                </defs>
                <path
                  d="M 4 10 L 16 10 L 16 4 L 30 16 L 16 28 L 16 22 L 4 22 Z"
                  fill={`url(#arrowGrad-${color})`}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}

        {/* HUD Box */}
        <div
          className={`relative w-[118px] sm:w-[134px] h-[56px] sm:h-[64px] rounded-[14px] sm:rounded-[16px] border-[2.5px] ${
            theme.border
          } bg-gradient-to-b from-[#0c3a88] to-[#071f4c] flex items-center justify-between p-0 transition-all duration-200 ${
            isPlayerActive ? (isCurrentTurn ? theme.shadowActive : theme.shadowInactive) : 'opacity-40 grayscale'
          }`}
        >
          {isTrayOnRight ? (
            <>
              {/* Dedicated Goti (Teardrop Pin) Pod + Player Label on Left */}
              <div className="flex-1 h-full flex flex-col items-center justify-center pl-1 pr-0.5 shrink-0">
                <div className="w-6 h-8 sm:w-7 sm:h-9 flex items-center justify-center drop-shadow-md">
                  <TeardropPinSVG color={color} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-white/90 tracking-wide mt-0.5 leading-none">
                  {theme.label}
                </span>
              </div>

              {/* Square Tray on Right */}
              <div
                className="h-full aspect-square relative flex items-center justify-center p-0 shrink-0 border-l-2 border-[#e6b8b8] bg-gradient-to-b from-[#fff5f5] to-[#f4d4d4] shadow-[inset_0_2px_4px_rgba(0,0,0,0.22)] rounded-r-[11px] sm:rounded-r-[13px]"
              >
                {isPlayerActive && isCurrentTurn && (
                  <RollingDice3D
                    value={diceValue}
                    isRolling={isRolling}
                    canRoll={!hasRolled && !isRolling && !isMovingPawn}
                    onRoll={() => handleRollDice(color)}
                    position={position}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Square Tray on Left */}
              <div
                className="h-full aspect-square relative flex items-center justify-center p-0 shrink-0 border-r-2 border-[#e6b8b8] bg-gradient-to-b from-[#fff5f5] to-[#f4d4d4] shadow-[inset_0_2px_4px_rgba(0,0,0,0.22)] rounded-l-[11px] sm:rounded-l-[13px]"
              >
                {isPlayerActive && isCurrentTurn && (
                  <RollingDice3D
                    value={diceValue}
                    isRolling={isRolling}
                    canRoll={!hasRolled && !isRolling && !isMovingPawn}
                    onRoll={() => handleRollDice(color)}
                    position={position}
                  />
                )}
              </div>

              {/* Dedicated Goti (Teardrop Pin) Pod + Player Label on Right */}
              <div className="flex-1 h-full flex flex-col items-center justify-center pr-1 pl-0.5 shrink-0">
                <div className="w-6 h-8 sm:w-7 sm:h-9 flex items-center justify-center drop-shadow-md">
                  <TeardropPinSVG color={color} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-white/90 tracking-wide mt-0.5 leading-none">
                  {theme.label}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-[#0a1b3f] via-[#070f24] to-[#040814] font-['Outfit',sans-serif] flex flex-col items-center justify-between py-1.5 sm:py-2.5 px-2 select-none">
      <style>{`
        @keyframes arrowNudgeRight {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(6px);
          }
        }
        @keyframes arrowNudgeLeft {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(-6px);
          }
        }
      `}</style>
      {/* Background radial gaming glow matching Home & Selector theme */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(22, 65, 150, 0.4) 0%, transparent 72%)',
        }}
      />

      {/* TOP HEADER: Exit on left, Sound toggle on right */}
      <header className="relative w-full z-40 flex items-center justify-between max-w-[440px] px-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0a1e42]/90 border border-blue-400/40 text-blue-100 text-xs sm:text-sm font-semibold active:scale-95 transition-all shadow-md cursor-pointer hover:bg-[#0f2c61]"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Exit
        </button>

        <button
          type="button"
          onClick={() => soundFx.toggleMute()}
          className="p-1.5 rounded-full bg-[#0a1e42]/90 border border-blue-400/40 text-blue-100 active:scale-95 transition-all shadow-md cursor-pointer hover:bg-[#0f2c61]"
          title="Toggle Sound"
        >
          {soundFx.isMuted() ? (
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </header>

      {/* MAIN GAME ARENA: Strict stacking context ensuring pawns and dice float cleanly without clipping */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center max-w-[440px] px-1">
        {/* TOP HUD ROW (Player 2 Red on Left, Player 3 Green on Right) - Elevated with z-30 */}
        <div className="relative z-30 w-full flex items-end justify-between px-1 mb-2.5 sm:mb-3 shrink-0">
          {/* Player 2 (Red): Top-Left */}
          {renderHUD('red', 'top-left')}

          {/* Player 3 (Green): Top-Right */}
          {renderHUD('green', 'top-right')}
        </div>

        {/* 100% VECTOR LUDO BOARD: Clean razor-sharp black lines, dynamic pawns & interactive moves with overflow-visible */}
        <div className="relative z-20 w-full aspect-square rounded-[8px] shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-2 border-[#111111] overflow-visible bg-white shrink-0">
          <LudoBoardSVG
            className="w-full h-full overflow-visible"
            pawns={pawns}
            moveablePawnIds={moveablePawnIds}
            currentTurnColor={activeColor}
            onPawnClick={handlePawnClick}
            movingPawn={movingPawn}
            onMovementComplete={handleMovementComplete}
          />
        </div>

        {/* BOTTOM HUD ROW (Player 1 Blue on Left, Player 4 Yellow on Right) - Elevated with z-30 */}
        <div className="relative z-30 w-full flex items-start justify-between px-1 mt-2.5 sm:mt-3 shrink-0">
          {/* Player 1 (Blue): Bottom-Left */}
          {renderHUD('blue', 'bottom-left')}

          {/* Player 4 (Yellow): Bottom-Right */}
          {renderHUD('yellow', 'bottom-right')}
        </div>
      </main>

      {/* BOTTOM FOOTER */}
      <div className="h-0.5 shrink-0" />
    </div>
  );
};
