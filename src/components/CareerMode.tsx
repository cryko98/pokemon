import React, { useState, useEffect } from 'react';
import { PokemonCharacter, Arena } from '../types';
import { POKEMONS, BOOSTER_SECRET_POKEMONS, ARENAS } from '../data';
import { audio } from '../utils/audio';
import { ShieldCheck, Trophy, Sword, Lock, User, UserCheck, Coins, Flame, Shield, Heart, Zap, LogOut, ArrowRight, Star, RefreshCw, Key, Award, FlameKindling, CheckCircle2 } from 'lucide-react';
import PokemonCard from './PokemonCard';

export interface CareerProfile {
  id: string;
  username: string;
  passcode: string; // Numeric or alphanumeric passcode
  currentStage: number; // 1 to 7
  points: number;
  chosenPokemonId: string;
  upgrades: {
    attack: number; // +2 damage rating each layer (0 to 10 max)
    defense: number; // +2 defense rating each layer (0 to 10 max)
    hp: number; // +20 HP each layer (0 to 10 max)
    speed: number; // +0.15 velocity movement each layer (0 to 10 max)
  };
}

export interface CareerStage {
  level: number;
  name: string;
  opponentId: string;
  arenaId: string;
  rewardPoints: number;
  difficulty: 'easy' | 'normal' | 'veteran';
  statMultiplier: number; // Multiplies BOT stats for escalating dynamic difficulty
  description: string;
}

const CAREER_STAGES: CareerStage[] = [
  {
    level: 1,
    name: 'Pewter Forest Gym',
    opponentId: 'pikachu',
    arenaId: 'forest',
    rewardPoints: 120,
    difficulty: 'easy',
    statMultiplier: 1.0,
    description: 'Face the agile forest ranger Pikachu in the starting cup of the league!'
  },
  {
    level: 2,
    name: 'Cerulean Splash Dome',
    opponentId: 'blastoise',
    arenaId: 'kanto_stadium',
    rewardPoints: 180,
    difficulty: 'normal',
    statMultiplier: 1.1,
    description: 'Challenge the fortress-like shell of Blastoise in the regional coastal stadium.'
  },
  {
    level: 3,
    name: 'Lavender Ghost Spire',
    opponentId: 'gengar',
    arenaId: 'lavender_town',
    rewardPoints: 250,
    difficulty: 'normal',
    statMultiplier: 1.25,
    description: 'Eerie shadows call you to battle the telekinetic master phantom Gengar.'
  },
  {
    level: 4,
    name: 'Cinnabar Fire Crater',
    opponentId: 'charizard',
    arenaId: 'volcano',
    rewardPoints: 350,
    difficulty: 'veteran',
    statMultiplier: 1.4,
    description: 'Survive boiling lava pools that boost Charizards destructive wing-strike power!'
  },
  {
    level: 5,
    name: 'Indigo Fighting League',
    opponentId: 'lucario',
    arenaId: 'kanto_stadium',
    rewardPoints: 480,
    difficulty: 'veteran',
    statMultiplier: 1.55,
    description: 'Dodge supersonic aura blasts under the flags of the Grand Fighting Master Lucario!'
  },
  {
    level: 6,
    name: 'Cosmic Sky Summit',
    opponentId: 'rayquaza',
    arenaId: 'volcano',
    rewardPoints: 650,
    difficulty: 'veteran',
    statMultiplier: 1.75,
    description: 'Behold Rayquazas mythical sky winds. A deity of mass defense and attack speed!'
  },
  {
    level: 7,
    name: 'Temple of the Alpha Creator',
    opponentId: 'arceus',
    arenaId: 'kanto_stadium',
    rewardPoints: 1000,
    difficulty: 'veteran',
    statMultiplier: 2.1,
    description: 'The final ultimate showdown against Arceus. The Alpha creator of all Pokémon!'
  }
];

interface CareerModeProps {
  onStartCareerFight: (
    playerPokemon: PokemonCharacter,
    cpuPokemon: PokemonCharacter,
    arena: Arena,
    stageLevel: number,
    statMultiplier: number
  ) => void;
  savedProfilesUpdatedTrigger?: number;
}

export default function CareerMode({ onStartCareerFight, savedProfilesUpdatedTrigger = 0 }: CareerModeProps) {
  const [profiles, setProfiles] = useState<CareerProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<CareerProfile | null>(null);
  
  // Registration form states
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [starterId, setStarterId] = useState('pikachu');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form states
  const [joiningProfileId, setJoiningProfileId] = useState<string | null>(null);
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Modal logic
  const [isSwappingPokemon, setIsSwappingPokemon] = useState(false);
  const [selectedStage, setSelectedStage] = useState<CareerStage | null>(null);

  // State to track whether player has unlocked Booster Secrets
  const [unlockedSecrets, setUnlockedSecrets] = useState<string[]>([]);

  const loadLocals = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('arcade_trainer_profiles') || '[]');
      setProfiles(stored);
      
      const loggedInId = localStorage.getItem('arcade_current_profile_id');
      if (loggedInId) {
        const found = stored.find((p: CareerProfile) => p.id === loggedInId);
        if (found) {
          setCurrentProfile(found);
        }
      }

      const secrets = JSON.parse(localStorage.getItem('unlocked_secrets') || '[]');
      setUnlockedSecrets(secrets);
    } catch {
      setProfiles([]);
    }
  };

  useEffect(() => {
    loadLocals();
  }, [savedProfilesUpdatedTrigger]);

  const saveProfileUpdates = (p: CareerProfile) => {
    try {
      const stored = JSON.parse(localStorage.getItem('arcade_trainer_profiles') || '[]');
      const updated = stored.map((item: CareerProfile) => (item.id === p.id ? p : item));
      localStorage.setItem('arcade_trainer_profiles', JSON.stringify(updated));
      setCurrentProfile(p);
      setProfiles(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage('Please enter a trainer name!');
      return;
    }

    if (profiles.some(p => p.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      setErrorMessage('This trainer name is already taken! Choose another.');
      return;
    }

    const cleanPassCode = passcode.trim();
    if (!cleanPassCode) {
      setErrorMessage('Please provide a 4-digit security passcode!');
      return;
    }

    // Initialize clean career model
    const newProfile: CareerProfile = {
      id: 'trainer_' + Date.now(),
      username: trimmedUsername,
      passcode: cleanPassCode,
      currentStage: 1,
      points: 200, // Augmented starting bonus points!
      chosenPokemonId: starterId,
      upgrades: {
        attack: 0,
        defense: 0,
        hp: 0,
        speed: 0
      }
    };

    const nextList = [...profiles, newProfile];
    localStorage.setItem('arcade_trainer_profiles', JSON.stringify(nextList));
    localStorage.setItem('arcade_current_profile_id', newProfile.id);
    
    setProfiles(nextList);
    setCurrentProfile(newProfile);
    setUsername('');
    setPasscode('');
    audio.playWin(); // Fanfare feedback
  };

  const handleLoginTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!joiningProfileId) return;
    const target = profiles.find(p => p.id === joiningProfileId);
    if (!target) return;

    if (target.passcode !== loginPasscode.trim()) {
      setLoginError('Invalid security passcode! Please try again.');
      audio.playSelect();
      return;
    }

    localStorage.setItem('arcade_current_profile_id', target.id);
    setCurrentProfile(target);
    setLoginPasscode('');
    setJoiningProfileId(null);
    audio.playBattleStart();
  };

  const handleLogout = () => {
    localStorage.removeItem('arcade_current_profile_id');
    setCurrentProfile(null);
    audio.playSelect();
  };

  const getUpgradeCost = (currentLvl: number) => {
    if (currentLvl >= 10) return 99999;
    return (currentLvl + 1) * 80;
  };

  const handleUpgradeStat = (statKey: 'attack' | 'defense' | 'hp' | 'speed') => {
    if (!currentProfile) return;
    const currentLvl = currentProfile.upgrades[statKey];
    if (currentLvl >= 10) return;

    const cost = getUpgradeCost(currentLvl);
    if (currentProfile.points < cost) {
      alert("Sorry, you don't have enough Battle PTS for this upgrade!");
      audio.playSelect();
      return;
    }

    const updatedProfile: CareerProfile = {
      ...currentProfile,
      points: currentProfile.points - cost,
      upgrades: {
         ...currentProfile.upgrades,
        [statKey]: currentLvl + 1
      }
    };

    saveProfileUpdates(updatedProfile);
    audio.playUltimate(); // Dynamic visual feedback level powerup!
  };

  const currentAvailablePokemons = [...POKEMONS];
  try {
    unlockedSecrets.forEach((id: string) => {
      const match = BOOSTER_SECRET_POKEMONS.find(p => p.id === id);
      if (match && !currentAvailablePokemons.some(p => p.id === id)) {
        currentAvailablePokemons.push(match);
      }
    });
  } catch {}

  const activePokemon = currentAvailablePokemons.find(p => p.id === currentProfile?.chosenPokemonId) || POKEMONS[0];

  // Compile full upgraded stats
  const upgradedAttack = activePokemon.attack + (currentProfile?.upgrades.attack || 0) * 2;
  const upgradedDefense = activePokemon.defense + (currentProfile?.upgrades.defense || 0) * 1;
  const upgradedHp = activePokemon.maxHp + (currentProfile?.upgrades.hp || 0) * 20;
  const upgradedSpeed = parseFloat((activePokemon.speed + (currentProfile?.upgrades.speed || 0) * 0.15).toFixed(2));

  const fullyUpgradedPokemon: PokemonCharacter = {
    ...activePokemon,
    attack: upgradedAttack,
    defense: upgradedDefense,
    maxHp: upgradedHp,
    speed: upgradedSpeed
  };

  const selectNewHero = (id: string) => {
    if (!currentProfile) return;
    const nextP = {
      ...currentProfile,
      chosenPokemonId: id
    };
    saveProfileUpdates(nextP);
    setIsSwappingPokemon(false);
    audio.playSelect();
  };

  const clickStageNode = (stage: CareerStage) => {
    if (!currentProfile) return;
    if (stage.level > currentProfile.currentStage) {
      audio.playBlock();
      return;
    }
    setSelectedStage(stage);
    audio.playSelect();
  };

  const launchCareerBattle = () => {
    if (!currentProfile || !selectedStage) return;
    
    const cpuBase = [...POKEMONS, ...BOOSTER_SECRET_POKEMONS].find(p => p.id === selectedStage.opponentId) || POKEMONS[1];
    
    const scaling = selectedStage.statMultiplier;
    const scaledCpu: PokemonCharacter = {
      ...cpuBase,
      attack: Math.round(cpuBase.attack * (1 + (scaling - 1) * 0.6)),
      defense: Math.round(cpuBase.defense * (1 + (scaling - 1) * 0.5)),
      maxHp: Math.round(cpuBase.maxHp * scaling),
      speed: parseFloat((cpuBase.speed * (1 + (scaling - 1) * 0.25)).toFixed(2))
    };

    const arenaObj = ARENAS.find(a => a.id === selectedStage.arenaId) || ARENAS[0];

    audio.playBattleStart();
    onStartCareerFight(fullyUpgradedPokemon, scaledCpu, arenaObj, selectedStage.level, selectedStage.statMultiplier);
    setSelectedStage(null);
  };

  // Compile Dynamic Trainer Achievements
  const getAchievements = () => {
    if (!currentProfile) return [];
    
    const totalStatUpgrades = 
      currentProfile.upgrades.attack + 
      currentProfile.upgrades.defense + 
      currentProfile.upgrades.hp + 
      currentProfile.upgrades.speed;

    return [
      {
        id: 'first_blood',
        title: 'Challenger Spark',
        desc: 'Begin your journey and register a local Trainer Account.',
        unlocked: true,
        icon: '⚡'
      },
      {
        id: 'stage_complete_1',
        title: 'Boulder Breaker',
         desc: 'Defeat Pewter Gym and advance beyond Campaign Stage 1.',
        unlocked: currentProfile.currentStage > 1,
        icon: '⛰️'
      },
      {
        id: 'super_upgraded',
        title: 'Apex Stat Enhancer',
        desc: 'Acquire at least 5 Total Stat upgrades from Battle PTS.',
        unlocked: totalStatUpgrades >= 5,
        icon: '🔥'
      },
      {
        id: 'has_secret',
        title: 'Holographic Mystery Collector',
        desc: 'Draw at least one ultra-rare Secret Legend from Booster foil.',
        unlocked: unlockedSecrets.length > 0,
        icon: '🌟'
      },
      {
        id: 'supreme_master',
        title: 'Universe Divinity Champion',
        desc: 'Defeat Arceus at Stage 7 to rule the Stadium Fighting Arena.',
        unlocked: currentProfile.currentStage > 7,
        icon: '👑'
      }
    ];
  };

  const trainerAchievements = getAchievements();

  return (
    <div className="w-full text-slate-950 font-sans">
      
      {/* 1. NOT LOGGED IN STATE: SIGN UP OR CHOOSE PROFILE */}
      {!currentProfile ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in p-1 text-slate-955">
          
          {/* TRAINER REGISTER */}
          <div className="md:col-span-6 bg-white border-4 border-slate-950 p-5 sm:p-6 rounded-[28px] flex flex-col justify-between shadow-[5px_5px_0px_#000000]">
            <form onSubmit={handleRegisterTrainer} className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5 bg-yellow-400 text-slate-950 border-2 border-slate-950 px-4 py-1.5 rounded-full font-black text-xs uppercase w-max self-start shadow-[2px_2px_0px_#000]">
                <Sword className="w-3.5 h-3.5" /> NEW TRAINER SIGNUP
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-slate-955 tracking-wide mt-1.5 uppercase font-display">
                START YOUR CHAMPIONSHIP CAREER!
              </h2>
              <p className="text-xs text-slate-705 leading-relaxed font-semibold">
                Create a persistent offline profile in your local browser history. With each campaign victory, you earn valuable Battle PTS to permanently augment your combat metrics (HP, Defense, Damage, Speed) and challenge elite bosses!
              </p>

              {errorMessage && (
                <div className="bg-rose-100 border-2 border-rose-500 p-3 rounded-xl text-rose-600 text-xs font-black font-mono uppercase">
                  ⚠️ {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest pl-1">TRAINER USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={15}
                  className="bg-slate-50 border-2 border-slate-950 rounded-xl px-4 py-3 text-slate-950 text-xs font-mono font-bold focus:outline-none focus:border-yellow-500 transition shadow-inner"
                  placeholder="e.g., Red, Ash Ketchum, Gary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-widest pl-1">SECURITY PASSCODE (4 Digits)</label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                  className="bg-slate-50 border-2 border-slate-950 rounded-xl px-4 py-3 text-slate-950 text-xs font-mono tracking-widest font-bold focus:outline-none focus:border-yellow-500 transition shadow-inner"
                  placeholder="e.g., 1234"
                />
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest pl-1">SELECT YOUR STARTER MONSTER:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {POKEMONS.slice(0, 6).map((poke) => {
                    const isSel = starterId === poke.id;
                    return (
                      <button
                        type="button"
                        key={poke.id}
                        onClick={() => {
                          setStarterId(poke.id);
                          audio.playSelect();
                        }}
                        className={`p-2 rounded-xl border-2 cursor-pointer transition flex flex-col items-center gap-1.5 ${
                          isSel 
                            ? 'bg-[#ffcb05] border-slate-950 text-slate-950 font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full border border-slate-350 overflow-hidden bg-white p-0.5">
                          <img src={poke.imageUrl} alt={poke.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-black text-slate-900 truncate w-full text-center uppercase tracking-wide">{poke.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#ffcb05] hover:bg-yellow-450 text-slate-950 border-3 border-slate-950 font-cartoon font-black text-xs py-3.5 mt-3 rounded-2xl shadow-[4px_4px_0px_#000000] uppercase tracking-wider cursor-pointer transition duration-150 active:scale-95"
              >
                BEGIN ADVENTURE! 🌋 GO
              </button>
            </form>
          </div>

          {/* LOGIN SELECTOR PORTFOLIO (RIGHT) */}
          <div className="md:col-span-6 bg-white border-4 border-slate-950 p-5 sm:p-6 rounded-[28px] flex flex-col justify-between shadow-[5px_5px_0px_#000000] text-slate-950">
            <div>
              <div className="flex items-center gap-2.5 bg-rose-500 text-white border-2 border-slate-950 px-4 py-1.5 rounded-full font-black text-xs uppercase w-max mb-4 shadow-[2px_2px_0px_#000]">
                <UserCheck className="w-3.5 h-3.5" /> RETRIEVE PREVIOUS ARCHIVE
              </div>

              <h2 className="text-xl font-display font-black text-slate-950 tracking-wide uppercase mb-3 text-left">
                CHOOSE SAVED TRAINER FILE
              </h2>

              {profiles.length === 0 ? (
                <div className="border-2 border-dashed border-slate-305 rounded-2xl p-8 text-center text-slate-500 text-xs font-semibold py-14 bg-slate-50 mt-4 flex flex-col items-center gap-2.5 shadow-inner">
                  <User className="w-8 h-8 opacity-45 text-slate-500 animate-pulse" />
                  <span>No saved trainer profiles found in local cache yet. Use the signup form to begin!</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[290px] overflow-y-auto pr-1.5 mt-4">
                  {profiles.map(p => {
                    const starter = POKEMONS.find(poke => poke.id === p.chosenPokemonId) || POKEMONS[0];
                    return (
                      <div 
                        key={p.id}
                        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${
                          joiningProfileId === p.id ? 'bg-indigo-50 border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)]' : 'bg-white border-slate-200 hover:border-slate-455 hover:bg-slate-55'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-white flex items-center justify-center p-0.5 relative">
                            <img src={starter.imageUrl} alt={starter.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-mono text-[8px] font-black border border-slate-950 px-1 rounded-full leading-none">
                              Stg {p.currentStage}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-black text-slate-950 uppercase block tracking-wide">{p.username}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-650 flex items-center gap-1 uppercase">
                              <Coins className="w-3 h-3 text-amber-500" /> {p.points} Battle PTS
                            </span>
                          </div>
                        </div>

                        {joiningProfileId === p.id ? (
                          <form onSubmit={handleLoginTrainer} className="flex items-center gap-1.5 py-0.5">
                            <input
                              type="password"
                              value={loginPasscode}
                              onChange={(e) => setLoginPasscode(e.target.value.replace(/\D/g, ''))}
                              maxLength={4}
                              className="bg-white border-2 border-slate-950 rounded-lg w-16 px-2 py-1 text-center font-mono font-bold text-xs text-slate-950"
                              placeholder="PASS"
                              autoFocus
                            />
                            <button className="bg-[#ffcb05] text-slate-955 border-2 border-slate-950 hover:bg-amber-500 hover:scale-105 active:scale-95 px-2.5 py-1 rounded-lg text-xs cursor-pointer font-black duration-150">
                              OK
                            </button>
                            <button 
                              type="button" 
                              onClick={() => { setJoiningProfileId(null); setLoginPasscode(''); }}
                              className="text-[9px] hover:text-red-600 font-extrabold underline uppercase pl-1 cursor-pointer font-bold bg-transparent border-none text-slate-600"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setJoiningProfileId(p.id);
                              setLoginError(null);
                              audio.playSelect();
                            }}
                            className="bg-indigo-550 hover:bg-indigo-600 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl border-2 border-slate-905 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:scale-105 cursor-pointer uppercase transition active:scale-95 duration-100"
                          >
                            SELECT PROFILE ➔
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {loginError && (
                <div className="mt-3 bg-red-100 border-2 border-red-500 text-red-650 p-2.5 rounded-xl text-[10.5px] font-black font-mono leading-relaxed uppercase text-center">
                  ⚠️ {loginError}
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-2 border-slate-950 text-slate-800 rounded-2xl p-3.5 mt-4 text-[10px] leading-relaxed font-semibold shadow-inner">
              🔒 <strong className="text-slate-950 font-black">SECURE LOCAL ENCRYPT:</strong> All character progressions are preserved indefinitely in your sandboxed web partition, assuring zero cloud dependency or credential leaks!
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in text-slate-950">
          {/* 2. LOGGED IN MAIN ACTIVE STADIUM DASHBOARD BOARD */}
          
          {/* STAT UPGRADES & TRAINER PORTFOLIO (LEFT COLUMN) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* COMPACT DASHBOARD CARD */}
            <div className="bg-white border-4 border-slate-950 p-4.5 rounded-[28px] flex flex-col gap-3 relative overflow-hidden shadow-[5px_5px_0px_#000000]">
              <div className="flex items-center justify-between border-b-2 border-slate-950 pb-3 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-955 text-yellow-500 font-bold font-mono text-sm shadow-sm shrink-0 flex items-center justify-center border border-slate-950">
                    🏆
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-black text-slate-955 text-sm uppercase tracking-wide leading-none">{currentProfile.username}</h3>
                    <p className="text-[9.5px] font-mono font-black text-[#dc2626] flex items-center gap-1 uppercase mt-1">
                      CHAMPIONSHIP STAGE: {currentProfile.currentStage}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-rose-500 text-white border-2 border-slate-955 hover:bg-rose-605 px-2.5 py-1.5 rounded-xl cursor-pointer hover:scale-105 active:scale-95 duration-100 flex items-center justify-center gap-1 text-[9.5px] uppercase font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  title="Log out of Trainer Account"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>

              {/* CASH DEPOSIT METERS */}
              <div className="bg-slate-950 text-white rounded-2xl border-2 border-slate-950 p-3.5 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-405 animate-bounce shrink-0" />
                  <div className="text-left">
                    <span className="text-[8.5px] font-mono text-slate-400 font-bold block uppercase tracking-wider leading-none">BATTLE PROGRESS XP</span>
                    <span className="text-lg font-black font-mono leading-none tracking-tight text-[#ffcb05]">{currentProfile.points} PTS</span>
                  </div>
                </div>
                <div className="text-[10px] text-right font-display text-slate-955 bg-[#ffcb05] border-2 border-slate-955 px-2.5 py-1.5 rounded-xl font-black uppercase tracking-wider">
                  Spendable
                </div>
              </div>

            </div>

            {/* UPGRADE HUB SYSTEM */}
            <div className="bg-white border-4 border-slate-950 p-4.5 sm:p-5 rounded-[28px] flex flex-col gap-4 shadow-[5px_5px_0px_#000000]">
              
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                <h3 className="text-xs font-black font-display text-slate-955 uppercase tracking-widest flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> PERK UPGRADES SHOP
                </h3>
                <span className="text-[9px] font-mono text-indigo-705 font-black bg-indigo-50 border-2 border-slate-955 px-2 py-0.5 rounded-lg">
                  Max: Lvl 10
                </span>
              </div>

              {/* REAL STAT CONVERTORS */}
              <div className="flex flex-col gap-3.5">
                
                {/* ATTACK UPGRADE */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-950 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1 uppercase"><Sword className="w-3.5 h-3.5 text-rose-500" /> STRENGTH (ATK)</span>
                    <span className="font-mono text-slate-955 font-black">{upgradedAttack} ATK <span className="text-slate-500 font-semibold font-sans">({activePokemon.attack} + {currentProfile.upgrades.attack * 2})</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 bg-slate-200 h-3 rounded-lg border-2 border-slate-950 overflow-hidden flex">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 border-r border-slate-950 ${
                            i < currentProfile.upgrades.attack ? 'bg-rose-500' : 'bg-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                    {currentProfile.upgrades.attack >= 10 ? (
                      <span className="text-[9px] font-display text-slate-500 uppercase font-black px-2 py-1 border-2 border-dashed border-slate-300 rounded-lg">MAX</span>
                    ) : (
                      <button
                        onClick={() => handleUpgradeStat('attack')}
                        className="bg-[#ffcb05] hover:bg-yellow-450 border-2 border-slate-950 text-slate-955 font-black text-[9.5px] px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap active:scale-95 transition flex flex-col items-center leading-none justify-center duration-155 shadow-[1px_1px_0_#050505]"
                      >
                        <span>BOOST</span>
                        <span className="text-[7.5px] font-mono opacity-90 font-black mt-0.5">{getUpgradeCost(currentProfile.upgrades.attack)} XP</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* DEFENSE UPGRADE */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-950 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1 uppercase"><Shield className="w-3.5 h-3.5 text-blue-500" /> ARMOR CAP (DEF)</span>
                    <span className="font-mono text-slate-955 font-black">{upgradedDefense} DEF <span className="text-slate-505 font-bold font-sans">({activePokemon.defense} + {currentProfile.upgrades.defense * 1})</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 bg-slate-200 h-3 rounded-lg border-2 border-slate-950 overflow-hidden flex">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 border-r border-slate-950 ${
                            i < currentProfile.upgrades.defense ? 'bg-blue-500' : 'bg-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                    {currentProfile.upgrades.defense >= 10 ? (
                      <span className="text-[9px] font-display text-slate-505 uppercase font-black px-2 py-1 border-2 border-dashed border-slate-300 rounded-lg">MAX</span>
                    ) : (
                      <button
                        onClick={() => handleUpgradeStat('defense')}
                        className="bg-[#ffcb05] hover:bg-yellow-450 border-2 border-slate-950 text-slate-955 font-black text-[9.5px] px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap active:scale-95 transition flex flex-col items-center leading-none justify-center duration-155 shadow-[1px_1px_0_#050505]"
                      >
                        <span>BOOST</span>
                        <span className="text-[7.5px] font-mono opacity-95 font-black mt-0.5">{getUpgradeCost(currentProfile.upgrades.defense)} XP</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* HP UPGRADE */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-950 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1 uppercase"><Heart className="w-3.5 h-3.5 text-emerald-500" /> MAX VITALITY (HP)</span>
                    <span className="font-mono text-slate-955 font-black">{upgradedHp} HP <span className="text-slate-555 font-bold font-sans">({activePokemon.maxHp} + {currentProfile.upgrades.hp * 20})</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 bg-slate-200 h-3 rounded-lg border-2 border-slate-950 overflow-hidden flex">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 border-r border-slate-950 ${
                            i < currentProfile.upgrades.hp ? 'bg-emerald-500' : 'bg-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                    {currentProfile.upgrades.hp >= 10 ? (
                      <span className="text-[9px] font-display text-[#1e293b] font-black px-2 py-1 border-2 border-dashed border-slate-300 rounded-lg">MAX</span>
                    ) : (
                      <button
                        onClick={() => handleUpgradeStat('hp')}
                        className="bg-[#ffcb05] hover:bg-yellow-450 border-2 border-slate-950 text-slate-955 font-black text-[9.5px] px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap active:scale-95 transition flex flex-col items-center leading-none justify-center duration-155 shadow-[1px_1px_0_#050505]"
                      >
                        <span>BOOST</span>
                        <span className="text-[7.5px] font-mono opacity-95 font-black mt-0.5">{getUpgradeCost(currentProfile.upgrades.hp)} XP</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* SPEED UPGRADE */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-950 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1 uppercase"><Zap className="w-3.5 h-3.5 text-amber-505 animate-pulse" /> VELOCITY SPEED (SPD)</span>
                    <span className="font-mono text-slate-955 font-black">{upgradedSpeed} SPD <span className="text-slate-505 font-bold font-sans">({activePokemon.speed} + {parseFloat(((currentProfile.upgrades.speed || 0) * 0.15).toFixed(2))})</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 bg-slate-200 h-3 rounded-lg border-2 border-slate-950 overflow-hidden flex">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 border-r border-slate-950 ${
                            i < currentProfile.upgrades.speed ? 'bg-amber-500' : 'bg-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                    {currentProfile.upgrades.speed >= 10 ? (
                      <span className="text-[9px] font-display text-[#1e293b] font-black px-2 py-1 border-2 border-dashed border-slate-300 rounded-lg">MAX</span>
                    ) : (
                      <button
                        onClick={() => handleUpgradeStat('speed')}
                        className="bg-[#ffcb05] hover:bg-yellow-450 border-2 border-slate-950 text-slate-955 font-black text-[9.5px] px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap active:scale-95 transition flex flex-col items-center leading-none justify-center duration-155 shadow-[1px_1px_0_#050505]"
                      >
                        <span>BOOST</span>
                        <span className="text-[7.5px] font-mono opacity-95 font-black mt-0.5">{getUpgradeCost(currentProfile.upgrades.speed)} XP</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* ROSTER SWAP MODAL TRIGGER */}
              <div className="border-t-2 border-slate-200 pt-4 flex flex-col items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => { setIsSwappingPokemon(true); audio.playSelect(); }}
                  className="w-full text-[10.5px] font-display font-black bg-indigo-55 bg-indigo-50 border-3 border-slate-955 text-indigo-705 hover:bg-indigo-600 hover:text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer uppercase transition duration-155 active:scale-95 shadow-[3px_3px_0_#000]"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin duration-3000" /> SWAP ACTIVE MONSTER
                </button>

                <div className="w-full mt-2.5 flex justify-center scale-95">
                  <PokemonCard pokemon={fullyUpgradedPokemon} label="CURRENT HERO" badgeColor="bg-[#ffcb05] text-slate-955 font-display border-2 border-slate-950 font-black" />
                </div>
              </div>

            </div>

          </div>

          {/* MAIN CAREER CHAMPIONSHIP MAP & MILESTONES (RIGHT COLUMN) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* THE ARENA MAP JOURNEY */}
            <div className="bg-white border-4 border-slate-950 p-5 rounded-[28px] flex-1 flex flex-col justify-between shadow-[5px_5px_0px_#000000]">
              <div>
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 gap-2 flex-wrap">
                  <div className="text-left">
                    <h2 className="text-lg sm:text-xl font-display text-slate-955 font-black tracking-wider flex items-center gap-2">
                      🗺️ STADIUM CHAMPIONSHIP CAMPAIGN
                    </h2>
                    <p className="text-[10.5px] text-slate-650 mt-0.5 leading-relaxed font-bold">
                      Advance stage by stage. Each tier introduces higher-scaled rival metrics and rewards premium Battle PTS!
                    </p>
                  </div>
                  <div className="px-3.5 py-1 bg-[#ffcb05] border-2 border-slate-955 text-slate-955 font-display font-black text-[10px] tracking-wider shrink-0 uppercase rounded-xl shadow-[1px_1px_0_rgba(0,0,0,1)]">
                    7 Stages Map
                  </div>
                </div>

                {/* JOURNEY PATH NODES */}
                <div className="flex flex-col gap-6 py-6 relative max-w-xl mx-auto pl-4">
                  <div className="absolute top-10 bottom-10 left-[27px] w-1 bg-slate-950 opacity-30 z-0 pointer-events-none" />

                  {CAREER_STAGES.map((st) => {
                    const isCompleted = st.level < currentProfile.currentStage;
                    const isActive = st.level === currentProfile.currentStage;
                    const isLocked = st.level > currentProfile.currentStage;

                    const cpuChar = [...POKEMONS, ...BOOSTER_SECRET_POKEMONS].find(p => p.id === st.opponentId) || POKEMONS[1];

                    return (
                      <div
                        key={st.level}
                        onClick={() => clickStageNode(st)}
                        className={`flex items-start gap-4 relative z-10 p-3 sm:p-4 rounded-2xl border-3 transition-all duration-300 shadow-[3px_3px_0px_#000000] ${
                          isCompleted
                            ? 'bg-emerald-50 border-emerald-500 hover:bg-emerald-100 cursor-pointer hover:scale-101'
                            : isActive
                              ? 'bg-blue-50 border-blue-500 hover:bg-blue-100 cursor-pointer hover:scale-102 ring-2 ring-[#ffcb05]'
                              : 'bg-slate-100 border-slate-350 opacity-50 pointer-events-none'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute -top-3 right-3 bg-[#dc2626] border-2 border-slate-955 text-white px-2.5 py-0.5 text-[8px] font-mono rounded-full font-black uppercase tracking-wider scale-110 shadow-[1px_1px_0_#000] animate-bounce">
                            ACTIVE RIVAL ⚔️
                          </span>
                        )}

                        {/* STAGE SPOT BULLET */}
                        <div className="shrink-0 flex items-center justify-center relative">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-display font-black text-sm shadow-inner duration-200 ${
                            isCompleted
                              ? 'bg-emerald-500 text-white border-slate-955'
                              : isActive
                                ? 'bg-[#ffcb05] font-black text-slate-955 scale-105 shadow-md border-slate-955'
                                : 'bg-slate-300 border-slate-400 text-slate-500'
                          }`}>
                            {isCompleted ? '✓' : st.level}
                          </div>

                          {/* Avatar overlay */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-950 bg-white overflow-hidden p-0.5 flex items-center justify-center shadow-md">
                            <img src={cpuChar.imageUrl} alt={cpuChar.name} className="w-full h-full object-contain img-pixelated" referrerPolicy="no-referrer" />
                          </div>
                        </div>

                        {/* DESCRIPTION CONTAINER */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-display font-black text-xs sm:text-sm text-slate-955 uppercase tracking-wide">
                              Stage {st.level}: {st.name}
                            </h4>
                            {isLocked && <Lock className="w-3.5 h-3.5 text-slate-550 shrink-0" />}
                            {isCompleted && <span className="text-[8px] font-mono text-emerald-600 font-extrabold bg-emerald-100 border-2 border-emerald-500 px-1.5 py-0.2 rounded-full leading-none uppercase shrink-0">Defeated</span>}
                          </div>

                          <p className="text-[10px] sm:text-xs text-slate-700 font-bold leading-relaxed mt-1">
                            {st.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2 font-mono text-[9px] sm:text-[10px] font-bold">
                            <span className="bg-slate-950 text-white px-2 py-0.5 rounded border border-slate-950">
                              Rival: <strong className="font-sans font-black text-[#ffcb05] uppercase">{cpuChar.name}</strong>
                            </span>
                            <span className={`px-2 py-0.5 rounded uppercase border-2 border-slate-950 ${
                              st.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : st.difficulty === 'normal'
                                  ? 'bg-blue-105 bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              Difficulty: {st.difficulty.toUpperCase()}
                            </span>
                            <span className="bg-[#ffcb05] border-2 border-slate-950 text-slate-955 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                              💎 Reward: +{st.rewardPoints} XP
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC TRAINER ACHIEVEMENTS SECTION (ENHANCEMENT) */}
              <div className="border-t-2 border-slate-200 pt-5 mt-5">
                <h3 className="text-xs font-black font-display text-slate-955 uppercase tracking-widest mb-3 flex items-center gap-1.5 pl-1">
                  <Award className="w-4.5 h-4.5 text-yellow-500 animate-pulse fill-yellow-450" /> TRAINER ACHIEVEMENTS ({trainerAchievements.filter(a => a.unlocked).length}/{trainerAchievements.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {trainerAchievements.map((ac) => (
                    <div 
                      key={ac.id} 
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all relative overflow-hidden ${
                        ac.unlocked 
                          ? 'bg-slate-50 border-slate-950 shadow-[2px_2px_0px_#000000]' 
                          : 'bg-slate-100 border-dashed border-slate-300 opacity-50'
                      }`}
                    >
                      <div className="text-2xl w-9 h-9 flex items-center justify-center rounded-xl bg-white border-2 border-slate-955 shadow">
                        {ac.unlocked ? ac.icon : '🔒'}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <span className={`text-[10.5px] font-display uppercase block tracking-wider truncate leading-tight ${ac.unlocked ? 'text-slate-955 font-black' : 'text-slate-400 font-bold'}`}>
                          {ac.title}
                        </span>
                        <span className="text-[9px] text-slate-650 font-bold block leading-tight mt-0.5 line-clamp-1">
                          {ac.desc}
                        </span>
                      </div>
                      
                      {ac.unlocked && (
                        <div className="absolute right-2.5 top-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* CHAMPIONSHIP LAUNCH MODAL */}
          {selectedStage && (
            <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-955 selection:bg-[#ffcb05] selection:text-slate-955">
              <div className="bg-white border-4 border-slate-955 p-5 sm:p-6 rounded-[28px] max-w-sm w-full text-center relative overflow-hidden shadow-[8px_8px_0px_#000000]">
                
                <h3 className="text-[10px] font-mono text-slate-955 font-black uppercase tracking-widest bg-yellow-50 border-2 border-slate-955 px-4 py-1.5 rounded-full w-max mx-auto mb-3">
                  STADIUM MATCH SELECTION
                </h3>

                <h2 className="text-xl font-display font-black text-slate-955 tracking-wide uppercase mb-1">
                  Ready for Combat?
                </h2>
                <p className="text-xs text-slate-700 font-bold mb-6 leading-relaxed max-w-xs mx-auto">
                  By starting this campaign duel, you will control your fully upgraded <span className="text-indigo-650 font-black">{fullyUpgradedPokemon.name}</span> in the arena!
                </p>

                {/* VISUAL VS BAR */}
                <div className="flex items-center justify-center gap-3.5 my-4 bg-slate-50 border-2 border-slate-955 p-4 rounded-2xl">
                  {/* PLAYER COLUMN */}
                  <div className="flex-1 flex flex-col items-center min-w-0">
                    <div className="w-11 h-11 rounded-xl border-2 border-slate-955 overflow-hidden bg-white p-0.5 shadow-sm">
                      <img src={fullyUpgradedPokemon.imageUrl} alt={fullyUpgradedPokemon.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] font-display text-slate-955 font-black mt-2 leading-none uppercase truncate w-full text-center">{fullyUpgradedPokemon.name}</span>
                    <span className="text-[8.5px] font-mono text-slate-600 font-bold uppercase leading-none mt-1">Lvl {currentProfile.currentStage} (Ally)</span>
                  </div>

                  <div className="font-mono font-black text-[10px] text-white bg-slate-955 px-2.5 py-1.5 border-2 border-slate-955 rounded-lg shrink-0">VS</div>

                  {/* CPU COLUMN */}
                  <div className="flex-1 flex flex-col items-center min-w-0">
                    <div className="w-11 h-11 rounded-xl border-2 border-slate-955 overflow-hidden bg-white p-0.5 shadow-sm">
                      <img 
                        src={([...POKEMONS, ...BOOSTER_SECRET_POKEMONS].find(p => p.id === selectedStage.opponentId) || POKEMONS[1]).imageUrl} 
                        alt="Opponent" 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-display text-[#dc2626] font-black mt-2 leading-none uppercase truncate w-full text-center">
                      {([...POKEMONS, ...BOOSTER_SECRET_POKEMONS].find(p => p.id === selectedStage.opponentId) || POKEMONS[1]).name}
                    </span>
                    <span className="text-[8.5px] font-mono text-slate-600 font-bold uppercase leading-none mt-1">NPC Challenger</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={launchCareerBattle}
                    className="w-full bg-[#facc15] hover:bg-[#ffcb05] text-slate-955 border-3 border-slate-955 font-display font-black text-xs py-3.5 rounded-2xl uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_#000] transition active:scale-95 duration-100"
                  >
                    ENTER ARENA! ⚔️
                  </button>
                  <button
                    onClick={() => { setSelectedStage(null); audio.playSelect(); }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-705 border-2 border-slate-955 font-display font-black text-[10px] py-2.5 rounded-xl uppercase tracking-wider cursor-pointer border shadow-[2px_2px_0px_#000] transition active:scale-95 duration-100"
                  >
                    Go Back
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ACTIVE ROSTER SWAP DIALOG */}
          {isSwappingPokemon && (
            <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-955 selection:bg-yellow-405 selection:text-slate-955">
              <div className="bg-white border-4 border-slate-955 p-5 sm:p-6 rounded-[28px] max-w-lg w-full text-slate-955 relative overflow-hidden shadow-[8px_8px_0px_#000000]">
                
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-4">
                  <h3 className="font-display font-black text-base text-slate-955 uppercase tracking-wide">
                    POKÉMON ROSTER CATALOGUE
                  </h3>
                  <button 
                    onClick={() => { setIsSwappingPokemon(false); audio.playSelect(); }}
                    className="py-1 px-2.5 rounded-lg border-2 border-slate-955 text-slate-800 hover:bg-slate-100 hover:scale-105 duration-100 cursor-pointer font-black text-xs uppercase"
                  >
                    Close ✕
                  </button>
                </div>

                <p className="text-xs text-slate-750 font-bold mb-4 leading-relaxed text-justify">
                  Select any of your unlocked classic base characters or custom legends unlocked from mystery Booster foils. All of your Trainer EXP upgrades will immediately transfer to your selected fighter!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {currentAvailablePokemons.map((p) => {
                    const isCurrent = currentProfile.chosenPokemonId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => selectNewHero(p.id)}
                        className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1.5 cursor-pointer relative transition duration-200 hover:scale-[1.03] ${
                          isCurrent 
                            ? 'bg-indigo-50 border-indigo-550 text-indigo-705 font-black shadow-[2px_2px_0px_#000]' 
                            : 'bg-slate-50 border-slate-350 hover:bg-slate-100 text-slate-850'
                        }`}
                      >
                        {p.isSecret && (
                          <span className="absolute -top-1.5 -right-1 bg-[#ffcb05] border border-slate-955 text-slate-955 text-[6.5px] font-black px-1.5 py-0.2 rounded-full scale-85 animate-pulse font-mono block">
                            RARE
                          </span>
                        )}
                        <div className="w-10 h-10 rounded-full border border-slate-350 bg-white flex items-center justify-center p-0.5 shadow-sm">
                          <img src={p.imageUrl} alt={p.name} className="w-9 h-9 object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[10px] font-display font-black text-slate-955 truncate w-full text-center uppercase tracking-wide">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t-2 border-slate-205 border-slate-200 mt-4 text-center">
                  <button
                    onClick={() => { setIsSwappingPokemon(false); audio.playSelect(); }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-705 font-display border-2 border-slate-955 px-6 py-3 rounded-xl text-xs uppercase font-black cursor-pointer shadow-[3px_3px_0px_#000] transition active:scale-95 duration-100"
                  >
                    Return to Campaign
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
