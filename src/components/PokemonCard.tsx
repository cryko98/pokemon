import React from 'react';
import { PokemonCharacter } from '../types';
import { Zap, Flame, Shield, Sparkles, Star, Award, Heart } from 'lucide-react';

interface PokemonCardProps {
  pokemon: PokemonCharacter;
  label?: string;
  badgeColor?: string;
  isCpu?: boolean;
}

export default function PokemonCard({ pokemon, label, badgeColor = 'bg-amber-400 text-slate-950 border-amber-500', isCpu = false }: PokemonCardProps) {
  // Determine energy symbol background based on Pokemon element type
  const getEnergyBadge = (type: string) => {
    if (type.includes('Electric')) return <span className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm flex items-center justify-center text-[8px] font-mono font-black text-slate-950">⚡</span>;
    if (type.includes('Fire')) return <span className="w-4 h-4 rounded-full bg-orange-500 border border-orange-700 shadow-sm flex items-center justify-center text-[8px] font-mono font-black text-white">🔥</span>;
    if (type.includes('Water')) return <span className="w-4 h-4 rounded-full bg-blue-500 border border-blue-700 shadow-sm flex items-center justify-center text-[8px] font-mono font-black text-white">💧</span>;
    if (type.includes('Ghost')) return <span className="w-4 h-4 rounded-full bg-purple-700 border border-purple-900 shadow-sm flex items-center justify-center text-[8px] font-mono font-black text-white">👁️</span>;
    if (type.includes('Fighting')) return <span className="w-4 h-4 rounded-full bg-red-600 border border-red-800 shadow-sm flex items-center justify-center text-[8px] font-mono font-black text-white">👊</span>;
    return <span className="w-4 h-4 rounded-full bg-slate-400 border border-slate-600 shadow-sm flex items-center justify-center text-[8px] font-mono font-black text-slate-950">⭐</span>;
  };

  // Determine card base theme styling
  const getCardTheme = (id: string) => {
    switch (id) {
      case 'pikachu':
        return {
          border: 'border-[#EAB308]',
          outerBg: 'bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500',
          innerBg: 'bg-slate-900/90 text-yellow-300',
          gradientBg: 'from-amber-200 via-yellow-100 to-yellow-300',
          elementSymbol: '⚡',
          tcgColor: 'text-yellow-600',
          typeLabel: 'Lightning',
          weakness: 'Grass',
          resistance: 'Metal',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-white/20 to-transparent',
        };
      case 'charizard':
        return {
          border: 'border-[#EA580C]',
          outerBg: 'bg-gradient-to-b from-orange-400 via-orange-500 to-red-600',
          innerBg: 'bg-slate-900/90 text-orange-400',
          gradientBg: 'from-orange-300 via-orange-100 to-red-300',
          elementSymbol: '🔥',
          tcgColor: 'text-red-600',
          typeLabel: 'Fire / Flying',
          weakness: 'Water',
          resistance: 'Fighting',
          retreat: 3,
          foilLine: 'bg-gradient-to-r from-transparent via-orange-200/30 to-transparent',
        };
      case 'blastoise':
        return {
          border: 'border-[#1D4ED8]',
          outerBg: 'bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600',
          innerBg: 'bg-slate-900/90 text-blue-300',
          gradientBg: 'from-blue-200 via-sky-100 to-indigo-300',
          elementSymbol: '💧',
          tcgColor: 'text-blue-600',
          typeLabel: 'Water',
          weakness: 'Lightning',
          resistance: 'Fire',
          retreat: 4,
          foilLine: 'bg-gradient-to-r from-transparent via-blue-200/30 to-transparent',
        };
      case 'gengar':
        return {
          border: 'border-[#6B21A8]',
          outerBg: 'bg-gradient-to-b from-purple-500 via-purple-700 to-indigo-950',
          innerBg: 'bg-slate-900/90 text-purple-400',
          gradientBg: 'from-purple-300 via-indigo-100 to-purple-400',
          elementSymbol: '👁️',
          tcgColor: 'text-purple-600',
          typeLabel: 'Ghost / Poison',
          weakness: 'Dark',
          resistance: 'Fighting',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-purple-200/30 to-transparent',
        };
      case 'lucario':
        return {
          border: 'border-[#0891B2]',
          outerBg: 'bg-gradient-to-b from-cyan-400 via-cyan-600 to-slate-800',
          innerBg: 'bg-slate-900/90 text-cyan-400',
          gradientBg: 'from-cyan-200 via-slate-100 to-cyan-300',
          elementSymbol: '👊',
          tcgColor: 'text-cyan-600',
          typeLabel: 'Fighting / Steel',
          weakness: 'Psychic',
          resistance: 'Metal',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent',
        };
      case 'greninja':
        return {
          border: 'border-blue-900',
          outerBg: 'bg-gradient-to-b from-blue-700 via-blue-900 to-indigo-950',
          innerBg: 'bg-slate-900/90 text-blue-400',
          gradientBg: 'from-blue-900 via-cyan-800 to-blue-950',
          elementSymbol: '💧',
          tcgColor: 'text-blue-800',
          typeLabel: 'Water / Dark',
          weakness: 'Lightning',
          resistance: 'Psychic',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent',
        };
      case 'mewtwo':
        return {
          border: 'border-[#7C3AED]',
          outerBg: 'bg-gradient-to-b from-purple-400 via-indigo-500 to-purple-800',
          innerBg: 'bg-slate-900/90 text-purple-300',
          gradientBg: 'from-purple-200 via-indigo-100 to-purple-300',
          elementSymbol: '👁️',
          tcgColor: 'text-purple-600',
          typeLabel: 'Psychic',
          weakness: 'Dark',
          resistance: 'Fighting',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-pink-300/30 to-transparent',
        };
      case 'snorlax':
        return {
          border: 'border-slate-600',
          outerBg: 'bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700',
          innerBg: 'bg-slate-900/90 text-slate-300',
          gradientBg: 'from-slate-300 via-slate-100 to-slate-400',
          elementSymbol: '⭐',
          tcgColor: 'text-slate-600',
          typeLabel: 'Normal',
          weakness: 'Fighting',
          resistance: 'None',
          retreat: 4,
          foilLine: 'bg-gradient-to-r from-transparent via-slate-100/30 to-transparent',
        };
      default:
        return {
          border: 'border-slate-500',
          outerBg: 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500',
          innerBg: 'bg-slate-900/90 text-slate-300',
          gradientBg: 'from-slate-200 via-slate-100 to-slate-300',
          elementSymbol: '⭐',
          tcgColor: 'text-slate-600',
          typeLabel: 'Colorless',
          weakness: 'None',
          resistance: 'None',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-white/20 to-transparent',
        };
    }
  };

  const theme = getCardTheme(pokemon.id);

  return (
    <div className={`w-full max-w-[290px] mx-auto rounded-xl p-2.5 pb-3 border-4 ${theme.border} ${theme.outerBg} shadow-2xl relative overflow-hidden flex flex-col justify-between text-slate-950 select-none group transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]`}>
      {/* Label Badge Overlay (Player 1 / CPU Opponent) */}
      {label && (
        <div className={`absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-black px-3.5 py-0.5 rounded-b-md shadow border-x border-b border-black/10 uppercase tracking-widest z-20 ${badgeColor} select-none`}>
          {label}
        </div>
      )}

      {/* Holofoil shine overlay */}
      <div className={`absolute inset-0 translate-x-[-120%] rotate-12 ${theme.foilLine} w-[250%] h-[200%] pointer-events-none group-hover:translate-x-[100%] transition-transform duration-1000 ease-out z-10 opacity-70`} />

      <div className="flex flex-col gap-2 relative z-10 mt-1">
        {/* Card Header */}
        <div className="flex justify-between items-center px-1 border-b border-black/15 pb-1">
          <div className="flex flex-col line-height-tight">
            <span className="text-[7px] font-mono font-black text-black/60 uppercase tracking-wider">Basic Pokémon</span>
            <span className="text-sm font-sans font-black uppercase text-black italic tracking-tight">{pokemon.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-extrabold text-red-700 font-mono">HP</span>
            <span className="text-base font-black font-mono text-red-700 leading-none">{pokemon.maxHp}</span>
            <span className="text-sm -mt-0.5 inline-block">{theme.elementSymbol}</span>
          </div>
        </div>

        {/* Card Illustration Framed Area */}
        <div className={`w-full aspect-[4/3] rounded-lg border-2 border-[#D97706] bg-gradient-to-b ${theme.gradientBg} relative p-1.5 shadow-inner overflow-hidden flex items-center justify-center`}>
          {/* Decorative artwork sparkles */}
          <div className="absolute inset-0 bg-radial-gradient-dust pointer-events-none opacity-25" />
          
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            <Sparkles className="w-3.5 h-3.5 text-white animate-spin opacity-50 duration-5000" />
          </div>

          {/* Dynamic Poke Avatar Ring & Real Image representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Glow backing circle */}
            <div 
              className="w-20 h-20 rounded-full opacity-50 blur-lg animate-pulse absolute"
              style={{ backgroundColor: pokemon.color }}
            />
            
            {/* The real, high-res Pokémon artwork */}
            <img 
              src={pokemon.imageUrl} 
              alt={pokemon.name} 
              className="w-[110px] h-[110px] object-contain filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)] z-10 transform group-hover:scale-115 group-hover:-rotate-2 transition-all duration-500 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            
            {/* Element watermark badge */}
            <span className="absolute bottom-1.5 right-2 text-sm select-none opacity-30 font-mono font-black">{theme.elementSymbol}</span>
          </div>

          {/* Holographic light bands */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
        </div>

        {/* Small stats description tape */}
        <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded px-1.5 py-0.5 text-[7.5px] font-mono text-amber-950 flex justify-between items-center font-semibold shadow-sm uppercase tracking-wide">
          <span>{theme.typeLabel} Pokémon</span>
          <span>Attack: {pokemon.attack}</span>
          <span>Speed: {pokemon.speed}</span>
        </div>

        {/* Attacks list and move abilities */}
        <div className="flex flex-col gap-1.5 py-1 text-slate-900">
          
          {/* Quick attack row */}
          <div className="flex items-start justify-between border-b border-black/5 pb-1">
            <div className="flex items-start gap-1 max-w-[85%]">
              <div className="flex gap-0.5 shrink-0 mt-0.5">
                {getEnergyBadge(pokemon.type)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-black font-sans leading-none block">{pokemon.moves.quick.name}</span>
                <span className="text-[7.5px] leading-tight text-slate-800 line-clamp-1 block">A fast, low-cooldown striking blow.</span>
              </div>
            </div>
            <span className="text-[10px] font-black font-mono text-black shrink-0">{pokemon.moves.quick.damage}</span>
          </div>

          {/* Heavy attack row */}
          <div className="flex items-start justify-between border-b border-black/5 pb-1">
            <div className="flex items-start gap-1 max-w-[85%]">
              <div className="flex gap-0.5 shrink-0 mt-0.5">
                {getEnergyBadge(pokemon.type)}
                {getEnergyBadge('Normal')}
              </div>
              <div>
                <span className="text-[10px] font-bold text-black font-sans leading-none block">{pokemon.moves.heavy.name}</span>
                <span className="text-[7.5px] leading-tight text-slate-800 line-clamp-1 block">A high impact strike that pushes the foe back.</span>
              </div>
            </div>
            <span className="text-[10px] font-black font-mono text-black shrink-0">{pokemon.moves.heavy.damage}</span>
          </div>

          {/* Special action / Projectile row */}
          <div className="flex items-start justify-between border-b border-black/10 pb-1">
            <div className="flex items-start gap-1 max-w-[85%]">
              <div className="flex gap-0.5 shrink-0 mt-0.5">
                {getEnergyBadge(pokemon.type)}
                {getEnergyBadge(pokemon.type)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-black font-sans leading-none block flex items-center gap-1.5">
                  {pokemon.moves.special.name}
                  <span className="text-[7px] text-blue-800 bg-blue-100 border border-blue-400 font-mono px-1 rounded-sm leading-none shrink-0 uppercase tracking-widest">20 EN</span>
                </span>
                <span className="text-[7.5px] leading-tight text-slate-800 line-clamp-1 block">Spawns a dynamic ranged energy bullet.</span>
              </div>
            </div>
            <span className="text-[10px] font-black font-mono text-black shrink-0">{pokemon.moves.special.damage}</span>
          </div>

          {/* Ultimate Move Box */}
          <div className="bg-amber-100/70 border border-amber-600/35 rounded-lg p-1 text-[9px] shadow-sm">
            <div className="flex justify-between items-center leading-none">
              <span className="font-sans font-black text-amber-950 uppercase flex items-center gap-1 tracking-tight">
                <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-bounce" /> {pokemon.moves.ultimate.name}
              </span>
              <span className="font-mono text-[7px] font-black text-amber-800 animate-pulse bg-amber-200/50 px-1 rounded-sm border border-amber-500/20 uppercase tracking-wider">100% ULTI</span>
              <span className="font-mono font-black text-orange-700 leading-none">{pokemon.moves.ultimate.damage}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Card authentic footer stats: Weakness, Resistance, Retreat Cost */}
      <div className="border-t border-black/25 pt-1.5 flex justify-between text-[7px] font-mono leading-none tracking-tight text-black/70 font-semibold px-1">
        <div>
          <span>weakness</span>
          <span className="block font-bold text-red-800 text-[8px] mt-0.5 uppercase">{theme.weakness}</span>
        </div>
        <div>
          <span>resistance</span>
          <span className="block font-bold text-blue-800 text-[8px] mt-0.5 uppercase">{theme.resistance}</span>
        </div>
        <div>
          <span>retreat cost</span>
          <span className="flex gap-0.5 mt-0.5">
            {Array.from({ length: theme.retreat }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500/50 border border-slate-700/60 block" />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
