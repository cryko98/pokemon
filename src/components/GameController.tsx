import React, { useEffect, useRef, useState, useCallback } from 'react';
import { POKEMONS, ARENAS } from '../data';
import { Fighter, Projectile, CombatText, Particle, Arena, PokemonCharacter } from '../types';
import { drawFighter, drawProjectile, drawCombatText, drawParticle, drawArenaBackground } from '../utils/renderer';
import { audio } from '../utils/audio';
import { Sword, RotateCcw, Shield, ShieldCheck, Zap, Volume2, VolumeX, Trophy, Sparkles, ChevronLeft, Flame, Waves, Skull, UserCheck } from 'lucide-react';

interface GameControllerProps {
  playerPokemon: PokemonCharacter;
  cpuPokemon: PokemonCharacter;
  selectedArena: Arena;
  onExitToMenu: () => void;
  onSelectDifferentCharacters: () => void;
}

export default function GameController({
  playerPokemon,
  cpuPokemon,
  selectedArena,
  onExitToMenu,
  onSelectDifferentCharacters
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

  // Combat collision: Check proximity and apply hit mechanics
  const triggerMeleeAttack = useCallback((attacker: Fighter, defender: Fighter, attackType: 'quick' | 'heavy' | 'ultimate') => {
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
    if (attackType === 'ultimate') {
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
      // Calculate blocking status of victim
      const isDefBlocked = defender.isBlocking && defender.dir !== attacker.dir; 
      let finalDamage = Math.round(move.damage * (1 + (pokeData.attack - 15) * 0.015));
      if (isDefBlocked) {
        finalDamage = Math.round(finalDamage * 0.15); // block absorbs 85% damage!
      }

      // Check for Gengar's Dream Eater ultimate lifesteal!
    // Helper: Trigger Gengar lifesteal or other texts in English
    if (attackType === 'ultimate' && pokeData.id === 'gengar') {
      const hSteal = Math.round(finalDamage * 0.4);
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + hSteal);
      if (isPlayer) setP1Hp(attacker.hp);
      else setCpuHp(attacker.hp);
      addCombatText(`STEAL +${hSteal}`, attacker.x, attacker.y - 60, '#A78BFA', 22);
    }

      // Apply damage
      defender.hp = Math.max(0, defender.hp - finalDamage);
      (defender.id === 'player') ? setP1Hp(defender.hp) : setCpuHp(defender.hp);

      // Trigger screen shake & Sound effects
      screenShakeRef.current = attackType === 'quick' ? 8 : attackType === 'heavy' ? 16 : 28;
      if (isDefBlocked) {
        audio.playBlock();
        addCombatText('KIVÉDVE!', defender.x, defender.y - 50, '#67E8F9', 20);
        createExplosion(defender.x, defender.y - 25, '#CBD5E1', 10, 2);
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
          `${isCritical ? 'KRITIKUS! ' : ''}-${finalDamage}`, 
          defender.x + (Math.random() - 0.5) * 15, 
          defender.y - 45, 
          damageColor, 
          isCritical || attackType === 'ultimate' ? 24 : 19
        );

        // Splash blood/sparks
        createExplosion(defender.x, defender.y - 30, isCritical ? '#DC2626' : (attacker.id === 'player' ? playerPokemon.color : cpuPokemon.color), 16, 4);
      }

      // Build energy on successful landing
      attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + (attackType === 'quick' ? 10 : 20));
      if (isPlayer) setP1Energy(attacker.energy);
      else setCpuEnergy(attacker.energy);

    } else {
      // Whiff sound or air hit effect
    }
  }, [playerPokemon, cpuPokemon]);

  // Handle firing projectile
  const fireSpecialProjectile = useCallback((attacker: Fighter, defender: Fighter) => {
    const isPlayer = attacker.id === 'player';
    const pokeData = isPlayer ? playerPokemon : cpuPokemon;
    const move = pokeData.moves.special;

    if (attacker.energy < move.energyCost) {
      if (isPlayer) addCombatText('No energy!', attacker.x, attacker.y - 50, '#EF4444', 16);
      return;
    }

    // Deduct energy
    attacker.energy -= move.energyCost;
    if (isPlayer) setP1Energy(attacker.energy);
    else setCpuEnergy(attacker.energy);

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
  const executeUltimateMove = useCallback((attacker: Fighter, defender: Fighter) => {
    const isPlayer = attacker.id === 'player';
    const pokeData = isPlayer ? playerPokemon : cpuPokemon;

    // Check energy
    if (attacker.energy < 100) return;

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
        triggerMeleeAttack(attacker, defender, 'ultimate');
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

      // Combat actions keys
      if (k === 'j' || e.key === '1') {
        const p1 = p1Ref.current;
        if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate') {
          p1.state = 'attack_quick';
          p1.stateTimer = 18; // 18 frames duration
          audio.playJump(); // Quick air swoosh
          triggerMeleeAttack(p1, cpuRef.current, 'quick');
        }
      }
      else if (k === 'k' || e.key === '2') {
        const p1 = p1Ref.current;
        if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate') {
          p1.state = 'attack_heavy';
          p1.stateTimer = 32; // heavier swing
          triggerMeleeAttack(p1, cpuRef.current, 'heavy');
        }
      }
      else if (k === 'l' || e.key === '3') {
        const p1 = p1Ref.current;
        if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate') {
          fireSpecialProjectile(p1, cpuRef.current);
        }
      }
      else if (k === 'i' || e.key === '4') {
        const p1 = p1Ref.current;
        if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate' && p1.energy >= 100) {
          executeUltimateMove(p1, cpuRef.current);
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

      // Read player walk inputs
      if (p1.state !== 'fainted' && p1.state !== 'hit' && !roundAnnouncement && !roundOver) {
        // Horizontal Movement
        let isMoving = false;
        
        // Block condition (S or ArrowDown)
        if (keysRef.current['S'] || keysRef.current['s'] || keysRef.current['ArrowDown']) {
          p1.isBlocking = true;
          p1.vx = 0;
          if (p1.isGrounded) p1.state = 'idle';
        } else {
          p1.isBlocking = false;
          
          if (keysRef.current['A'] || keysRef.current['a'] || keysRef.current['ArrowLeft']) {
            p1.vx = -playerPokemon.speed;
            p1.dir = -1;
            isMoving = true;
          } else if (keysRef.current['D'] || keysRef.current['d'] || keysRef.current['ArrowRight']) {
            p1.vx = playerPokemon.speed;
            p1.dir = 1;
            isMoving = true;
          } else {
            p1.vx = p1.vx * 0.76; // slide friction
          }

          // State visual alignment
          if (p1.isGrounded && p1.state !== 'attack_quick' && p1.state !== 'attack_heavy' && p1.state !== 'attack_special' && p1.state !== 'ultimate') {
            p1.state = isMoving ? 'walk' : 'idle';
          }
        }

        // Jump condition (W, Space or ArrowUp)
        if ((keysRef.current['W'] || keysRef.current['w'] || keysRef.current[' '] || keysRef.current['ArrowUp']) && p1.isGrounded) {
          p1.vy = -12; // vertical force
          p1.isGrounded = false;
          p1.state = 'jump';
          audio.playJump();
          createExplosion(p1.x, p1.y, '#94A3B8', 5, 2); // dust plume
        }
      } else {
        // Friction when disabled/hit
        p1.vx *= 0.85;
      }

      // --- JOBB OLDALI CPU AI INTELLIGENS MOZGATÁSI RECIPIENSE --- (cpuRef)
      if (cpu.state !== 'fainted' && cpu.state !== 'hit' && !roundAnnouncement && !roundOver) {
        const dx = p1.x - cpu.x;
        const dist = Math.abs(dx);
        
        // Align CPU direction to face player
        cpu.dir = dx > 0 ? 1 : -1;

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
            
            // Check if player is attacking to activate smart defense block!
            const playerAttacking = p1.state.includes('attack_') || p1.state === 'ultimate';
            const blockChance = difficulty === 'easy' ? 0.28 : difficulty === 'normal' ? 0.62 : 0.82;
            
            if (playerAttacking && Math.random() < blockChance) {
              // Activate Block Shield
              cpu.isBlocking = true;
              cpu.state = 'idle';
            } else {
              cpu.isBlocking = false;
              // Attack selection: Ultimate > Special > Heavy > Quick
              if (cpu.energy >= 100 && Math.random() > 0.2) {
                executeUltimateMove(cpu, p1);
              } else if (Math.random() > 0.65) {
                cpu.state = 'attack_heavy';
                cpu.stateTimer = 34;
                triggerMeleeAttack(cpu, p1, 'heavy');
              } else {
                cpu.state = 'attack_quick';
                cpu.stateTimer = 20;
                triggerMeleeAttack(cpu, p1, 'quick');
              }
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
        if (cpu.stateTimer === 0 && cpu.state !== 'fainted') cpu.state = 'idle';
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
  }, [playerPokemon, cpuPokemon, selectedArena, difficulty, roundNumber, timer, roundOver, matchOver, triggerMeleeAttack, fireSpecialProjectile, executeUltimateMove, roundAnnouncement]);


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
      if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate') {
        p1.state = 'attack_quick';
        p1.stateTimer = 18;
        audio.playJump();
        triggerMeleeAttack(p1, cpuRef.current, 'quick');
      }
    } 
    else if (action === 'heavy') {
      if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate') {
        p1.state = 'attack_heavy';
        p1.stateTimer = 32;
        audio.playJump(); // Play kick sound effect
        triggerMeleeAttack(p1, cpuRef.current, 'heavy');
      }
    } 
    else if (action === 'special') {
      if (p1.state !== 'hit' && p1.state !== 'fainted' && p1.state !== 'ultimate') {
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
    <div className="flex flex-col items-center w-full max-w-5xl px-2 py-4 select-none">
      
      {/* HEADER CONTROL BAR WITH LEAGUE STATS */}
      <div className="flex flex-wrap items-center justify-between w-full backdrop-blur-md bg-slate-950/40 border-t border-x border-white/5 p-4 rounded-t-2xl gap-4 shadow-xl z-10">
        <button
          onClick={onExitToMenu}
          className="flex items-center gap-2 text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-3.5 py-2 rounded-xl transition shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-amber-500 animate-pulse" /> Exit to Main Menu
        </button>

        {/* Difficulty Selection */}
        <div className="flex items-center gap-2 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-white/5 shadow-inner">
          <span className="text-[11px] font-mono text-slate-400">Difficulty:</span>
          <div className="flex gap-1.5">
            {(['easy', 'normal', 'veteran'] as const).map((level) => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  audio.playSelect();
                }}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase transition-all duration-300 ${
                  difficulty === level
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {level === 'easy' ? 'Easy' : level === 'normal' ? 'Normal' : 'Veteran'}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Mute buttons */}
        <button
          onClick={toggleMute}
          className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all shadow-md cursor-pointer"
          title="Mute Audio"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_4px_#34d399]" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
        </button>
      </div>

      {/* FIGHT BAR HUD STATS */}
      <div className="relative w-full backdrop-blur-md bg-[#090b11]/75 border-x border-white/5 p-5 flex flex-col items-center gap-3.5 shadow-2xl z-10">
        
        {/* Combo Floats */}
        <div className="absolute top-24 left-6 z-10 pointer-events-none transition-all">
          {p1Combo > 1 && (
            <div className="flex flex-col items-start animate-bounce">
              <span className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wider font-orbitron drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                {p1Combo} HITS!
              </span>
              <span className="text-[9px] font-mono uppercase bg-amber-500 text-slate-950 px-2 py-0.5 font-bold rounded shadow">
                Combo Sequence
              </span>
            </div>
          )}
        </div>

        <div className="absolute top-24 right-6 z-10 pointer-events-none transition-all">
          {cpuCombo > 1 && (
            <div className="flex flex-col items-end animate-bounce">
              <span className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-400 tracking-wider font-orbitron drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                {cpuCombo} HITS!
              </span>
              <span className="text-[9px] font-mono uppercase bg-rose-500 text-white px-2 py-0.5 font-bold rounded shadow">
                CPU Combo!
              </span>
            </div>
          )}
        </div>

        {/* Core Bars Container */}
        <div className="flex items-center justify-between w-full gap-5">
          
          {/* PLAYER 1 HEALTH & POWER METERS */}
          <div className="flex-1 flex flex-col items-start gap-1.5">
            <div className="flex items-center justify-between w-full">
              <span className="font-display font-bold text-slate-100 flex items-center gap-2">
                <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded font-mono shadow-sm">P1</span>
                {playerPokemon.name}
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">{p1Hp} / {playerPokemon.maxHp} HP</span>
            </div>
            
            {/* HP Slot */}
            <div className="w-full bg-slate-950/80 rounded-xl border border-white/5 h-6 overflow-hidden shadow-inner relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 transition-all duration-100 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                style={{ width: `${(p1Hp / playerPokemon.maxHp) * 100}%` }}
              />
              {/* Damage backing indicator */}
              <div className="absolute top-0 right-0 bottom-0 bg-rose-500/10 pointer-events-none" style={{ left: `${(p1Hp / playerPokemon.maxHp) * 100}%` }} />
              {/* Shiny Glass Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Ultimate Energy Progress Meter */}
            <div className="w-full flex items-center gap-2 mt-1">
              <span className="text-[9px] font-mono font-black text-amber-500 tracking-wider flex items-center gap-0.5">
                <Zap className={`w-3.5 h-3.5 ${p1Energy >= 100 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} /> ENERGY
              </span>
              <div className="flex-1 bg-slate-950 rounded-lg border border-white/5 h-2.5 overflow-hidden relative shadow-inner">
                <div 
                  className={`h-full transition-all duration-200 ${p1Energy >= 100 ? 'bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-amber-600'}`}
                  style={{ width: `${p1Energy}%` }}
                />
              </div>
              {p1Energy >= 100 && (
                <span className="text-[8px] font-sans font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-1.5 py-0.2 rounded-md animate-pulse shadow-sm">ULTI READY</span>
              )}
            </div>
          </div>

          {/* TIMER ROUND STATS ROUND MIDDLE */}
          <div className="flex flex-col items-center justify-center bg-slate-950 border border-amber-500/30 w-16 h-16 rounded-full relative shadow-[0_0_15px_rgba(245,158,11,0.1)] shrink-0 select-none">
            <span className="text-2xl font-black font-orbitron text-amber-400 leading-none drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]">{timer}</span>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">Sec</span>

            {/* Round wins dots */}
            <div className="absolute -bottom-6 flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-full border border-white/5 shadow-md">
              <div className={`w-2 h-2 rounded-full border ${playerWins >= 1 ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_#fbbf24]' : 'bg-slate-800 border-slate-705'}`} />
              <div className={`w-2 h-2 rounded-full border ${playerWins >= 2 ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_#fbbf24]' : 'bg-slate-800 border-slate-705'}`} />
              <span className="text-[9px] text-slate-500 mx-0.5 font-bold font-mono">VS</span>
              <div className={`w-2 h-2 rounded-full border ${cpuWins >= 1 ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_#ef4444]' : 'bg-slate-800 border-slate-705'}`} />
              <div className={`w-2 h-2 rounded-full border ${cpuWins >= 2 ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_#ef4444]' : 'bg-slate-800 border-slate-705'}`} />
            </div>
          </div>

          {/* CPU / FIGHTER 2 HP & POWER METERS */}
          <div className="flex-1 flex flex-col items-end gap-1.5">
            <div className="flex items-center justify-between w-full flex-row-reverse">
              <span className="font-display font-bold text-slate-100 flex items-center justify-end gap-2">
                {cpuPokemon.name}
                <span className="text-[10px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded font-mono shadow-sm">CPU</span>
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">{cpuHp} / {cpuPokemon.maxHp} HP</span>
            </div>
            
            {/* HP Slot */}
            <div className="w-full bg-slate-950/80 rounded-xl border border-white/5 h-6 overflow-hidden shadow-inner relative flex justify-end">
              <div 
                className="h-full bg-gradient-to-l from-rose-500 via-red-400 to-rose-500 transition-all duration-100 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                style={{ width: `${(cpuHp / cpuPokemon.maxHp) * 100}%` }}
              />
              <div className="absolute top-0 left-0 bottom-0 bg-rose-500/10 pointer-events-none" style={{ right: `${(cpuHp / cpuPokemon.maxHp) * 100}%` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>

            {/* CPU Energy Progress Meter */}
            <div className="w-full flex items-center gap-2 mt-1 flex-row-reverse">
              <span className="text-[9px] font-mono font-black text-rose-400 tracking-wider flex items-center gap-0.5">
                <Zap className={`w-3.5 h-3.5 ${cpuEnergy >= 100 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} /> ENERGY
              </span>
              <div className="flex-1 bg-slate-950 rounded-lg border border-white/5 h-2.5 overflow-hidden relative shadow-inner">
                <div 
                  className={`h-full transition-all duration-200 float-right ${cpuEnergy >= 100 ? 'bg-gradient-to-r from-rose-400 to-red-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-rose-600'}`}
                  style={{ width: `${cpuEnergy}%`, float: 'right' }}
                />
              </div>
              {cpuEnergy >= 100 && (
                <span className="text-[8px] font-sans font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-md animate-pulse shadow-sm">ULTI READY</span>
              )}
            </div>
          </div>

        </div>

        {/* Current Arena Label under timer */}
        <div className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-widest text-center">
          Arena: <span className="text-amber-400 font-bold">{selectedArena.name}</span> • Round #{roundNumber}
        </div>
      </div>

      {/* CORE 2D GAME CANVAS CONTAINER */}
      <div className="relative w-full bg-slate-950 border-x border-b border-white/5 shadow-2xl overflow-hidden aspect-[2/1] rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.57)]">
        
        <canvas 
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* ROUND ANNOUNCEMENTS BANNER OVERLAY */}
        {roundAnnouncement && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-20 animate-fade-in backdrop-blur-sm">
            <div className="text-center">
              <div className="text-[10px] font-mono font-extrabold text-amber-500 tracking-[0.25em] uppercase mb-2 animate-pulse">BATTLE COMMENCING!</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-slate-200 select-none drop-shadow-[0_2px_15px_rgba(245,158,11,0.55)] font-orbitron py-2">
                {roundAnnouncement}
              </h2>
              <p className="text-[10px] font-mono text-slate-400 mt-3.5 tracking-wide">Controls: [A/D] - Move, [W] - Jump, [S] - Defend, [J/K/L/I] - Action / Combat</p>
            </div>
          </div>
        )}

        {/* ROUND OVER / KO BANNER OVERLAY */}
        {roundOver && !matchOver && !roundAnnouncement && (
          <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-20 backdrop-blur-sm">
            <div className="text-center animate-bounce">
              <h2 className="text-5xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-400 to-rose-600 tracking-wider drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] font-orbitron py-1">
                K. O.
              </h2>
              <p className="text-base font-display font-bold text-white mt-3 bg-slate-950/40 px-4 py-1.5 rounded-full border border-white/5">
                {roundWinnerName === 'DRAW!' ? 'DRAW!' : `${roundWinnerName} wins the round!`}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-2">CPU preparing for the next round...</p>
            </div>
          </div>
        )}

        {/* MATCH GAME OVER DIALOG VIEW */}
        {matchOver && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 z-30 transition backdrop-blur-md animate-fade-in">
            <div className="max-w-md w-full bg-slate-950 border border-white/10 p-7 rounded-2xl text-center shadow-2xl relative overflow-hidden">
              
              {/* Decorative glows */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-slate-900/40 blur-2xl rounded-full" />

              {/* Decorative crown / trophy badge */}
              <div className="mx-auto w-16 h-16 bg-white/5 rounded-full border border-white/5 flex items-center justify-center mb-4.5 shadow-inner">
                <Trophy className={`w-8 h-8 ${matchWinner === 'player' ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-bounce' : 'text-slate-600'}`} />
              </div>

              <h2 className="text-3xl font-orbitron font-black italic tracking-tight text-white uppercase bg-gradient-to-r from-white via-amber-200 to-slate-200 bg-clip-text text-transparent">
                {matchWinner === 'player' ? 'Victory!' : 'Defeat...'}
              </h2>

              <p className="text-xs font-sans text-slate-300 mt-3 mb-6.5 leading-relaxed font-light">
                {matchWinner === 'player' ? (
                  <>Congratulations! Your controlled <span className="font-bold text-amber-400 font-display">{playerPokemon.name}</span> has defeated the CPU-controlled <span className="font-bold text-slate-400">{cpuPokemon.name}</span> in the pocket tournament league!</>
                ) : (
                  <>Defeated! The CPU-controlled <span className="font-bold text-rose-400">{cpuPokemon.name}</span> was too strong this match. Practice and try again!</>
                )}
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={restartMatch}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-orbitron font-extrabold py-3 rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <RotateCcw className="w-4 h-4" /> Rematch (Play Again)
                </button>
                
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={onSelectDifferentCharacters}
                    className="bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white py-2.5 rounded-xl transition border border-white/5 uppercase tracking-wide cursor-pointer"
                  >
                    Swap Pokémon
                  </button>
                  <button
                    onClick={onExitToMenu}
                    className="bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white py-2.5 rounded-xl transition border border-white/5 uppercase tracking-wide cursor-pointer"
                  >
                    Main Menu
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* DETAILED CONTROLS PANEL & RETRO TOUCH CONTROLLER PAD */}
      <div className="mt-5 w-full grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Keyboard Controls Instructions Manual */}
        <div className="md:col-span-4 backdrop-blur-md bg-slate-900/20 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block mb-3.5 border-b border-white/5 pb-1">KEYBOARD CONTROLS:</span>
            <ul className="text-xs font-mono text-slate-350 space-y-2.5">
              <li className="flex justify-between border-b border-white/5 pb-1.5 font-light">
                <span>Move (Left / Right):</span>
                <span className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded text-amber-400 text-[10px] font-bold">A / D</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1.5 font-light">
                <span>Jump (Up):</span>
                <span className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded text-amber-400 text-[10px] font-bold">W / Space</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1.5 font-light">
                <span>Block / Defend:</span>
                <span className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded text-amber-400 text-[10px] font-bold">S / Arrow Down</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1.5 font-light">
                <span>Quick Punch:</span>
                <span className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded text-amber-400 text-[10px] font-bold">J or 1</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1.5 font-light">
                <span>Heavy Kick:</span>
                <span className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded text-amber-400 text-[10px] font-bold">K or 2</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1.5 font-light">
                <span>Special Projectile:</span>
                <span className="bg-slate-950 border border-white/10 px-2 py-0.5 rounded text-amber-400 text-[10px] font-bold">L or 3</span>
              </li>
              <li className="flex justify-between font-light">
                <span>Ultimate Move / Blast:</span>
                <span className="bg-slate-950 border border-amber-500/30 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.25)]">I or 4</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/15 p-3 rounded-xl mt-4">
            <span className="text-[9px] font-mono font-black text-amber-300 uppercase tracking-widest block mb-1">Battle Tip:</span>
            <p className="text-[10px] text-slate-400 leading-normal font-light">
              Blocking absorbs 85% of incoming damage! Once your energy bar fills up to 100%, press the ULTIMATE key to launch your signature finisher!
            </p>
          </div>
        </div>

        {/* DIRECT TOUCH / MOUSE CONTROLS (THE RETRO GAMEPAD) */}
        <div className="md:col-span-8 backdrop-blur-md bg-slate-900/20 border border-white/5 p-5 rounded-xl shadow-lg flex flex-col justify-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-4 text-center md:text-left">
            Visual Retro Gamepad Controller (Perfect for mobile touch or mouse clicks!)
          </span>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-around">
            
            {/* Direction D-PAD Cluster */}
            <div className="grid grid-cols-3 gap-2 w-32 h-32 shrink-0">
              <div />
              <button
                onMouseDown={() => triggerVirtualAction('jump')}
                onTouchStart={() => triggerVirtualAction('jump')}
                onMouseUp={() => releaseVirtualAction('jump')}
                onMouseLeave={() => releaseVirtualAction('jump')}
                onTouchEnd={() => releaseVirtualAction('jump')}
                className="bg-white/5 hover:bg-white/10 border border-white/5 active:bg-amber-500 rounded-xl flex items-center justify-center p-2 text-slate-300 shadow-md transition-all font-display font-bold text-[10px] uppercase cursor-pointer select-none"
                title="Jump"
              >
                JUMP
              </button>
              <div />

              <button
                onMouseDown={() => triggerVirtualAction('left')}
                onTouchStart={() => triggerVirtualAction('left')}
                onMouseUp={() => releaseVirtualAction('left')}
                onMouseLeave={() => releaseVirtualAction('left')}
                onTouchEnd={() => releaseVirtualAction('left')}
                className="bg-white/5 hover:bg-white/10 border border-white/5 active:bg-amber-500 rounded-xl flex items-center justify-center p-2 text-slate-300 shadow-md transition-all font-display font-bold text-[10px] uppercase cursor-pointer select-none"
                title="Left"
              >
                LEFT
              </button>
              <div className="bg-slate-950 rounded-xl border border-white/5 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              </div>
              <button
                onMouseDown={() => triggerVirtualAction('right')}
                onTouchStart={() => triggerVirtualAction('right')}
                onMouseUp={() => releaseVirtualAction('right')}
                onMouseLeave={() => releaseVirtualAction('right')}
                onTouchEnd={() => releaseVirtualAction('right')}
                className="bg-white/5 hover:bg-white/10 border border-white/5 active:bg-amber-500 rounded-xl flex items-center justify-center p-2 text-slate-300 shadow-md transition-all font-display font-bold text-[10px] uppercase cursor-pointer select-none"
                title="Right"
              >
                RIGHT
              </button>

              <div />
              <button
                onMouseDown={() => triggerVirtualAction('block')}
                onTouchStart={() => triggerVirtualAction('block')}
                onMouseUp={() => releaseVirtualAction('block')}
                onMouseLeave={() => releaseVirtualAction('block')}
                onTouchEnd={() => releaseVirtualAction('block')}
                className="bg-white/5 hover:bg-white/10 border border-white/5 active:bg-amber-500 rounded-xl flex items-center justify-center p-2 text-slate-300 shadow-md transition-all font-display font-bold text-[10px] uppercase cursor-pointer select-none"
                title="Block"
              >
                BLOCK
              </button>
              <div />
            </div>

            {/* Attack Buttons Cluster */}
            <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  triggerVirtualAction('quick');
                  audio.playSelect();
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/5 active:bg-yellow-400 hover:border-yellow-500/30 text-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-md cursor-pointer"
              >
                <span className="text-xs font-sans font-bold text-yellow-400 font-display">PUNCH</span>
                <span className="text-[9px] font-mono text-slate-400">Quick Punch</span>
              </button>

              <button
                onClick={() => {
                  triggerVirtualAction('heavy');
                  audio.playSelect();
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/5 active:bg-orange-500 hover:border-orange-500/30 text-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-md cursor-pointer"
              >
                <span className="text-xs font-sans font-bold text-orange-400 font-display">KICK</span>
                <span className="text-[9px] font-mono text-slate-400">Heavy Kick</span>
              </button>

              <button
                onClick={() => {
                  triggerVirtualAction('special');
                  audio.playSelect();
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/5 active:bg-cyan-500 hover:border-cyan-500/30 text-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {playerPokemon.id === 'charizard' && <Flame className="w-4 h-4 text-orange-400" />}
                {playerPokemon.id === 'blastoise' && <Waves className="w-4 h-4 text-cyan-400" />}
                {playerPokemon.id === 'gengar' && <Skull className="w-4 h-4 text-purple-400" />}
                {playerPokemon.id === 'pikachu' && <Zap className="w-4 h-4 text-yellow-400 animate-bounce" />}
                {playerPokemon.id === 'lucario' && <Sparkles className="w-4 h-4 text-teal-400" />}
                <span className="text-[9px] font-mono text-slate-450 uppercase font-bold text-center leading-tight">Projectile</span>
              </button>

              <button
                disabled={p1Energy < 100}
                onClick={() => {
                  triggerVirtualAction('ultimate');
                  audio.playSelect();
                }}
                className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-md ${
                  p1Energy >= 100
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 border border-amber-300 text-slate-950 font-black animate-pulse cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-950/40 border border-white/5 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Trophy className={`w-4 h-4 ${p1Energy >= 100 ? 'text-slate-950' : 'text-slate-600'}`} />
                <span className="text-xs font-display font-black">ULTIMATE</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
