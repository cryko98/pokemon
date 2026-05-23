export interface GameMove {
  name: string;
  nameHu: string;
  damage: number;
  energyCost: number;
  cooldown: number; // in frames
}

export interface PokemonCharacter {
  id: string;
  name: string;
  nameHu: string;
  type: string;
  typeColor: string;
  color: string;
  accentColor: string;
  maxHp: number;
  speed: number;
  attack: number;
  defense: number;
  imageUrl: string;
  moves: {
    quick: GameMove;
    heavy: GameMove;
    special: GameMove;
    ultimate: GameMove;
  };
  description: string;
  descriptionHu: string;
  nativelyFacesRight?: boolean;
  isSecret?: boolean;
}

export type FigtherState =
  | 'idle'
  | 'walk'
  | 'jump'
  | 'attack_quick'
  | 'attack_heavy'
  | 'attack_special'
  | 'ultimate'
  | 'hit'
  | 'fainted';

export interface Fighter {
  id: 'player' | 'cpu';
  pokemonId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  dir: 1 | -1; // 1 = facing right, -1 = facing left
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  state: FigtherState;
  stateTimer: number; // frames remaining in current state
  isGrounded: boolean;
  isBlocking: boolean;
  wins: number;
  comboCount: number;
  comboTimer: number;
  lastHitByUltimate: boolean;
  specialCooldown: number;
  ultimateReady: boolean;
}

export interface Projectile {
  id: string;
  ownerId: 'player' | 'cpu';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  sparkleColor: string;
  isUltimate: boolean;
  type: 'bolt' | 'fire' | 'water' | 'shadow' | 'aura';
}

export interface CombatText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  life: number; // frames
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface Arena {
  id: string;
  name: string;
  nameHu: string;
  primaryColor: string;
  secondaryColor: string;
  gradientFrom: string;
  gradientTo: string;
  floorColor: string;
  description: string;
}
