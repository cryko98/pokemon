import { Fighter, PokemonCharacter, Projectile, CombatText, Particle, Arena } from '../types';

const imgCacheRef: { [id: string]: HTMLImageElement } = {};

export function preloadPokemonImage(id: string, url: string): HTMLImageElement {
  if (!imgCacheRef[id]) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    imgCacheRef[id] = img;
  }
  return imgCacheRef[id];
}

function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return '255, 255, 255';
  }
  return `${r}, ${g}, ${b}`;
}

export function drawFighter(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  pokemon: PokemonCharacter,
  gameTick: number
) {
  const { x, y, width, height, dir, state, stateTimer, isBlocking } = fighter;
  
  // Triggers image preloading so it displays immediately once downloaded
  const imgElement = preloadPokemonImage(pokemon.id, pokemon.imageUrl);
  const isImageLoaded = imgElement.complete && imgElement.naturalWidth !== 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1); // Flip horizontally depending on direction

  // Breathing effect (sine wave offset)
  const breath = Math.sin(gameTick * 0.1) * 3;
  const attackExt = stateTimer > 0 ? (state === 'attack_quick' ? 12 : state === 'attack_heavy' ? 24 : state === 'ultimate' ? 30 : 0) : 0;

  // Draw shadows below
  ctx.beginPath();
  ctx.ellipse(0, height / 2 - 2, width * 0.4, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fill();

  // Draw indicators if blocking
  if (isBlocking) {
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(103, 232, 249, 0.7)'; // Saturated cyan shield outline
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(103, 232, 249, 0.15)';
    ctx.fill();
    
    // Draw rotating shield hex details on client to look extremely premium!
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const hexAngle = (gameTick * 0.04) + i * (Math.PI / 1.5);
      const hx = Math.cos(hexAngle) * (width * 0.65);
      const hy = Math.sin(hexAngle) * (width * 0.65);
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw relative to center-bottom of fighter frame
  ctx.translate(0, -height / 2);

  if (isImageLoaded) {
    // --- ADVANCED REAL HIGH-RES ARTWORK DRAWING LOOP ---
    ctx.save();
    
    // Add micro-breathing offset
    ctx.translate(0, breath * 0.35);

    // Dynamic rotation angles based on state action values
    let angle = 0;
    if (state === 'attack_quick') {
      angle = 0.15;
      // lunge forward sharply
      ctx.translate(attackExt * 0.75, -2);
    } else if (state === 'attack_heavy') {
      // Amazing dynamic backflip / high-kick spin rotation cycle!
      const progress = Math.max(0, Math.min(1, (32 - stateTimer) / 32));
      angle = -progress * Math.PI * 2;
      // High-arc flight path
      ctx.translate(attackExt * 0.55, -Math.sin(progress * Math.PI) * 26);
    } else if (state === 'ultimate') {
      angle = 0.32;
      ctx.translate(attackExt * 0.6, -10);
    } else if (state === 'hit') {
      angle = -0.15 + Math.sin(gameTick * 0.618) * 0.12; // speedy shivering shake
    } else if (state === 'fainted') {
      angle = -Math.PI / 2.1; // Rotated fallen posture
      ctx.translate(-5, 15);
    } else {
      // Gentle walking slope sway
      if (Math.abs(fighter.vx) > 0.1) {
        angle = Math.sin(gameTick * 0.22) * 0.07;
      } else {
        angle = Math.sin(gameTick * 0.07) * 0.02;
      }
    }
    ctx.rotate(angle);

    // Apply soft glow/shadow aura matching its primary type highlight!
    const isUltimateCharged = state === 'ultimate' || fighter.energy >= 100;
    ctx.shadowColor = pokemon.color;
    ctx.shadowBlur = isUltimateCharged ? 28 + Math.sin(gameTick * 0.18) * 12 : (state === 'hit' ? 22 : 14);

    // Transparent ambient power energy fields backer
    ctx.fillStyle = `rgba(${hexToRgb(pokemon.color)}, ${isUltimateCharged ? 0.35 : 0.18})`;
    ctx.beginPath();
    ctx.arc(0, 5, width * 0.52, 0, Math.PI * 2);
    ctx.fill();

    // Sizing calculation (Scale up somewhat for ultimate details & shrink slightly on hit)
    let renderW = width * 1.35;
    let renderH = height * 1.35;
    if (state === 'hit') {
      renderW *= 1.12;
      renderH *= 0.88;
    } else if (state === 'ultimate') {
      renderW *= 1.3;
      renderH *= 1.3;
    }

    // Centered coordinates positioning
    const xPos = -renderW / 2;
    const yPos = -renderH / 2 + 5;

    // Draw high-res PokeAPI image asset (flipped horizontally to correct PokeAPI's left-facing sprites)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(imgElement, xPos, yPos, renderW, renderH);
    ctx.restore();

    // Crimson flashing overlay when taking hits
    if (state === 'hit') {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.42)'; // soft alpha damage red mask
      ctx.fillRect(xPos, yPos, renderW, renderH);
      ctx.restore();
    }

    // --- DISTINCT PUNCH AND KICK GLOWING EFFECT TRAILS DURING COMBAT ---
    if (state === 'attack_quick') {
      // Draw Punch / Jab high-speed yellow shockwave ring expanding outward
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FBBF24';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      const pCount = Math.max(0, Math.min(1, (18 - stateTimer) / 18));
      ctx.ellipse(28, -2, 6 + pCount * 24, 12 + pCount * 14, 0, -Math.PI/2, Math.PI/2);
      ctx.stroke();
      
      // Punch motion slash lines
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(30, -6); ctx.lineTo(62, -6);
      ctx.moveTo(34, 6); ctx.lineTo(58, 6);
      ctx.stroke();
      ctx.restore();
    } else if (state === 'attack_heavy') {
      // Draw Heavy Kick spinning fire-orange-yellow crescent sweep trail
      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#EF4444';
      
      const gradient = ctx.createRadialGradient(0, 0, width * 0.5, 0, 0, width * 1.6);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
      gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
      gradient.addColorStop(1, 'rgba(253, 224, 71, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, width * 1.5, -0.4, 1.4);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      
      // High-intensity white-hot blade cutting edge line
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, width * 1.35, -0.3, 1.3);
      ctx.stroke();
      ctx.restore();
    }

    // Sparkles and elemental glowing bubbles when fully charged
    if (isUltimateCharged) {
      for (let i = 0; i < 3; i++) {
        const pArc = Math.random() * Math.PI * 2;
        const pRadius = (width * 0.5) + Math.random() * 18;
        const sparkX = Math.cos(pArc) * pRadius;
        const sparkY = Math.sin(pArc) * pRadius - 8;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : pokemon.accentColor;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#FFFFFF';
        ctx.fill();
      }
    }

    ctx.restore();
  } else {
    // ---- TRADITIONAL CUSTOM VECTOR DRAWINGS (ROBUST OFFLINE/PRE-DOWNLOAD BACKUP) ----
    // Switch drawings by Pokemon Id
    if (pokemon.id === 'pikachu') {
    // ---- PIKACHU RENDERER ----
    const scale = state === 'hit' ? 0.9 : 1.0;
    ctx.scale(scale, scale);

    // Ears
    ctx.fillStyle = pokemon.color;
    // Left ear
    ctx.beginPath();
    ctx.moveTo(-12, -28 + breath * 0.5);
    ctx.quadraticCurveTo(-18, -48 + breath, -14, -54 + breath);
    ctx.quadraticCurveTo(-6, -42 + breath, -6, -26 + breath * 0.5);
    ctx.fill();
    // Left Ear Tip (black)
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.moveTo(-16, -42 + breath);
    ctx.quadraticCurveTo(-18, -48 + breath, -14, -54 + breath);
    ctx.quadraticCurveTo(-10, -48 + breath, -12, -40 + breath);
    ctx.fill();

    // Right ear
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    ctx.moveTo(10, -28 + breath * 0.5);
    ctx.quadraticCurveTo(18, -46 + breath, 22, -50 + breath);
    ctx.quadraticCurveTo(12, -40 + breath, 5, -26 + breath * 0.5);
    ctx.fill();
    // Right Ear Tip
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.moveTo(14, -38 + breath);
    ctx.quadraticCurveTo(18, -46 + breath, 22, -50 + breath);
    ctx.quadraticCurveTo(16, -42 + breath, 12, -36 + breath);
    ctx.fill();

    // Lightning Tail
    ctx.fillStyle = '#D97706'; // Dark orange/brown base of tail
    ctx.beginPath();
    ctx.moveTo(-12, 10);
    ctx.lineTo(-24, 6);
    ctx.lineTo(-20, -2);
    ctx.fillStyle = pokemon.color;
    ctx.lineTo(-32, -8);
    ctx.lineTo(-26, -16);
    ctx.lineTo(-44, -24 + (state === 'attack_heavy' ? -15 : 0)); // lightning tail extension during heavy hit
    ctx.lineTo(-30, -8);
    ctx.lineTo(-36, 0);
    ctx.lineTo(-14, 12);
    ctx.fill();

    // Body (Round, cuddly but athletic)
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    ctx.arc(0, 5 + breath, 24, 0, Math.PI * 2);
    ctx.fill();

    // Head (Slightly overlapping top)
    ctx.beginPath();
    ctx.arc(0, -12 + breath * 0.7, 20, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks (Red glow circles)
    ctx.fillStyle = '#EF4444'; // Red cheeks
    ctx.beginPath();
    ctx.arc(12, -6 + breath * 0.7, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1E293B';
    if (state === 'hit') {
      // Slanted hurt eyes
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(4, -16); ctx.lineTo(-1, -12);
      ctx.moveTo(13, -16); ctx.lineTo(8, -12);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(7, -15 + breath * 0.7, 3, 0, Math.PI * 2);
      ctx.fill();
      // Eye reflection spark
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(8, -16 + breath * 0.7, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth / Smile
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(7, -9 + breath * 0.7, 3, 0, Math.PI);
    ctx.stroke();

    // Arms
    ctx.fillStyle = pokemon.color;
    if (state === 'attack_quick' || state === 'ultimate') {
      // Swing arm forward! (PUNCH)
      ctx.beginPath();
      ctx.ellipse(15 + attackExt * 0.5, -4, 12, 6, Math.PI * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Slanted cute paws
      ctx.beginPath();
      ctx.ellipse(8, -1, 8, 4, Math.PI * 0.3, 0, Math.PI * 2);
      ctx.ellipse(-8, -1, 8, 4, -Math.PI * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Feet
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    if (state === 'attack_heavy') {
      // Extend right foot forward as an awesome energetic sliding spark kick!
      ctx.ellipse(10 + attackExt * 0.85, 20 + breath, 15, 6, -Math.PI * 0.15, 0, Math.PI * 2);
      ctx.ellipse(-10, 24 + breath, 8, 4, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(10, 24 + breath, 8, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(-10, 24 + breath, 8, 4, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Electric dynamic overlay if in ultimate or special charging
    if (state === 'ultimate' || state === 'attack_special') {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const ax = (Math.random() - 0.5) * 60;
        const ay = (Math.random() - 0.5) * 60 - 10;
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (Math.random() - 0.5) * 15, ay + (Math.random() - 0.5) * 15);
        ctx.stroke();
      }
    }

  } else if (pokemon.id === 'charizard') {
    // ---- CHARIZARD RENDERER ----
    
    // Wings (Orange outside, blue-teal inside)
    ctx.fillStyle = '#06B6D4'; // Teal inside
    ctx.strokeStyle = pokemon.color;
    ctx.lineWidth = 3;
    
    // Left Wing (back)
    const wingFlap = Math.sin(gameTick * 0.15) * 8;
    ctx.beginPath();
    ctx.moveTo(-15, -15);
    ctx.quadraticCurveTo(-45, -45 - wingFlap, -55 + (state === 'attack_heavy' ? -20 : 0), -20 - wingFlap);
    ctx.quadraticCurveTo(-30, -5, -15, 0);
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    ctx.arc(0, 0 + breath * 0.5, 30, 0, Math.PI * 2);
    ctx.fill();

    // Cream Belly
    ctx.fillStyle = '#FEF08A'; // Yellow 200
    ctx.beginPath();
    ctx.arc(8, 4 + breath * 0.5, 20, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.fill();

    // Head with snout
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    ctx.arc(10, -32 + breath * 0.8, 16, 0, Math.PI * 2);
    ctx.fill();
    // Snout
    ctx.beginPath();
    ctx.ellipse(20, -28 + breath * 0.8, 11, 8, Math.PI * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.beginPath();
    ctx.moveTo(1, -44 + breath * 0.8);
    ctx.lineTo(-14, -50 + breath * 0.8);
    ctx.lineTo(-4, -36 + breath * 0.8);
    ctx.fill();

    // Tail + Flame
    ctx.strokeStyle = pokemon.color;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-25, 15);
    ctx.quadraticCurveTo(-45, 25, -50, 5 + breath);
    ctx.stroke();

    // Flame at tip
    const flameSize = 10 + Math.random() * 8;
    ctx.fillStyle = '#F97316'; // Orange flame
    ctx.beginPath();
    ctx.arc(-52, 5 + breath, flameSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B'; // Yellow internal flame
    ctx.beginPath();
    ctx.arc(-52, 5 + breath, flameSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Claws/Arm
    ctx.fillStyle = pokemon.color;
    if (state === 'attack_quick' || state === 'ultimate') {
      ctx.beginPath();
      ctx.ellipse(22 + attackExt * 0.5, -10, 16, 8, Math.PI * 0.1, 0, Math.PI * 2);
      ctx.fill();
      // White claws
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(36 + attackExt * 0.5, -9, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(12, -8, 11, 6, Math.PI * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    if (state === 'attack_heavy') {
      // Heavy forward tailing stomp/kick!
      ctx.ellipse(12 + attackExt * 0.8, 20 + breath * 0.5, 18, 10, -Math.PI * 0.2, 0, Math.PI * 2);
      ctx.ellipse(-12, 26 + breath * 0.5, 14, 8, -Math.PI * 0.1, 0, Math.PI * 2);
    } else {
      ctx.ellipse(12, 26 + breath * 0.5, 14, 8, Math.PI * 0.1, 0, Math.PI * 2);
      ctx.ellipse(-12, 26 + breath * 0.5, 14, 8, -Math.PI * 0.1, 0, Math.PI * 2);
    }
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#06B6D4'; // Blue shiny dragon eyes
    ctx.beginPath();
    ctx.arc(16, -35 + breath * 0.8, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (pokemon.id === 'blastoise') {
    // ---- BLASTOISE RENDERER ----

    // Shell Brown Back
    ctx.fillStyle = '#78350F'; // Dark brown
    ctx.beginPath();
    ctx.arc(-8, 5, 34, 0, Math.PI * 2);
    ctx.fill();
    // Shell White Rim
    ctx.strokeStyle = '#F8FAFC'; // White outline
    ctx.lineWidth = 4;
    ctx.stroke();

    // Cannons
    ctx.fillStyle = '#94A3B8'; // Steel Gray
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    // Left Cannon
    ctx.save();
    ctx.translate(-16, -26);
    ctx.rotate(-Math.PI * 0.2 + (state === 'attack_special' ? -0.15 : 0));
    ctx.fillRect(-6, -20, 12, 24);
    ctx.strokeRect(-6, -20, 12, 24);
    ctx.restore();

    // Right Cannon
    ctx.save();
    ctx.translate(-5, -28);
    ctx.rotate(-Math.PI * 0.08 + (state === 'attack_special' ? -0.12 : 0));
    ctx.fillRect(-6, -20, 12, 24);
    ctx.strokeRect(-6, -20, 12, 24);
    ctx.restore();

    // Blue Main Body
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    ctx.arc(4, 5 + breath * 0.4, 28, 0, Math.PI * 2);
    ctx.fill();

    // Soft Cream Belly Segment
    ctx.fillStyle = '#FEF08A'; // Yellowish belly plate
    ctx.beginPath();
    ctx.ellipse(12, 5 + breath * 0.4, 18, 22, 0, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.fill();

    // Heavy Head
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    ctx.arc(15, -28 + breath * 0.5, 18, 0, Math.PI * 2);
    ctx.fill();

    // Ears (Turtle triangular ears)
    ctx.beginPath();
    ctx.moveTo(8, -43 + breath * 0.5);
    ctx.lineTo(0, -52 + breath * 0.5);
    ctx.lineTo(14, -40 + breath * 0.5);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(22, -43 + breath * 0.5);
    ctx.lineTo(26, -52 + breath * 0.5);
    ctx.lineTo(24, -40 + breath * 0.5);
    ctx.fill();

    // Small Eyes
    ctx.fillStyle = '#D97706'; // Reddish/Orange alert eyes
    ctx.beginPath();
    ctx.arc(20, -29 + breath * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = pokemon.color;
    if (state === 'attack_quick' || state === 'ultimate') {
      ctx.beginPath();
      ctx.ellipse(24 + attackExt * 0.4, -4, 18, 10, Math.PI * 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(16, -2, 14, 10, Math.PI * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heavy Feet
    ctx.fillStyle = pokemon.color;
    if (state === 'attack_heavy') {
      // Thrust heavy back-kick foot forward!
      ctx.fillRect(4 + attackExt * 0.8, 20 + breath * 0.4, 20, 14);
      ctx.fillRect(-18, 26 + breath * 0.4, 15, 12);
    } else {
      ctx.fillRect(4, 26 + breath * 0.4, 15, 12);
      ctx.fillRect(-18, 26 + breath * 0.4, 15, 12);
    }

  } else if (pokemon.id === 'gengar') {
    // ---- GENGAR RENDERER ----

    // Floaty floating suspension
    const floatY = Math.sin(gameTick * 0.12) * 6;
    ctx.translate(0, floatY);

    // Spikes/Horns around body
    ctx.fillStyle = pokemon.color;
    const spikePoints = [
      [-18, -25], [-28, -15], [-29, 2], [-22, 18], [0, -32], [22, -22], [28, -10], [28, 5]
    ];
    spikePoints.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx * 1.5, sy * 1.4);
      ctx.lineTo(sx * 0.8 + 10, sy * 0.8 + 10);
      ctx.fill();
    });

    // Main round ghost body
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Crimson Eyes
    ctx.fillStyle = '#EF4444'; // Red 500
    ctx.beginPath();
    ctx.moveTo(4, -13);
    ctx.lineTo(21, -9);
    ctx.lineTo(12, -4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-4, -13);
    ctx.lineTo(-21, -9);
    ctx.lineTo(-12, -4);
    ctx.closePath();
    ctx.fill();

    // Red pupil Sparkles
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(10, -8, 1.5, 0, Math.PI * 2);
    ctx.arc(-10, -8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Big Sinister Smile
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 6, 14, 0, Math.PI);
    ctx.stroke();

    // Draw the teeth grid inside the smile
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = -10; i <= 10; i += 5) {
      ctx.beginPath();
      ctx.moveTo(i, 6);
      ctx.lineTo(i, 6 + Math.sqrt(196 - i*i) * 0.45);
      ctx.stroke();
    }

    // Shadowy Floating Claws
    ctx.fillStyle = pokemon.color;
    if (state === 'attack_quick' || state === 'ultimate') {
      // Thrust claws forward!
      ctx.beginPath();
      ctx.arc(28 + attackExt * 0.5, 0, 11, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(22, 6, 8, 0, Math.PI * 2);
      ctx.arc(-22, 6, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Little feet
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    if (state === 'attack_heavy') {
      // Floating slide kick extension shape!
      ctx.ellipse(12 + attackExt * 0.85, 20, 13, 7, -Math.PI * 0.15, 0, Math.PI * 2);
      ctx.ellipse(-12, 26, 8, 5, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(12, 26, 8, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(-12, 26, 8, 5, 0, 0, Math.PI * 2);
    }
    ctx.fill();

  } else if (pokemon.id === 'lucario') {
    // ---- LUCARIO RENDERER ----

    // Athletics bouncing stance
    const bounce = Math.sin(gameTick * 0.16) * 4;

    // Body blue
    ctx.fillStyle = pokemon.color;
    ctx.beginPath();
    ctx.ellipse(0, 5 + bounce * 0.5, 14, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black mask patterns and neck appendage (ribbon style)
    ctx.fillStyle = '#1E293B'; // Dark Slate
    ctx.beginPath();
    ctx.arc(0, -18 + bounce * 0.8, 12, 0, Math.PI * 2);
    ctx.fill();

    // Long upright ears
    ctx.beginPath();
    ctx.moveTo(-8, -26 + bounce * 0.8);
    ctx.lineTo(-14, -54 + bounce * 0.8);
    ctx.lineTo(-2, -28 + bounce * 0.8);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(4, -26 + bounce * 0.8);
    ctx.lineTo(8, -54 + bounce * 0.8);
    ctx.lineTo(10, -28 + bounce * 0.8);
    ctx.fill();

    // Ribbon dreadlocks (floating back of head)
    ctx.save();
    ctx.translate(-8, -16 + bounce * 0.8);
    ctx.rotate(Math.sin(gameTick * 0.1) * 0.2 + 0.3);
    ctx.fillRect(-4, 0, 8, 28);
    ctx.restore();

    // Yellow fluffy chest
    ctx.fillStyle = '#FEF08A'; // Yellow 200
    ctx.beginPath();
    ctx.ellipse(4, -4 + bounce * 0.5, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spike on chest
    ctx.fillStyle = '#E2E8F0'; // White spikes
    ctx.beginPath();
    ctx.moveTo(11, -4 + bounce * 0.5);
    ctx.lineTo(17, -4 + bounce * 0.5);
    ctx.lineTo(11, -8 + bounce * 0.5);
    ctx.fill();

    // Jackal snout
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(10, -18 + bounce * 0.8, 10, 5, Math.PI * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Glowing aura red eye
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(3, -20 + bounce * 0.8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Fighting Arms
    ctx.fillStyle = pokemon.color;
    if (state === 'attack_quick' || state === 'ultimate') {
      ctx.beginPath();
      ctx.ellipse(18 + attackExt * 0.5, -4, 15, 7, Math.PI * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Wrist spike forward
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(25 + attackExt * 0.5, -6);
      ctx.lineTo(31 + attackExt * 0.5, -4);
      ctx.lineTo(25 + attackExt * 0.5, -2);
      ctx.fill();
    } else {
      // Boxing fighter arms guarded stance
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.ellipse(10, -4 + bounce * 0.5, 8, 6, Math.PI * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pokemon.color;
      ctx.beginPath();
      ctx.ellipse(14, -10 + bounce * 0.5, 7, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    ctx.fillStyle = '#1E293B';
    if (state === 'attack_heavy') {
      // Lucario signature sliding straight kick!
      ctx.fillRect(2 + attackExt * 0.85, 16 + bounce * 0.5, 14, 8);
      ctx.fillRect(-10, 22 + bounce * 0.5, 8, 14);
    } else {
      ctx.fillRect(2, 22 + bounce * 0.5, 8, 14);
      ctx.fillRect(-10, 22 + bounce * 0.5, 8, 14);
    }
  }

  } // End of offline fallback else block
  ctx.restore();
}

export function drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile, gameTick: number) {
  const { x, y, radius, color, sparkleColor, type } = projectile;

  ctx.save();
  ctx.beginPath();

  if (type === 'fire') {
    // Fireball drawing with secondary flame rings
    const grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.3, '#F59E0B'); // Orange
    grad.addColorStop(1, '#EF4444'); // Red
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Flame particles
    ctx.beginPath();
    ctx.arc(x - projectile.vx * 2, y + (Math.sin(gameTick * 0.4) * 4), radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = '#F97316';
    ctx.fill();

  } else if (type === 'water') {
    // Water projectile
    const grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
    grad.addColorStop(0, '#E0F2FE');
    grad.addColorStop(0.5, '#38BDF8');
    grad.addColorStop(1, '#1D4ED8');
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Tail splash
    ctx.beginPath();
    ctx.arc(x - projectile.vx * 1.5, y, radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.fill();

  } else if (type === 'bolt') {
    // Glowing electric sphere
    const grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.4, '#FEF08A');
    grad.addColorStop(1, '#FACC15');
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw little electrical spikes
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const angle = (gameTick * 0.3 + i * Math.PI / 2);
      ctx.moveTo(x + Math.cos(angle) * (radius - 2), y + Math.sin(angle) * (radius - 2));
      ctx.lineTo(x + Math.cos(angle) * (radius + 5), y + Math.sin(angle) * (radius + 5));
      ctx.stroke();
    }

  } else if (type === 'shadow') {
    // Sinister shadow orb
    const grad = ctx.createRadialGradient(x, y, 1, x, y, radius);
    grad.addColorStop(0, '#DDD6FE');
    grad.addColorStop(0.4, '#7C3AED');
    grad.addColorStop(1, '#1E1B4B');
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Shadow flame particles
    ctx.beginPath();
    ctx.ellipse(x - projectile.vx * 1.3, y, radius * 0.9, radius * 0.5, Math.PI * 0.1 * gameTick, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(124, 58, 237, 0.4)';
    ctx.fill();

  } else if (type === 'aura') {
    // Pure azure aura orb
    const grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
    grad.addColorStop(0, '#E0F7FA');
    grad.addColorStop(0.3, '#00E5FF');
    grad.addColorStop(1, '#006064');
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Pulse
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 3 + Math.sin(gameTick * 0.5) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawCombatText(ctx: CanvasRenderingContext2D, combatText: CombatText) {
  const { text, x, y, color, size, alpha } = combatText;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.font = `bold ${size}px "Space Grotesk", sans-serif`;
  ctx.textAlign = 'center';
  
  // Draw stroke then fill
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  const { x, y, radius, color, alpha } = particle;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draw arena details on canvas
export function drawArenaBackground(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  width: number,
  height: number,
  gameTick: number
) {
  // Clear with Arena Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0F172A'); // deep navy slate
  grad.addColorStop(0.65, arena.floorColor);
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative backgrounds matching arenas
  if (arena.id === 'kanto_stadium') {
    // Draw classic Pokémon league stage banners
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    // Left support column
    ctx.fillRect(80, 0, 15, height - 120);
    // Right support column
    ctx.fillRect(width - 95, 0, 15, height - 120);

    // Giant Pokéball emblem on wall
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 40, 100, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, height / 2 - 40);
    ctx.lineTo(width / 2 + 100, height / 2 - 40);
    ctx.stroke();

    // Dynamic stadium flashlights
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)'; // Red banner light
    ctx.lineWidth = 40;
    ctx.beginPath();
    const lOffset = Math.sin(gameTick * 0.02) * 160;
    ctx.moveTo(100, 40);
    ctx.lineTo(width / 2 + lOffset, height - 120);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)'; // Blue banner light
    ctx.beginPath();
    ctx.moveTo(width - 100, 40);
    ctx.lineTo(width / 2 - lOffset, height - 120);
    ctx.stroke();

  } else if (arena.id === 'volcano') {
    // Draw lava bubbles rising
    ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
    for (let i = 0; i < 5; i++) {
      const bubbleX = (width * 0.15 + (i * width * 0.18) + Math.cos(gameTick * 0.03 + i) * 30) % width;
      const bubbleY = (height - 110 - (gameTick * (1 + i * 0.2)) % 250);
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, 6 + i, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cracks of lava in the floor
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, height - 85);
    ctx.lineTo(250, height - 87);
    ctx.lineTo(280, height - 82);
    ctx.lineTo(440, height - 88);
    ctx.lineTo(width - 50, height - 85);
    ctx.stroke();

  } else if (arena.id === 'lavender_town') {
    // Draw Lavender ghost mist particles
    ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
    for (let i = 0; i < 6; i++) {
      const mistX = (i * width * 0.2 + (gameTick * 0.8)) % (width + 100) - 50;
      const mistY = height * 0.4 + Math.sin(gameTick * 0.05 + i) * 20;
      ctx.beginPath();
      ctx.ellipse(mistX, mistY, 60, 25, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spooky tombstones in back
    ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.fillRect(150, height - 170, 30, 50);
    ctx.beginPath();
    ctx.arc(165, height - 170, 15, 0, Math.PI, true);
    ctx.fill();

    ctx.fillRect(width - 180, height - 175, 25, 55);
    ctx.beginPath();
    ctx.arc(width - 167.5, height - 175, 12.5, 0, Math.PI, true);
    ctx.fill();

  } else if (arena.id === 'forest') {
    // Falling leaves
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    for (let i = 0; i < 6; i++) {
      const leafX = (i * width * 0.22 + (gameTick * 0.4)) % width;
      const leafY = (gameTick * (1.2 + i * 0.15)) % (height - 100);
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(gameTick * 0.02 + i);
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Tall trees in back shadows
    ctx.fillStyle = 'rgba(4, 120, 87, 0.15)';
    ctx.fillRect(60, 0, 45, height - 90);
    ctx.fillRect(280, 0, 40, height - 90);
    ctx.fillRect(width - 130, 0, 50, height - 90);
  }

  // Draw Arena Floor Platform Segment
  ctx.fillStyle = arena.floorColor;
  ctx.fillRect(0, height - 90, width, 90);

  // Border separating earth/stage with elegant glowing ground divider line
  ctx.strokeStyle = arena.primaryColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = arena.primaryColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, height - 90);
  ctx.lineTo(width, height - 90);
  ctx.stroke();
  ctx.shadowBlur = 0; // reset shadow blurring immediately

  // Highlight dust on footer floor
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.fillRect(0, height - 86, width, 12);
}
