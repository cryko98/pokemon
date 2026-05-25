import React, { useState, useEffect } from 'react';
import { POKEMONS, BOOSTER_SECRET_POKEMONS } from '../data';
import { PokemonCharacter } from '../types';
import { audio } from '../utils/audio';
import PokemonCard from './PokemonCard';
import PokeBall from './PokeBall';
import { Sparkles, RefreshCw, Landmark, ShieldCheck, X, Award, Zap } from 'lucide-react';

const BOOSTER_POOL = [...POKEMONS, ...BOOSTER_SECRET_POKEMONS];

interface BoosterPackProps {
  onClose: () => void;
  onAccept: (pokemon: PokemonCharacter) => void;
}

export default function BoosterPack({ onClose, onAccept }: BoosterPackProps) {
  const [step, setStep] = useState<'closed' | 'ripping' | 'revealed'>('closed');
  const [revealedPokemon, setRevealedPokemon] = useState<PokemonCharacter | null>(null);
  const [shaking, setShaking] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; scale: number; speedY: number; speedX: number }[]>([]);

  // Sound triggering helper
  const playSelectSound = () => {
    audio.playSelect();
  };

  const startRipping = () => {
    if (step !== 'closed') return;
    audio.playUltimate(); // Dynamic charging build sound
    setShaking(true);
    setStep('ripping');

    // Create energetic charging sparkles
    const chargeParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: Math.random() + i,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      color: ['#FACC15', '#EF4444', '#38BDF8', '#C084FC', '#F472B6'][Math.floor(Math.random() * 5)],
      scale: 0.5 + Math.random() * 1.5,
      speedY: -1 - Math.random() * 3,
      speedX: (Math.random() - 0.5) * 4,
    }));
    setParticles(chargeParticles);

    // Timed rip-opening sequence
    setTimeout(() => {
      setShaking(false);
      audio.playWin(); // Glorious victory fanfare sound!
      
      // Randomly choose a Pokemon from the enriched booster pool (standard + secret exclusives!)
      const randomIndex = Math.floor(Math.random() * BOOSTER_POOL.length);
      const chosen = BOOSTER_POOL[randomIndex];
      
      // Persist unlocked secret card in local storage
      if (chosen.isSecret) {
        try {
          const unlocked = JSON.parse(localStorage.getItem('unlocked_secrets') || '[]');
          if (!unlocked.includes(chosen.id)) {
            unlocked.push(chosen.id);
            localStorage.setItem('unlocked_secrets', JSON.stringify(unlocked));
          }
        } catch (err) {
          console.error("Local storage sync error:", err);
        }
      }

      setRevealedPokemon(chosen);
      setStep('revealed');

      // Explode booster pack confetti / star particles!
      const explodeParticles = Array.from({ length: 45 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 6;
        return {
          id: Math.random() + i,
          x: 50,
          y: 45,
          color: ['#FACC15', '#EF4444', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 6)],
          scale: 0.6 + Math.random() * 2.0,
          speedY: Math.sin(angle) * velocity,
          speedX: Math.cos(angle) * velocity,
        };
      });
      setParticles(explodeParticles);
    }, 1200);
  };

  // Particle tracking update thread
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.speedX * 0.5,
            y: p.y + p.speedY * 0.5 + 0.1, // custom float physics with minor grav
            scale: Math.max(0, p.scale - 0.035),
          }))
          .filter((p) => p.scale > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  const resetPack = () => {
    audio.playSelect();
    setStep('closed');
    setRevealedPokemon(null);
    setParticles([]);
    setShaking(false);
  };

  const acceptFighter = () => {
    if (!revealedPokemon) return;
    audio.playBattleStart();
    onAccept(revealedPokemon);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 overflow-hidden backdrop-blur-md animate-fade-in select-none">
      
      {/* Dynamic Backplate Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Grid line matrix aesthetic overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* Action Exit button top-right */}
      <button 
        onClick={() => {
          playSelectSound();
          onClose();
        }}
        className="absolute top-5 right-5 p-3 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all z-50 cursor-pointer shadow"
        title="Close Mystery Pack Overlay"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Container Card Box */}
      <div className="relative w-full max-w-lg flex flex-col items-center">
        
        {/* --- STEP 1: CLOSED PACK WRAPPER VIEW --- */}
        {step === 'closed' && (
          <div className="flex flex-col items-center">
            
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1 bg-yellow-400 border-2 border-black text-slate-950 text-xs font-cartoon px-3.5 py-1 rounded-full uppercase tracking-wider mb-2.5 shadow-sm">
                🎁 STADIUM TOURNAMENT MYSTERY
              </span>
              <h2 className="text-3xl font-cartoon text-yellow-400 uppercase tracking-wide drop-shadow-[2px_2px_0_#000]">
                LEGENDARY BOOSTER PACK
              </h2>
              <p className="text-xs font-semibold text-slate-300 mt-1.5 max-w-xs mx-auto">
                Rip open the booster foil, claim your randomized pocket fighter, and venture directly into live combat!
              </p>
            </div>

            {/* Booster foil wrapping render */}
            <div 
              onClick={startRipping}
              className={`relative w-[240px] h-[350px] bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 rounded-2xl p-5 select-none transition-all duration-300 hover:scale-105 cartoon-border cartoon-shadow cursor-pointer ${
                shaking ? 'animate-[bounce_0.2s_infinite]' : 'hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]'
              }`}
            >
              {/* Foil reflective light band */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-out pointer-events-none" />

              {/* Decorative crimped jagged top/bottom booster rims */}
              <div className="absolute top-0 inset-x-0 h-4 bg-amber-500/10 border-b-2 border-dashed border-black flex justify-center items-center gap-0.5 pointer-events-none">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-2.5 bg-yellow-400 border-r border-black" />
                ))}
              </div>

              <div className="absolute bottom-0 inset-x-0 h-4 bg-amber-500/10 border-t-2 border-dashed border-black flex justify-center items-center gap-0.5 pointer-events-none">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-2.5 bg-yellow-400 border-r border-black" />
                ))}
              </div>

              {/* Pack Content Header */}
              <div className="text-center pt-3.5 z-10">
                <div className="text-[9px] font-cartoon text-yellow-400 tracking-wider uppercase mb-0.5">FIGHTING ARENA</div>
                <div className="text-xs font-black text-white uppercase italic tracking-wider leading-none font-retro">T. C. G. EDITION</div>
                <div className="w-8 h-1 bg-red-500 mx-auto mt-1.5 rounded-full border border-black" />
              </div>

              {/* Pack Foil Illustration central brand logotype */}
              <div className="flex-1 flex flex-col items-center justify-center relative my-4">
                {/* Radial glow backing */}
                <div className="absolute w-28 h-28 bg-amber-500/15 rounded-full blur-xl pointer-events-none animate-pulse" />
                
                <div className="z-10 transition-transform group-hover:scale-110 duration-500">
                  <PokeBall className="w-16 h-16" type="master" animate={false} />
                </div>
                
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-3">Booster Grade Foil</span>
                <span className="text-[10px] font-cartoon text-yellow-400 tracking-tight mt-1">TAP OR CLICK TO OPEN</span>
              </div>

              {/* Footer specs labels */}
              <div className="text-center pb-3 z-10">
                <div className="text-[8.5px] font-mono text-slate-400 font-bold">CONTAINS 1 RANDOM HERO</div>
                <div className="text-[8.5px] font-cartoon text-yellow-300 uppercase tracking-wider mt-1 animate-pulse flex items-center justify-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-300" /> HOLOGRAPHIC GUARANTEED!
                </div>
              </div>
            </div>

            {/* Prompt action button below */}
            <button
              onClick={startRipping}
              className="mt-6 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-700 hover:to-yellow-600 font-cartoon font-black text-xs text-white tracking-widest uppercase transition-all duration-300 transform active:scale-95 border-2 border-black cartoon-shadow cursor-pointer"
            >
              RIP OPEN PACK!
            </button>
          </div>
        )}

        {/* --- STEP 2: RIPPING ACTIVE SEQUENCE VIEW --- */}
        {step === 'ripping' && (
          <div className="flex flex-col items-center">
            {/* Shaking booster pack tearing up */}
            <div className="relative w-[240px] h-[350px] bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 rounded-2xl animate-[bounce_0.12s_infinite] flex flex-col items-center justify-center overflow-hidden cartoon-border cartoon-shadow">
              
              {/* Splitting slash bar */}
              <div className="absolute h-full w-2 bg-yellow-450 rotate-[20deg] animate-pulse shadow-[0_0_30px_#facc15]" />
              
              <PokeBall className="w-14 h-14 animate-spin scale-110" type="master" animate={false} />
              
              <span className="text-xs font-cartoon text-yellow-400 tracking-wider mt-5 animate-pulse">RIPPING BOOSTER PACK...</span>
              <div className="absolute inset-0 bg-white/5 animate-flash-interval pointer-events-none" />
            </div>

            <p className="text-xs font-semibold text-slate-400 mt-6 animate-pulse">Unlocking holographic secrets...</p>
          </div>
        )}

        {/* --- STEP 3: REVEALED CHARACTER STAGE VIEW --- */}
        {step === 'revealed' && revealedPokemon && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            
            <div className="text-center mb-4.5">
              {revealedPokemon.isSecret ? (
                <span className="inline-flex items-center gap-1.5 bg-yellow-400 border-2 border-black text-slate-950 text-xs font-cartoon px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 animate-bounce shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-spin" /> SECRET LEAGUE RARE!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-green-500/10 border-2 border-green-500 text-green-400 text-xs font-cartoon px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" /> UNLOCKED HOLOGRAPHIC!
                </span>
              )}
              <h2 className={`text-3xl font-cartoon text-white uppercase ${revealedPokemon.isSecret ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-red-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]' : ''}`}>
                {revealedPokemon.name} ACQUIRED!
              </h2>
              <p className="text-xs font-semibold text-slate-350 max-w-sm mx-auto leading-relaxed mt-1">
                {revealedPokemon.isSecret 
                  ? "Unbelievable! You've uncovered an ultra-rare Booster-Exclusive Secret Legend! Test their passive powers in stadium combat!"
                  : "You have drawn a powerful fighter! Proceed to physical fight directly, or roll again by open mystery booster pack!"}
              </p>
            </div>

            {/* Revealed 3D Holographic Trading Card Presentation Wrapper */}
            <div className="my-3 flex justify-center w-full relative">
              
              {/* Orbiting visual glows */}
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10 animate-spin duration-15000">
                <div className={`w-56 h-76 rounded-xl border-2 border-dashed scale-110 ${revealedPokemon.isSecret ? 'border-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.25)]' : 'border-red-500/20'}`} />
              </div>

              {/* Sparkle effects radiating */}
              <div className="absolute top-1/4 left-1/4 animate-bounce">
                <Sparkles className="w-5 h-5 text-yellow-500 blur-[0.5px]" />
              </div>
              <div className="absolute bottom-1/4 right-1/4 animate-ping duration-1500 text-teal-400 text-base font-bold">
                ✦
              </div>

              {/* The Pokemon trading card component */}
              <PokemonCard 
                pokemon={revealedPokemon} 
                label={revealedPokemon.isSecret ? "SECRET LEGEND" : "CHOSEN WARRIOR"} 
                badgeColor={revealedPokemon.isSecret 
                  ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-red-550 text-slate-950 font-cartoon border-2 border-black tracking-wider shadow-sm" 
                  : "bg-yellow-400 text-slate-950 font-cartoon border-2 border-black tracking-wider shadow-sm"} 
              />
            </div>

            {/* Accept / Re-roll Booster Action Hub grid */}
            <div className="w-full max-w-[290px] flex flex-col gap-2.5 mt-4 z-10 relative">
              <button
                onClick={acceptFighter}
                className="w-full bg-[#22c55e] hover:bg-green-600 text-white font-cartoon font-black text-xs py-3.5 rounded-2xl border-2 border-black cartoon-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4.5 h-4.5 text-white" /> Accept & Fight!
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={resetPack}
                  className="bg-white/10 hover:bg-white/20 text-white border-2 border-black font-cartoon font-black text-[10px] py-3 rounded-xl transition uppercase cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Re-roll
                </button>

                <button
                  onClick={() => {
                    playSelectSound();
                    onClose();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border-2 border-black font-cartoon font-black text-[10px] py-3 rounded-xl transition uppercase cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 inline mr-1" /> Close
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Ripping Sparks & Confetti particles layers */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(-50%, -50%) scale(${p.scale})`,
              backgroundColor: p.color,
              width: `${6 + p.scale * 4}px`,
              height: `${6 + p.scale * 4}px`,
              boxShadow: `0 0 8px ${p.color}`,
              opacity: p.scale,
              transition: 'opacity 0.05s ease-out',
            }}
          />
        ))}
      </div>

    </div>
  );
}
