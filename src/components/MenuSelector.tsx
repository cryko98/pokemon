import React, { useState } from 'react';
import { POKEMONS, ARENAS } from '../data';
import { PokemonCharacter, Arena } from '../types';
import { audio } from '../utils/audio';
import PokemonCard from './PokemonCard';
import { Sword, Play, AlertTriangle } from 'lucide-react';
import PokeBall from './PokeBall';

interface MenuSelectorProps {
  onStartFight: (playerPokemon: PokemonCharacter, cpuPokemon: PokemonCharacter, selectedArena: Arena) => void;
}

export default function MenuSelector({ onStartFight }: MenuSelectorProps) {
  // Menu Selection States
  const [selectedP1, setSelectedP1] = useState<PokemonCharacter>(POKEMONS[0]);
  const [selectedCpu, setSelectedCpu] = useState<PokemonCharacter>(POKEMONS[1]);
  const [selectedArena, setSelectedArena] = useState<Arena>(ARENAS[0]);

  const startMatch = () => {
    audio.playBattleStart();
    onStartFight(selectedP1, selectedCpu, selectedArena);
  };

  const selectP1Character = (p: PokemonCharacter) => {
    setSelectedP1(p);
    audio.playSelect();
  };

  const selectCpuCharacter = (p: PokemonCharacter) => {
    setSelectedCpu(p);
    audio.playSelect();
  };

  const selectArenaItem = (a: Arena) => {
    setSelectedArena(a);
    audio.playSelect();
  };

  return (
    <div className="w-full max-w-5xl px-4 py-4 flex flex-col gap-6 select-none animate-fade-in">
      
      {/* EPIC GLOWING HERO INTRO BANNER TITLE WITH POKÉMON COLOUR PALETTE (RED/YELLOW/WHITE) */}
      <div className="text-center flex flex-col items-center backdrop-blur-md bg-slate-950/70 border-2 border-red-500/20 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow corner highlights */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/[0.08] blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/[0.08] blur-3xl rounded-full pointer-events-none" />
        
        {/* Grid pattern aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-400 text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full border border-red-500/20 mb-3 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)] uppercase tracking-widest font-mono">
            <Sword className="w-3.5 h-3.5 text-red-500" /> STADIUM TOURNAMENT CHAMPIONSHIP
          </div>
          
          <div className="flex items-center justify-center gap-4 my-1">
            <PokeBall className="w-8 h-8 hidden md:block" type="classic" />
            <h1 className="text-3xl md:text-5xl lg:text-5.5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-yellow-400 drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)] font-orbitron select-none py-1">
              POKÉMON FIGHTING ARENA
            </h1>
            <PokeBall className="w-8 h-8 hidden md:block" type="ultra" />
          </div>
          
          <p className="text-xs md:text-sm text-slate-350 max-w-xl mx-auto mt-2 leading-relaxed font-light">
            Take command of your chosen fighter on the left and defeat the intelligent, dynamic computer-controlled opponent on the right in this classic 2D retro action fighting game!
          </p>

          {/* Dynamic Interactive Pokéball row for immersive brand feel */}
          <div className="mt-4.5 flex items-center gap-5 justify-center bg-slate-900/60 p-2.5 rounded-2xl border border-red-500/10 shadow-inner">
            <div className="flex flex-col items-center">
              <PokeBall className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer" type="classic" />
              <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase font-black">Poké Ball</span>
            </div>
            <div className="flex flex-col items-center">
              <PokeBall className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer" type="great" />
              <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase font-black">Great Ball</span>
            </div>
            <div className="flex flex-col items-center">
              <PokeBall className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer" type="ultra" />
              <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase font-black">Ultra Ball</span>
            </div>
            <div className="flex flex-col items-center">
              <PokeBall className="w-8 h-8 hover:scale-110 transition-transform cursor-pointer" type="master" />
              <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase font-black">Master Ball</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. SELECTION SPLIT VIEWS WITH PREMIUM POKEMON CARDS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PLAYER 1 CHARACTER ACCORDION CARD (THEMED YELLOW/WHITE) */}
            <div className="backdrop-blur-md bg-slate-950/40 border-t-4 border-t-yellow-400 border-x border-b border-white/5 p-5 rounded-2xl shadow-xl flex flex-col justify-between gap-5 transition-all hover:bg-slate-950/60">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs md:text-sm font-display font-black text-yellow-300 uppercase tracking-widest flex items-center gap-2">
                    <PokeBall className="w-5 h-5 flex-shrink-0" type="classic" /> PLAYER 1 (YOU)
                  </h3>
                </div>

                {/* Grid Choices - Custom spritted circles! */}
                <div className="grid grid-cols-4 gap-1.5 mb-5">
                  {POKEMONS.map((poke) => {
                    const isSelected = selectedP1.id === poke.id;
                    return (
                      <button
                        key={poke.id}
                        onClick={() => selectP1Character(poke)}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 group ${
                          isSelected
                            ? 'bg-yellow-400/5 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.25)]'
                            : 'bg-slate-950/80 border-white/5 hover:border-slate-800'
                        }`}
                        title={poke.name}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shrink-0 relative p-1 bg-slate-900/60 transition-transform group-hover:scale-105"
                          style={{ boxShadow: `0 0 8px ${poke.color}33`, background: `radial-gradient(circle, ${poke.color}22 0%, ${poke.color}66 100%)` }}
                        >
                          <img 
                            src={poke.imageUrl} 
                            alt={poke.name} 
                            className="w-8 h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] select-none pointer-events-none" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[8.5px] font-sans font-black text-slate-200 truncate w-full text-center">{poke.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* High Fidelity Pokémon Trading Card Display */}
                <div className="w-full flex justify-center">
                  <PokemonCard pokemon={selectedP1} label="YOUR HERO" badgeColor="bg-yellow-400 text-slate-950" />
                </div>
              </div>
            </div>

            {/* CPU AI OPPONENT ACCORDION CARD (THEMED RED/WHITE) */}
            <div className="backdrop-blur-md bg-slate-950/40 border-t-4 border-t-red-500 border-x border-b border-white/5 p-5 rounded-2xl shadow-xl flex flex-col justify-between gap-5 transition-all hover:bg-slate-950/60">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs md:text-sm font-display font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <PokeBall className="w-5 h-5 flex-shrink-0" type="ultra" /> CPU AI OPPONENT
                  </h3>
                </div>

                {/* Grid Choices - Custom spritted circles! */}
                <div className="grid grid-cols-4 gap-1.5 mb-5">
                  {POKEMONS.map((poke) => {
                    const isSelected = selectedCpu.id === poke.id;
                    const isSame = selectedP1.id === poke.id;
                    return (
                      <button
                        key={poke.id}
                        onClick={() => selectCpuCharacter(poke)}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 relative group ${
                          isSelected
                            ? 'bg-rose-500/5 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                            : 'bg-slate-950/80 border-white/5 hover:border-slate-800'
                        }`}
                        title={poke.name}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shrink-0 relative p-1 bg-slate-900/60 transition-transform group-hover:scale-105"
                          style={{ boxShadow: `0 0 8px ${poke.color}33`, background: `radial-gradient(circle, ${poke.color}22 0%, ${poke.color}66 100%)` }}
                        >
                          <img 
                            src={poke.imageUrl} 
                            alt={poke.name} 
                            className="w-8 h-8 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] select-none pointer-events-none" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[8.5px] font-sans font-black text-slate-200 truncate w-full text-center">{poke.name}</span>
                        {isSame && (
                          <span className="absolute -top-1.5 right-0.5 text-[5.5px] font-mono bg-red-600 border border-red-400 text-white px-1.5 font-bold rounded-full scale-90 shadow-md">CLONE</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* High Fidelity Pokémon Trading Card Display */}
                <div className="w-full flex justify-center">
                  <PokemonCard pokemon={selectedCpu} label="CPU RIVAL" badgeColor="bg-rose-500 text-white" isCpu />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 2. CHOOSE MAP THEMED COLS & START LAUNCH BUTTON (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* MAP / ARENA SECTOR CONTAINER */}
          <div className="backdrop-blur-md bg-slate-900/20 border border-white/5 p-5 rounded-2xl shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-display font-black text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-amber-400 rounded-sm" /> CHOOSE BATTLE ARENA:
              </h3>

              <div className="flex flex-col gap-3">
                {ARENAS.map((arena) => {
                  const isSel = selectedArena.id === arena.id;
                  return (
                    <button
                      key={arena.id}
                      onClick={() => selectArenaItem(arena)}
                      className={`p-3.5 rounded-xl border flex flex-col items-start gap-1.5 transition-all duration-300 text-left cursor-pointer ${
                        isSel
                          ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/20'
                          : 'border-white/5 bg-slate-950/40 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-display font-bold text-slate-100">{arena.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-light">{arena.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* START FIGHT MATCHMAKER ACTION BUTTON */}
            <div className="pt-4 border-t border-white/5 mt-4 flex flex-col gap-4">
              
              {/* Battle preview summary stats */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 flex items-center justify-center gap-5 shadow-lg">
                <div className="text-center">
                  <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Player 1</div>
                  <div className="text-xs font-display font-black text-amber-400">{selectedP1.name}</div>
                </div>
                
                <span className="font-orbitron text-slate-600 font-extrabold text-[11px] animate-pulse bg-slate-900/60 px-1.5 py-0.5 rounded border border-white/5">VS</span>

                <div className="text-center">
                  <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Opponent</div>
                  <div className="text-xs font-display font-black text-rose-500">{selectedCpu.name}</div>
                </div>
              </div>

              <button
                onClick={startMatch}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-orbitron font-black text-xs tracking-widest uppercase transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.55)] border border-amber-300/20 cursor-pointer"
              >
                <Play className="w-4.5 h-4.5 fill-slate-950" /> START BATTLE!
              </button>
            </div>

          </div>

          {/* Retro controls disclaimer banner */}
          <div className="backdrop-blur-md bg-slate-950/40 border border-white/5 p-4 rounded-xl flex items-start gap-3 shadow-md">
            <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse mt-0.5 shrink-0" />
            <div className="text-[10px] font-mono text-slate-400 leading-relaxed font-light">
              <strong className="text-slate-300">100% Control Support:</strong> Move your Pokémon with <code className="text-amber-400 font-bold bg-slate-900/60 p-0.5 rounded border border-white/5">A, S, D, W / Space</code> on your keyboard, and fight of your rivals with <code className="text-amber-400 font-bold bg-slate-900/60 p-0.5 rounded border border-white/5">J, K, L, I</code> or leverage the interactive retro gamepad buttons below!
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
