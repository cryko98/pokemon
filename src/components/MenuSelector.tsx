import React, { useState, useEffect } from 'react';
import { POKEMONS, BOOSTER_SECRET_POKEMONS, ARENAS } from '../data';
import { PokemonCharacter, Arena } from '../types';
import { audio } from '../utils/audio';
import PokemonCard from './PokemonCard';
import { Sword, Play, AlertTriangle, BookOpen, Layers, Shield, Sparkles, Trophy, Lock, Search } from 'lucide-react';
import PokeBall from './PokeBall';
import BoosterPack from './BoosterPack';
import CareerMode from './CareerMode';

interface MenuSelectorProps {
  onStartFight: (playerPokemon: PokemonCharacter, cpuPokemon: PokemonCharacter, selectedArena: Arena) => void;
  onStartCareerFight: (
    playerPokemon: PokemonCharacter,
    cpuPokemon: PokemonCharacter,
    arena: Arena,
    stageLevel: number,
    statMultiplier: number
  ) => void;
  savedProfilesUpdatedTrigger?: number;
}

type MenuTab = 'career' | 'bot' | 'album' | 'abilities';

export default function MenuSelector({ onStartFight, onStartCareerFight, savedProfilesUpdatedTrigger = 0 }: MenuSelectorProps) {
  // Navigation tabs - default to campaign mode
  const [activeTab, setActiveTab] = useState<MenuTab>('career');

  // local VS AI Selectors
  const [selectedP1, setSelectedP1] = useState<PokemonCharacter>(POKEMONS[0]);
  const [selectedCpu, setSelectedCpu] = useState<PokemonCharacter>(POKEMONS[1]);
  const [selectedArena, setSelectedArena] = useState<Arena>(ARENAS[0]);
  const [boosterPackActive, setBoosterPackActive] = useState(false);

  // Unlocked secret pokemons from local persistence
  const [unlockedSecretIds, setUnlockedSecretIds] = useState<string[]>([]);
  
  // Card Album detailed selection state
  const [albumSelected, setAlbumSelected] = useState<PokemonCharacter>(POKEMONS[0]);

  // Read unlocked secrets on initial mount and when booster is closed
  const reloadSecrets = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('unlocked_secrets') || '[]');
      setUnlockedSecretIds(stored);
    } catch {
      setUnlockedSecretIds([]);
    }
  };

  useEffect(() => {
    reloadSecrets();
  }, []);

  const handleTabChange = (tab: MenuTab) => {
    setActiveTab(tab);
    audio.playSelect();
  };

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

  const allAlbumPokemons = [...POKEMONS, ...BOOSTER_SECRET_POKEMONS];

  return (
    <div className="w-full max-w-5xl px-2 sm:px-4 py-3 flex flex-col gap-6 select-none animate-fade-in text-slate-100">
      
      {/* INTRO BANNER TITLE WITH CARTOON POKEMON STYLE */}
      <div className="flex flex-col glass-panel-glow rounded-[28px] relative overflow-hidden">
        {/* COVER LANDSCAPE ART - WITH DARK GRADIENT OVERLAY */}
        <div className="w-full relative overflow-hidden bg-slate-950 border-b border-white/5 h-48 sm:h-60 md:h-72 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs" style={{ backgroundImage: "url('https://berjrozgwqoqpeqozceu.supabase.co/storage/v1/object/public/werld/poke.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <img 
            src="https://berjrozgwqoqpeqozceu.supabase.co/storage/v1/object/public/werld/poke.png" 
            className="relative z-10 max-w-full max-h-[85%] object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-500" 
            alt="Pokémon Cast"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="text-center flex flex-col items-center p-5 sm:p-7 relative bg-slate-950/70 backdrop-blur-md">
          <div className="absolute top-0 left-0 w-36 h-36 bg-red-500/[0.04] blur-3xl rounded-full pointer-events-none" />
          <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-405/[0.04] blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 text-red-400 text-[10px] sm:text-xs font-mono font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <Sword className="w-3.5 h-3.5 text-red-500 animate-pulse" /> CHAMPIONS COLISEUM 2026
            </div>
            
            <div className="flex items-center justify-center gap-3.5 my-1">
              <PokeBall className="w-8 h-8 hidden sm:block filter drop-shadow animate-bounce" type="classic" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-350 tracking-tight select-none py-1 uppercase">
                POKÉMON ARENA FIGHTER
              </h1>
              <PokeBall className="w-8 h-8 hidden sm:block filter drop-shadow animate-bounce" type="ultra" />
            </div>
          
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mt-3 font-normal">
              Lead your favorite pocket monsters to victory in real-time stadium duels! Crack open foil booster packs to claim legendary fighters, or upgrade your custom profile stats in the local Campaign Mode!
            </p>

            {/* INTERACTIVE NAVIGATION CARTOON PANEL */}
            <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-6 p-1.5 bg-slate-950/80 border border-white/5 rounded-2xl w-full max-w-2xl shadow-2xl">
              <button
                onClick={() => handleTabChange('career')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl font-display font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-xs sm:text-sm uppercase tracking-wider ${
                  activeTab === 'career'
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold shadow-[0_4px_16px_rgba(245,158,11,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className="w-4 h-4" /> Campaign
              </button>
              <button
                onClick={() => handleTabChange('bot')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl font-display font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-xs sm:text-sm uppercase tracking-wider ${
                  activeTab === 'bot'
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-extrabold shadow-[0_4px_16px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sword className="w-4 h-4" /> BOT MATCH
              </button>
              <button
                onClick={() => handleTabChange('album')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl font-display font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-xs sm:text-sm uppercase tracking-wider ${
                  activeTab === 'album'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold shadow-[0_4px_16px_rgba(16,185,129,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4" /> COLLECTION
              </button>
              <button
                onClick={() => handleTabChange('abilities')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl font-display font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-xs sm:text-sm uppercase tracking-wider ${
                  activeTab === 'abilities'
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-extrabold shadow-[0_4px_16px_rgba(168,85,247,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4" /> PASSIVES
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* CAREER SYSTEM TABLE */}
      {activeTab === 'career' && (
        <CareerMode 
          onStartCareerFight={onStartCareerFight}
          savedProfilesUpdatedTrigger={savedProfilesUpdatedTrigger}
        />
      )}

      {/* BOT GAME TABLE */}
      {activeTab === 'bot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in text-slate-150">
          
          {/* OFFLINE CHARACTER SELECTIONS */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* ALY 1 INDUCTE */}
              <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between gap-5 border border-white/5">
                <div>
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-2 font-bold text-slate-200">
                      <PokeBall className="w-5 h-5 shrink-0" type="classic" /> PLAYER 1 (YOU)
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 font-extrabold">ALLY CHOOSE</span>
                  </h3>

                  <button
                    onClick={() => {
                      setBoosterPackActive(true);
                      audio.playSelect();
                    }}
                    className="w-full mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 font-display font-black text-xs tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all duration-300 uppercase animate-pulse"
                  >
                    🎁 RIP OPEN MYSTERY BOOSTER PACK!
                  </button>

                  <div className="grid grid-cols-4 gap-1.5 mb-5 h-28 overflow-y-auto pr-1">
                    {POKEMONS.map((poke) => {
                      const isSelected = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectP1Character(poke)}
                          className={`p-1 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-slate-800 border-yellow-500/80 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                              : 'bg-slate-950/40 border-white/5 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 overflow-hidden relative p-0.5 bg-slate-950"
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-7 h-7 object-contain filter drop-shadow pointer-events-none transition-transform duration-205 group-hover:scale-110" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-300 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
                        </button>
                      );
                    })}

                    {/* Unlocked special monsters catalog */}
                    {unlockedSecretIds.map(secId => {
                      const poke = BOOSTER_SECRET_POKEMONS.find(p => p.id === secId);
                      if (!poke) return null;
                      const isSelected = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectP1Character(poke)}
                          className={`p-1 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-slate-800 border-yellow-500/80 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                              : 'bg-slate-950/40 border-yellow-500/20 hover:border-yellow-500/50'
                          }`}
                        >
                          <span className="absolute -top-1.5 -right-0.5 bg-yellow-400 text-slate-950 text-[6px] font-bold font-mono px-1 rounded-full scale-75 shadow-sm z-10">RARE</span>
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-yellow-500/30 overflow-hidden relative p-0.5 bg-slate-950"
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-7 h-7 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-yellow-500 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full flex justify-center">
                    <PokemonCard pokemon={selectedP1} label="YOUR HERO" badgeColor="bg-yellow-400 text-slate-950 border border-yellow-500/20" />
                  </div>
                </div>
              </div>

              {/* ENEMY CPU SELECTION */}
              <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between gap-5 border border-white/5">
                <div>
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-2 font-bold text-slate-200">
                      <PokeBall className="w-5 h-5 shrink-0" type="ultra" /> COMPUTER OPPONENT (AI)
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 font-extrabold">FOE CHOOSE</span>
                  </h3>

                  <div className="grid grid-cols-4 gap-1.5 mb-5 mt-4 h-28 overflow-y-auto pr-1">
                    {POKEMONS.map((poke) => {
                      const isSelected = selectedCpu.id === poke.id;
                      const isSame = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectCpuCharacter(poke)}
                          className={`p-1 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-slate-800 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                              : 'bg-slate-950/40 border-white/5 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 overflow-hidden relative p-0.5 bg-slate-950"
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-7 h-7 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-300 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
                          {isSame && (
                            <span className="absolute -top-1.5 -right-0.5 text-[6px] font-bold font-mono bg-red-600 text-white px-1 rounded-full scale-75 shadow-sm">CLONE</span>
                          )}
                        </button>
                      );
                    })}

                    {/* Unlocked secret monsters as AI duels */}
                    {unlockedSecretIds.map(secId => {
                      const poke = BOOSTER_SECRET_POKEMONS.find(p => p.id === secId);
                      if (!poke) return null;
                      const isSelected = selectedCpu.id === poke.id;
                      const isSame = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectCpuCharacter(poke)}
                          className={`p-1 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-slate-800 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                              : 'bg-slate-950/40 border-yellow-500/25 hover:border-yellow-500/50'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 overflow-hidden relative p-0.5 bg-slate-950"
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-7 h-7 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-300 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
                          {isSame && (
                            <span className="absolute -top-1.5 -right-0.5 text-[6px] font-bold font-mono bg-red-600 text-white px-1 rounded-full scale-75 shadow-sm">CLONE</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full flex justify-center">
                    <PokemonCard pokemon={selectedCpu} label="ENEMY CPU" badgeColor="bg-red-500 text-white border border-red-600/30" isCpu />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE ACTIONS AND SETTINGS */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="glass-panel border border-white/5 p-5 rounded-3xl flex-1 flex flex-col justify-between gap-5">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-yellow-400 rounded-sm block shadow-[0_0_6px_rgba(234,179,8,0.5)]" /> SELECT BATTLE VENUE:
                </h3>

                <div className="flex flex-col gap-2">
                  {ARENAS.map((arena) => {
                    const isSel = selectedArena.id === arena.id;
                    return (
                      <button
                        key={arena.id}
                        onClick={() => selectArenaItem(arena)}
                        className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all duration-200 text-left cursor-pointer ${
                          isSel
                            ? 'border-yellow-400 bg-yellow-405/10 text-slate-100 shadow-[0_0_12px_rgba(234,179,8,0.08)]'
                            : 'border-white/5 bg-slate-950/40 text-slate-405 hover:border-slate-800 hover:bg-slate-900/40'
                        }`}
                      >
                        <span className={`text-[11px] font-display font-bold tracking-wide uppercase ${isSel ? 'text-yellow-450 text-yellow-405' : 'text-slate-205'}`}>{arena.name}</span>
                        <p className="text-[9px] text-slate-500 leading-normal font-semibold line-clamp-2 mt-0.5">{arena.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 flex items-center justify-center gap-4 shadow-inner text-xs">
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-slate-505 uppercase">YOUR FIGHTER</div>
                    <div className="font-display font-extrabold text-slate-100 text-xs tracking-wider uppercase mt-1">{selectedP1.name}</div>
                  </div>
                  <div className="font-bold text-slate-600">VS</div>
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-slate-505 uppercase">AI BOT</div>
                    <div className="font-display font-extrabold text-slate-150 text-xs tracking-wider uppercase mt-1">{selectedCpu.name}</div>
                  </div>
                </div>

                <button
                  onClick={startMatch}
                  className="w-full bg-gradient-to-r from-yellow-405 to-amber-500 hover:from-yellow-500 hover:to-amber-550 active:scale-95 text-slate-950 font-display font-extrabold text-xs tracking-widest uppercase transition-all duration-200 py-4 rounded-xl shadow-[0_4px_16px_rgba(234,179,8,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" /> INITIATE LIVE DUEL! ⚔
                </button>
              </div>
            </div>

            {/* QUICK CONTROLS INSTRUCTIONS */}
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-start gap-3 shadow-md text-slate-350">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[10px] text-left leading-relaxed">
                <strong className="text-amber-500 uppercase font-display font-bold text-xs block mb-1">KEYBOARD CONTROLS:</strong>
                <span>Fighter Movement: <code className="text-yellow-400 font-bold bg-slate-950 px-1 py-0.5 rounded border border-white/5">W, A, S, D / Arrows</code>.</span>
                <span className="block mt-1.5">Action Keys:</span>
                <span className="block mt-1 pl-1">⚡ <code className="text-slate-300 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded border border-white/5">J</code> Light Strike / Quick attack</span>
                <span className="block pl-1">🔥 <code className="text-slate-300 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded border border-white/5">K</code> Knockout Heavy Strike</span>
                <span className="block pl-1">☄️ <code className="text-slate-300 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded border border-white/5">L</code> Energy Ranged Ball (Cost: 20 Energy)</span>
                <span className="block pl-1">🔮 <code className="text-slate-300 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded border border-white/5">I</code> Ultimate Strike (Cost: 100 Energy)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CARD LIBRARY COLLECTION */}
      {activeTab === 'album' && (
        <div className="glass-panel border border-white/5 p-5 sm:p-6 rounded-3xl flex flex-col gap-5 animate-fade-in relative text-slate-200">
          
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/[0.02] blur-3xl rounded-full pointer-events-none" />

          <div className="border-b border-white/5 pb-4">
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500 animate-pulse" /> POKÉMON COLLECTORS DECK ALBUM
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed">
              Browse your registered holographic deck catalogs. Reveal ultra-rare hidden cards (<strong className="text-yellow-550 text-yellow-500 uppercase">RARE</strong>) by ripping foil mystery boosters to send them straight into live battle arenas!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* DECK GRID VIEW */}
            <div className="md:col-span-7 flex flex-col gap-3.5 bg-slate-950/40 p-4 rounded-2xl border border-white/5 max-h-[480px] overflow-y-auto">
              <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1 mb-1.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" /> REGISTERED CARDS ({allAlbumPokemons.length} Total Cards in Deck):
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {allAlbumPokemons.map((poke) => {
                  const isSec = poke.isSecret === true;
                  const isUnlocked = !isSec || unlockedSecretIds.includes(poke.id);
                  const isCurrentlySelected = albumSelected.id === poke.id;

                  return (
                    <button
                      key={poke.id}
                      onClick={() => {
                        if (isUnlocked) {
                          setAlbumSelected(poke);
                          audio.playSelect();
                        } else {
                          audio.playBlock();
                        }
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-between gap-3.5 transition-all duration-200 shrink-0 select-none cursor-pointer group relative ${
                        isUnlocked
                          ? isCurrentlySelected
                            ? 'bg-slate-800 border-emerald-500/50 shadow-md'
                            : 'bg-slate-950/40 border-white/5 hover:border-slate-800'
                          : 'bg-slate-950/20 border-white/5 opacity-30 cursor-not-allowed'
                      }`}
                      disabled={!isUnlocked}
                      title={isUnlocked ? poke.name : "Locked Secret Legend"}
                    >
                      {isSec && isUnlocked && (
                        <span className="absolute -top-1.5 -right-0.5 uppercase font-mono font-bold text-[6px] bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 px-1 py-0.2 border border-yellow-500/20 rounded-full shadow z-10 animate-pulse">RARE</span>
                      )}

                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center border overflow-hidden relative p-0.5 transition-all ${
                          isUnlocked 
                            ? 'bg-slate-900 border-white/10 group-hover:scale-105'
                            : 'bg-slate-950 border-white/5'
                        }`}
                      >
                        {isUnlocked ? (
                          <img 
                            src={poke.imageUrl} 
                            alt={poke.name} 
                            className="w-8 h-8 object-contain filter drop-shadow select-none group-hover:rotate-1 duration-200 pointer-events-none" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>

                      <div className="text-center w-full min-w-0">
                        <span className={`text-[9px] font-mono font-bold block truncate leading-tight uppercase tracking-wide ${isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                          {isUnlocked ? poke.name : '???'}
                        </span>
                        <span className="text-[7px] font-mono text-slate-500 uppercase block mt-0.5">
                          {isUnlocked ? (isSec ? 'Legend' : 'Classic') : 'Locked'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* FOIL SWEEPER */}
              <div className="mt-4 bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-3 text-xs flex-wrap">
                <p className="text-slate-400 leading-normal text-[10.5px] max-w-[280px]">
                  Missing rare stadium gods (e.g., <strong className="text-amber-500">Rayquaza, Mew, Arceus</strong>)? Put your luck to the test and unwrap mystery packs!
                </p>
                <button
                  onClick={() => {
                    setBoosterPackActive(true);
                    audio.playSelect();
                  }}
                  className="bg-yellow-405 text-slate-950 hover:bg-yellow-500 font-display font-extrabold text-[10px] px-4 py-2.5 rounded-lg border border-yellow-500/20 transition-all shrink-0 cursor-pointer uppercase tracking-wider"
                >
                  Unrip Booster 🎁
                </button>
              </div>
            </div>

            {/* EXPANDED INTERACTIVE PREVIEW */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/40 border border-white/5 p-4 rounded-2xl relative min-h-[350px]">
              
              <div className="absolute top-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase leading-none z-10">
                CARD DECK HOLOGRAM VISUALIZER ✦
              </div>

              <div className="w-full flex justify-center mt-6">
                <PokemonCard pokemon={albumSelected} label="PREVIEW CARD" badgeColor="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 font-mono" />
              </div>

              <div className="mt-4 bg-slate-950/90 border border-white/5 p-3.5 rounded-xl w-full text-left">
                <div className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest leading-none">CHARACTER BIO & ANCESTRY:</div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2 text-justify">
                  {albumSelected.description}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* DETAILED POKÉMON ABILITIES TAB */}
      {activeTab === 'abilities' && (
        <div className="glass-panel border border-white/5 p-5 sm:p-6 rounded-3xl flex flex-col gap-5 animate-fade-in relative text-slate-200">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/[0.02] blur-3xl rounded-full pointer-events-none" />

          <div className="border-b border-white/5 pb-4">
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse shrink-0" /> STADIUM ABILITIES & CHARACTER PASSIVES
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-1 leading-normal">
              Every card inherits an active perk and secondary element modifier, completely defining their defense parameters in live combat!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 max-h-[480px] overflow-y-auto pr-1">
            {allAlbumPokemons.map((poke) => {
              const isSec = poke.isSecret === true;
              return (
                <div 
                  key={poke.id} 
                  className={`p-4 rounded-xl border flex gap-4 transition-all hover:bg-slate-900/40 relative ${
                    isSec 
                      ? 'bg-yellow-500/[0.03] border-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.05)]' 
                      : 'bg-slate-950/40 border-white/5'
                  }`}
                >
                  {isSec && (
                    <span className="absolute top-2 right-2.5 text-[7px] font-mono bg-yellow-405/10 border border-yellow-400/30 text-yellow-500 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">SECRET</span>
                  )}

                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-slate-900"
                  >
                    <img src={poke.imageUrl} alt={poke.name} className="w-8 h-8 object-contain filter drop-shadow" referrerPolicy="no-referrer" />
                  </div>

                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-xs font-display font-bold text-slate-200 flex items-center gap-2 leading-tight uppercase">
                      {poke.name}
                      <span className="text-[8px] font-mono text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full leading-none shrink-0 uppercase tracking-widest">
                        {poke.abilityName || 'Passive Aura'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1.5 font-normal">
                      {poke.abilityDesc || 'Grants customized stat boosts and passive shield attributes inside combat matches.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {boosterPackActive && (
        <BoosterPack 
          onClose={() => {
            setBoosterPackActive(false);
            reloadSecrets();
          }}
          onAccept={(pokemon) => {
            selectP1Character(pokemon);
            setBoosterPackActive(false);
            reloadSecrets();
            onStartFight(pokemon, selectedCpu, selectedArena);
          }}
        />
      )}

    </div>
  );
}
