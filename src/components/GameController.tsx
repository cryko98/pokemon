import React, { useEffect, useRef, useState, useCallback } from 'react';
import { POKEMONS, ARENAS } from '../data';
import { Fighter, Projectile, CombatText, Particle, Arena, PokemonCharacter } from '../types';
import { drawFighter, drawProjectile, drawCombatText, drawParticle, drawArenaBackground } from '../utils/renderer';
import { audio } from '../utils/audio';
import { Sword, RotateCcw, Shield, ShieldCheck, Zap, Volume2, VolumeX, Trophy, Sparkles, ChevronLeft, Flame, Waves, Skull, UserCheck, Star } from 'lucide-react';

interface GameControllerProps {
  playerPokemon: PokemonCharacter;
  cpuPokemon: PokemonCharacter;
  selectedArena: Arena;
  onExitToMenu: () => void;
  onSelectDifferentCharacters: () => void;
  isMultiplayer?: boolean;
  roomId?: string | null;
  multiplayerSide?: 'player' | 'cpu';
  clientSocket?: any;
  onMatchFinished?: (winner: 'player' | 'cpu') => void;
}

export default function GameController({
  playerPokemon,
  cpuPokemon,
  selectedArena,
  onExitToMenu,
  onSelectDifferentCharacters,
  isMultiplayer = false,
  roomId = null,
  multiplayerSide = 'player',
  clientSocket = null,
  onMatchFinished
}: GameControllerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Difficulty settings
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'veteran'>('normal');
  const [soundOn, setSoundOn] = useState(true);

  // High Stakes Best-of-3 status
  const [playerWins, setPlayerWins] = useState(0);
  const [cpuWins, setCpuWins] = useState(0);
  
  // HUD states
  const [timer, setTimer] = useState(99);
  const [roundNumber, setRoundNumber] = useState(1);
  const [matchOver, setMatchOver] = useState(false);
  const [matchWinner, setMatchWinner] = useState<'player' | 'cpu' | null>(null);
  const [roundOver, setRoundOver] = useState(false);
  const [roundWinnerName, setRoundWinnerName] = useState<string | null>(null);
  const [roundAnnouncement, setRoundAnnouncement] = useState<string>('ROUND 1!');
  const [p1Combo, setP1Combo] = useState<number>(0);
  const [cpuCombo, setCpuCombo] = useState<number>(0);

  // Fighter Health & Energy hook values (to render premium high-fidelity HTML/CSS health bars outdoors of canvas!)
  const [p1Hp, setP1Hp] = useState(playerPokemon.maxHp);
  const [cpuHp, setCpuHp] = useState(cpuPokemon.maxHp);
  const [p1Energy, setP1Energy] = useState(0);
  const [cpuEnergy, setCpuEnergy] = useState(0);

  // Fighter instances references for the game-loop
  const p1Ref = useRef<Fighter>({
    id: 'player',
    pokemonId: playerPokemon.id,
    x: 180,
    y: 310,
    vx: 0,
    vy: 0,
    width: 65,
    height: 75,
    dir: 1,
    hp: playerPokemon.maxHp,
    maxHp: playerPokemon.maxHp,
    energy: 10,
    maxEnergy: 100,
    state: 'idle',
    stateTimer: 0,
    isGrounded: true,
    isBlocking: false,
    wins: 0,
    comboCount: 0,
    comboTimer: 0,
    lastHitByUltimate: false,
    specialCooldown: 0,
    ultimateReady: false
  });

  const cpuRef = useRef<Fighter>({
    id: 'cpu',
    pokemonId: cpuPokemon.id,
    x: 620,
    y: 310,
    vx: 0,
    vy: 0,
    width: 65,
    height: 75,
    dir: -1,
    hp: cpuPokemon.maxHp,
    maxHp: cpuPokemon.maxHp,
    energy: 10,
    maxEnergy: 100,
    state: 'idle',
    stateTimer: 0,
    isGrounded: true,
    isBlocking: false,
    wins: 0,
    comboCount: 0,
    comboTimer: 0,
    lastHitByUltimate: false,
    specialCooldown: 0,
    ultimateReady: false
  });

  // Projectiles, FX text notifications, screen-shake, and particle arrays
  const projectilesRef = useRef<Projectile[]>([]);
  const combatTextsRef = useRef<CombatText[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const screenShakeRef = useRef<number>(0);
  const gameTickRef = useRef<number>(0);

  // Active inputs state (for keyboard mapping)
  const keysRef = useRef<{ [key: string]: boolean }>({
    A: false,
    a: false,
    D: false,
    d: false,
    W: false,
    w: false,
    S: false,
    s: false,
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
  });

  // Block viewport scrolling hook during live combat
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  // Sound toggler
  const toggleMute = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    audio.toggleSound(newState);
  };

  // Helper: Trigger visual popup combat words
  const addCombatText = (text: string, x: number, y: number, color: string = '#FACC15', size: number = 20) => {
    combatTextsRef.current.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      size,
      alpha: 1.0,
      vx: (Math.random() - 0.5) * 2,
      vy: -1.5 - Math.random() * 2,
      life: 45 // 45 frames
    });
  };

  // Helper: Trigger beautiful combat particle rings/bursts
  const createExplosion = (x: number, y: number, color: string, count: number = 15, sizeMax = 4) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5;
      particlesRef.current.push({
        id: Math.random().toString(),
        x,
        y: y - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 2), // upward drift
        radius: 1 + Math.random() * sizeMax,
        color,
        alpha: 1.0,
        life: 25 + Math.random() * 20,
        maxLife: 45,
        gravity: 0.12
      });
    }
  };

  // Helper: Trigger beautiful celebratory victory fireworks
  const createFirework = (x: number, y: number) => {
    const palette = ['#FBBF24', '#EF4444', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899', '#F97316', '#FFFFFF'];
    const primaryColor = palette[Math.floor(Math.random() * palette.length)];
    const secondaryColor = palette[Math.floor(Math.random() * palette.length)];
    
    // Create a spectacular cascading circular shockwave of fireworks particles
    const particleCount = 45 + Math.floor(Math.random() * 25);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 6.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const life = 35 + Math.floor(Math.random() * 35);
      const useColor = Math.random() > 0.35 ? primaryColor : secondaryColor;
      
      particlesRef.current.push({
        id: Math.random().toString(),
        x,
        y,
        vx,
        vy,
        radius: 1.0 + Math.random() * 2.5,
        color: useColor,
        alpha: 1.0,
        life,
        maxLife: life,
        gravity: 0.045 + Math.random() * 0.04
      });
    }
  };

  // Combat collision: Check proximity and apply hit mechanics
  const triggerMeleeAttack = useCallback((attacker: Fighter, defender: Fighter, attackType: 'quick' | 'heavy' | 'ultimate', isReplicated: boolean = false) => {
    const isPlayer = attacker.id === 'player';
    const pokeData = isPlayer ? playerPokemon : cpuPokemon;
    const move = attackType === 'quick' 
      ? pokeData.moves.quick 
      : attackType === 'heavy' 
      ? pokeData.moves.heavy 
      : pokeData.moves.ultimate;

    // Range calculations depending on direction
    const range = attackType === 'quick' ? 55 : attackType === 'heavy' ? 70 : 85;
    const dx = defender.x - attacker.x;
    const dy = Math.abs(defender.y - attacker.y);

    // Is the defender in range and attacker facing them?
    const correctDirection = (attacker.dir === 1 && dx > -10) || (attacker.dir === -1 && dx < 10);
    const inRange = Math.abs(dx) <= range && dy < 60 && correctDirection;

    // Deduct ultimate energy cost if ultimate is clicked
    if (attackType === 'ultimate' && !isReplicated) {
      attacker.energy = 0;
      attacker.ultimateReady = false;
      if (isPlayer) setP1Energy(0);
      else setCpuEnergy(0);
    }

    // Spawn cool hit wind ripples at attack boundary
    const windX = attacker.x + attacker.dir * (range - 10);
    const windY = attacker.y - attacker.height / 2;
    createExplosion(windX, windY, attacker.id === 'player' ? playerPokemon.color : cpuPokemon.color, 6, 2.5);

    if (inRange) {
      const defenderPoke = attacker.id === 'player' ? cpuPokemon : playerPokemon;
      
      // Calculate blocking status of victim
      const isDefBlocked = defender.isBlocking && defender.dir !== attacker.dir; 
      let finalDamage = Math.round(move.damage * (1 + (pokeData.attack - 15) * 0.015));
      
      // Pikachu Spark Passive: 20% extra damage if defender is hit
      if (pokeData.id === 'pikachu' && Math.random() < 0.2) {
        finalDamage = Math.round(finalDamage * 1.2);
        addCombatText('SPARK CRIT! ⭐', attacker.x, attacker.y - 70, '#FACC15', 20);
      }

      // Rayquaza Ozone Overdrive Passive: Dealt 30% more damage if attacker is mid-air
      if (pokeData.id === 'rayquaza' && !attacker.isGrounded) {
        finalDamage = Math.round(finalDamage * 1.3);
        addCombatText('OZONE STRIKE! 🌀', attacker.x, attacker.y - 70, '#0D9488', 20);
      }

      // Charizard Burn Fury Passive: 20% more damage if his HP is below 50%
      if (pokeData.id === 'charizard' && attacker.hp < attacker.maxHp * 0.5) {
        finalDamage = Math.round(finalDamage * 1.25);
        addCombatText('BURN FURY! 🔥', attacker.x, attacker.y - 70, '#F97316', 21);
      }

      // Blastoise Steel Shell Passive: absorbs 15% of all received generic damage
      if (defenderPoke.id === 'blastoise') {
        finalDamage = Math.round(finalDamage * 0.85);
      }

      // Arceus Divine Aura: 20% chance of complete deflection/invulnerability
      let isDivineDeflected = false;
      if (defenderPoke.id === 'arceus' && Math.random() < 0.2) {
        isDivineDeflected = true;
        finalDamage = 0;
      }

      if (isDefBlocked) {
        finalDamage = Math.round(finalDamage * 0.15); // block absorbs 85% damage!
      }

      // Check for Gengar's Dream Eater ultimate lifesteal! (and shadow lifesteal passive on regular hits too)
      if (pokeData.id === 'gengar') {
        const stealPct = attackType === 'ultimate' ? 0.45 : 0.15;
        const hSteal = Math.round(finalDamage * stealPct);
        if (hSteal > 0) {
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + hSteal);
          if (isPlayer) setP1Hp(attacker.hp);
          else setCpuHp(attacker.hp);
          addCombatText(`DRAIN +${hSteal} ❤️`, attacker.x, attacker.y - 60, '#A78BFA', 20);
        }
      }

      // Garchomp Rough Skin Passive: Rebounds 15% physical damage back
      if (defenderPoke.id === 'garchomp' && finalDamage > 0) {
        const rebound = Math.round(finalDamage * 0.15);
        if (rebound > 0) {
          attacker.hp = Math.max(0, attacker.hp - rebound);
          if (isPlayer) setP1Hp(attacker.hp);
          else setCpuHp(attacker.hp);
          addCombatText(`REBOUND -${rebound} 💥`, attacker.x, attacker.y - 80, '#EF4444', 18);
        }
      }

      // Mew DNA Genesis: 5% passive heal per landed hit
      if (pokeData.id === 'mew') {
        const hHeal = Math.round(attacker.maxHp * 0.04);
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + hHeal);
        if (isPlayer) setP1Hp(attacker.hp);
        else setCpuHp(attacker.hp);
        addCombatText(`REGEN +${hHeal} ✨`, attacker.x, attacker.y - 50, '#EC4899', 19);
      }

      // Apply damage
      if (isDivineDeflected) {
        addCombatText('DIVINE BLOCK! 🛡️', defender.x, defender.y - 65, '#FEF08A', 22);
        createExplosion(defender.x, defender.y - 30, '#FEF08A', 14, 3);
        audio.playBlock();
      } else {
        defender.hp = Math.max(0, defender.hp - finalDamage);
        (defender.id === 'player') ? setP1Hp(defender.hp) : setCpuHp(defender.hp);
      }

      // Trigger screen shake & Sound effects
      screenShakeRef.current = attackType === 'quick' ? 8 : attackType === 'heavy' ? 16 : 28;
      if (isDefBlocked) {
        audio.playBlock();
        addCombatText('BLOCKED!', defender.x, defender.y - 50, '#67E8F9', 20);
        createExplosion(defender.x, defender.y - 25, '#CBD5E1', 10, 2);

        // CPU Smart block counter-strike to break physical loop spams!
        if (defender.id === 'cpu' && !isMultiplayer) {
          const counterChance = difficulty === 'easy' ? 0.12 : difficulty === 'normal' ? 0.45 : 0.80;
          if (Math.random() < counterChance) {
            // Instantly transition to a fast, defensive counter-attack to punish spamming!
            defender.state = 'attack_quick';
            defender.stateTimer = 18;
            defender.vx = defender.dir * 3; // slide forward slightly toward target
            addCombatText('COUNTER-STRIKE! ⚡', defender.x, defender.y - 70, '#FBBF24', 18);
            triggerMeleeAttack(defender, attacker, 'quick');
          }
        }
      } else {
        if (attackType === 'heavy' || attackType === 'ultimate') {
          audio.playHeavyHit();
        } else {
          audio.playHit();
        }
        
        // Push-back push velocities
        defender.vx += attacker.dir * (attackType === 'quick' ? 6 : attackType === 'heavy' ? 14 : 22);
        defender.vy += attackType === 'ultimate' ? -5 : -2; // bounce slightly
        defender.state = 'hit';
        defender.stateTimer = attackType === 'quick' ? 15 : attackType === 'heavy' ? 26 : 40;
        
        // Accumulate combo points
        attacker.comboCount += 1;
        attacker.comboTimer = 180; // 3 seconds window to build combos
        if (isPlayer) setP1Combo(attacker.comboCount);
        else setCpuCombo(attacker.comboCount);

        // Render damage floats
        const isCritical = attackType === 'heavy' && Math.random() > 0.6;
        const damageColor = isCritical ? '#EF4444' : attackType === 'ultimate' ? '#FBBF24' : '#F8FAFC';
        addCombatText(
          `${isCritical ? 'CRITICAL! ' : ''}-${finalDamage}`, 
          defender.x + (Math.random() - 0.5) * 15, 
          defender.y - 45, 
          damageColor, 
          isCritical || attackType === 'ultimate' ? 24 : 19
        );

        // Splash blood/sparks
        createExplosion(defender.x, defender.y - 30, isCritical ? '#DC2626' : (attacker.id === 'player' ? playerPokemon.color : cpuPokemon.color), 16, 4);
      }

      // Build energy on successful landing
      if (!isReplicated) {
        attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + (attackType === 'quick' ? 10 : 20));
        if (isPlayer) setP1Energy(attacker.energy);
        else setCpuEnergy(attacker.energy);
      }

    } else {
      // Whiff sound or air hit effect
    }
  }, [playerPokemon, cpuPokemon]);

  // Handle firing projectile
  const fireSpecialProjectile = useCallback((attacker: Fighter, defender: Fighter, isReplicated: boolean = false) => {
    const isPlayer = attacker.id === 'player';
    const pokeData = isPlayer ? playerPokemon : cpuPokemon;
    const move = pokeData.moves.special;

    if (!isReplicated && attacker.energy < move.energyCost) {
      if (isPlayer) addCombatText('NO POWER! ⚡', attacker.x, attacker.y - 50, '#EF4444', 16);
      return;
    }

    if (!isReplicated) {
      // Deduct energy
      attacker.energy -= move.energyCost;
      if (isPlayer) setP1Energy(attacker.energy);
      else setCpuEnergy(attacker.energy);
    }

    // Play laser/special audio track
    audio.playSpecial();

    // Determine type code for custom drawing
    let projType: 'bolt' | 'fire' | 'water' | 'shadow' | 'aura' = 'bolt';
    if (pokeData.id === 'pikachu') projType = 'bolt';
    else if (pokeData.id === 'charizard') projType = 'fire';
    else if (pokeData.id === 'blastoise') projType = 'water';
    else if (pokeData.id === 'gengar') projType = 'shadow';
    else if (pokeData.id === 'lucario') projType = 'aura';

    // Spawn bullet relative to chest height
    projectilesRef.current.push({
      id: Math.random().toString(),
      ownerId: attacker.id,
      x: attacker.x + attacker.dir * 30,
      y: attacker.y - attacker.height * 0.6,
      vx: attacker.dir * 12, // velocity across screen
      vy: 0,
      radius: 14,
      color: pokeData.color,
      sparkleColor: pokeData.accentColor,
      damage: Math.round(move.damage * (1 + (pokeData.attack - 15) * 0.015)),
      isUltimate: false,
      type: projType
    });

    // Animate firing pose
    attacker.state = 'attack_special';
    attacker.stateTimer = 22;

    // Bullet back thrust particles
    createExplosion(attacker.x + attacker.dir * 35, attacker.y - attacker.height * 0.6, pokeData.color, 8, 3);
  }, [playerPokemon, cpuPokemon]);

  // Execute ultimate spells
  const executeUltimateMove = useCallback((attacker: Fighter, defender: Fighter, isReplicated: boolean = false) => {
    const isPlayer = attacker.id === 'player';
    const pokeData = isPlayer ? playerPokemon : cpuPokemon;

    // Check energy
    if (!isReplicated && attacker.energy < 100) return;

    if (!isReplicated) {
      attacker.energy = 0;
      attacker.ultimateReady = false;
      if (isPlayer) setP1Energy(0);
      else setCpuEnergy(0);
    }

    audio.playUltimate();
    
    // Set casting anim State
    attacker.state = 'ultimate';
    attacker.stateTimer = 70;

    addCombatText('!! ULTIMATE !!', attacker.x, attacker.y - 70, '#FBBF24', 28);
    screenShakeRef.current = 40;

    // Spawn massive particles around attacker
    createExplosion(attacker.x, attacker.y - 15, '#FFFFFF', 40, 5);

    // Apply ultimate effect: Pikachu and Lucario are physical dash ultimates, Charizard, Blastoise, and Gengar are magical screen-wide impacts!
    const isPhysicalReach = pokeData.id === 'pikachu' || pokeData.id === 'lucario';

    if (isPhysicalReach) {
      // Dash cross-screen to trigger hit
      attacker.vx = attacker.dir * 32;
      setTimeout(() => {
        // Evaluate close hitting impact
        triggerMeleeAttack(attacker, defender, 'ultimate', isReplicated);
      }, 100);
    } else {
      // Fire generic heavy projectile tracking the defender after short lag
      setTimeout(() => {
        let projType: 'bolt' | 'fire' | 'water' | 'shadow' | 'aura' = 'fire';
        if (pokeData.id === 'charizard') projType = 'fire';
        else if (pokeData.id === 'blastoise') projType = 'water';
        else if (pokeData.id === 'gengar') projType = 'shadow';

        projectilesRef.current.push({
          id: Math.random().toString(),
          ownerId: attacker.id,
          x: attacker.x + attacker.dir * 35,
          y: attacker.y - attacker.height * 0.5,
          vx: attacker.dir * 15,
          vy: 0,
          radius: 28, // HUGE BALL
          color: pokeData.color,
          sparkleColor: '#F59E0B',
          damage: Math.round(pokeData.moves.ultimate.damage * (1 + (pokeData.attack - 15) * 0.015)),
          isUltimate: true,
          type: projType
        });
      }, 300);
    }
  }, [playerPokemon, cpuPokemon, triggerMeleeAttack]);

  // Multiplayer real-time socket listeners
  useEffect(() => {
    if (!isMultiplayer || !clientSocket) return;

    // Receive state synchronization from remote player
    clientSocket.on('remote_state', (data: any) => {
      // Check that it's the opposing side
      if (data.side === multiplayerSide) return;

      const opposingRef = data.side === 'player' ? p1Ref : cpuRef;
      const f = opposingRef.current;
      if (!f) return;

      f.x = data.x;
      f.y = data.y;
      f.vx = data.vx;
      f.vy = data.vy;
      f.hp = data.hp;
      f.energy = data.energy;
      f.state = data.state;
      f.stateTimer = data.stateTimer;
      f.isBlocking = data.isBlocking;
      f.dir = data.dir;
      f.isGrounded = data.isGrounded;

      // Keep HP and Energy HUD updated in real-time
      if (data.side === 'player') {
        setP1Hp(data.hp);
        setP1Energy(data.energy);
      } else {
        setCpuHp(data.hp);
        setCpuEnergy(data.energy);
      }
    });

    // Receive exact actions triggered by remote player
    clientSocket.on('remote_action_triggered', (data: any) => {
      if (data.side === multiplayerSide) return;

      const { action, payload } = data;
      const p1 = p1Ref.current;
      const cpu = cpuRef.current;

      if (action === 'melee_hit') {
        const attacker = payload.attackerId === 'player' ? p1 : cpu;
        const defender = payload.attackerId === 'player' ? cpu : p1;
        attacker.state = payload.attackType === 'quick' ? 'attack_quick' : 'attack_heavy';
        attacker.stateTimer = payload.attackType === 'quick' ? 18 : 32;
        triggerMeleeAttack(attacker, defender, payload.attackType, true);
      } 
      else if (action === 'spawn_projectile') {
        const attacker = payload.ownerId === 'player' ? p1 : cpu;
        const defender = payload.ownerId === 'player' ? cpu : p1;
        fireSpecialProjectile(attacker, defender, true); // true = bypass replicated energy deduct
      } 
      else if (action === 'execute_ultimate') {
        const attacker = payload.ownerId === 'player' ? p1 : cpu;
        const defender = payload.ownerId === 'player' ? cpu : p1;
        executeUltimateMove(attacker, defender, true); // true = replicated ultimate pose
      }
    });

    return () => {
      clientSocket.off('remote_state');
      clientSocket.off('remote_action_triggered');
    };
  }, [isMultiplayer, clientSocket, multiplayerSide, triggerMeleeAttack, fireSpecialProjectile, executeUltimateMove]);

  // Setup/Reset a high stakes battle round
  const resetRound = useCallback((round: number) => {
    // Show round text announcement
    setRoundNumber(round);
    setRoundAnnouncement(round === 3 ? "FINAL ROUND!" : `ROUND ${round}!`);
    
    // Reset individual fighter dynamic coordinates, hp, states
    p1Ref.current.x = 180;
    p1Ref.current.y = 310;
    p1Ref.current.vx = 0;
    p1Ref.current.vy = 0;
    p1Ref.current.hp = playerPokemon.maxHp;
    p1Ref.current.state = 'idle';
    p1Ref.current.stateTimer = 0;
    p1Ref.current.isBlocking = false;
    p1Ref.current.energy = 5;
    
    cpuRef.current.x = 620;
    cpuRef.current.y = 310;
    cpuRef.current.vx = 0;
    cpuRef.current.vy = 0;
    cpuRef.current.hp = cpuPokemon.maxHp;
    cpuRef.current.state = 'idle';
    cpuRef.current.stateTimer = 0;
    cpuRef.current.isBlocking = false;
    cpuRef.current.energy = 10;

    // Reset references lists
    projectilesRef.current = [];
    combatTextsRef.current = [];
    particlesRef.current = [];
    screenShakeRef.current = 0;

    setP1Hp(playerPokemon.maxHp);
    setCpuHp(cpuPokemon.maxHp);
    setP1Energy(5);
    setCpuEnergy(10);
    setP1Combo(0);
    setCpuCombo(0);
    setTimer(99);
    setRoundOver(false);
    setRoundWinnerName(null);

    audio.playBattleStart();

    // Clear announcement label after 2.2 seconds
    setTimeout(() => {
      setRoundAnnouncement('');
    }, 2200);
  }, [playerPokemon, cpuPokemon]);

  // Restart the whole tournament match
  const restartMatch = () => {
    setPlayerWins(0);
    setCpuWins(0);
    setMatchOver(false);
    setMatchWinner(null);
    resetRound(1);
  };

  // Keyboard controls listeners binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      
      // Prevent browser default scroll actions when playing with keys (such as Space or Arrow keys)
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd'].includes(k) || [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      // Record movement keys
      if (['a', 'd', 'w', 's', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(k) || [' ', 'arrowup'].includes(e.key)) {
        if (!roundOver && !matchOver) {
          keysRef.current[e.key] = true;
          // Support lowercase equivalent
          keysRef.current[k] = true;
        }
      }

      if (roundOver || matchOver) return;

      const active = isMultiplayer ? (multiplayerSide === 'player' ? p1Ref.current : cpuRef.current) : p1Ref.current;
      const target = isMultiplayer ? (multiplayerSide === 'player' ? cpuRef.current : p1Ref.current) : cpuRef.current;

      // Combat actions keys (strictly guarded against attack animation spamming)
      if (k === 'j' || e.key === '1') {
        if (active.state !== 'hit' && active.state !== 'fainted' && active.state !== 'ultimate' && !active.state.startsWith('attack_')) {
          active.state = 'attack_quick';
          active.stateTimer = 18; // 18 frames duration
          audio.playJump(); // Quick air swoosh
          triggerMeleeAttack(active, target, 'quick');
          if (isMultiplayer && clientSocket) {
            clientSocket.emit('remote_action', { roomId, action: 'melee_hit', payload: { attackType: 'quick', attackerId: multiplayerSide } });
          }
        }
      }
      else if (k === 'k' || e.key === '2') {
        if (active.state !== 'hit' && active.state !== 'fainted' && active.state !== 'ultimate' && !active.state.startsWith('attack_')) {
          active.state = 'attack_heavy';
          active.stateTimer = 32; // heavier swing
          triggerMeleeAttack(active, target, 'heavy');
          if (isMultiplayer && clientSocket) {
            clientSocket.emit('remote_action', { roomId, action: 'melee_hit', payload: { attackType: 'heavy', attackerId: multiplayerSide } });
          }
        }
      }
      else if (k === 'l' || e.key === '3') {
        if (active.state !== 'hit' && active.state !== 'fainted' && active.state !== 'ultimate' && !active.state.startsWith('attack_')) {
          fireSpecialProjectile(active, target);
          if (isMultiplayer && clientSocket) {
            clientSocket.emit('remote_action', { roomId, action: 'spawn_projectile', payload: { ownerId: multiplayerSide } });
          }
        }
      }
      else if (k === 'i' || e.key === '4') {
        if (active.state !== 'hit' && active.state !== 'fainted' && active.state !== 'ultimate' && active.energy >= 100) {
          executeUltimateMove(active, target);
          if (isMultiplayer && clientSocket) {
            clientSocket.emit('remote_action', { roomId, action: 'execute_ultimate', payload: { ownerId: multiplayerSide } });
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[e.key] = false;
      keysRef.current[k] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [roundOver, matchOver, triggerMeleeAttack, fireSpecialProjectile, executeUltimateMove]);

  // Round Timer Countdown Loop
  useEffect(() => {
    if (roundOver || matchOver || roundAnnouncement) return;
    const interval = setInterval(() => {
      setTimer((current) => {
        if (current <= 1) {
          clearInterval(interval);
          // Time out check round winner based on highest HP remaining!
          determineRoundWinner(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundOver, matchOver, roundAnnouncement]);

  const determineRoundWinner = (timeOut: boolean = false) => {
    if (roundOver) return;
    const p1 = p1Ref.current;
    const cpu = cpuRef.current;

    setRoundOver(true);

    let winner: 'player' | 'cpu' | 'draw' = 'draw';
    if (p1.hp > cpu.hp) winner = 'player';
    else if (cpu.hp > p1.hp) winner = 'cpu';

    if (winner === 'player') {
      const nextWins = playerWins + 1;
      setPlayerWins(nextWins);
      setRoundWinnerName(playerPokemon.name);
      audio.playWin();
      if (nextWins >= 2) {
        setTimeout(() => {
          setMatchOver(true);
          setMatchWinner('player');
          if (onMatchFinished) {
            onMatchFinished('player');
          }
          // Launch introductory glorious firework celebrations!
          for (let k = 0; k < 5; k++) {
            setTimeout(() => {
              createFirework(150 + Math.random() * 500, 70 + Math.random() * 110);
            }, k * 280);
          }
        }, 1200);
      } else {
        setTimeout(() => {
          resetRound(roundNumber + 1);
        }, 3200);
      }
    } else if (winner === 'cpu') {
      const nextWins = cpuWins + 1;
      setCpuWins(nextWins);
      setRoundWinnerName(cpuPokemon.name);
      audio.playDefeat();
      if (nextWins >= 2) {
        setTimeout(() => {
          setMatchOver(true);
          setMatchWinner('cpu');
          if (onMatchFinished) {
            onMatchFinished('cpu');
          }
        }, 1200);
      } else {
        setTimeout(() => {
          resetRound(roundNumber + 1);
        }, 3200);
      }
    } else {
      // Draw: restart same round
      setRoundWinnerName('DRAW!');
      setTimeout(() => {
        resetRound(roundNumber);
      }, 3000);
    }
  };

  // Main high-performance Canvas Frame Tick Loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal size of retro arena
    const w = 800;
    const h = 400;
    canvas.width = w;
    canvas.height = h;

    // Start with round setup once
    if (roundNumber === 1 && timer === 99 && !roundOver && !matchOver) {
      audio.playBattleStart();
      setTimeout(() => {
        setRoundAnnouncement('');
      }, 2000);
    }

    // Animation Loop
    const tick = () => {
      gameTickRef.current += 1;
      const tickCount = gameTickRef.current;

      // 1. Core Physics & CPU Movement decision engine
      const p1 = p1Ref.current;
      const cpu = cpuRef.current;

      // Check KO fainted states
      if (p1.hp <= 0 && p1.state !== 'fainted') {
        p1.state = 'fainted';
        p1.vx = -p1.dir * 4; // slide back slightly
        determineRoundWinner();
      }
      if (cpu.hp <= 0 && cpu.state !== 'fainted') {
        cpu.state = 'fainted';
        cpu.vx = -cpu.dir * 4;
        determineRoundWinner();
      }

      // Read walk & jump inputs based on local active controller mapping
      const activeFtr = isMultiplayer ? (multiplayerSide === 'player' ? p1 : cpu) : p1;
      const remoteFtr = isMultiplayer ? (multiplayerSide === 'player' ? cpu : p1) : cpu;

      if (activeFtr.state !== 'fainted' && activeFtr.state !== 'hit' && !roundAnnouncement && !roundOver) {
        // Horizontal Movement
        let isMoving = false;
        
        // Block condition (S or ArrowDown)
        if (keysRef.current['S'] || keysRef.current['s'] || keysRef.current['ArrowDown']) {
          activeFtr.isBlocking = true;
          activeFtr.vx = 0;
          if (activeFtr.isGrounded) activeFtr.state = 'idle';
        } else {
          activeFtr.isBlocking = false;
          
          if (keysRef.current['A'] || keysRef.current['a'] || keysRef.current['ArrowLeft']) {
            const currentSpeed = isMultiplayer ? (multiplayerSide === 'player' ? playerPokemon.speed : cpuPokemon.speed) : playerPokemon.speed;
            activeFtr.vx = -currentSpeed;
            activeFtr.dir = -1;
            isMoving = true;
          } else if (keysRef.current['D'] || keysRef.current['d'] || keysRef.current['ArrowRight']) {
            const currentSpeed = isMultiplayer ? (multiplayerSide === 'player' ? playerPokemon.speed : cpuPokemon.speed) : playerPokemon.speed;
            activeFtr.vx = currentSpeed;
            activeFtr.dir = 1;
            isMoving = true;
          } else {
            activeFtr.vx = activeFtr.vx * 0.76; // slide friction
          }

          // State visual alignment
          if (activeFtr.isGrounded && activeFtr.state !== 'attack_quick' && activeFtr.state !== 'attack_heavy' && activeFtr.state !== 'attack_special' && activeFtr.state !== 'ultimate') {
            activeFtr.state = isMoving ? 'walk' : 'idle';
          }
        }

        // Jump condition (W, Space or ArrowUp)
        if ((keysRef.current['W'] || keysRef.current['w'] || keysRef.current[' '] || keysRef.current['ArrowUp']) && activeFtr.isGrounded) {
          activeFtr.vy = -12; // vertical force
          activeFtr.isGrounded = false;
          activeFtr.state = 'jump';
          audio.playJump();
          createExplosion(activeFtr.x, activeFtr.y, '#94A3B8', 5, 2); // dust plume
        }
      } else {
        // Friction when disabled/hit
        activeFtr.vx *= 0.85;
      }

      // If we are in multiplayer, emit active state to room on tick counts (every 2 frames is perfect to limit network overhead)
      if (isMultiplayer && clientSocket && tickCount % 2 === 0) {
        clientSocket.emit('sync_state', {
          roomId,
          side: multiplayerSide,
          x: activeFtr.x,
          y: activeFtr.y,
          vx: activeFtr.vx,
          vy: activeFtr.vy,
          hp: activeFtr.hp,
          energy: activeFtr.energy,
          state: activeFtr.state,
          stateTimer: activeFtr.stateTimer,
          isBlocking: activeFtr.isBlocking,
          dir: activeFtr.dir,
          isGrounded: activeFtr.isGrounded
        });
      }

      // Friction for the other fighter in remote mode if we aren't receiving packets, or let them decay state
      if (isMultiplayer) {
        // Remote fighter shouldn't do AI logic, but align their facing dir to target
        remoteFtr.dir = (activeFtr.x - remoteFtr.x) > 0 ? 1 : -1;
      }

      // --- RIGHT-SIDE SINGLE PLAYER CPU AI INTELLIGENS MOVEMENT DECISION TREE --- (only when NOT in multiplayer)
      if (!isMultiplayer) {
        if (cpu.state !== 'fainted' && cpu.state !== 'hit' && !roundAnnouncement && !roundOver) {
          const dx = p1.x - cpu.x;
          const dist = Math.abs(dx);
          
          // Align CPU direction to face player
          cpu.dir = dx > 0 ? 1 : -1;

          // INSTANT HIGH-FREQUENCY BLOCKING SHIELD COOLDOWN (Checked every frame, not inside tickRate limit)
          const playerAttacking = (p1.state.startsWith('attack_') || p1.state === 'ultimate') && dist < 85;
          if (playerAttacking) {
            const blockChance = difficulty === 'easy' ? 0.22 : difficulty === 'normal' ? 0.60 : 0.88;
            if (Math.random() < blockChance) {
              cpu.isBlocking = true;
              cpu.vx *= 0.70; // slide back slightly during impact block
              if (cpu.state === 'walk') cpu.state = 'idle';
            }
          } else {
            // Drop block shield on off-frames dynamically
            if (tickCount % 3 === 0) {
              cpu.isBlocking = false;
            }
          }

          // Simple decision matrix based on time ticks and difficulty modifier
          const updateRate = difficulty === 'easy' ? 40 : difficulty === 'normal' ? 24 : 12;

          if (tickCount % updateRate === 0) {
            // AI Logic
            if (dist > 280) {
              // Far distance: run/advance towards competitor
              cpu.vx = cpu.dir * cpuPokemon.speed * 0.95;
              cpu.state = 'walk';
              cpu.isBlocking = false;

              // Occasional projectile shot
              if (Math.random() > 0.65 && cpu.energy >= cpuPokemon.moves.special.energyCost) {
                fireSpecialProjectile(cpu, p1);
              }
            } 
            else if (dist < 70) {
              // Extreme close range
              cpu.vx = 0;
              
              // No generic block here; handled above dynamically per frame!
              cpu.isBlocking = false;

              // Attack selection: Ultimate > Special > Heavy > Quick
              if (cpu.energy >= 100 && Math.random() > 0.15) {
                executeUltimateMove(cpu, p1);
              } else if (Math.random() > 0.60) {
                cpu.state = 'attack_heavy';
                cpu.stateTimer = 34;
                triggerMeleeAttack(cpu, p1, 'heavy');
              } else {
                cpu.state = 'attack_quick';
                cpu.stateTimer = 20;
                triggerMeleeAttack(cpu, p1, 'quick');
              }
            } 
            else {
              // Mid distance
              cpu.isBlocking = false;
              
              // Random walk back and forth
              if (Math.random() > 0.5) {
                cpu.vx = -cpu.dir * cpuPokemon.speed * 0.8;
                cpu.state = 'walk';
              } else {
                cpu.vx = cpu.dir * cpuPokemon.speed * 0.8;
                cpu.state = 'walk';
              }

              // Potential shoot or jump over incoming projectiles
              const nearbyProjectile = projectilesRef.current.some(pr => pr.ownerId === 'player' && Math.abs(pr.x - cpu.x) < 160);
              if (nearbyProjectile && cpu.isGrounded && Math.random() > 0.3) {
                // Jump dodge!
                cpu.vy = -11;
                cpu.isGrounded = false;
                cpu.state = 'jump';
                audio.playJump();
              } else if (Math.random() > 0.75 && cpu.energy >= cpuPokemon.moves.special.energyCost) {
                fireSpecialProjectile(cpu, p1);
              }
            }
          }
        } else if (cpu.state === 'hit' || cpu.state === 'fainted') {
          cpu.vx *= 0.85;
        }
      }

      // --- APPLIED PHYSICS FOR BOTH FIGHTERS ---
      // Player bounds
      p1.x += p1.vx;
      p1.y += p1.vy;
      
      // Strict upper ceiling constraint to prevent flying out of view (h is 400, so 60 keeps them clearly in playing field)
      if (p1.y < 60) {
        p1.y = 60;
        if (p1.vy < 0) {
          p1.vy = 1.5; // Snap downwards instantly!
        }
      }

      // Height-determined gravity and ground system
      if (p1.y < 310) {
        p1.isGrounded = false;
        p1.vy += 0.68; // Sniper, snappier crisp gravity physics (0.68 instead of floaty 0.52)
      } else {
        p1.y = 310;
        p1.vy = 0;
        p1.isGrounded = true;
        if (p1.state === 'jump') p1.state = 'idle';
      }

      // Wall boundary limits
      if (p1.x < 35) p1.x = 35;
      if (p1.x > w - 35) p1.x = w - 35;

      // CPU bounds
      cpu.x += cpu.vx;
      cpu.y += cpu.vy;

      // Strict upper ceiling constraint to prevent CPU flying out of view
      if (cpu.y < 60) {
        cpu.y = 60;
        if (cpu.vy < 0) {
          cpu.vy = 1.5; // Snap downwards instantly!
        }
      }

      if (cpu.y < 310) {
        cpu.isGrounded = false;
        cpu.vy += 0.68; // Physics gravity force multiplier
      } else {
        cpu.y = 310;
        cpu.vy = 0;
        cpu.isGrounded = true;
        if (cpu.state === 'jump') cpu.state = 'idle';
      }
      if (cpu.x < 35) cpu.x = 35;
      if (cpu.x > w - 35) cpu.x = w - 35;

      // Mutual fighter spacing collision (prevent overlaps completely)
      const touchDist = 48;
      const actualDx = cpu.x - p1.x;
      if (Math.abs(actualDx) < touchDist) {
        const oOverlap = touchDist - Math.abs(actualDx);
        const pushSide = actualDx > 0 ? 1 : -1;
        // Push apart
        p1.x -= pushSide * oOverlap * 0.5;
        cpu.x += pushSide * oOverlap * 0.5;
      }

      // Decrement states duration counters timers
      if (p1.stateTimer > 0) {
        p1.stateTimer--;
        if (p1.stateTimer === 0 && p1.state !== 'fainted') p1.state = 'idle';
      }
      if (cpu.stateTimer > 0) {
        cpu.stateTimer--;
        if (cpu.stateTimer === 0 && cpu.state !== 'fainted') {
          const wasHit = cpu.state === 'hit';
          cpu.state = 'idle';

          // Smart recovery escape action for CPU AI to prevent easy combo loops
          if (wasHit && !isMultiplayer) {
            const dist = Math.abs(p1.x - cpu.x);
            if (dist < 85) {
              const actionRoll = Math.random();
              const escapeChance = difficulty === 'easy' ? 0.15 : difficulty === 'normal' ? 0.50 : 0.82;
              if (actionRoll < escapeChance) {
                // Evasive roll/backdash hop!
                cpu.vx = -cpu.dir * cpuPokemon.speed * 1.6;
                cpu.vy = -3.5;
                cpu.isGrounded = false;
                cpu.state = 'jump';
                addCombatText('EVADE! 💨', cpu.x, cpu.y - 70, '#60A5FA', 18);
                audio.playJump();
              } else if (actionRoll < escapeChance + 0.15) {
                // Instant defensive stance awake
                cpu.isBlocking = true;
                addCombatText('DEFEND! 🛡️', cpu.x, cpu.y - 70, '#67E8F9', 18);
              }
            }
          }
        }
      }

      // Combo system timeout decay
      if (p1.comboTimer > 0) {
        p1.comboTimer--;
        if (p1.comboTimer === 0) {
          p1.comboCount = 0;
          setP1Combo(0);
        }
      }
      if (cpu.comboTimer > 0) {
        cpu.comboTimer--;
        if (cpu.comboTimer === 0) {
          cpu.comboCount = 0;
          setCpuCombo(0);
        }
      }

      // Passive small energy gain tick
      if (tickCount % 45 === 0 && !roundOver) {
        p1.energy = Math.min(p1.maxEnergy, p1.energy + 1);
        cpu.energy = Math.min(cpu.maxEnergy, cpu.energy + 1);
        setP1Energy(p1.energy);
        setCpuEnergy(cpu.energy);
      }

      // 2. PROJECTILES PHYSICS AND HIT INTERSECTS
      const projectiles = projectilesRef.current;
      projectilesRef.current = projectiles.filter((proj) => {
        // Move horizontal
        proj.x += proj.vx;

        // Check screen edge boundary cleanup
        if (proj.x < -40 || proj.x > w + 40) return false;

        // Check overlaps with competitor bounding box
        const target = proj.ownerId === 'player' ? cpu : p1;
        const targetData = proj.ownerId === 'player' ? cpuPokemon : playerPokemon;

        const distanceVectorX = Math.abs(proj.x - target.x);
        const distanceVectorY = Math.abs(proj.y - (target.y - target.height / 2));

        if (distanceVectorX < (target.width / 2 + proj.radius) && distanceVectorY < (target.height / 2 + proj.radius)) {
          // HIT!
          const isTargetBlocked = target.isBlocking && target.dir !== (proj.vx > 0 ? -1 : 1);
          let finalDmg = proj.damage;
          if (isTargetBlocked) {
            finalDmg = Math.round(finalDmg * 0.15); // absorb damage
          }

          // Damage target
          target.hp = Math.max(0, target.hp - finalDmg);
          (target.id === 'player') ? setP1Hp(target.hp) : setCpuHp(target.hp);

          target.state = 'hit';
          target.stateTimer = proj.isUltimate ? 34 : 16;
          // knock back push
          target.vx += (proj.vx > 0 ? 1 : -1) * (proj.isUltimate ? 16 : 8);

          // SFX Hit sound
          if (isTargetBlocked) {
            audio.playBlock();
            createExplosion(proj.x, proj.y, '#94A3B8', 12, 2.5);
            addCombatText('BLOCKED', target.x, target.y - 65, '#67E8F9', 18);
          } else {
            audio.playHeavyHit();
            createExplosion(proj.x, proj.y, proj.color, 24, 4);
            screenShakeRef.current = proj.isUltimate ? 24 : 12;
            addCombatText(`-${finalDmg}`, target.x, target.y - 60, proj.isUltimate ? '#FBBF24' : '#FFFFFF', proj.isUltimate ? 26 : 21);
          }

          return false; // delete this projectile immediately
        }

        return true;
      });

      // 3. COMBAT FLOATING TEXT DECAY ANIMATION
      const combatTexts = combatTextsRef.current;
      combatTextsRef.current = combatTexts.filter((txt) => {
        txt.x += txt.vx;
        txt.y += txt.vy;
        txt.vy += 0.05; // float slow deceleration
        txt.life--;
        txt.alpha = txt.life / 45;
        return txt.life > 0;
      });

      // 4. PARTICLES PHYSICS TRACKING AND COLLISION
      const particles = particlesRef.current;
      particlesRef.current = particles.filter((part) => {
        part.x += part.vx;
        part.y += part.vy;
        if (part.gravity) part.vy += part.gravity;
        part.life--;
        part.alpha = part.life / part.maxLife;
        return part.life > 0;
      });

      // 5. Celebrate match victory with continuous background fireworks
      if (matchOver && matchWinner === 'player' && tickCount % 24 === 0) {
        const fx = 100 + Math.random() * 600;
        const fy = 40 + Math.random() * 140;
        createFirework(fx, fy);
      }

      // Reduce screen shake
      if (screenShakeRef.current > 0) {
        screenShakeRef.current -= 0.85;
      }

      // --- RENDERING TO CANVAS ---
      ctx.save();
      
      // Perform screen vibration if shake ref is active
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
      }

      // Render backgrounds
      drawArenaBackground(ctx, selectedArena, w, h, tickCount);

      // Draw particle trails
      particlesRef.current.forEach((part) => drawParticle(ctx, part));

      // Draw projectiles
      projectilesRef.current.forEach((proj) => drawProjectile(ctx, proj, tickCount));

      // Draw Fighters
      drawFighter(ctx, p1, playerPokemon, tickCount);
      drawFighter(ctx, cpu, cpuPokemon, tickCount);

      // Draw floating scores/combos texts
      combatTextsRef.current.forEach((txt) => drawCombatText(ctx, txt));

      ctx.restore();

      // Enqueue next repaint frame
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [playerPokemon, cpuPokemon, selectedArena, difficulty, roundNumber, timer, roundOver, matchOver, matchWinner, triggerMeleeAttack, fireSpecialProjectile, executeUltimateMove, roundAnnouncement]);


  // Quick helper for triggering controls from virtual click pads!
  const triggerVirtualAction = (action: 'left' | 'right' | 'jump' | 'block' | 'quick' | 'heavy' | 'special' | 'ultimate') => {
    if (roundOver || matchOver) return;
    const p1 = p1Ref.current;

    if (action === 'left') {
      keysRef.current['a'] = true;
      keysRef.current['ArrowLeft'] = true;
    } 
    else if (action === 'right') {
      keysRef.current['d'] = true;
      keysRef.current['ArrowRight'] = true;
    } 
    else if (action === 'jump') {
      // Direct jump calculation: Instantaneous, independent of key release so it never gets stuck!
      if (p1.isGrounded && p1.state !== 'hit' && p1.state !== 'fainted' && !roundAnnouncement && !roundOver) {
        p1.vy = -12;
        p1.isGrounded = false;
        p1.state = 'jump';
        audio.playJump();
        createExplosion(p1.x, p1.y, '#94A3B8', 6, 2.5);
      }
    } 
    else if (action === 'block') {
      keysRef.current['s'] = true;
      keysRef.current['ArrowDown'] = true;
    } 
    else if (action === 'quick') {
      if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate' && !p1.state.startsWith('attack_')) {
        p1.state = 'attack_quick';
        p1.stateTimer = 18;
        audio.playJump();
        triggerMeleeAttack(p1, cpuRef.current, 'quick');
      }
    } 
    else if (action === 'heavy') {
      if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate' && !p1.state.startsWith('attack_')) {
        p1.state = 'attack_heavy';
        p1.stateTimer = 32;
        audio.playJump(); // Play kick sound effect
        triggerMeleeAttack(p1, cpuRef.current, 'heavy');
      }
    } 
    else if (action === 'special') {
      if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate' && !p1.state.startsWith('attack_')) {
        fireSpecialProjectile(p1, cpuRef.current);
      }
    } 
    else if (action === 'ultimate') {
      if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate' && p1.energy >= 100) {
        executeUltimateMove(p1, cpuRef.current);
      }
    }
  };

  const releaseVirtualAction = (action: 'left' | 'right' | 'jump' | 'block') => {
    if (action === 'left') {
      keysRef.current['a'] = false;
      keysRef.current['ArrowLeft'] = false;
    } else if (action === 'right') {
      keysRef.current['d'] = false;
      keysRef.current['ArrowRight'] = false;
    } else if (action === 'jump') {
      // No-op because jumping is a discrete impulse action!
      keysRef.current['w'] = false;
      keysRef.current[' '] = false;
      keysRef.current['ArrowUp'] = false;
    } else if (action === 'block') {
      keysRef.current['s'] = false;
      keysRef.current['ArrowDown'] = false;
    }
  };


  return (
    <div className="flex flex-col justify-between w-full h-full max-h-full max-w-5xl px-1 sm:px-2 py-1 select-none overflow-hidden gap-1 sm:gap-2 flex-1">
      
      {/* HEADER CONTROL BAR WITH LEAGUE STATS - REPOSITIONED AND COMPACTED */}
      <div className="flex items-center justify-between w-full backdrop-blur-md bg-slate-950/70 border border-white/5 py-1.5 px-3 rounded-xl gap-2 shadow-lg z-10 shrink-0">
        <button
          onClick={onExitToMenu}
          className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg transition shadow cursor-pointer uppercase shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-yellow-400" /> Back
        </button>

        {/* Difficulty Selection */}
        <div className="flex items-center gap-1.5 bg-slate-900/40 px-2 my-0.5 py-1 rounded-lg border border-white/5 shadow-inner">
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-black">Diff:</span>
          <div className="flex gap-1">
            {(['easy', 'normal', 'veteran'] as const).map((level) => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  audio.playSelect();
                }}
                className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase transition-all duration-300 ${
                  difficulty === level
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {level === 'easy' ? 'Easy' : level === 'normal' ? 'Normal' : 'Vet'}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Mute buttons */}
        <button
          onClick={toggleMute}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-900/40 hover:bg-white/10 rounded-lg border border-white/5 transition shadow cursor-pointer shrink-0"
          title="Mute Audio"
        >
          {soundOn ? <Volume2 className="w-3.5 h-3.5 text-yellow-400 drop-shadow-[0_0_4px_#facc15]" /> : <VolumeX className="w-3.5 h-3.5 text-rose-500" />}
        </button>
      </div>

      {/* FIGHT BAR HUD STATS - SLIM AND COMPACT FOR MAXIMUM VIEWPORT ALLOCATION */}
      <div className="relative w-full backdrop-blur-md bg-slate-900/60 border border-white/5 p-2 sm:p-3 pb-3 sm:pb-4 flex flex-col items-center gap-2 shadow-2xl z-10 rounded-2xl shrink-0">
        
        {/* Combo Floats */}
        <div className="absolute top-16 left-4 z-10 pointer-events-none transition-all">
          {p1Combo > 1 && (
            <div className="flex flex-col items-start animate-bounce">
              <span className="text-xl sm:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 tracking-wider font-display drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse">
                {p1Combo} HITS!
              </span>
            </div>
          )}
        </div>

        <div className="absolute top-16 right-4 z-10 pointer-events-none transition-all">
          {cpuCombo > 1 && (
            <div className="flex flex-col items-end animate-bounce">
              <span className="text-xl sm:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-400 to-red-400 tracking-wider font-display drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">
                {cpuCombo} HITS!
              </span>
            </div>
          )}
        </div>

        {/* Core Bars Container */}
        <div className="flex items-center justify-between w-full gap-3 sm:gap-4">
          
          {/* PLAYER 1 HEALTH & POWER METERS */}
          <div className="flex-1 flex flex-col items-start gap-1">
            <div className="flex items-center justify-between w-full">
              <span className="font-display font-bold text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="text-[9px] bg-indigo-500/20 border border-indigo-455/30 text-indigo-305 text-indigo-300 font-extrabold px-1.5 py-0.2 rounded font-mono shadow-sm">P1</span>
                {playerPokemon.name}
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-400">{p1Hp} / {playerPokemon.maxHp} HP</span>
            </div>
            
            {/* HP Slot */}
            <div className="w-full bg-slate-950/80 rounded-lg border border-white/5 h-4 sm:h-5 overflow-hidden shadow-inner relative">
              <div 
                className="h-full bg-gradient-to-r from-yellow-405 via-amber-400 to-yellow-300 transition-all duration-100 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                style={{ width: `${(p1Hp / playerPokemon.maxHp) * 100}%` }}
              />
              <div className="absolute top-0 right-0 bottom-0 bg-red-500/10 pointer-events-none" style={{ left: `${(p1Hp / playerPokemon.maxHp) * 100}%` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Ultimate Energy Progress Meter */}
            <div className="w-full flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] sm:text-[9px] font-mono font-black text-yellow-400 tracking-wider flex items-center gap-0.5 shrink-0">
                <Zap className={`w-3 h-3 ${p1Energy >= 100 ? 'text-yellow-400 animate-pulse' : 'text-slate-500'}`} /> POW
              </span>
              <div className="flex-1 bg-slate-950 rounded-md border border-white/5 h-2 overflow-hidden relative shadow-inner">
                <div 
                  className={`h-full transition-all duration-200 ${p1Energy >= 100 ? 'bg-gradient-to-r from-yellow-400 to-red-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-yellow-500'}`}
                  style={{ width: `${p1Energy}%` }}
                />
              </div>
              {p1Energy >= 100 && (
                <span className="text-[7.5px] font-sans font-black bg-gradient-to-r from-yellow-400 to-red-500 text-slate-950 px-1 py-0.2 rounded animate-pulse shadow-sm">CRITICAL READY</span>
              )}
            </div>
          </div>

          {/* TIMER ROUND STATS ROUND MIDDLE */}
          <div className="flex flex-col items-center justify-center bg-slate-950/90 border border-white/10 w-11 h-11 sm:w-13 sm:h-13 rounded-full relative shadow-[0_4px_12px_rgba(0,0,0,0.5)] shrink-0 select-none">
            <span className="text-xl sm:text-2xl font-black font-display text-yellow-400 leading-none drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]">{timer}</span>
            <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mt-0.5 scale-90">Sec</span>

            {/* Round wins dots */}
            <div className="absolute -bottom-4.5 flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
              <div className={`w-1.5 h-1.5 rounded-full border ${playerWins >= 1 ? 'bg-yellow-400 border-yellow-350 shadow-[0_0_6px_#fbbf24]' : 'bg-slate-800 border-white/5'}`} />
              <div className={`w-1.5 h-1.5 rounded-full border ${playerWins >= 2 ? 'bg-yellow-400 border-yellow-350 shadow-[0_0_6px_#fbbf24]' : 'bg-slate-800 border-white/5'}`} />
              <span className="text-[7.5px] text-slate-500 font-bold font-mono">VS</span>
              <div className={`w-1.5 h-1.5 rounded-full border ${cpuWins >= 1 ? 'bg-red-505 bg-rose-500 border-rose-400 shadow-[0_0_6px_#ef4444]' : 'bg-slate-800 border-white/5'}`} />
              <div className={`w-1.5 h-1.5 rounded-full border ${cpuWins >= 2 ? 'bg-red-505 bg-rose-500 border-rose-400 shadow-[0_0_6px_#ef4444]' : 'bg-slate-800 border-white/5'}`} />
            </div>
          </div>

          {/* CPU / FIGHTER 2 HP & POWER METERS */}
          <div className="flex-1 flex flex-col items-end gap-1">
            <div className="flex items-center justify-between w-full flex-row-reverse">
              <span className="font-display font-bold text-slate-100 flex items-center justify-end gap-1.5 text-xs sm:text-sm">
                {cpuPokemon.name}
                <span className="text-[9px] bg-rose-505/20 border border-rose-500/20 text-rose-300 font-extrabold px-1.5 py-0.2 rounded font-mono shadow-sm">CPU</span>
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-400">{cpuHp} / {cpuPokemon.maxHp} HP</span>
            </div>
            
            {/* HP Slot */}
            <div className="w-full bg-slate-950/80 rounded-lg border border-white/5 h-4 sm:h-5 overflow-hidden shadow-inner relative flex justify-end">
              <div 
                className="h-full bg-gradient-to-l from-red-600 via-rose-500 to-red-400 transition-all duration-100 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                style={{ width: `${(cpuHp / cpuPokemon.maxHp) * 100}%` }}
              />
              <div className="absolute top-0 left-0 bottom-0 bg-red-500/10 pointer-events-none" style={{ right: `${(cpuHp / cpuPokemon.maxHp) * 100}%` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* CPU Energy Progress Meter */}
            <div className="w-full flex items-center gap-1.5 mt-0.5 flex-row-reverse">
              <span className="text-[8px] sm:text-[9px] font-mono font-black text-rose-400 tracking-wider flex items-center gap-0.5 shrink-0">
                <Zap className={`w-3 h-3 ${cpuEnergy >= 100 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} /> POW
              </span>
              <div className="flex-1 bg-slate-950 rounded-md border border-white/5 h-2 overflow-hidden relative shadow-inner">
                <div 
                  className={`h-full transition-all duration-200 float-right ${cpuEnergy >= 100 ? 'bg-gradient-to-r from-red-500 to-rose-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-red-500'}`}
                  style={{ width: `${cpuEnergy}%`, float: 'right' }}
                />
              </div>
              {cpuEnergy >= 100 && (
                <span className="text-[7.5px] font-sans font-black bg-red-500 text-white px-1 py-0.2 rounded animate-pulse shadow-sm">CRITICAL READY</span>
              )}
            </div>
          </div>

        </div>

        {/* Current Arena Label under timer --- HIGH CONTRAST */}
        <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5 select-none font-bold uppercase tracking-wider justify-center">
          Stadium: <span className="text-yellow-400 font-extrabold">{selectedArena.name}</span> • Match Round #{roundNumber}
        </div>
      </div>

      {/* CORE 2D GAME CANVAS CONTAINER - FULL RESOLUTION DYNAMIC VIEWPORT ADAPTATION, NO SCROLLS */}
      <div className="relative w-full flex-1 min-h-0 bg-[#06080e] border border-white/5 shadow-2xl overflow-hidden rounded-2xl flex items-center justify-center">
        
        <canvas 
          ref={canvasRef}
          className="max-w-full max-h-full aspect-[2/1] object-contain block cursor-crosshair rounded-xl shadow-inner shadow-black"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* ROUND ANNOUNCEMENTS BANNER OVERLAY */}
        {roundAnnouncement && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-20 animate-fade-in backdrop-blur-sm">
            <div className="text-center">
              <div className="text-[10px] font-mono font-extrabold text-yellow-400 tracking-[0.25em] uppercase mb-1.5 animate-pulse">MATCH COMMENCING</div>
              <h2 className="text-3xl md:text-5xl lg:text-5.5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-250 to-red-400 select-none drop-shadow-[0_2px_15px_rgba(234,179,8,0.55)] font-display py-1">
                {roundAnnouncement}
              </h2>
              <p className="text-[9px] font-mono text-slate-400 mt-2 tracking-wide font-medium">Use Virtual touch buttons on your screen bottom or Keyboard action keys!</p>
            </div>
          </div>
        )}

        {/* ROUND OVER / KO BANNER OVERLAY */}
        {roundOver && !matchOver && !roundAnnouncement && (
          <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-20 backdrop-blur-sm">
            <div className="text-center animate-bounce">
              <h2 className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-yellow-400 tracking-wider drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] font-display py-0.5">
                K. O.
              </h2>
              <p className="text-sm font-display font-black text-white mt-2 bg-slate-900/40 px-4 py-1.5 rounded-full border border-white/5">
                {roundWinnerName === 'DRAW!' ? 'DRAW!' : `${roundWinnerName} wins the round!`}
              </p>
              <p className="text-[9px] font-mono text-slate-500 mt-2 font-bold uppercase tracking-wider">Loading next round...</p>
            </div>
          </div>
        )}

        {/* MATCH GAME OVER DIALOG VIEW */}
        {matchOver && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 z-30 transition backdrop-blur-md animate-fade-in">
            <div className="max-w-md w-full bg-slate-900/90 border border-white/10 p-5 rounded-3xl text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
              
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-400/[0.04] blur-2xl rounded-full animate-pulse" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-red-650/[0.04] blur-2xl rounded-full animate-pulse" />

              <div className="mx-auto w-12 h-12 bg-white/5 rounded-full border border-white/5 flex items-center justify-center mb-3.5 shadow-inner">
                <Trophy className={`w-6 h-6 ${matchWinner === 'player' ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-bounce' : 'text-slate-600'}`} />
              </div>

              <h2 className="text-2xl font-display font-black italic tracking-tight text-white uppercase">
                {matchWinner === 'player' ? 'Victory!' : 'Defeat...'}
              </h2>

              <p className="text-[11px] font-sans text-slate-400 mt-2 mb-4 leading-relaxed font-light">
                {matchWinner === 'player' ? (
                  <>Congratulations! Your controlled <span className="font-bold text-yellow-400 font-display">{playerPokemon.name}</span> has defeated the CPU-controlled <span className="font-bold text-slate-300">{cpuPokemon.name}</span> in the pocket tournament league!</>
                ) : (
                  <>Defeated! The CPU-controlled <span className="font-bold text-rose-450">{cpuPokemon.name}</span> was too strong this match. Practice and try again!</>
                )}
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={restartMatch}
                  className="w-full bg-gradient-to-r from-yellow-405 to-red-500 hover:from-yellow-400 hover:to-red-600 text-slate-950 font-display font-extrabold py-3.5 rounded-2xl transition shadow-[0_4px_15px_rgba(239,68,68,0.15)] flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rematch (Play Again)
                </button>
                
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <button
                    onClick={onSelectDifferentCharacters}
                    className="bg-slate-800/80 hover:bg-slate-800 text-[9px] font-bold text-slate-300 hover:text-white py-2.5 rounded-xl transition border border-white/5 uppercase tracking-wider cursor-pointer font-mono"
                  >
                    Swap Hero
                  </button>
                  <button
                    onClick={onExitToMenu}
                    className="bg-slate-800/80 hover:bg-slate-800 text-[9px] font-bold text-slate-300 hover:text-white py-2.5 rounded-xl transition border border-white/5 uppercase tracking-wider cursor-pointer font-mono"
                  >
                    Main Menu
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* DETAILED DIRECT Retro Gamepad Controller PAD - FULL WIDTH AT THE VERY BOTTOM */}
      <div className="w-full backdrop-blur-md bg-slate-950/70 border border-white/5 px-3 py-2 sm:py-2.5 rounded-2xl shadow-xl flex flex-col justify-center shrink-0">
        
        <div className="flex flex-row items-center gap-3 sm:gap-4 justify-between w-full">
          
          {/* 1. Direcetion D-PAD Cluster (LEFT, JUMP, RIGHT, BLOCK) */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 shadow-inner scale-90 sm:scale-100 origin-left shrink-0">
            <button
              onMouseDown={() => triggerVirtualAction('left')}
              onTouchStart={(e) => { e.preventDefault(); triggerVirtualAction('left'); }}
              onMouseUp={() => releaseVirtualAction('left')}
              onMouseLeave={() => releaseVirtualAction('left')}
              onTouchEnd={(e) => { e.preventDefault(); releaseVirtualAction('left'); }}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 active:bg-indigo-600 rounded-xl flex flex-col items-center justify-center text-indigo-400 shadow active:text-white font-mono font-black text-[9px] uppercase cursor-pointer select-none transition-transform active:scale-95"
              title="Left (A)"
            >
              <span className="text-[12px] sm:text-sm">◀</span>
              <span className="text-[6.5px]">A</span>
            </button>

            <div className="flex flex-col gap-1.5">
              <button
                onMouseDown={() => triggerVirtualAction('jump')}
                onTouchStart={(e) => { e.preventDefault(); triggerVirtualAction('jump'); }}
                onMouseUp={() => releaseVirtualAction('jump')}
                onMouseLeave={() => releaseVirtualAction('jump')}
                onTouchEnd={(e) => { e.preventDefault(); releaseVirtualAction('jump'); }}
                className="w-10 h-8 sm:w-11 sm:h-9 bg-yellow-405/10 hover:bg-yellow-405/20 border border-yellow-400/20 active:bg-yellow-400 active:text-slate-950 rounded-xl flex flex-col items-center justify-center text-yellow-500 shadow font-mono font-black text-[9px] uppercase cursor-pointer select-none transition-all active:scale-95"
                title="Jump (W)"
              >
                <span className="text-[9px]">▲</span>
                <span className="text-[6px]">JUMP</span>
              </button>
              
              <button
                onMouseDown={() => triggerVirtualAction('block')}
                onTouchStart={(e) => { e.preventDefault(); triggerVirtualAction('block'); }}
                onMouseUp={() => releaseVirtualAction('block')}
                onMouseLeave={() => releaseVirtualAction('block')}
                onTouchEnd={(e) => { e.preventDefault(); releaseVirtualAction('block'); }}
                className="w-10 h-8 sm:w-11 sm:h-9 bg-slate-800/40 hover:bg-slate-805 border border-white/5 hover:border-white/10 active:bg-slate-705 rounded-xl flex flex-col items-center justify-center text-slate-400 active:text-white shadow font-mono font-black text-[9px] uppercase cursor-pointer select-none transition-all active:scale-95"
                title="Block (S)"
              >
                <span className="text-[6px]">BLOCK</span>
                <span className="text-[9px]">▼</span>
              </button>
            </div>

            <button
              onMouseDown={() => triggerVirtualAction('right')}
              onTouchStart={(e) => { e.preventDefault(); triggerVirtualAction('right'); }}
              onMouseUp={() => releaseVirtualAction('right')}
              onMouseLeave={() => releaseVirtualAction('right')}
              onTouchEnd={(e) => { e.preventDefault(); releaseVirtualAction('right'); }}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 active:bg-indigo-600 rounded-xl flex flex-col items-center justify-center text-indigo-400 shadow active:text-white font-mono font-black text-[9px] uppercase cursor-pointer select-none transition-transform active:scale-95"
              title="Right (D)"
            >
              <span className="text-[12px] sm:text-sm">▶</span>
              <span className="text-[6.5px]">D</span>
            </button>
          </div>

          {/* Core Tip HUD */}
          <div className="hidden lg:flex flex-col text-center justify-center leading-normal max-w-xs">
            <span className="text-[8px] font-mono font-black text-rose-400 uppercase tracking-widest block mb-0.5">Quick Guide tip:</span>
            <p className="text-[9.5px] font-sans text-slate-400 font-light">
              Press <span className="text-yellow-400 font-bold">[S]</span> or <span className="text-yellow-400 font-bold">[BLOCK]</span> button to absorb 85% of incoming damages!
            </p>
          </div>

          {/* 2. Attack Actions Buttons Cluster (PUNCH, KICK, PROJECTILE, ULTIMATE) */}
          <div className="flex-1 grid grid-cols-4 gap-1 sm:gap-1.5 max-w-lg origin-right scale-90 sm:scale-100 pb-0.5">
            <button
              onClick={() => {
                triggerVirtualAction('quick');
                audio.playSelect();
              }}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 active:bg-red-600 text-slate-100 py-1 px-1 sm:px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 cursor-pointer shadow-md h-11 sm:h-13"
            >
              <span className="text-[10px] sm:text-xs font-display font-extrabold text-red-400">PUNCH</span>
              <span className="text-[7.5px] font-mono text-slate-400 font-bold">[ J ]</span>
            </button>

            <button
              onClick={() => {
                triggerVirtualAction('heavy');
                audio.playSelect();
              }}
              className="bg-yellow-405/10 hover:bg-yellow-405/20 border border-yellow-405/20 active:bg-yellow-400 active:text-slate-950 text-slate-100 py-1 px-1 sm:px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 cursor-pointer shadow-md h-11 sm:h-13"
            >
              <span className="text-[10px] sm:text-xs font-display font-extrabold text-yellow-300">KICK</span>
              <span className="text-[7.5px] font-mono text-slate-400 font-bold">[ K ]</span>
            </button>

            <button
              onClick={() => {
                triggerVirtualAction('special');
                audio.playSelect();
              }}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 active:bg-cyan-500 hover:border-cyan-500/30 text-slate-100 py-1 px-1 sm:px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 cursor-pointer shadow-md h-11 sm:h-13"
            >
              <div className="flex items-center gap-0.5 scale-75 md:scale-90">
                {playerPokemon.id === 'charizard' && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                {playerPokemon.id === 'blastoise' && <Waves className="w-3.5 h-3.5 text-cyan-400" />}
                {playerPokemon.id === 'gengar' && <Skull className="w-3.5 h-3.5 text-purple-400" />}
                {playerPokemon.id === 'pikachu' && <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />}
                {playerPokemon.id === 'lucario' && <Sparkles className="w-3.5 h-3.5 text-teal-400" />}
                {playerPokemon.id === 'greninja' && <Waves className="w-3.5 h-3.5 text-sky-400" />}
                {playerPokemon.id === 'mewtwo' && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                {playerPokemon.id === 'snorlax' && <Star className="w-3.5 h-3.5 text-slate-400" />}
              </div>
              <span className="text-[7.5px] font-mono text-slate-400 uppercase font-black tracking-tighter">[ L ]</span>
            </button>

            <button
              disabled={p1Energy < 100}
              onClick={() => {
                triggerVirtualAction('ultimate');
                audio.playSelect();
              }}
              className={`py-1 px-1 sm:px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition shadow-md h-11 sm:h-13 ${
                p1Energy >= 100
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 border border-yellow-300 text-slate-950 font-black animate-pulse cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95'
                  : 'bg-slate-950/40 border border-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Trophy className={`w-3.5 h-3.5 ${p1Energy >= 100 ? 'text-slate-950' : 'text-slate-650'}`} />
              <span className="text-[9px] sm:text-[10px] font-display font-extrabold tracking-tighter leading-none">ULTI [ I ]</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
