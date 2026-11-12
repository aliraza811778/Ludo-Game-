import React, { useState } from 'react';
import { GameMode } from './HomePage';
import { soundFx } from '../../audio/soundManager';
import { TeardropPinSVG } from '../pawns/TeardropPinSVG';

export type PlayerColor = 'red' | 'green' | 'blue' | 'yellow';

export interface GameConfig {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  selectedColor: PlayerColor;
  playerNames: Record<PlayerColor, string>;
}

interface SelectorPageProps {
  mode: GameMode;
  onBack: () => void;
  onStartGame: (config: GameConfig) => void;
}

export const SelectorPage: React.FC<SelectorPageProps> = ({ mode, onBack, onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(mode === 'team_play' ? 4 : 2);
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('blue');

  const handleSelectCount = (count: 2 | 3 | 4) => {
    soundFx.playClick(540);
    setPlayerCount(count);
  };

  const handleSelectColor = (color: PlayerColor) => {
    soundFx.playSelect();
    setSelectedColor(color);
  };

  const handleStart = () => {
    soundFx.playSelect();
    const config: GameConfig = {
      mode,
      playerCount,
      selectedColor,
      playerNames: {
        blue: 'Player 1 (Blue)',
        red: mode === 'computer_play' ? 'Bot Red' : 'Player 2 (Red)',
        green: mode === 'computer_play' ? 'Bot Green' : 'Player 3 (Green)',
        yellow: mode === 'computer_play' ? 'Bot Yellow' : 'Player 4 (Yellow)',
      },
    };
    onStartGame(config);
  };

  const colorConfigs: Record<
    PlayerColor,
    {
      name: string;
      color: PlayerColor;
      selectedBg: string;
      borderSelected: string;
    }
  > = {
    blue: {
      name: 'Blue',
      color: 'blue',
      selectedBg: 'bg-gradient-to-b from-[#0088e8] to-[#0062a8]',
      borderSelected: 'border-[#38bdf8] shadow-[0_0_16px_rgba(56,189,248,0.7),inset_0_0_8px_rgba(255,255,255,0.3)]',
    },
    red: {
      name: 'Red',
      color: 'red',
      selectedBg: 'bg-gradient-to-b from-[#e5252f] to-[#b3141c]',
      borderSelected: 'border-[#fb7185] shadow-[0_0_16px_rgba(251,113,133,0.7),inset_0_0_8px_rgba(255,255,255,0.3)]',
    },
    green: {
      name: 'Green',
      color: 'green',
      selectedBg: 'bg-gradient-to-b from-[#05a84b] to-[#037834]',
      borderSelected: 'border-[#4ade80] shadow-[0_0_16px_rgba(74,222,128,0.7),inset_0_0_8px_rgba(255,255,255,0.3)]',
    },
    yellow: {
      name: 'Yellow',
      color: 'yellow',
      selectedBg: 'bg-gradient-to-b from-[#f59e0b] to-[#d97706]',
      borderSelected: 'border-[#fde047] shadow-[0_0_16px_rgba(253,224,71,0.7),inset_0_0_8px_rgba(255,255,255,0.3)]',
    },
  };

  return (
    <div className="relative h-screen h-[100dvh] max-h-[100dvh] w-full bg-[#070d1e] text-white flex flex-col justify-between items-center select-none overflow-hidden font-['Outfit',sans-serif]">
      {/* 1. Ambient Background Room Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-amber-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[440px] h-[440px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#2a1708]/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. Main Game Shell */}
      <div className="relative z-10 w-full max-w-[360px] sm:max-w-[390px] h-full flex flex-col justify-between items-center px-3 sm:px-3.5 pt-1.5 pb-0">
        
        {/* TOP BAR */}
        <header className="w-full flex items-center justify-between shrink-0 pt-0.5 pb-0.5">
          <button 
            type="button"
            onClick={() => {
              soundFx.playClick(400);
              onBack();
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl transition-all duration-150 active:scale-95 cursor-pointer shrink-0 hover:brightness-110"
            title="Back to Home"
          >
            <img 
              src="/assets/selector_perfect/btn_back.png" 
              alt="Back" 
              className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
            />
          </button>

          {/* 3D Crown LUDO Logo */}
          <div className="flex-1 flex justify-center items-center px-1">
            <img 
              src="/assets/selector_perfect/logo_ludo.png" 
              alt="LUDO Select Players & Color" 
              className="max-h-[8vh] sm:max-h-[9vh] w-auto object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.85)] filter transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>

          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0" aria-hidden="true" />
        </header>

        {/* MAIN SECTIONS CONTAINER */}
        <main className="w-full my-auto shrink-0 flex flex-col items-center justify-center gap-2 sm:gap-2.5 py-0.5">
          
          {/* PANEL 1: NUMBER OF PLAYERS CONTAINER */}
          <div className="w-full rounded-[22px] sm:rounded-[24px] bg-gradient-to-b from-[#0e2246] to-[#08152e] border-2 border-[#1c3c72] shadow-[0_8px_25px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.18)] p-2.5 sm:p-3">
            
            {/* Header */}
            <div className="w-full flex items-center gap-2.5 mb-2 px-0.5">
              <div className="w-9 h-9 shrink-0">
                <img 
                  src="/assets/selector_perfect/icon_users.png" 
                  alt="Players" 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px] sm:text-[15px] text-white tracking-wide leading-tight">
                  Number of Players
                </div>
                <div className="text-[11px] sm:text-[12px] text-blue-200/80 font-normal leading-tight mt-0.5">
                  Choose how many players will join
                </div>
              </div>
              <div className="w-12 h-[1px] bg-gradient-to-r from-blue-400/40 to-transparent shrink-0" />
            </div>

            {/* 3 Player Cards Grid (2, 3, 4 Players) */}
            <div className="grid grid-cols-3 gap-2 w-full items-stretch">
              {([2, 3, 4] as const).map((count) => {
                const isSelected = playerCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleSelectCount(count)}
                    className={`relative w-full aspect-[260/278] rounded-[20px] p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#0e2c63] to-[#081836] border-2 border-[#00d2ff] shadow-[0_0_18px_rgba(0,210,255,0.95),inset_0_0_8px_rgba(0,210,255,0.35)] scale-[1.03] z-10'
                        : 'bg-gradient-to-b from-[#091733] to-[#050e21] border-2 border-[#1c3c72] hover:border-[#2a559e] hover:scale-[1.01]'
                    }`}
                    title={`${count} Players`}
                  >
                    {/* Top Gotis */}
                    <div className="w-full flex-1 flex items-center justify-center pt-1">
                      {count === 2 && (
                        <div className="flex items-end justify-center -space-x-2">
                          <div className="w-8 h-10 sm:w-9 sm:h-11 drop-shadow-md z-10">
                            <TeardropPinSVG color="red" />
                          </div>
                          <div className="w-8 h-10 sm:w-9 sm:h-11 drop-shadow-md z-0">
                            <TeardropPinSVG color="yellow" />
                          </div>
                        </div>
                      )}
                      {count === 3 && (
                        <div className="flex items-end justify-center -space-x-2">
                          <div className="w-7 h-9 sm:w-8 sm:h-10 drop-shadow-md z-10">
                            <TeardropPinSVG color="red" />
                          </div>
                          <div className="w-7.5 h-9.5 sm:w-8.5 sm:h-10.5 drop-shadow-md z-20 -translate-y-1">
                            <TeardropPinSVG color="yellow" />
                          </div>
                          <div className="w-7 h-9 sm:w-8 sm:h-10 drop-shadow-md z-10">
                            <TeardropPinSVG color="green" />
                          </div>
                        </div>
                      )}
                      {count === 4 && (
                        <div className="flex items-end justify-center -space-x-2.5">
                          <div className="w-6.5 h-8.5 sm:w-7.5 sm:h-9.5 drop-shadow-md z-10">
                            <TeardropPinSVG color="red" />
                          </div>
                          <div className="w-6.5 h-8.5 sm:w-7.5 sm:h-9.5 drop-shadow-md z-20 -translate-y-1">
                            <TeardropPinSVG color="yellow" />
                          </div>
                          <div className="w-6.5 h-8.5 sm:w-7.5 sm:h-9.5 drop-shadow-md z-20 -translate-y-1">
                            <TeardropPinSVG color="green" />
                          </div>
                          <div className="w-6.5 h-8.5 sm:w-7.5 sm:h-9.5 drop-shadow-md z-10">
                            <TeardropPinSVG color="blue" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Labels */}
                    <div className="w-full flex flex-col items-center pb-1">
                      <div className="text-[24px] sm:text-[27px] font-black leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
                        {count}
                      </div>
                      <div className="text-[11px] sm:text-[12px] font-bold text-white/90 leading-tight mt-0.5 tracking-wide">
                        Players
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                        <img 
                          src="/assets/selector_perfect/badge_check_cyan.png" 
                          alt="Selected" 
                          className="w-6 h-6 sm:w-6.5 sm:h-6.5 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" 
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PANEL 2: CHOOSE YOUR COLOR CONTAINER */}
          <div className="w-full rounded-[22px] sm:rounded-[24px] bg-gradient-to-b from-[#0e2246] to-[#08152e] border-2 border-[#1c3c72] shadow-[0_8px_25px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.18)] p-2.5 sm:p-3">
            
            <div className="w-full flex items-center gap-2.5 mb-2 px-0.5">
              <div className="w-9 h-9 shrink-0">
                <img 
                  src="/assets/selector_perfect/icon_palette.png" 
                  alt="Colors" 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px] sm:text-[15px] text-white tracking-wide leading-tight">
                  Choose Your Color
                </div>
                <div className="text-[11px] sm:text-[12px] text-blue-200/80 font-normal leading-tight mt-0.5">
                  Pick your favorite color to play
                </div>
              </div>
              <div className="w-12 h-[1px] bg-gradient-to-r from-blue-400/40 to-transparent shrink-0" />
            </div>

            {/* 4 Color Cards Grid */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full items-stretch">
              {(['blue', 'red', 'green', 'yellow'] as const).map((color) => {
                const isSelected = selectedColor === color;
                const conf = colorConfigs[color];
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleSelectColor(color)}
                    className={`relative w-full aspect-[188/250] rounded-[18px] p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? `${conf.selectedBg} border-2 ${conf.borderSelected} scale-[1.04] z-10`
                        : 'bg-gradient-to-b from-[#091733] to-[#050e21] border-2 border-[#1c3c72] hover:border-[#2a559e] hover:scale-[1.01]'
                    }`}
                    title={`${conf.name} Color`}
                  >
                    <div className="w-full flex-1 flex items-center justify-center pt-1.5">
                      <div className="w-9 h-11 sm:w-10 sm:h-12 drop-shadow-lg">
                        <TeardropPinSVG color={color} />
                      </div>
                    </div>

                    <div className="w-full flex justify-center pb-1">
                      <div className="text-[12px] sm:text-[13px] font-bold text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {conf.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GREEN START GAME BUTTON */}
          <div className="w-full flex justify-center mt-1 sm:mt-1.5 z-20">
            <button
              type="button"
              onClick={handleStart}
              className="relative w-56 sm:w-64 rounded-full transition-all duration-150 active:scale-95 hover:scale-[1.02] cursor-pointer drop-shadow-[0_8px_20px_rgba(34,197,94,0.6)]"
              title="Start Game"
            >
              <img 
                src="/assets/selector_perfect/btn_start.png" 
                alt="Start Game" 
                className="w-full h-auto object-contain pointer-events-none"
              />
            </button>
          </div>
        </main>

        {/* BOTTOM WOODEN TABLE SCENE */}
        <footer className="w-full -mx-3.5 px-0 mt-auto shrink-0 overflow-hidden pointer-events-none select-none">
          <img 
            src="/assets/selector_perfect/table_board.png" 
            alt="Wooden Table with Dice, Pawns and Ludo Board" 
            className="w-full max-h-[7vh] sm:max-h-[8.5vh] object-cover object-top opacity-95 drop-shadow-2xl"
          />
        </footer>
      </div>
    </div>
  );
};
