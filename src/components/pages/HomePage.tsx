import React, { useState } from 'react';
import { Volume2, VolumeX, X, Play, RotateCcw } from 'lucide-react';
import { soundFx } from '../../audio/soundManager';

export type GameMode = 'computer_play' | 'pass_and_play' | 'team_play' | 'rush_mode';

interface HomePageProps {
  onSelectMode: (mode: GameMode) => void;
  onContinueLastGame?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectMode, onContinueLastGame }) => {
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const toggleSound = () => {
    const updated = soundFx.toggleMute();
    setIsMuted(updated);
  };

  const handleSelect = (mode: GameMode) => {
    soundFx.playSelect();
    setSelectedMode(mode);
    onSelectMode(mode);
  };

  const handleContinue = () => {
    soundFx.playSelect();
    if (onContinueLastGame) {
      onContinueLastGame();
    } else {
      const lastMode = (localStorage.getItem('ludo_last_mode') as GameMode) || 'pass_and_play';
      setSelectedMode(lastMode);
      onSelectMode(lastMode);
    }
  };

  return (
    <div className="relative h-screen h-[100dvh] max-h-[100dvh] w-full bg-[#070d1e] text-white flex flex-col justify-between items-center select-none overflow-hidden font-['Outfit',sans-serif]">
      {/* Ambient background lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-blue-600/12 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Game Shell Container */}
      <div className="relative z-10 w-full max-w-[360px] sm:max-w-[390px] h-full flex flex-col justify-between items-center px-3.5 sm:px-4 pt-2 pb-0">
        
        {/* 1. TOP HEADER: Settings Gear Button */}
        <header className="w-full flex items-center justify-end shrink-0 pt-1 pb-0.5">
          <button 
            onClick={() => {
              soundFx.playClick(500);
              setShowSettings(true);
            }}
            className="group relative w-11 h-11 sm:w-12 sm:h-12 transition-transform duration-150 active:scale-95 cursor-pointer hover:brightness-110"
            title="Game Settings"
          >
            <img 
              src="/assets/ludo_ui/settings_btn.png" 
              alt="Settings" 
              className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
            />
          </button>
        </header>

        {/* 2. CENTER HERO LOGO */}
        <div className="w-full flex justify-center items-center shrink-0 my-0.5">
          <div className="relative w-60 sm:w-68 max-h-[17vh] flex items-center justify-center">
            <img 
              src="/assets/ludo_ui/ludo_logo.png" 
              alt="LUDO Roll · Move · Win" 
              className="w-full h-auto max-h-[17vh] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)] filter transition-transform duration-200 hover:scale-[1.02]"
            />
          </div>
        </div>

        {/* 3. THE 4 GAME MODE CARDS */}
        <main className="w-full max-w-[310px] sm:max-w-[330px] my-auto shrink-0 flex flex-col items-center justify-center py-1">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full">
            
            {/* Card 1: Play with Computer (Top-Left) */}
            <button
              onClick={() => handleSelect('computer_play')}
              className={`group relative aspect-[436/455] w-full rounded-[20px] overflow-hidden transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.02] shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] ${
                selectedMode === 'computer_play' ? 'ring-3 ring-cyan-300 scale-[1.02]' : ''
              }`}
            >
              <img 
                src="/assets/ludo_ui/card_computer.png" 
                alt="Play with Computer" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            {/* Card 2: Pass & Play (Top-Right) */}
            <button
              onClick={() => handleSelect('pass_and_play')}
              className={`group relative aspect-[436/455] w-full rounded-[20px] overflow-hidden transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.02] shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] ${
                selectedMode === 'pass_and_play' ? 'ring-3 ring-emerald-300 scale-[1.02]' : ''
              }`}
            >
              <img 
                src="/assets/ludo_ui/card_pass_play.png" 
                alt="Pass & Play" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            {/* Card 3: Team Play (Bottom-Left) */}
            <button
              onClick={() => handleSelect('team_play')}
              className={`group relative aspect-[436/455] w-full rounded-[20px] overflow-hidden transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.02] shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] ${
                selectedMode === 'team_play' ? 'ring-3 ring-purple-300 scale-[1.02]' : ''
              }`}
            >
              <img 
                src="/assets/ludo_ui/card_team_play.png" 
                alt="Team Play" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            {/* Card 4: Rush Mode (Bottom-Right) */}
            <button
              onClick={() => handleSelect('rush_mode')}
              className={`group relative aspect-[436/455] w-full rounded-[20px] overflow-hidden transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.02] shadow-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] ${
                selectedMode === 'rush_mode' ? 'ring-3 ring-amber-300 scale-[1.02]' : ''
              }`}
            >
              <img 
                src="/assets/ludo_ui/card_rush_mode.png" 
                alt="Rush Mode" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          </div>

          {/* 4. LANDSCAPE BUTTON: CONTINUE LAST GAME */}
          <div className="w-full mt-2.5 sm:mt-3">
            <button
              onClick={handleContinue}
              className="group relative w-full h-11 sm:h-12 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 border-2 border-emerald-300 text-slate-950 font-black tracking-wide text-xs sm:text-sm uppercase flex items-center justify-between px-3.5 shadow-lg shadow-emerald-950/60 border-b-[4px] border-b-emerald-800 active:translate-y-0.5 active:border-b-[1px] transition-all cursor-pointer overflow-hidden"
              title="Continue Last Game"
            >
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-2xl pointer-events-none" />

              <div className="w-7 h-7 rounded-xl bg-slate-950/15 flex items-center justify-center text-slate-950 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-4 h-4 text-slate-950" />
              </div>

              <div className="flex flex-col items-center">
                <span className="font-black text-xs sm:text-sm text-slate-950 leading-tight">
                  CONTINUE LAST GAME
                </span>
              </div>

              <div className="w-7 h-7 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center shadow-sm group-hover:translate-x-0.5 transition-transform">
                <Play className="w-3.5 h-3.5 fill-emerald-400 ml-0.5" />
              </div>
            </button>
          </div>
        </main>

        {/* 5. BOTTOM PERSPECTIVE LUDO BOARD */}
        <footer className="w-full -mx-3.5 px-0 mt-auto shrink-0 overflow-hidden pointer-events-none">
          <img 
            src="/assets/ludo_ui/bottom_board.png" 
            alt="Ludo Board" 
            className="w-full max-h-[7vh] sm:max-h-[9vh] object-cover opacity-90 drop-shadow-2xl"
          />
        </footer>
      </div>

      {/* 6. SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xs bg-gradient-to-b from-slate-900 via-slate-900 to-[#070d1e] border-2 border-cyan-400/40 rounded-3xl p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-black tracking-wide text-white uppercase flex items-center gap-2">
                <span>Game Settings</span>
              </h3>
              <button 
                onClick={() => {
                  soundFx.playClick();
                  setShowSettings(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold flex items-center gap-2">
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  <span>Sound Effects</span>
                </span>
                <button
                  onClick={toggleSound}
                  className={`px-3 py-1 rounded-full font-black text-xs transition-colors cursor-pointer ${
                    !isMuted 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {!isMuted ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-slate-300">Offline Game</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                  100% READY
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setShowSettings(false);
              }}
              className="w-full mt-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
