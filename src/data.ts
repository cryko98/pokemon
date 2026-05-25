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
    nativelyFacesRight: true,
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
    nativelyFacesRight: true,
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

export const BOOSTER_SECRET_POKEMONS: PokemonCharacter[] = [
  {
    id: 'rayquaza',
    name: 'Rayquaza',
    nameHu: 'Rayquaza',
    type: 'Dragon / Flying',
    typeColor: 'bg-teal-700 text-yellow-300 border-teal-800 font-bold',
    color: '#0D9488', // Teal 600
    accentColor: '#EAB308', // Yellow 500
    maxHp: 300,
    speed: 5.8,
    attack: 34,
    defense: 18,
    isSecret: true,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png',
    description: 'A legendary dragon of the ozone layer. Devastates the battlefield with stellar aerial dragon claws and hurricanes.',
    descriptionHu: 'A legendary dragon of the ozone layer. Devastates the battlefield with stellar aerial dragon claws and hurricanes.',
    nativelyFacesRight: true,
    moves: {
      quick: { name: 'Dragon Claw', nameHu: 'Dragon Claw', damage: 12, energyCost: 0, cooldown: 18 },
      heavy: { name: 'Extreme Speed', nameHu: 'Extreme Speed', damage: 22, energyCost: 0, cooldown: 35 },
      special: { name: 'Dragon Pulse', nameHu: 'Dragon Pulse', damage: 32, energyCost: 25, cooldown: 55 },
      ultimate: { name: 'Draco Meteor', nameHu: 'Draco Meteor', damage: 72, energyCost: 100, cooldown: 140 }
    }
  },
  {
    id: 'mew',
    name: 'Mew',
    nameHu: 'Mew',
    type: 'Psychic / Mythic',
    typeColor: 'bg-pink-400 text-slate-900 border-pink-500 font-bold',
    color: '#F472B6', // Pink 400
    accentColor: '#EC4899', // Pink 500
    maxHp: 240,
    speed: 6.2,
    attack: 27,
    defense: 16,
    isSecret: true,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png',
    description: 'A mythical Pokémon said to possess the genetic composition of all Pokémon. Uses beautiful psychic mirror fields.',
    descriptionHu: 'A mythical Pokémon said to possess the genetic composition of all Pokémon. Uses beautiful psychic mirror fields.',
    nativelyFacesRight: true,
    moves: {
      quick: { name: 'Pound Strike', nameHu: 'Pound Strike', damage: 10, energyCost: 0, cooldown: 16 },
      heavy: { name: 'Mega Punch', nameHu: 'Mega Punch', damage: 19, energyCost: 0, cooldown: 32 },
      special: { name: 'Psychic Spark', nameHu: 'Psychic Spark', damage: 26, energyCost: 20, cooldown: 48 },
      ultimate: { name: 'Genesis Nova', nameHu: 'Genesis Nova', damage: 65, energyCost: 100, cooldown: 120 }
    }
  },
  {
    id: 'garchomp',
    name: 'Garchomp',
    nameHu: 'Garchomp',
    type: 'Dragon / Ground',
    typeColor: 'bg-indigo-950 text-amber-400 border-indigo-900 font-bold',
    color: '#312E81', // Indigo 900
    accentColor: '#EF4444', // Red 500
    maxHp: 280,
    speed: 5.4,
    attack: 32,
    defense: 17,
    isSecret: true,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/443.png',
    description: 'It can fly at sonic speeds when folded. Its razor-sharp fins and rough skin slice through any defenses.',
    descriptionHu: 'It can fly at sonic speeds when folded. Its razor-sharp fins and rough skin slice through any defenses.',
    moves: {
      quick: { name: 'Dual Chop', nameHu: 'Dual Chop', damage: 11, energyCost: 0, cooldown: 20 },
      heavy: { name: 'Dragon Rush', nameHu: 'Dragon Rush', damage: 21, energyCost: 0, cooldown: 38 },
      special: { name: 'Earthquake Rift', nameHu: 'Earthquake Rift', damage: 29, energyCost: 25, cooldown: 52 },
      ultimate: { name: 'Outrage Rampage', nameHu: 'Outrage Rampage', damage: 68, energyCost: 100, cooldown: 130 }
    }
  },
  {
    id: 'arceus',
    name: 'Arceus',
    nameHu: 'Arceus',
    type: 'Divine / Normal',
    typeColor: 'bg-amber-100 text-slate-800 border-yellow-400 font-extrabold',
    color: '#FEF08A', // Yellow 200
    accentColor: '#FBBF24', // Yellow 400
    maxHp: 340,
    speed: 5.0,
    attack: 36,
    defense: 22,
    isSecret: true,
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/493.png',
    description: 'According to mythology, this Pokémon emerged before the universe existed. The mythical divine creator of all.',
    descriptionHu: 'According to mythology, this Pokémon emerged before the universe existed. The mythical divine creator of all.',
    moves: {
      quick: { name: 'Cosmic Slam', nameHu: 'Cosmic Slam', damage: 14, energyCost: 0, cooldown: 22 },
      heavy: { name: 'Divine Charge', nameHu: 'Divine Charge', damage: 24, energyCost: 0, cooldown: 40 },
      special: { name: 'Judgement Beam', nameHu: 'Judgement Beam', damage: 34, energyCost: 30, cooldown: 58 },
      ultimate: { name: 'Judgement Cosmic', nameHu: 'Judgement Cosmic', damage: 75, energyCost: 100, cooldown: 150 }
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

const ABILITIES_MAPPING: { [id: string]: { name: string; desc: string } } = {
  pikachu: {
    name: "Static Acceleration",
    desc: "When health drops below 50%, movement speed increases and electrical sparks paralyze enemies."
  },
  charizard: {
    name: "Blaze Rage",
    desc: "Fire-based strikes deal 20% critical heat damage."
  },
  blastoise: {
    name: "Steel Shell",
    desc: "Reduces all incoming direct damage by a solid 15% armor mitigation."
  },
  gengar: {
    name: "Shadow Curse",
    desc: "Lifesteals and regenerates health upon executing successful attacks."
  },
  lucario: {
    name: "Aura Concentration",
    desc: "Passively generates and recovers special combat move energy 25% faster."
  },
  greninja: {
    name: "Ninja Acrobatics",
    desc: "Enables elegant double-jumping to dodge hostile projectiles on the field."
  },
  mewtwo: {
    name: "Telekinetic Shield",
    desc: "Periodically spawns a psychic barrier to completely deflect incoming projectiles."
  },
  snorlax: {
    name: "Thick Fat",
    desc: "Immune to lightweight displacement knockbacks, starts with boosted max HP."
  },
  rayquaza: {
    name: "Ozone Tempest",
    desc: "Aerial and jump strikes inflict 30% more destructive force."
  },
  mew: {
    name: "Genesis DNA",
    desc: "Reduces special energy costs by 30% and passively heals over time."
  },
  garchomp: {
    name: "Rough Skin",
    desc: "Automatically reflects 15% of received contact damage back onto attackers."
  },
  arceus: {
    name: "Divine Protection",
    desc: "Completely nullifies the first incoming strike and begins battle with 50% energy."
  }
};

POKEMONS.forEach(poke => {
  const meta = ABILITIES_MAPPING[poke.id];
  if (meta) {
    poke.abilityName = meta.name;
    poke.abilityDesc = meta.desc;
  }
});

BOOSTER_SECRET_POKEMONS.forEach(poke => {
  const meta = ABILITIES_MAPPING[poke.id];
  if (meta) {
    poke.abilityName = meta.name;
    poke.abilityDesc = meta.desc;
  }
});

