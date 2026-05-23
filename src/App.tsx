import React, { useState } from 'react';
import MenuSelector from './components/MenuSelector';
import GameController from './components/GameController';
import { PokemonCharacter, Arena } from './types';
import { Sword, Gamepad2, Info, Moon, Github, Copy, Check } from 'lucide-react';
import PokeBall from './components/PokeBall';

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'fighting'>('menu');
  const [playerPokemon, setPlayerPokemon] = useState<PokemonCharacter | null>(null);
  const [cpuPokemon, setCpuPokemon] = useState<PokemonCharacter | null>(null);
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCA = () => {
    navigator.clipboard.writeText('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startCombat = (player: PokemonCharacter, cpu: PokemonCharacter, arena: Arena) => {
    setPlayerPokemon(player);
    setCpuPokemon(cpu);
    setSelectedArena(arena);
    setGameState('fighting');
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

      {/* TOP COMPACT HEADER BAR (Only show or minimize during active fight to prevent layout clutter) */}
      <header className={`w-full max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between border-b border-red-500/10 backdrop-blur-md ${
        isFighting ? 'bg-slate-950/80 mb-0 py-2.5 rounded-b-xl border-x border-slate-900 shadow-lg' : 'bg-slate-950/45 mt-4 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]'
      } z-10 transition-all duration-300`}>
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

      {/* CORE DISPLAY ROUTER */}
      <main className={`w-full flex flex-col items-center justify-center z-10 flex-1 min-h-0 ${isFighting ? 'p-1 sm:p-2' : 'py-6'}`}>
        {gameState === 'menu' ? (
          <MenuSelector onStartFight={startCombat} />
        ) : (
          playerPokemon && cpuPokemon && selectedArena && (
            <GameController
              playerPokemon={playerPokemon}
              cpuPokemon={cpuPokemon}
              selectedArena={selectedArena}
              onExitToMenu={exitToMenu}
              onSelectDifferentCharacters={() => setGameState('menu')}
            />
          )
        )}
      </main>

      {/* DETAILED GUIDE PANEL/FOOTER (Only visible in Menu state for clean focus during fights) */}
      {gameState === 'menu' && (
        <div className="w-full max-w-5xl px-4 mb-6 z-10 transition-all">
          <div className="backdrop-blur-md bg-slate-950/40 border-l-4 border-l-red-500 border-t border-r border-b border-white/5 p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                <Info className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-xs md:text-sm font-display font-black uppercase text-yellow-300 tracking-wider">STAGE CHAMPIONSHIP STADIUM</h4>
                <p className="text-xs text-slate-350 mt-1 leading-relaxed max-w-2xl font-light">
                  Pick your combatant, choose your battle venue, and prepare for high-octane 2D fighter combos. Dodge incoming elemental energy spheres, block heavy kinetic kicks, and time your moves to unleash devastating Pocket Monster Ultimate attacks!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400 self-end md:self-center">
              <span>Language:</span>
              <span className="bg-red-600/10 border border-red-500/20 px-2.5 py-1 rounded text-red-400 font-bold font-mono">English (EN)</span>
            </div>
          </div>
        </div>
      )}

      {/* SOLANA MEMECOIN CONTRACT ADDRESS & TICKER FOOTER */}
      <footer className="w-full max-w-5xl px-6 py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-5 text-xs font-mono text-slate-400 z-10 bg-[#090d16]/30 backdrop-blur-sm rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 px-3 py-1.5 rounded-xl font-bold text-yellow-400 select-none shadow-[0_0_12px_rgba(234,179,8,0.15)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            Ticker: $PokeFight
          </div>
          <p className="text-[11px] text-slate-500 font-sans mt-1 sm:mt-0">© 2026 Pokémon Fighting Arena. All rights reserved.</p>
        </div>

        {/* Dynamic Solana CA Box with easy-click-to-copy handler */}
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

    </div>
  );
}
