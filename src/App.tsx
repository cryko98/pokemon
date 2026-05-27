import React, { useState } from 'react';
import MenuSelector from './components/MenuSelector';
import GameController from './components/GameController';
import { PokemonCharacter, Arena } from './types';
import { Sword, Gamepad2, Info, Moon, Github, Copy, Check, Star, Trophy, ArrowRight } from 'lucide-react';
import PokeBall from './components/PokeBall';

const CAREER_STAGES_MAPPING: { [key: number]: number } = {
  1: 120,
  2: 180,
  3: 250,
  4: 350,
  5: 480,
  6: 650,
  7: 1000
};

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'fighting'>('menu');
  const [playerPokemon, setPlayerPokemon] = useState<PokemonCharacter | null>(null);
  const [cpuPokemon, setCpuPokemon] = useState<PokemonCharacter | null>(null);
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);
  
  // Custom Career Mode progress stats tracker
  const [careerActiveStage, setCareerActiveStage] = useState<number | null>(null);
  const [careerActiveReward, setCareerActiveReward] = useState<number>(0);
  const [careerResult, setCareerResult] = useState<{ winner: 'player' | 'cpu'; pointsEarned: number } | null>(null);
  const [savedProfilesUpdatedTrigger, setSavedProfilesUpdatedTrigger] = useState<number>(0);

  const [copied, setCopied] = useState(false);

  const handleCopyCA = () => {
    navigator.clipboard.writeText('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startCombat = (player: PokemonCharacter, cpu: PokemonCharacter, arena: Arena) => {
    // Standard quick match (local bot)
    setCareerActiveStage(null);
    setCareerActiveReward(0);
    setCareerResult(null);

    setPlayerPokemon(player);
    setCpuPokemon(cpu);
    setSelectedArena(arena);
    setGameState('fighting');
  };

  const startCareerCombat = (
    player: PokemonCharacter,
    cpu: PokemonCharacter,
    arena: Arena,
    stageLevel: number,
    statMultiplier: number
  ) => {
    // Set active campaign stage properties
    setCareerActiveStage(stageLevel);
    setCareerActiveReward(CAREER_STAGES_MAPPING[stageLevel] || 150);
    setCareerResult(null);

    setPlayerPokemon(player);
    setCpuPokemon(cpu);
    setSelectedArena(arena);
    setGameState('fighting');
  };

  // Called when fight concludes
  const handleMatchFinished = (winner: 'player' | 'cpu') => {
    if (!careerActiveStage) return; // Ignore for quickplay bot fights

    const loggedInId = localStorage.getItem('arcade_current_profile_id');
    if (!loggedInId) return;

    try {
      const stored = JSON.parse(localStorage.getItem('arcade_trainer_profiles') || '[]');
      const profile = stored.find((p: any) => p.id === loggedInId);
      
      if (profile) {
        let pts = 25; // Consolation Battle prize to support progress on defeat

        if (winner === 'player') {
          pts = careerActiveReward;
          // Advance map milestone if they beat their highest level
          if (profile.currentStage === careerActiveStage && profile.currentStage < 7) {
            profile.currentStage += 1;
          }
        }

        profile.points += pts;

        // Persist updated profile values
        const updated = stored.map((item: any) => (item.id === profile.id ? profile : item));
        localStorage.setItem('arcade_trainer_profiles', JSON.stringify(updated));

        // Mount rewarding overlays
        setCareerResult({
          winner,
          pointsEarned: pts
        });

        setSavedProfilesUpdatedTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Local storage sync failure:", err);
    }
  };

  const exitToMenu = () => {
    setGameState('menu');
  };

  const isFighting = gameState === 'fighting';

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${
      isFighting 
        ? 'h-[100dvh] max-h-[100dvh] overflow-hidden pb-0 bg-slate-950' 
        : 'min-h-screen bg-transparent'
    } text-slate-900 flex flex-col items-center justify-between relative overflow-x-hidden font-sans selection:bg-yellow-400 selection:text-slate-950`}>
      
      {/* Decorative immersive ambient background glows */}
      {!isFighting && (
        <>
          <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-white/20 border-4 border-slate-905 pointer-events-none opacity-40 animate-pulse" />
          <div className="absolute top-44 right-12 w-32 h-32 rounded-full bg-white/15 border-4 border-slate-905 pointer-events-none opacity-30" />
        </>
      )}

      {/* TOP COMPACT HEADER BAR */}
      {!isFighting && (
        <header className="w-full max-w-5xl mx-auto px-5 py-3 flex items-center justify-between border-4 border-slate-950 bg-white mt-4 rounded-3xl shadow-[5px_5px_0px_#000000] z-10 transition-all duration-300">
          <div className="flex items-center gap-3">
            <PokeBall className="w-8 h-8 flex-shrink-0 animate-bounce" type="classic" />
            <span className="font-display font-black tracking-tight text-xs sm:text-sm md:text-base text-slate-950 uppercase leading-none">
              POKÉMON FIGHTING ARENA
            </span>
          </div>

          <div className="flex items-center gap-3 text-[9px] sm:text-[10px] md:text-xs shrink-0 select-none">
            <span className="bg-rose-500 text-white font-black px-3 py-1 rounded-full border-2 border-slate-950 shadow-[2px_2px_0px_#000] uppercase tracking-wider">
              $POKEFIGHT
            </span>
            <span className="hidden sm:inline-flex bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full border-2 border-slate-950 shadow-[2px_2px_0px_#000] uppercase tracking-wider items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" /> SECTORS LIVE
            </span>
          </div>
        </header>
      )}

      {/* CORE DISPLAY ROUTER */}
      <main className={`w-full flex-1 flex flex-col items-center justify-center z-10 min-h-0 ${isFighting ? 'p-1 sm:p-2 h-full' : 'py-6'}`}>
        {gameState === 'menu' ? (
          <MenuSelector 
            onStartFight={startCombat} 
            onStartCareerFight={startCareerCombat}
            savedProfilesUpdatedTrigger={savedProfilesUpdatedTrigger}
          />
        ) : (
          playerPokemon && cpuPokemon && selectedArena && (
            <GameController
              playerPokemon={playerPokemon}
              cpuPokemon={cpuPokemon}
              selectedArena={selectedArena}
              onExitToMenu={exitToMenu}
              onSelectDifferentCharacters={() => setGameState('menu')}
              onMatchFinished={handleMatchFinished}
            />
          )
        )}
      </main>

      {/* DYNAMIC CAMPAIGN OUTCOME/REWARD REPORT SCREEN */}
      {careerResult && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in text-slate-900 selection:bg-yellow-400 selection:text-slate-950">
          <div className="bg-white border-4 border-black cartoon-shadow-xl p-6 rounded-3xl max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_2px,transparent_2px),linear-gradient(to_bottom,#00000005_2px,transparent_2px)] bg-[size:16px_16px] pointer-events-none opacity-40" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/[0.08] blur-xl rounded-full pointer-events-none" />
            
            <div className="w-16 h-16 bg-yellow-105 border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl cartoon-shadow-xs relative">
              {careerResult.winner === 'player' ? '🏆' : '💀'}
            </div>

            <h2 className="text-xl sm:text-2xl font-cartoon font-black tracking-wide uppercase mb-2">
              {careerResult.winner === 'player' ? 'CAMPAIGN STAGE VICTORY!' : 'VALIANT FIGHT DEFEAT...'}
            </h2>
            
            <p className="text-xs text-slate-600 font-semibold mb-5 leading-relaxed max-w-xs mx-auto">
              {careerResult.winner === 'player' ? (
                <>Congratulations! You have successfully defeated the pocket league challenger and claimed ultimate glory!</>
              ) : (
                <>The opponent Pokémon was too tough this time. However, you gained valuable combat experience!</>
              )}
            </p>

            <div className="bg-slate-950 text-white p-4.5 rounded-2xl border-3 border-black flex flex-col items-center justify-center gap-1 shadow-inner mb-6">
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest leading-none">Combat Training Points Earned</span>
              <span className="text-2xl font-black font-mono text-yellow-400 flex items-center gap-1.5 animate-pulse mt-1">
                +{careerResult.pointsEarned} PTS
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 leading-none">which can be spent instantly to upgrade your Pokémon's stats!</span>
            </div>

            <button
              onClick={() => {
                setCareerResult(null);
                setCareerActiveStage(null);
                setGameState('menu');
              }}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-cartoon border-2 border-black font-black text-xs py-3.5 rounded-2xl uppercase tracking-widest cursor-pointer cartoon-shadow-sm transition active:scale-95 duration-100"
            >
              Claim Rewards! ➔
            </button>
          </div>
        </div>
      )}

      {/* DETAILED GUIDE PANEL/FOOTER */}
      {gameState === 'menu' && (
        <div className="w-full max-w-5xl px-4 mb-6 z-10 transition-all">
          <div className="bg-white border-4 border-slate-950 p-5 rounded-3xl flex flex-col md:flex-row gap-5 items-center justify-between shadow-[5px_5px_0px_#000000]">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Info className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-xs md:text-sm font-display font-black uppercase text-slate-950 tracking-wider">STAGE CHAMPIONSHIP STADIUM</h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-2xl font-semibold">
                  Pick your combatant, choose your battle venue, and prepare for high-octane 2D fighter combos. Dodge incoming elemental energy spheres, block heavy kinetic kicks, and time your moves to unleash devastating Pocket Monster Ultimate attacks!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-650 self-end md:self-center">
              <span className="font-bold">Language:</span>
              <span className="bg-rose-500 border-2 border-slate-950 shadow-[2px_2px_0px_#000] px-3 py-1 rounded-xl text-white font-black font-mono">English Only (EN)</span>
            </div>
          </div>
        </div>
      )}

      {/* SOLANA MEMECOIN CONTRACT ADDRESS & TICKER FOOTER */}
      {!isFighting && (
        <footer className="w-full max-w-5xl px-6 py-6 border-4 border-slate-950 flex flex-col md:flex-row items-center justify-between gap-5 text-xs font-mono text-slate-950 z-10 bg-amber-400 rounded-t-[40px] shadow-[4px_-4px_0px_#000000]">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 bg-white border-2 border-slate-950 px-3 py-1.5 rounded-2xl font-black text-slate-950 select-none shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Ticker: $PokeFight
            </div>
            <p className="text-[11px] text-slate-900 font-sans font-bold mt-1 sm:mt-0">© 2026 Pokémon Fighting Arena. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-2 bg-white border-2 border-slate-950 p-1.5 rounded-2xl max-w-sm w-full shadow-[2px_2px_0px_rgba(0,0,0,0.8)] select-all">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider pl-2.5">CA:</span>
            <code className="text-[11px] text-slate-950 font-mono font-bold truncate flex-1 tracking-tight select-all">
              xxxxxxxxxxxxxxxxxxxxxxxxxxx
            </code>
            <button 
              type="button"
              onClick={handleCopyCA}
              className="bg-slate-950 text-white font-display font-black text-[10px] px-3 py-1.5 rounded-lg hover:bg-slate-900 active:scale-95 transition-all duration-150 flex items-center gap-1 cursor-pointer select-none uppercase tracking-wider shrink-0"
              title="Copy Solana Contract Address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-yellow-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </footer>
      )}

    </div>
  );
}
