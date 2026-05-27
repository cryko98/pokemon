import React from 'react';
import { PokemonCharacter } from '../types';
import { Zap, Flame, Shield, Sparkles, Star, Award, Heart } from 'lucide-react';

interface PokemonCardProps {
  pokemon: PokemonCharacter;
  label?: string;
  badgeColor?: string;
  isCpu?: boolean;
}

export default function PokemonCard({ pokemon, label, badgeColor = 'bg-yellow-400 text-slate-950 border-yellow-500', isCpu = false }: PokemonCardProps) {
  
  // High-fidelity species categorization for classic Pokedex look
  const getSpeciesInfo = (id: string) => {
    switch (id) {
      case 'pikachu': return "Mouse Pokémon. HT: 1'04\", WT: 13.2 lbs.";
      case 'charizard': return "Flame Pokémon. HT: 5'07\", WT: 199.5 lbs.";
      case 'blastoise': return "Shellfish Pokémon. HT: 5'03\", WT: 188.5 lbs.";
      case 'gengar': return "Shadow Pokémon. HT: 4'11\", WT: 89.3 lbs.";
      case 'lucario': return "Aura Pokémon. HT: 3'11\", WT: 119.0 lbs.";
      case 'greninja': return "Ninja Pokémon. HT: 4'11\", WT: 88.2 lbs.";
      case 'mewtwo': return "Genetic Pokémon. HT: 6'07\", WT: 269.0 lbs.";
      case 'snorlax': return "Sleeping Pokémon. HT: 6'11\", WT: 1014.1 lbs.";
      case 'rayquaza': return "Sky High Pokémon. HT: 23'00\", WT: 455.3 lbs.";
      case 'mew': return "New Species Pokémon. HT: 1'04\", WT: 8.8 lbs.";
      case 'garchomp': return "Mach Pokémon. HT: 6'03\", WT: 209.4 lbs.";
      case 'arceus': return "Alpha Pokémon. HT: 10'06\", WT: 705.5 lbs.";
      default: return "Mystery Pokémon. HT: 3'04\", WT: 55.4 lbs.";
    }
  };

  // Determine beautiful primary symbol colors
  const getEnergyBadge = (type: string) => {
    const symbolStyle = "w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] select-none font-bold shadow-inner border border-black/30 shrink-0";
    if (type.includes('Electric')) {
      return <span className={`${symbolStyle} bg-yellow-405 text-slate-900`} title="Electric">⚡</span>;
    }
    if (type.includes('Fire')) {
      return <span className={`${symbolStyle} bg-rose-500 text-white`} title="Fire">🔥</span>;
    }
    if (type.includes('Water')) {
      return <span className={`${symbolStyle} bg-sky-505 text-white`} title="Water">💧</span>;
    }
    if (type.includes('Ghost')) {
      return <span className={`${symbolStyle} bg-purple-605 text-white`} title="Ghost">🔮</span>;
    }
    if (type.includes('Fighting')) {
      return <span className={`${symbolStyle} bg-amber-700 text-white`} title="Fighting">👊</span>;
    }
    if (type.includes('Psychic')) {
      return <span className={`${symbolStyle} bg-fuchsia-500 text-white`} title="Psychic">🔮</span>;
    }
    if (type.includes('Dragon')) {
      return <span className={`${symbolStyle} bg-teal-600 text-white`} title="Dragon">🐲</span>;
    }
    if (type.includes('Divine')) {
      return <span className={`${symbolStyle} bg-amber-400 text-slate-900 border-amber-500`} title="Divine">🌟</span>;
    }
    return <span className={`${symbolStyle} bg-slate-300 text-slate-800`} title="Normal">⭐</span>;
  };

  // Determine card base theme styling, element colors, weaknesses, resistances, type matching
  const getCardTheme = (id: string) => {
    switch (id) {
      case 'pikachu':
        return {
          bgGradient: 'from-yellow-105 via-amber-200/90 to-amber-300',
          borderColor: 'border-slate-950',
          accentColor: 'text-amber-800',
          elementSymbol: '⚡',
          typeLabel: 'Lightning',
          weakness: 'Grass',
          resistance: 'Metal',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent',
        };
      case 'charizard':
        return {
          bgGradient: 'from-orange-100 via-orange-400/40 to-rose-500/45',
          borderColor: 'border-slate-950',
          accentColor: 'text-orange-950',
          elementSymbol: '🔥',
          typeLabel: 'Fire / Flying',
          weakness: 'Water',
          resistance: 'Fighting',
          retreat: 3,
          foilLine: 'bg-gradient-to-r from-transparent via-orange-500/30 to-transparent',
        };
      case 'blastoise':
        return {
          bgGradient: 'from-sky-100 via-blue-400/30 to-blue-600/40',
          borderColor: 'border-slate-950',
          accentColor: 'text-blue-900',
          elementSymbol: '💧',
          typeLabel: 'Water',
          weakness: 'Lightning',
          resistance: 'Fire',
          retreat: 4,
          foilLine: 'bg-gradient-to-r from-transparent via-blue-400/30 to-transparent',
        };
      case 'gengar':
        return {
          bgGradient: 'from-purple-100 via-fuchsia-500/30 to-indigo-900/45',
          borderColor: 'border-slate-950',
          accentColor: 'text-purple-950',
          elementSymbol: '🔮',
          typeLabel: 'Ghost / Poison',
          weakness: 'Dark',
          resistance: 'Fighting',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-purple-400/30 to-transparent',
        };
      case 'lucario':
        return {
          bgGradient: 'from-cyan-50 via-sky-400/30 to-slate-700/40',
          borderColor: 'border-slate-950',
          accentColor: 'text-sky-950',
          elementSymbol: '👊',
          typeLabel: 'Fighting / Steel',
          weakness: 'Psychic',
          resistance: 'Metal',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent',
        };
      case 'greninja':
        return {
          bgGradient: 'from-indigo-50 via-sky-500/30 to-blue-900/45',
          borderColor: 'border-slate-950',
          accentColor: 'text-indigo-900',
          elementSymbol: '💧',
          typeLabel: 'Water / Dark',
          weakness: 'Lightning',
          resistance: 'Psychic',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-sky-305/30 to-transparent',
        };
      case 'mewtwo':
        return {
          bgGradient: 'from-fuchsia-50 via-fuchsia-400/30 to-purple-800/45',
          borderColor: 'border-slate-950',
          accentColor: 'text-purple-900',
          elementSymbol: '🔮',
          typeLabel: 'Psychic',
          weakness: 'Dark',
          resistance: 'Fighting',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-purple-305/35 to-transparent',
        };
      case 'snorlax':
        return {
          bgGradient: 'from-stone-100 via-stone-300/40 to-slate-500/40',
          borderColor: 'border-slate-950',
          accentColor: 'text-slate-800',
          elementSymbol: '⭐',
          typeLabel: 'Normal',
          weakness: 'Fighting',
          resistance: 'None',
          retreat: 4,
          foilLine: 'bg-gradient-to-r from-transparent via-slate-300/30 to-transparent',
        };
      case 'rayquaza':
        return {
          bgGradient: 'from-emerald-50 via-teal-500/30 to-teal-900/45',
          borderColor: 'border-slate-950',
          accentColor: 'text-teal-950',
          elementSymbol: '🐲',
          typeLabel: 'Dragon / Flying',
          weakness: 'Ice',
          resistance: 'Fighting',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-emerald-450/40 to-transparent',
        };
      case 'mew':
        return {
          bgGradient: 'from-pink-50 via-pink-400/35 to-rose-600/40',
          borderColor: 'border-slate-950',
          accentColor: 'text-pink-900',
          elementSymbol: '🔮',
          typeLabel: 'Psychic / Mythic',
          weakness: 'Psychic',
          resistance: 'None',
          retreat: 1,
          foilLine: 'bg-gradient-to-r from-transparent via-pink-400/40 to-transparent',
        };
      case 'garchomp':
        return {
          bgGradient: 'from-indigo-100 via-indigo-600/25 to-indigo-900/45',
          borderColor: 'border-slate-950',
          accentColor: 'text-indigo-950',
          elementSymbol: '🐲',
          typeLabel: 'Dragon / Ground',
          weakness: 'Fairy',
          resistance: 'Electric',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-indigo-500/35 to-transparent',
        };
      case 'arceus':
        return {
          bgGradient: 'from-amber-50 via-yellow-400/25 to-amber-600/35',
          borderColor: 'border-slate-950',
          accentColor: 'text-amber-950',
          elementSymbol: '🌟',
          typeLabel: 'Divine / Normal',
          weakness: 'Fighting',
          resistance: 'None',
          retreat: 2,
          foilLine: 'bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent',
        };
      default:
        return {
          bgGradient: 'from-stone-100 to-slate-200',
          borderColor: 'border-slate-950',
          accentColor: 'text-slate-800',
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
    <div 
      className="w-full max-w-[285px] mx-auto rounded-[20px] p-2.5 bg-[#ffcb05] border-[3.5px] border-slate-950 relative overflow-hidden flex flex-col justify-between text-slate-900 select-none group transition-all duration-300 hover:scale-[1.04]"
      style={{
        boxShadow: `6px 6px 0px #000000, inset 0 2px 4px rgba(255,255,255,0.7)`
      }}
    >
      
      {/* Label Badge Overlay (Player 1 / CPU Opponent with iconic comic speech look) */}
      {label && (
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-display font-black px-4 py-1 rounded-b-xl border-x-2 border-b-2 border-slate-950 uppercase tracking-wide z-20 ${badgeColor} select-none shadow-md`}>
          {label}
        </div>
      )}

      {/* Elegant Holofoil glint animation across the physical glossy paper card */}
      <div className={`absolute inset-0 translate-x-[-120%] rotate-12 ${theme.foilLine} w-[260%] h-[200%] pointer-events-none group-hover:translate-x-[110%] transition-transform duration-1000 ease-out z-10 opacity-60`} />

      {/* Card Content Area - Embedded inside the thick retro yellow border frame */}
      <div className={`flex flex-col gap-2 rounded-xl p-2.5 border-2 border-slate-950 bg-gradient-to-b ${theme.bgGradient} relative z-10`}
           style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
        
        {/* Card Header (Pikachu level, Type, Name in crisp Comic style) */}
        <div className="flex justify-between items-center px-0.5 border-b-2 border-black/15 pb-1 h-10">
          <div className="flex flex-col text-left">
            <span className="text-[7.5px] font-mono text-slate-800 font-extrabold uppercase tracking-wide leading-none">Basic Pokémon</span>
            <span className="text-[13px] sm:text-sm font-display font-black uppercase text-slate-950 tracking-tight leading-none mt-1">{pokemon.name}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-black text-rose-600 font-display">HP</span>
            <span className="text-sm font-mono font-black text-rose-600 leading-none">{pokemon.maxHp}</span>
            <span className="text-sm pb-1 shrink-0">{getEnergyBadge(pokemon.type)}</span>
          </div>
        </div>

        {/* Card Illustration Framed Area (Like physical glossy illustration window) */}
        <div className="w-full aspect-[4/3.1] rounded-lg border-2 border-slate-950 bg-gradient-to-b from-white/90 via-slate-100/70 to-slate-200/90 relative p-1 shadow-inner overflow-hidden flex items-center justify-center">
          
          {/* Subtle geometric dot patterns representing vintage printing press dots */}
          <div className="absolute inset-0 bg-[#000000] opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 20%, transparent 20%)', backgroundSize: '4px 4px' }} />
          
          <div className="absolute top-1.5 right-1.5 flex gap-1 z-20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-bounce duration-3000" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            {/* Element watermark neon backdrop orb */}
            <div 
              className="w-20 h-20 rounded-full opacity-35 blur-md animate-pulse absolute"
              style={{ backgroundColor: pokemon.color }}
            />
            
            {/* High-res official artwork */}
            <img 
              src={pokemon.imageUrl} 
              alt={pokemon.name} 
              className="w-[95px] h-[95px] object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] z-10 transform group-hover:scale-110 group-hover:-rotate-2 transition-all duration-300 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            
            <span className="absolute bottom-1 right-2 text-md select-none opacity-5 font-mono font-black">{theme.elementSymbol}</span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Nostalgic species, height and weight description strip (Direct from physical cards!) */}
        <div className="bg-[#facc15]/80 border border-slate-950 rounded-md px-2 py-0.5 text-[7px] font-mono text-slate-900 flex justify-center items-center shadow-xs font-bold uppercase tracking-tight italic">
          "{getSpeciesInfo(pokemon.id)}"
        </div>

        {/* Actions selection, moves and combat abilities */}
        <div className="flex flex-col gap-1 py-0.5 text-slate-900">
          
          {/* Quick attack row */}
          <div className="flex items-center justify-between border-b border-black/10 pb-1 text-left">
            <div className="flex items-center gap-1.5 max-w-[85%]">
              <div className="shrink-0">
                {getEnergyBadge(pokemon.type)}
              </div>
              <div className="flex flex-col">
                <span className="text-[9.5px] font-black text-slate-950 font-display leading-tight">{pokemon.moves.quick.name}</span>
                <span className="text-[7.5px] leading-none text-slate-600 font-semibold truncate max-w-[155px]">Quick strike with rapid recovery.</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-black text-slate-950 shrink-0">{pokemon.moves.quick.damage}</span>
          </div>

          {/* Heavy attack row */}
          <div className="flex items-center justify-between border-b border-black/10 pb-1 text-left">
            <div className="flex items-center gap-1.5 max-w-[85%]">
              <div className="flex gap-0.5 shrink-0">
                {getEnergyBadge(pokemon.type)}
                {getEnergyBadge('Normal')}
              </div>
              <div className="flex flex-col">
                <span className="text-[9.5px] font-black text-slate-950 font-display leading-tight">{pokemon.moves.heavy.name}</span>
                <span className="text-[7.5px] leading-none text-slate-600 font-semibold truncate max-w-[130px]">Heavy impact smash with massive knockback.</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-black text-slate-950 shrink-0">{pokemon.moves.heavy.damage}</span>
          </div>

          {/* Special Action/Projectiles Row */}
          <div className="flex items-center justify-between border-b border-black/10 pb-1 text-left">
            <div className="flex items-center gap-1.5 max-w-[85%]">
              <div className="flex gap-0.5 shrink-0">
                {getEnergyBadge(pokemon.type)}
                {getEnergyBadge(pokemon.type)}
              </div>
              <div className="flex flex-col">
                <span className="text-[9.5px] font-black text-slate-950 font-display leading-tight flex items-center gap-1">
                  {pokemon.moves.special.name}
                  <span className="text-[6.5px] font-mono text-blue-800 bg-sky-200/80 border border-blue-400 px-0.5 rounded font-extrabold shrink-0">20 EN</span>
                </span>
                <span className="text-[7.5px] leading-none text-slate-600 font-semibold truncate max-w-[130px]">Fires an energetic ranged bubble.</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-black text-slate-950 shrink-0">{pokemon.moves.special.damage}</span>
          </div>

          {/* Ultimate Move layout */}
          <div className="bg-[#fffbeb] border-1.5 border-slate-950 rounded-xl p-1.5 mt-0.5 shadow-sm">
            <div className="flex justify-between items-center leading-none text-left">
              <span className="font-display font-black text-slate-950 uppercase flex items-center gap-1 text-[8.5px] tracking-tight">
                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> {pokemon.moves.ultimate.name}
              </span>
              <span className="font-mono text-[6px] font-black text-yellow-800 bg-[#fef08a] border border-yellow-405 px-1 rounded uppercase tracking-wide">ULTI</span>
              <span className="font-mono font-black text-slate-950 text-[11px] shrink-0">{pokemon.moves.ultimate.damage}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Card physical-accurate footer stats: Weakness, Resistance, Retreat Cost */}
      <div className="pt-1.5 px-1 flex justify-between text-[7px] font-mono leading-none text-slate-950 font-black">
        <div className="text-left">
          <span>WEAKNESS</span>
          <span className="block text-[8px] font-black text-red-700 mt-1 uppercase leading-none">{theme.weakness} +20</span>
        </div>
        <div className="text-center">
          <span>RESISTANCE</span>
          <span className="block text-[8px] font-black text-blue-700 mt-1 uppercase leading-none">{theme.resistance} -30</span>
        </div>
        <div className="text-right">
          <span>RETREAT COST</span>
          <span className="flex gap-0.5 mt-1 justify-end">
            {Array.from({ length: theme.retreat }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-950 block" />
            ))}
          </span>
        </div>
      </div>
      
      {/* Decorative copyright footer */}
      <div className="text-[5.5px] font-semibold text-slate-950 px-1 pt-1.5 text-center flex justify-between items-center">
        <span>©1995-2026 Nintendo/Game Freak</span>
        <span>ID: {pokemon.id.toUpperCase()}</span>
      </div>

    </div>
  );
}
