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
  const [marqueeNotice, setMarqueeNotice] = useState<string | null>(null);

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
      <div className="flex flex-col rounded-[28px] border-4 border-slate-950 select-none relative overflow-hidden bg-white"
           style={{ boxShadow: '6px 6px 0px 0px #000000' }}>
        <img 
          src="https://berjrozgwqoqpeqozceu.supabase.co/storage/v1/object/public/werld/poke.png" 
          alt="Pokémon Battle Arena" 
          className="w-full h-auto object-cover block select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>

        {/* MARQUEE CARD SELECTOR TRACK - Floating real cards! */}
        <div className="w-full relative overflow-hidden bg-[#2563eb] border-y-4 border-slate-950 h-[430px] sm:h-[460px] flex items-center select-none py-4 shrink-0 group/marquee-hero">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-33.3333%, 0, 0); }
            }
            .animate-marquee-track {
              display: flex;
              gap: 1.25rem;
              animation: marquee 35s linear infinite;
              align-items: center;
              height: 100%;
            }
            .animate-marquee-track:hover {
              animation-play-state: paused;
            }
          ` }} />

          {/* Background decoration dots patterns */}
          <div className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-xs pointer-events-none" style={{ backgroundImage: "url('https://berjrozgwqoqpeqozceu.supabase.co/storage/v1/object/public/werld/poke.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          
          {/* Sliced reflective gloss lines */}
          <div className="w-full overflow-hidden relative flex items-center py-2 h-full z-10">
            <div className="animate-marquee-track">
              {[...POKEMONS, ...BOOSTER_SECRET_POKEMONS, ...POKEMONS, ...BOOSTER_SECRET_POKEMONS, ...POKEMONS, ...BOOSTER_SECRET_POKEMONS].map((poke, index) => {
                return (
                  <div 
                    key={`${poke.id}-marquee-${index}`}
                    onClick={() => {
                      setSelectedP1(poke);
                      setAlbumSelected(poke);
                      audio.playSelect();
                      setMarqueeNotice(`Selected ${poke.name} for battle! ⚔️`);
                      setTimeout(() => {
                        setMarqueeNotice(null);
                      }, 2500);
                    }}
                    className="w-[230px] sm:w-[260px] flex-shrink-0 cursor-pointer select-none transition-all duration-300 hover:scale-105 hover:z-20"
                  >
                    <PokemonCard pokemon={poke} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floated selection toast notice */}
          {marqueeNotice && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-35 bg-slate-950/95 border border-emerald-500/50 text-emerald-400 text-xs font-mono px-4 py-2 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] flex items-center gap-2 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              {marqueeNotice}
            </div>
          )}
        </div>

        {/* BOTTOM SUMMARY TEXT BOX - Bright comic card selector indicator */}
        <div className="text-center flex flex-col items-center p-5 sm:p-6 bg-white relative">
          <div className="relative z-10 flex flex-col items-center w-full">
            <p className="text-xs sm:text-sm text-slate-800 max-w-xl mx-auto leading-relaxed font-semibold italic text-center">
              "Lead your favorite pocket monsters to victory in real-time stadium duels! Crack open foil booster packs to claim legendary fighters, or upgrade your custom profile stats in the local Campaign Mode!"
            </p>

            {/* INTERACTIVE NAVIGATION CARTOON PANEL */}
            <nav className="flex flex-wrap items-center justify-center gap-2 mt-4 p-1.5 bg-slate-950 border-3 border-slate-950 rounded-2xl w-full max-w-2xl shadow-[4px_4px_0px_#000000]">
              <button
                onClick={() => handleTabChange('career')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl font-display font-black flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-xs sm:text-sm uppercase tracking-wider ${
                  activeTab === 'career'
                    ? 'bg-[#ffcb05] hover:bg-[#ffe135] text-slate-950 border-2 border-slate-950 font-black'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-4 h-4 text-rose-500 fill-rose-500" /> Campaign
              </button>
              <button
                onClick={() => handleTabChange('bot')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl font-display font-black flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-xs sm:text-sm uppercase tracking-wider ${
                  activeTab === 'bot'
                    ? 'bg-[#ffcb05] hover:bg-[#ffe135] text-slate-950 border-2 border-slate-950 font-black'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sword className="w-4 h-4 text-blue-500 fill-blue-500" /> BOT MATCH
              </button>
              <button
                onClick={() => handleTabChange('album')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl font-display font-black flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-xs sm:text-sm uppercase tracking-wider ${
                  activeTab === 'album'
                    ? 'bg-[#ffcb05] hover:bg-[#ffe135] text-slate-950 border-2 border-slate-950 font-black'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-500 fill-emerald-500" /> COLLECTION
              </button>
              <button
                onClick={() => handleTabChange('abilities')}
                className={`flex-1 min-w-[120px] py-3 rounded-xl font-display font-black flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-xs sm:text-sm uppercase tracking-wider ${
                  activeTab === 'abilities'
                    ? 'bg-[#ffcb05] hover:bg-[#ffe135] text-slate-950 border-2 border-slate-950 font-black'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-500 fill-purple-500" /> PASSIVES
              </button>
            </nav>
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
              <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between gap-5">
                <div>
                  <h3 className="text-xs font-mono text-slate-700 uppercase tracking-widest flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                    <span className="flex items-center gap-2 font-bold text-slate-900">
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
                          className={`p-1 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-amber-305 border-slate-950 text-slate-950 font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-300 overflow-hidden relative p-0.5 bg-white"
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-7 h-7 object-contain filter drop-shadow pointer-events-none transition-transform duration-205 group-hover:scale-110" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-750 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
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
                          className={`p-1 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-amber-305 border-slate-950 text-slate-950 font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                              : 'bg-yellow-50/50 border-yellow-200 hover:border-yellow-450 hover:bg-yellow-101'
                          }`}
                        >
                          <span className="absolute -top-1.5 -right-0.5 bg-yellow-400 text-slate-950 text-[6px] font-bold font-mono px-1 rounded-full scale-75 shadow-sm z-10">RARE</span>
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-yellow-300 overflow-hidden relative p-0.5 bg-white"
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-7 h-7 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-yellow-605 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full flex justify-center">
                    <PokemonCard pokemon={selectedP1} label="YOUR HERO" badgeColor="bg-yellow-400 text-slate-950 border-2 border-slate-950 font-display" />
                  </div>
                </div>
              </div>

              {/* ENEMY CPU SELECTION */}
              <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between gap-5">
                <div>
                  <h3 className="text-xs font-mono text-slate-700 uppercase tracking-widest flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                    <span className="flex items-center gap-2 font-bold text-slate-900">
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
                          className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-rose-100 border-slate-950 text-slate-950 font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-355 overflow-hidden relative p-0.5 bg-slate-50"
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-7 h-7 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-750 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
                          {isSame && (
                            <span className="absolute -top-1.5 -right-0.5 text-[6px] font-bold font-mono bg-red-600 text-white px-1 rounded-full scale-75 shadow-sm z-10">CLONE</span>
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
                          className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-rose-100 border-slate-950 text-slate-950 font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                              : 'bg-yellow-50 text-slate-800 border-yellow-300 hover:border-yellow-500'
                          }`}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-yellow-300 overflow-hidden relative p-0.5 bg-white"
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-7 h-7 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-yellow-605 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
                          {isSame && (
                            <span className="absolute -top-1.5 -right-0.5 text-[6px] font-bold font-mono bg-red-650 bg-red-600 text-white px-1 rounded-full scale-75 shadow-sm z-10">CLONE</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full flex justify-center">
                    <PokemonCard pokemon={selectedCpu} label="ENEMY CPU" badgeColor="bg-red-500 text-white border-2 border-slate-950" isCpu />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE ACTIONS AND SETTINGS */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="glass-panel p-5 rounded-3xl flex-1 flex flex-col justify-between gap-5">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-amber-450 rounded-sm block shadow-sm border border-slate-950" /> SELECT BATTLE VENUE:
                </h3>

                <div className="flex flex-col gap-2">
                  {ARENAS.map((arena) => {
                    const isSel = selectedArena.id === arena.id;
                    return (
                      <button
                        key={arena.id}
                        onClick={() => selectArenaItem(arena)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-start gap-1 transition-all duration-205 text-left cursor-pointer ${
                          isSel
                            ? 'border-slate-950 bg-amber-200 text-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold'
                            : 'border-slate-200 bg-white text-slate-750 hover:border-slate-450 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-[11px] font-display font-extrabold tracking-wide uppercase ${isSel ? 'text-slate-950' : 'text-slate-800'}`}>{arena.name}</span>
                        <p className="text-[9px] text-slate-500 leading-normal font-semibold line-clamp-2 mt-0.5">{arena.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-200 flex flex-col gap-3">
                <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-slate-950 flex items-center justify-center gap-4 shadow-sm text-xs text-slate-950">
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wide font-black">YOUR FIGHTER</div>
                    <div className="font-display font-extrabold text-slate-950 text-xs tracking-wider uppercase mt-1">{selectedP1.name}</div>
                  </div>
                  <div className="font-black text-slate-950 text-xs px-2 py-1 bg-white border border-slate-950 tracking-widest rounded-lg">VS</div>
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wide font-black">AI BOT</div>
                    <div className="font-display font-extrabold text-slate-950 text-xs tracking-wider uppercase mt-1">{selectedCpu.name}</div>
                  </div>
                </div>

                <button
                  onClick={startMatch}
                  className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 active:translate-y-0.5 active:shadow-stone-900 text-slate-950 font-display font-black text-xs tracking-widest uppercase transition-all duration-200 py-4 rounded-xl border-2 border-slate-950 shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" /> INITIATE LIVE DUEL! ⚔
                </button>
              </div>
            </div>

            {/* QUICK CONTROLS INSTRUCTIONS */}
            <div className="bg-amber-50 border-2 border-slate-950 p-4 rounded-3xl flex items-start gap-3 shadow-[4px_4px_0_rgba(0,0,0,1)] text-slate-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-[10px] text-left leading-relaxed">
                <strong className="text-amber-700 uppercase font-display font-extrabold text-xs block mb-1">KEYBOARD CONTROLS:</strong>
                <span>Fighter Movement: <code className="text-slate-950 font-bold bg-white px-1.5 py-0.5 rounded border-2 border-slate-950">W, A, S, D / Arrows</code>.</span>
                <span className="block mt-1.5 font-bold text-slate-705">Action Keys:</span>
                <span className="block mt-1 pl-1 font-semibold">⚡ <code className="text-slate-950 font-mono font-bold bg-white px-1.5 py-0.5 rounded border-2 border-slate-950">J</code> Light Strike / Quick attack</span>
                <span className="block pl-1 mt-1 font-semibold">🔥 <code className="text-slate-950 font-mono font-bold bg-white px-1.5 py-0.5 rounded border-2 border-slate-950">K</code> Knockout Heavy Strike</span>
                <span className="block pl-1 mt-1 font-semibold">☄️ <code className="text-slate-950 font-mono font-bold bg-white px-1.5 py-0.5 rounded border-2 border-slate-950">L</code> Energy Ranged Ball (Cost: 20 Energy)</span>
                <span className="block pl-1 mt-1 font-semibold">🔮 <code className="text-slate-950 font-mono font-bold bg-white px-1.5 py-0.5 rounded border-2 border-slate-950 font-black">I</code> Ultimate Strike (Cost: 100 Energy)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CARD LIBRARY COLLECTION */}
      {activeTab === 'album' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col gap-5 animate-fade-in relative text-slate-900 bg-white">
          
          <div className="border-b-2 border-slate-200 pb-4">
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" /> POKÉMON COLLECTORS DECK ALBUM
            </h2>
            <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
              Browse your registered holographic deck catalogs. Reveal ultra-rare hidden cards (<strong className="text-amber-500 uppercase">RARE</strong>) by ripping foil mystery boosters to send them straight into live battle arenas!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* DECK GRID VIEW */}
            <div className="md:col-span-7 flex flex-col gap-3.5 bg-slate-50 p-4.5 rounded-2xl border-2 border-slate-350 max-h-[480px] overflow-y-auto">
              <h3 className="text-[10px] font-mono font-black text-slate-650 uppercase tracking-widest pl-1 mb-1.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-805" /> REGISTERED CARDS ({allAlbumPokemons.length} Total Cards in Deck):
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
                      className={`p-2 rounded-xl border-2 flex flex-col items-center justify-between gap-3 transition-all duration-205 shrink-0 select-none cursor-pointer group relative ${
                        isUnlocked
                          ? isCurrentlySelected
                            ? 'bg-amber-305 border-slate-950 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-800 hover:bg-slate-50'
                          : 'bg-slate-100 border-dashed border-slate-300 opacity-40 cursor-not-allowed'
                      }`}
                      disabled={!isUnlocked}
                      title={isUnlocked ? poke.name : "Locked Secret Legend"}
                    >
                      {isSec && isUnlocked && (
                        <span className="absolute -top-1.5 -right-0.5 uppercase font-mono font-black text-[6px] bg-yellow-400 text-slate-950 px-1 border border-slate-950 rounded-full shadow-sm z-10 animate-pulse">RARE</span>
                      )}

                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center border overflow-hidden relative p-0.5 transition-all ${
                          isUnlocked 
                            ? 'bg-white border-slate-200 group-hover:scale-105'
                            : 'bg-slate-100 border-none'
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
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>

                      <div className="text-center w-full min-w-0">
                        <span className={`text-[9px] font-mono font-extrabold block truncate leading-tight uppercase tracking-wide ${isUnlocked ? 'text-slate-950' : 'text-slate-400'}`}>
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
              <div className="mt-4 bg-amber-50 border-2 border-slate-950 p-4 rounded-xl flex items-center justify-between gap-3 text-xs flex-wrap">
                <p className="text-slate-700 leading-normal text-[10.5px] max-w-[280px]">
                  Missing rare stadium gods (e.g., <strong className="text-amber-600">Rayquaza, Mew, Arceus</strong>)? Put your luck to the test and unwrap mystery packs!
                </p>
                <button
                  onClick={() => {
                    setBoosterPackActive(true);
                    audio.playSelect();
                  }}
                  className="bg-yellow-405 text-slate-950 hover:bg-yellow-500 font-display font-black text-xs px-4 py-2.5 rounded-lg border-2 border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all shrink-0 cursor-pointer uppercase tracking-wider"
                >
                  Unrip Booster 🎁
                </button>
              </div>
            </div>

            {/* EXPANDED INTERACTIVE PREVIEW */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-350 p-4 rounded-2xl relative min-h-[350px]">
              
              <div className="absolute top-2 bg-amber-201 bg-amber-100 border-2 border-slate-950 text-slate-950 text-[8px] font-mono font-black tracking-widest px-3 py-1 rounded-full uppercase leading-none z-10 shadow-sm animate-pulse">
                CARD DECK VISUALIZER ✦
              </div>

              <div className="w-full flex justify-center mt-6">
                <PokemonCard pokemon={albumSelected} label="PREVIEW CARD" badgeColor="bg-amber-400 text-slate-950 border-2 border-slate-950 font-display font-black" />
              </div>

              <div className="mt-4 bg-white border-2 border-slate-350 p-3.5 rounded-xl w-full text-left shadow-sm">
                <div className="text-[9px] font-mono font-black text-slate-705 uppercase tracking-widest leading-none">CHARACTER BIO & ANCESTRY:</div>
                <p className="text-[11px] text-slate-700 leading-relaxed mt-2 text-justify">
                  {albumSelected.description}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* DETAILED POKÉMON ABILITIES TAB */}
      {activeTab === 'abilities' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col gap-5 animate-fade-in relative text-slate-950 bg-white">
          
          <div className="border-b-2 border-slate-200 pb-4">
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500 animate-pulse shrink-0" /> STADIUM ABILITIES & CHARACTER PASSIVES
            </h2>
            <p className="text-xs text-slate-600 font-normal mt-1 leading-normal">
              Every card inherits an active perk and secondary element modifier, completely defining their defense parameters in live combat!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
            {allAlbumPokemons.map((poke) => {
              const isSec = poke.isSecret === true;
              return (
                <div 
                  key={poke.id} 
                  className={`p-4 rounded-xl border-2 flex gap-4 transition-all hover:bg-slate-50 relative ${
                    isSec 
                      ? 'bg-yellow-50 border-yellow-300 shadow-[2px_2px_0px_#000]' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {isSec && (
                    <span className="absolute top-2 right-2.5 text-[7px] font-mono font-black bg-yellow-405 border border-slate-950 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">SECRET</span>
                  )}

                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-300 bg-white"
                  >
                    <img src={poke.imageUrl} alt={poke.name} className="w-8 h-8 object-contain filter drop-shadow" referrerPolicy="no-referrer" />
                  </div>

                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-xs font-display font-black text-slate-950 flex items-center gap-2 leading-tight uppercase">
                      {poke.name}
                      <span className="text-[8px] font-mono text-purple-705 font-black bg-purple-50 border border-purple-250 px-2 py-0.5 rounded-full leading-none shrink-0 uppercase tracking-widest">
                        {poke.abilityName || 'Passive Aura'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-600 leading-normal mt-1.5 font-medium">
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
