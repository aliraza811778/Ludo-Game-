/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { HomePage, GameMode } from './components/pages/HomePage';
import { SelectorPage, GameConfig } from './components/pages/SelectorPage';
import { PlayScreen } from './components/pages/PlayScreen';

const SELECTOR_PRELOAD_ASSETS = [
  '/assets/selector_perfect/btn_back.png',
  '/assets/selector_perfect/logo_ludo.png',
  '/assets/selector_perfect/icon_users.png',
  '/assets/selector_perfect/card_player_2.png',
  '/assets/selector_perfect/card_player_3.png',
  '/assets/selector_perfect/card_player_4.png',
  '/assets/selector_perfect/badge_check_cyan.png',
  '/assets/selector_perfect/icon_palette.png',
  '/assets/selector_perfect/card_color_red_unselected.png',
  '/assets/selector_perfect/card_color_red_selected.png',
  '/assets/selector_perfect/card_color_green_unselected.png',
  '/assets/selector_perfect/card_color_green_selected.png',
  '/assets/selector_perfect/card_color_blue_unselected.png',
  '/assets/selector_perfect/card_color_blue_selected.png',
  '/assets/selector_perfect/card_color_yellow_unselected.png',
  '/assets/selector_perfect/card_color_yellow_selected.png',
  '/assets/selector_perfect/btn_start.png',
  '/assets/selector_perfect/table_board.png',
  '/assets/play_screen/board_exact.png',
  '/assets/play_screen/hud_p1_blue.png',
  '/assets/play_screen/hud_p1_blue_empty.png',
  '/assets/play_screen/hud_p2_red.png',
  '/assets/play_screen/hud_p3_green.png',
  '/assets/play_screen/hud_p4_yellow.png',
  '/assets/play_screen/arrow_turn.png',
  '/assets/play_screen/pawn_blue.png',
  '/assets/play_screen/pawn_red.png',
  '/assets/play_screen/pawn_green.png',
  '/assets/play_screen/pawn_yellow.png',
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'HOME' | 'SELECTOR' | 'PLAY'>('HOME');
  const [selectedMode, setSelectedMode] = useState<GameMode>('pass_and_play');
  const [activeConfig, setActiveConfig] = useState<GameConfig | null>(null);

  useEffect(() => {
    // Preload assets in the browser background for instant transitions
    SELECTOR_PRELOAD_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    setActiveScreen('SELECTOR');
  };

  const handleBackToHome = () => {
    setActiveScreen('HOME');
  };

  const handleStartGame = (config: GameConfig) => {
    setActiveConfig(config);
    setActiveScreen('PLAY');
  };

  return (
    <div className="w-full h-full h-[100dvh] overflow-hidden bg-[#070d1e] font-['Outfit',sans-serif]">
      {activeScreen === 'HOME' && (
        <HomePage 
          onSelectMode={handleSelectMode} 
          onContinueLastGame={() => {
            setSelectedMode('pass_and_play');
            setActiveScreen('SELECTOR');
          }}
        />
      )}

      {activeScreen === 'SELECTOR' && (
        <SelectorPage
          mode={selectedMode}
          onBack={handleBackToHome}
          onStartGame={handleStartGame}
        />
      )}

      {activeScreen === 'PLAY' && activeConfig && (
        <PlayScreen
          config={activeConfig}
          onBack={() => setActiveScreen('SELECTOR')}
        />
      )}
    </div>
  );
}
