import React, { useState, useEffect } from 'react';
import { POKEMONS } from '../data';
import { PokemonCharacter } from '../types';
import { audio } from '../utils/audio';
import PokemonCard from './PokemonCard';
import PokeBall from './PokeBall';
import { Sparkles, RefreshCw, Landmark, ShieldCheck, X, Award, Zap } from 'lucide-react';

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
      
      // Randomly choose a Pokemon
      const randomIndex = Math.floor(Math.random() * POKEMONS.length);
      const chosen = POKEMONS[randomIndex];
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
              <span className="inline-flex items-center gap-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-mono font-black border border-yellow-400/20 px-3.5 py-1 rounded-full uppercase tracking-wider mb-2.5 animate-pulse">
                🎁 STADIUM TOURNAMENT MYSTERY
              </span>
              <h2 className="text-2xl md:text-3xl font-orbitron font-black text-white italic tracking-tight uppercase leading-none drop-shadow">
                LEGENDARY BOOSTER PACK
              </h2>
              <p className="text-[11px] font-mono text-slate-400 mt-1.5 max-w-xs mx-auto">
                Rip open the booster foil, claim your randomized pocket fighter, and venture directly into live combat!
              </p>
            </div>

            {/* Booster foil wrapping render */}
            <div 
              onClick={startRipping}
              className={`relative w-[240px] h-[350px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-4 border-amber-400/80 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden cursor-pointer group flex flex-col justify-between p-4.5 select-none transition-all duration-300 hover:scale-105 ${
                shaking ? 'animate-[bounce_0.2s_infinite]' : 'hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]'
              }`}
            >
              {/* Foil reflective light band */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-out pointer-events-none" />

              {/* Decorative crimped jagged top/bottom booster rims */}
              <div className="absolute top-0 inset-x-0 h-4 bg-amber-500/10 border-b border-dashed border-amber-400/30 flex justify-center items-center gap-0.5 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="w-1 h-2 bg-amber-400/20 rounded-b-sm" />
                ))}
              </div>

              <div className="absolute bottom-0 inset-x-0 h-4 bg-amber-500/10 border-t border-dashed border-amber-400/30 flex justify-center items-center gap-0.5 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="w-1 h-2 bg-amber-400/20 rounded-t-sm" />
                ))}
              </div>

              {/* Pack Content Header */}
              <div className="text-center pt-3.5 z-10">
                <div className="text-[8px] font-mono font-black text-amber-400 tracking-widest uppercase mb-0.5">FIGHTING ARENA</div>
                <div className="text-sm font-black text-white uppercase italic tracking-tighter leading-none font-orbitron">T. C. G. EDITION</div>
                <div className="w-8 h-1 bg-red-500 mx-auto mt-1.5 rounded-full" />
              </div>

              {/* Pack Foil Illustration central brand logotype */}
              <div className="flex-1 flex flex-col items-center justify-center relative my-4">
                {/* Radial glow backing */}
                <div className="absolute w-28 h-28 bg-amber-500/15 rounded-full blur-xl pointer-events-none animate-pulse" />
                
                <div className="z-10 transition-transform group-hover:scale-110 duration-500">
                  <PokeBall className="w-16 h-16" type="master" animate={false} />
                </div>
                
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-3">Booster Grade Foil</span>
                <span className="text-[7.5px] font-mono text-amber-500 font-extrabold tracking-tight">TAP OR COLLIDE TO OPEN</span>
              </div>

              {/* Footer specs labels */}
              <div className="text-center pb-3 z-10">
                <div className="text-[8.5px] font-mono text-slate-500">CONTAINS 1 RANDOM HERO</div>
                <div className="text-[7px] font-mono text-amber-400 uppercase font-black tracking-widest mt-0.5 animate-pulse flex items-center justify-center gap-1">
                  <Sparkles className="w-2 h-2" /> HOLOGRAPHIC GUARANTEED!
                </div>
              </div>
            </div>

            {/* Prompt action button below */}
            <button
              onClick={startRipping}
              className="mt-6 px-10 py-3 rounded-xl bg-gradient-to-r from-red-650 via-amber-500 to-yellow-500 hover:from-red-700 hover:to-yellow-600 font-orbitron font-extrabold text-[11px] text-white tracking-widest uppercase transition-all duration-300 transform active:scale-95 shadow-[0_0_18px_rgba(245,158,11,0.25)] border border-yellow-400/20 cursor-pointer"
            >
              RIP OPEN PACK!
            </button>
          </div>
        )}

        {/* --- STEP 2: RIPPING ACTIVE SEQUENCE VIEW --- */}
        {step === 'ripping' && (
          <div className="flex flex-col items-center">
            {/* Shaking booster pack tearing up */}
            <div className="relative w-[240px] h-[350px] bg-gradient-to-b from-slate-900 to-indigo-950 border-4 border-amber-400 rounded-2xl animate-[bounce_0.12s_infinite] shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              
              {/* Splitting slash bar */}
              <div className="absolute h-full w-2 bg-yellow-400/40 rotate-[20deg] animate-pulse shadow-[0_0_30px_#facc15]" />
              
              <PokeBall className="w-14 h-14 animate-spin scale-110" type="master" animate={false} />
              
              <span className="text-xs font-mono font-black text-amber-400 tracking-widest mt-5 animate-pulse">RIPPING BOOSTER PACK...</span>
              <div className="absolute inset-0 bg-white/5 animate-flash-interval pointer-events-none" />
            </div>

            <p className="text-xs font-mono text-slate-400 mt-6 animate-pulse">Unlocking holographic secrets...</p>
          </div>
        )}

        {/* --- STEP 3: REVEALED CHARACTER STAGE VIEW --- */}
        {step === 'revealed' && revealedPokemon && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            
            <div className="text-center mb-4.5">
              <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 text-[10px] font-mono font-black border border-green-500/20 px-3.5 py-1 rounded-full uppercase tracking-widest mb-2 animate-bounce">
                <Sparkles className="w-3 h-3 text-yellow-400 animate-spin" /> UNLOCKED HOLOGRAPHIC!
              </span>
              <h2 className="text-3xl font-orbitron font-black text-white italic tracking-tight uppercase">
                {revealedPokemon.name} ACQUIRED!
              </h2>
              <p className="text-[11px] font-sans text-slate-400 max-w-sm mx-auto leading-relaxed">
                You have drawn a rare card! Proceed to stadium fight directly, or try your luck again by ripping another legendary package!
              </p>
            </div>

            {/* Revealed 3D Holographic Trading Card Presentation Wrapper */}
            <div className="my-3 flex justify-center w-full relative">
              
              {/* Orbiting visual glows */}
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10 animate-spin duration-15000">
                <div className="w-56 h-76 rounded-xl border border-dashed border-red-500/20 scale-110" />
              </div>

              {/* Sparkle effects radiating */}
              <div className="absolute top-1/4 left-1/4 animate-bounce">
                <Sparkles className="w-5 h-5 text-yellow-500 blur-[0.5px]" />
              </div>
              <div className="absolute bottom-1/4 right-1/4 animate-ping duration-1500 text-teal-400">
                ✦
              </div>

              {/* The Pokemon trading card component */}
              <PokemonCard pokemon={revealedPokemon} label="CHOSEN WARRIOR" badgeColor="bg-yellow-400 text-slate-950 font-black animate-pulse border-yellow-500" />
            </div>

            {/* Accept / Re-roll Booster Action Hub grid */}
            <div className="w-full max-w-[290px] flex flex-col gap-2 mt-4 z-10 relative">
              <button
                onClick={acceptFighter}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-orbitron font-extrabold text-xs tracking-wider py-3.5 rounded-xl uppercase transition-all duration-300 transform active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.3)] border border-green-400/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" /> Accept & Fight!
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={resetPack}
                  className="bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white border border-white/5 hover:border-white/10 font-mono font-bold text-[9px] py-2.5 rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Roll Again
                </button>

                <button
                  onClick={() => {
                    playSelectSound();
                    onClose();
                  }}
                  className="bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white border border-white/5 hover:border-white/10 font-mono font-bold text-[9px] py-2.5 rounded-lg transition uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Back
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
