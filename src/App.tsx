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
    <div className={`min-h-screen w-full bg-[#0b0c10] ${
      isFighting 
        ? 'h-[100dvh] max-h-[100dvh] overflow-hidden pb-0' 
        : 'min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.18),transparent_65%),radial-gradient(ellipse_at_bottom,rgba(234,179,8,0.08),transparent_70%)]'
    } text-slate-100 flex flex-col items-center justify-between relative overflow-x-hidden font-sans selection:bg-yellow-400 selection:text-slate-950`}>
      
      {/* Decorative immersive ambient background glows (Red / Yellow Pokémon Branding!) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/[0.05] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-yellow-500/[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-red-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

      {/* TOP COMPACT HEADER BAR */}
      {!isFighting && (
        <header className="w-full max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between border-b border-red-500/10 backdrop-blur-md bg-slate-950/45 mt-4 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] z-10 transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <PokeBall className="w-7 h-7 flex-shrink-0" type="classic" />
            <span className="font-orbitron font-extrabold tracking-widest text-[11px] sm:text-xs md:text-sm text-slate-100 italic bg-gradient-to-r from-yellow-300 via-white to-red-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(234,179,8,0.35)]">
              POKÉMON FIGHTING ARENA
            </span>
          </div>

          <div className="flex items-center gap-3.5 text-[9px] sm:text-[10px] md:text-xs font-mono text-slate-400 shrink-0">
            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase tracking-widest">
              $POKEFIGHT
            </span>
            <span className="hidden sm:inline-flex border-l border-white/10 pl-3.5 text-[10px] text-yellow-400 font-extrabold uppercase tracking-widest items-center gap-1.5 drop-shadow-[0_0_6px_rgba(234,179,8,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" /> STADIUM LIVE
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
          <div className="backdrop-blur-md bg-slate-950/40 border-l-4 border-l-red-500 border-t border-r border-b border-white/5 p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                <Info className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-xs md:text-sm font-display font-black uppercase text-yellow-300 tracking-wider">STAGE CHAMPIONSHIP STADIUM</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl font-light">
                  Pick your combatant, choose your battle venue, and prepare for high-octane 2D fighter combos. Dodge incoming elemental energy spheres, block heavy kinetic kicks, and time your moves to unleash devastating Pocket Monster Ultimate attacks!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400 self-end md:self-center">
              <span>Language:</span>
              <span className="bg-red-600/10 border border-red-500/20 px-2.5 py-1 rounded text-red-400 font-bold font-mono">English Only (EN)</span>
            </div>
          </div>
        </div>
      )}

      {/* SOLANA MEMECOIN CONTRACT ADDRESS & TICKER FOOTER */}
      {!isFighting && (
        <footer className="w-full max-w-5xl px-6 py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-5 text-xs font-mono text-slate-400 z-10 bg-[#090d16]/30 backdrop-blur-sm rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.15)]">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 px-3 py-1.5 rounded-xl font-bold text-yellow-400 select-none shadow-[0_0_12px_rgba(234,179,8,0.15)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              Ticker: $PokeFight
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-1 sm:mt-0">© 2026 Pokémon Fighting Arena. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 p-1.5 rounded-xl max-w-sm w-full shadow-inner select-all">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider pl-2.5">CA:</span>
            <code className="text-[11px] text-yellow-300 font-bold truncate flex-1 font-mono tracking-tight select-all">
              xxxxxxxxxxxxxxxxxxxxxxxxxxx
            </code>
            <button 
              type="button"
              onClick={handleCopyCA}
              className="bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1 cursor-pointer shadow-[0_2px_8px_rgba(234,179,8,0.2)] select-none uppercase tracking-wider shrink-0"
              title="Copy Solana Contract Address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
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
