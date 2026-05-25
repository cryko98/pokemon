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
    if (type.includes('Electric')) return <span className="w-4 h-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_8px_rgba(234,179,8,0.2)] flex items-center justify-center text-[9px] font-mono font-bold text-yellow-400">⚡</span>;
    if (type.includes('Fire')) return <span className="w-4 h-4 rounded-full bg-red-500/10 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)] flex items-center justify-center text-[9px] font-mono font-bold text-red-400">🔥</span>;
    if (type.includes('Water')) return <span className="w-4 h-4 rounded-full bg-[#1e40af]/30 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)] flex items-center justify-center text-[9px] font-mono font-bold text-blue-400">💧</span>;
    if (type.includes('Ghost')) return <span className="w-4 h-4 rounded-full bg-purple-950/30 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)] flex items-center justify-center text-[9px] font-mono font-bold text-purple-400">👁️</span>;
    if (type.includes('Fighting')) return <span className="w-4 h-4 rounded-full bg-red-950/40 border border-red-650/30 shadow-[0_0_8px_rgba(220,38,38,0.2)] flex items-center justify-center text-[9px] font-mono font-bold text-red-550">👊</span>;
    return <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600 shadow-[0_0_8px_rgba(255,255,255,0.1)] flex items-center justify-center text-[9px] font-mono font-bold text-slate-300">⭐</span>;
  };

  // Determine card base theme styling
  const getCardTheme = (id: string) => {
    switch (id) {
      case 'pikachu':
        return {
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:shadow-[0_0_35px_rgba(234,179,8,0.3)]',
          borderColor: 'border-yellow-500/30 hover:border-yellow-405',
          accentColor: 'text-yellow-400',
          elementSymbol: '⚡',
          typeLabel: 'Lightning',
          weakness: 'Grass',
          resistance: 'Metal',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-yellow-405/20 to-transparent',
        };
      case 'charizard':
        return {
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_35px_rgba(239,68,68,0.3)]',
          borderColor: 'border-orange-500/30 hover:border-orange-505',
          accentColor: 'text-orange-400',
          elementSymbol: '🔥',
          typeLabel: 'Fire / Flying',
          weakness: 'Water',
          resistance: 'Fighting',
          retreat: 3,
          foilLine: 'bg-gradient-to-r from-transparent via-red-500/25 to-transparent',
        };
      case 'blastoise':
        return {
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]',
          borderColor: 'border-blue-500/30 hover:border-blue-405',
          accentColor: 'text-blue-400',
          elementSymbol: '💧',
          typeLabel: 'Water',
          weakness: 'Lightning',
          resistance: 'Fire',
          retreat: 4,
          foilLine: 'bg-gradient-to-r from-transparent via-blue-500/25 to-transparent',
        };
      case 'gengar':
        return {
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]',
          borderColor: 'border-purple-500/30 hover:border-purple-405',
          accentColor: 'text-purple-400',
          elementSymbol: '👁️',
          typeLabel: 'Ghost / Poison',
          weakness: 'Dark',
          resistance: 'Fighting',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-purple-500/25 to-transparent',
        };
      case 'lucario':
        return {
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]',
          borderColor: 'border-cyan-500/30 hover:border-cyan-405',
          accentColor: 'text-cyan-400',
          elementSymbol: '👊',
          typeLabel: 'Fighting / Steel',
          weakness: 'Psychic',
          resistance: 'Metal',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent',
        };
      case 'greninja':
        return {
          glow: 'shadow-[0_0_20px_rgba(29,78,216,0.15)] hover:shadow-[0_0_35px_rgba(29,78,216,0.3)]',
          borderColor: 'border-blue-800/40 hover:border-blue-505',
          accentColor: 'text-blue-400',
          elementSymbol: '💧',
          typeLabel: 'Water / Dark',
          weakness: 'Lightning',
          resistance: 'Psychic',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-sky-400/25 to-transparent',
        };
      case 'mewtwo':
        return {
          glow: 'shadow-[0_0_20px_rgba(124,58,237,0.18)] hover:shadow-[0_0_35px_rgba(124,58,237,0.3)]',
          borderColor: 'border-violet-500/30 hover:border-violet-405',
          accentColor: 'text-violet-400',
          elementSymbol: '👁️',
          typeLabel: 'Psychic',
          weakness: 'Dark',
          resistance: 'Fighting',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-pink-400/25 to-transparent',
        };
      case 'snorlax':
        return {
          glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)] hover:shadow-[0_0_35px_rgba(148,163,184,0.25)]',
          borderColor: 'border-slate-600/30 hover:border-slate-405',
          accentColor: 'text-slate-400',
          elementSymbol: '⭐',
          typeLabel: 'Normal',
          weakness: 'Fighting',
          resistance: 'None',
          retreat: 4,
          foilLine: 'bg-gradient-to-r from-transparent via-slate-400/20 to-transparent',
        };
      default:
        return {
          glow: 'shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_35px_rgba(255,255,255,0.2)]',
          borderColor: 'border-slate-600/30 hover:border-slate-405',
          accentColor: 'text-slate-300',
          elementSymbol: '⭐',
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
    <div className={`w-full max-w-[285px] mx-auto rounded-[24px] p-4 border ${theme.borderColor} ${theme.glow} bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950/100 relative overflow-hidden flex flex-col justify-between text-slate-100 select-none group transition-all duration-300 hover:scale-[1.03]`}>
      
      {/* Label Badge Overlay (Player 1 / CPU Opponent) */}
      {label && (
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-3.5 py-1 rounded-b-xl border-x border-b border-white/5 uppercase tracking-wider z-20 ${badgeColor} select-none shadow-md backdrop-blur-md`}>
          {label}
        </div>
      )}

      {/* Elegant Holofoil glint animation */}
      <div className={`absolute inset-0 translate-x-[-120%] rotate-12 ${theme.foilLine} w-[260%] h-[200%] pointer-events-none group-hover:translate-x-[110%] transition-transform duration-1000 ease-out z-10 opacity-40`} />

      <div className="flex flex-col gap-3 relative z-10 mt-2">
        {/* Card Header */}
        <div className="flex justify-between items-center px-0.5 border-b border-white/5 pb-2">
          <div className="flex flex-col">
            <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest leading-none">Basic Card NFT</span>
            <span className="text-sm font-display font-extrabold uppercase text-slate-100 tracking-wide mt-1.5">{pokemon.name}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9px] font-mono text-rose-500 font-bold">HP</span>
            <span className="text-md font-mono font-black text-rose-500 leading-none">{pokemon.maxHp}</span>
            <span className="text-sm -mt-0.5 inline-block shrink-0">{theme.elementSymbol}</span>
          </div>
        </div>

        {/* Card Illustration Framed Area */}
        <div className="w-full aspect-[4/3] rounded-2xl border border-white/5 bg-gradient-to-b from-slate-950/90 to-slate-900/80 relative p-1.5 shadow-inner overflow-hidden flex items-center justify-center">
          {/* Decorative artwork sparkles */}
          <div className="absolute inset-0 bg-radial-gradient-dust pointer-events-none opacity-20" />
          
          <div className="absolute top-2 right-2 flex gap-1 z-20">
            <Sparkles className="w-3.5 h-3.5 text-white/40 animate-pulse duration-3000" />
          </div>

          {/* Dynamic Poke Avatar Ring & Real Image representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Glow backing circle */}
            <div 
              className="w-24 h-24 rounded-full opacity-20 blur-xl animate-pulse absolute"
              style={{ backgroundColor: pokemon.color }}
            />
            
            {/* The real, high-res artwork */}
            <img 
              src={pokemon.imageUrl} 
              alt={pokemon.name} 
              className="w-[105px] h-[105px] object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] z-10 transform group-hover:scale-110 group-hover:-rotate-1 transition-all duration-500 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            
            {/* Element watermark badge */}
            <span className="absolute bottom-2 right-2 text-md select-none opacity-10 font-mono font-black">{theme.elementSymbol}</span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
        </div>

        {/* Small stats description tape */}
        <div className="bg-slate-950/80 border border-white/5 rounded-xl px-2.5 py-1 text-[8px] font-mono text-slate-400 flex justify-between items-center shadow-inner font-medium uppercase tracking-wider">
          <span className={theme.accentColor}>{theme.typeLabel} Type</span>
          <span className="text-slate-500">•</span>
          <span>Atk: {pokemon.attack}</span>
          <span className="text-slate-500">•</span>
          <span>Spd: {pokemon.speed}</span>
        </div>

        {/* Attacks list and move abilities */}
        <div className="flex flex-col gap-2 py-1 text-slate-300">
          
          {/* Quick attack row */}
          <div className="flex items-start justify-between border-b border-white/5 pb-1">
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="flex gap-0.5 shrink-0 mt-0.5">
                {getEnergyBadge(pokemon.type)}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-200 block font-sans leading-none">{pokemon.moves.quick.name}</span>
                <span className="text-[8px] leading-tight text-slate-500 line-clamp-1 block mt-0.5">Swift striking blow. Cooldown critical.</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-250 mt-0.5">{pokemon.moves.quick.damage}</span>
          </div>

          {/* Heavy attack row */}
          <div className="flex items-start justify-between border-b border-white/5 pb-1">
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="flex gap-0.5 shrink-0 mt-0.5">
                {getEnergyBadge(pokemon.type)}
                {getEnergyBadge('Normal')}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-200 block font-sans leading-none">{pokemon.moves.heavy.name}</span>
                <span className="text-[8px] leading-tight text-slate-500 line-clamp-1 block mt-0.5">High impact kinetic pushback strike.</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-250 mt-0.5">{pokemon.moves.heavy.damage}</span>
          </div>

          {/* Special action / Projectile row */}
          <div className="flex items-start justify-between border-b border-white/5 pb-1">
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="flex gap-0.5 shrink-0 mt-0.5">
                {getEnergyBadge(pokemon.type)}
                {getEnergyBadge(pokemon.type)}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-200 block font-sans leading-none flex items-center gap-1.5">
                  {pokemon.moves.special.name}
                  <span className="text-[7.5px] text-blue-400 bg-blue-500/10 border border-blue-500/30 font-mono px-1 rounded-sm leading-none shrink-0 uppercase tracking-widest">20 EN</span>
                </span>
                <span className="text-[8px] leading-tight text-slate-500 line-clamp-1 block mt-0.5">Spawns ranged energetic bullet sphere.</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-250 mt-0.5">{pokemon.moves.special.damage}</span>
          </div>

          {/* Ultimate Move Box */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/5 rounded-xl p-2.5 mt-0.5 shadow-md">
            <div className="flex justify-between items-center leading-none">
              <span className="font-sans font-bold text-slate-200 uppercase flex items-center gap-1.5 text-[9px] tracking-wider">
                <Star className="w-3 h-3 text-yellow-400 animate-pulse" /> {pokemon.moves.ultimate.name}
              </span>
              <span className="font-mono text-[7px] font-bold text-yellow-400 animate-pulse bg-yellow-400/10 px-1.5 py-0.5 rounded-sm border border-yellow-400/20 uppercase tracking-widest">ULTI READY</span>
              <span className="font-mono font-bold text-yellow-400 leading-none text-xs">{pokemon.moves.ultimate.damage}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Card authentic footer stats: Weakness, Resistance, Retreat Cost */}
      <div className="border-t border-white/5 pt-3 flex justify-between text-[7.5px] font-mono leading-none tracking-wider text-slate-500 font-semibold px-0.5 mt-1">
        <div>
          <span>WEAKNESS</span>
          <span className="block font-bold text-red-500 text-[8px] mt-1.5 uppercase">{theme.weakness}</span>
        </div>
        <div>
          <span>RESISTANCE</span>
          <span className="block font-bold text-blue-400 text-[8px] mt-1.5 uppercase">{theme.resistance}</span>
        </div>
        <div>
          <span>RETREAT COST</span>
          <span className="flex gap-1 mt-1">
            {Array.from({ length: theme.retreat }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700 border border-slate-600 block" />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
