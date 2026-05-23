import { PokemonCharacter, Arena } from './types';

export const POKEMONS: PokemonCharacter[] = [
  {
    id: 'pikachu',
    name: 'Pikachu',
    nameHu: 'Pikachu',
    type: 'Electric',
    typeColor: 'bg-yellow-400 text-slate-900 border-yellow-500',
    color: '#FACC15', // Yellow 400
    accentColor: '#EAB308', // Yellow 500
    maxHp: 240,
    speed: 6.5,
    attack: 26,
    defense: 12,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    description: 'Lightning-fast mouse Pokémon. Uses swift electric dashes and thunderbolts to overwhelm opponents.',
    descriptionHu: 'Lightning-fast mouse Pokémon. Uses swift electric dashes and thunderbolts to overwhelm opponents.',
    moves: {
      quick: { name: 'Quick Attack', nameHu: 'Quick Attack', damage: 10, energyCost: 0, cooldown: 18 },
      heavy: { name: 'Iron Tail', nameHu: 'Iron Tail', damage: 18, energyCost: 0, cooldown: 35 },
      special: { name: 'Thunderbolt', nameHu: 'Thunderbolt', damage: 25, energyCost: 25, cooldown: 50 },
      ultimate: { name: 'Volt Tackle', nameHu: 'Volt Tackle', damage: 60, energyCost: 100, cooldown: 120 }
    }
  },
  {
    id: 'charizard',
    name: 'Charizard',
    nameHu: 'Charizard',
    type: 'Fire / Flying',
    typeColor: 'bg-orange-500 text-white border-orange-600',
    color: '#F97316', // Orange 500
    accentColor: '#DC2626', // Red 600
    maxHp: 260,
    speed: 4.8,
    attack: 32,
    defense: 16,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    description: 'Spits fire that is hot enough to melt boulders. High attack power and devastating aerial flaming attacks.',
    descriptionHu: 'Spits fire that is hot enough to melt boulders. High attack power and devastating aerial flaming attacks.',
    moves: {
      quick: { name: 'Scratch', nameHu: 'Scratch', damage: 12, energyCost: 0, cooldown: 20 },
      heavy: { name: 'Wing Attack', nameHu: 'Wing Attack', damage: 22, energyCost: 0, cooldown: 40 },
      special: { name: 'Flamethrower', nameHu: 'Flamethrower', damage: 32, energyCost: 30, cooldown: 60 },
      ultimate: { name: 'Blast Burn', nameHu: 'Blast Burn', damage: 65, energyCost: 100, cooldown: 150 }
    }
  },
  {
    id: 'blastoise',
    name: 'Blastoise',
    nameHu: 'Blastoise',
    type: 'Water',
    typeColor: 'bg-blue-500 text-white border-blue-600',
    color: '#3B82F6', // Blue 500
    accentColor: '#1D4ED8', // Blue 700
    maxHp: 320,
    speed: 3.8,
    attack: 24,
    defense: 25,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    description: 'A brutal turtle Pokémon with pressurized water cannons on its shell. Incredible defense and high health.',
    descriptionHu: 'A brutal turtle Pokémon with pressurized water cannons on its shell. Incredible defense and high health.',
    moves: {
      quick: { name: 'Tackle', nameHu: 'Tackle', damage: 8, energyCost: 0, cooldown: 22 },
      heavy: { name: 'Skull Bash', nameHu: 'Skull Bash', damage: 19, energyCost: 0, cooldown: 45 },
      special: { name: 'Hydro Pump', nameHu: 'Hydro Pump', damage: 28, energyCost: 20, cooldown: 55 },
      ultimate: { name: 'Hydro Cannon', nameHu: 'Hydro Cannon', damage: 55, energyCost: 100, cooldown: 130 }
    }
  },
  {
    id: 'gengar',
    name: 'Gengar',
    nameHu: 'Gengar',
    type: 'Ghost / Poison',
    typeColor: 'bg-purple-600 text-white border-purple-800',
    color: '#7C3AED', // Purple 600
    accentColor: '#4C1D95', // Violet 900
    maxHp: 220,
    speed: 5.6,
    attack: 29,
    defense: 10,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    description: 'Hides in shadows. Possesses tricky movements, psychic attacks, and can drain life from opponents.',
    descriptionHu: 'Hides in shadows. Possesses tricky movements, psychic attacks, and can drain life from opponents.',
    moves: {
      quick: { name: 'Lick', nameHu: 'Lick', damage: 9, energyCost: 0, cooldown: 16 },
      heavy: { name: 'Shadow Punch', nameHu: 'Shadow Punch', damage: 20, energyCost: 0, cooldown: 32 },
      special: { name: 'Shadow Ball', nameHu: 'Shadow Ball', damage: 30, energyCost: 25, cooldown: 52 },
      ultimate: { name: 'Dream Eater', nameHu: 'Dream Eater', damage: 50, energyCost: 100, cooldown: 110 }
    }
  },
  {
    id: 'lucario',
    name: 'Lucario',
    nameHu: 'Lucario',
    type: 'Fighting / Steel',
    typeColor: 'bg-cyan-600 text-white border-cyan-700',
    color: '#06B6D4', // Cyan 500
    accentColor: '#0F172A', // Slate 900
    maxHp: 250,
    speed: 5.4,
    attack: 28,
    defense: 15,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    description: 'Reads the aura of all things to sense feelings. Excellent technical combos and spiritual spheres.',
    descriptionHu: 'Reads the aura of all things to sense feelings. Excellent technical combos and spiritual spheres.',
    moves: {
      quick: { name: 'Metal Claw', nameHu: 'Metal Claw', damage: 11, energyCost: 0, cooldown: 19 },
      heavy: { name: 'Force Palm', nameHu: 'Force Palm', damage: 21, energyCost: 0, cooldown: 36 },
      special: { name: 'Aura Sphere', nameHu: 'Aura Sphere', damage: 27, energyCost: 25, cooldown: 48 },
      ultimate: { name: 'Close Combat', nameHu: 'Close Combat', damage: 62, energyCost: 100, cooldown: 140 }
    }
  },
  {
    id: 'greninja',
    name: 'Greninja',
    nameHu: 'Greninja',
    type: 'Water / Dark',
    typeColor: 'bg-blue-900 text-cyan-200 border-blue-950',
    color: '#1E3A8A', // Dark Blue
    accentColor: '#0F172A', // Slate 900
    maxHp: 230,
    speed: 7.2,
    attack: 27,
    defense: 11,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png',
    description: 'Unmatched speed and ninja acrobatics. Uses water shurikens and swift shadow strikes to cut through foes.',
    descriptionHu: 'Unmatched speed and ninja acrobatics. Uses water shurikens and swift shadow strikes to cut through foes.',
    moves: {
      quick: { name: 'Cut', nameHu: 'Cut', damage: 10, energyCost: 0, cooldown: 15 },
      heavy: { name: 'Night Slash', nameHu: 'Night Slash', damage: 19, energyCost: 0, cooldown: 30 },
      special: { name: 'Water Shuriken', nameHu: 'Water Shuriken', damage: 26, energyCost: 20, cooldown: 45 },
      ultimate: { name: 'Shadow Mirage', nameHu: 'Shadow Mirage', damage: 64, energyCost: 100, cooldown: 130 }
    }
  },
  {
    id: 'mewtwo',
    name: 'Mewtwo',
    nameHu: 'Mewtwo',
    type: 'Psychic',
    typeColor: 'bg-indigo-600 text-white border-indigo-700',
    color: '#A78BFA', // Purple 400
    accentColor: '#5B21B6', // Violet 800
    maxHp: 270,
    speed: 5.8,
    attack: 35,
    defense: 13,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    description: 'A genetically engineered legendary psychic force. Possesses mind-melting telekinetic shockwaves.',
    descriptionHu: 'A genetically engineered legendary psychic force. Possesses mind-melting telekinetic shockwaves.',
    moves: {
      quick: { name: 'Psycho Cut', nameHu: 'Psycho Cut', damage: 13, energyCost: 0, cooldown: 20 },
      heavy: { name: 'Swift Beam', nameHu: 'Swift Beam', damage: 23, energyCost: 0, cooldown: 38 },
      special: { name: 'Psystrike Sphere', nameHu: 'Psystrike Sphere', damage: 34, energyCost: 30, cooldown: 55 },
      ultimate: { name: 'Psychic Cataclysm', nameHu: 'Psychic Cataclysm', damage: 70, energyCost: 100, cooldown: 150 }
    }
  },
  {
    id: 'snorlax',
    name: 'Snorlax',
    nameHu: 'Snorlax',
    type: 'Normal',
    typeColor: 'bg-slate-500 text-white border-slate-600',
    color: '#334155', // Slate 700
    accentColor: '#0F172A', // Slate 900
    maxHp: 380,
    speed: 2.8,
    attack: 28,
    defense: 22,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    description: 'An enormous, peaceful powerhouse. Heavyweight bulk which crushes enemies under its sheer sleeping weight.',
    descriptionHu: 'An enormous, peaceful powerhouse. Heavyweight bulk which crushes enemies under its sheer sleeping weight.',
    moves: {
      quick: { name: 'Heavy Headbutt', nameHu: 'Heavy Headbutt', damage: 9, energyCost: 0, cooldown: 24 },
      heavy: { name: 'Body Slam', nameHu: 'Body Slam', damage: 24, energyCost: 0, cooldown: 48 },
      special: { name: 'Rollout', nameHu: 'Rollout', damage: 25, energyCost: 20, cooldown: 50 },
      ultimate: { name: 'Hyper Beam Blast', nameHu: 'Hyper Beam Blast', damage: 58, energyCost: 100, cooldown: 140 }
    }
  }
];

export const ARENAS: Arena[] = [
  {
    id: 'kanto_stadium',
    name: 'Indigo Plateau',
    nameHu: 'Indigo Plateau',
    primaryColor: '#EF4444',
    secondaryColor: '#3B82F6',
    gradientFrom: 'from-slate-900 via-indigo-950 to-slate-900',
    gradientTo: 'from-indigo-950 to-blue-950',
    floorColor: '#334155', // Slate 700
    description: 'The historic coliseum of the Pokémon League.'
  },
  {
    id: 'volcano',
    name: 'Cinnabar Volcano',
    nameHu: 'Cinnabar Volcano',
    primaryColor: '#F97316',
    secondaryColor: '#EF4444',
    gradientFrom: 'from-amber-950 via-stone-900 to-amber-950',
    gradientTo: 'from-orange-950 to-stone-900',
    floorColor: '#451a03', // warm dark stone
    description: 'An unstable stage elevated above boiling-hot streams of magma.'
  },
  {
    id: 'lavender_town',
    name: 'Lavender Ghost Tower',
    nameHu: 'Lavender Ghost Tower',
    primaryColor: '#8B5CF6',
    secondaryColor: '#4C1D95',
    gradientFrom: 'from-purple-950 via-zinc-900 to-purple-950',
    gradientTo: 'from-zinc-900 to-indigo-950',
    floorColor: '#2e1065', // violet 950
    description: 'Haunted ruins shrouded in dark mist and spectral energy.'
  },
  {
    id: 'forest',
    name: 'Viridian Forest',
    nameHu: 'Viridian Forest',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    gradientFrom: 'from-emerald-950 via-neutral-900 to-emerald-950',
    gradientTo: 'from-teal-950 to-zinc-900',
    floorColor: '#064e3b', // emerald 900
    description: 'A serene and lush woodland filled with wild grass and rustling leaves.'
  }
];
