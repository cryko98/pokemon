import React, { useState, useEffect } from 'react';
import { POKEMONS, BOOSTER_SECRET_POKEMONS, ARENAS } from '../data';
import { PokemonCharacter, Arena } from '../types';
import { audio } from '../utils/audio';
import PokemonCard from './PokemonCard';
import { Sword, Play, AlertTriangle, BookOpen, Layers, Users, Shield, Sparkles, Trophy, Globe, Lock, Search } from 'lucide-react';
import PokeBall from './PokeBall';
import BoosterPack from './BoosterPack';
import { io, Socket } from 'socket.io-client';

interface MenuSelectorProps {
  onStartFight: (playerPokemon: PokemonCharacter, cpuPokemon: PokemonCharacter, selectedArena: Arena) => void;
  onStartMultiplayerFight?: (
    player: PokemonCharacter,
    cpu: PokemonCharacter,
    arena: Arena,
    roomId: string,
    side: 'player' | 'cpu',
    socket: any
  ) => void;
}

type MenuTab = 'bot' | 'multiplayer' | 'album' | 'abilities';

export default function MenuSelector({ onStartFight, onStartMultiplayerFight }: MenuSelectorProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<MenuTab>('bot');

  // local VS AI Selectors
  const [selectedP1, setSelectedP1] = useState<PokemonCharacter>(POKEMONS[0]);
  const [selectedCpu, setSelectedCpu] = useState<PokemonCharacter>(POKEMONS[1]);
  const [selectedArena, setSelectedArena] = useState<Arena>(ARENAS[0]);
  const [boosterPackActive, setBoosterPackActive] = useState(false);

  // Unlocked secret pokemons from local persistence
  const [unlockedSecretIds, setUnlockedSecretIds] = useState<string[]>([]);
  
  // Card Album detailed selection state
  const [albumSelected, setAlbumSelected] = useState<PokemonCharacter>(POKEMONS[0]);

  // Online Multiplayer state declarations
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomIdInput, setRoomIdInput] = useState<string>('');
  const [playerNameInput, setPlayerNameInput] = useState<string>('');
  const [multiplayerStatus, setMultiplayerStatus] = useState<'idle' | 'connecting' | 'queue' | 'ready'>('idle');
  const [isLobbyCreator, setIsLobbyCreator] = useState<boolean>(false);
  const [multiplayerSide, setMultiplayerSide] = useState<'player' | 'cpu'>('player');
  const [connectedRoomId, setConnectedRoomId] = useState<string>('');
  const [lobbyPlayers, setLobbyPlayers] = useState<{ [idStr: string]: { name: string; pokemonId: string; idStr: string } }>({});
  const [multiplayerWarning, setMultiplayerWarning] = useState<string | null>(null);

  // Read unlocked secrets on initial mount and when booster is closed
  const reloadSecrets = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('unlocked_secrets') || '[]');
      setUnlockedSecretIds(stored);
    } catch {
      setUnlockedSecretIds([]);
    }
  };

  useEffect(() => {
    reloadSecrets();
    
    // Generate an automatic random Room Code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setRoomIdInput(`ARENA-${randomCode}`);
    
    // Prefill default random player name
    const randomNameCode = Math.floor(10 + Math.random() * 89);
    setPlayerNameInput(`Trainer-${randomNameCode}`);
  }, []);

  // Socket clean up on dismount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const handleTabChange = (tab: MenuTab) => {
    setActiveTab(tab);
    audio.playSelect();
  };

  const startMatch = () => {
    audio.playBattleStart();
    onStartFight(selectedP1, selectedCpu, selectedArena);
  };

  const selectP1Character = (p: PokemonCharacter) => {
    setSelectedP1(p);
    audio.playSelect();
  };

  const selectCpuCharacter = (p: PokemonCharacter) => {
    setSelectedCpu(p);
    audio.playSelect();
  };

  const selectArenaItem = (a: Arena) => {
    setSelectedArena(a);
    audio.playSelect();
  };

  // MULTIPLAYER ROOM JOIN FLOW
  const joinOnlineRoom = () => {
    if (!playerNameInput.trim()) {
      setMultiplayerWarning('Please enter a player nickname!');
      return;
    }
    if (!roomIdInput.trim()) {
      setMultiplayerWarning('Please enter a room code!');
      return;
    }

    setMultiplayerWarning(null);
    setMultiplayerStatus('connecting');
    audio.playSelect();

    // Initialize connection to local Server
    const devUrl = window.location.origin;
    const socketInstance = io(devUrl, {
      reconnectionAttempts: 4,
      timeout: 10000,
      withCredentials: true,
      transports: ['polling', 'websocket']
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      socketInstance.emit('join_room', {
        roomId: roomIdInput.trim().toUpperCase(),
        name: playerNameInput.trim(),
        pokemonId: selectedP1.id
      });
    });

    socketInstance.on('joined_room_info', ({ roomId, side, players }) => {
      setConnectedRoomId(roomId);
      setMultiplayerSide(side);
      setLobbyPlayers(players);
      setIsLobbyCreator(side === 'player');
      setMultiplayerStatus('queue');
    });

    socketInstance.on('room_info_update', ({ players }) => {
      setLobbyPlayers(players);
    });

    socketInstance.on('room_full', ({ message }) => {
      setMultiplayerWarning(message);
      setMultiplayerStatus('idle');
      socketInstance.disconnect();
    });

    // Both players connected - start matches!
    socketInstance.on('match_ready', ({ p1, p2 }) => {
      setMultiplayerStatus('ready');
      audio.playBattleStart();

      // Find actual Pokemon objects from full pool matching ids
      const fullPool = [...POKEMONS, ...BOOSTER_SECRET_POKEMONS];
      const p1Obj = fullPool.find(p => p.id === p1.pokemonId) || POKEMONS[0];
      const p2Obj = fullPool.find(p => p.id === p2.pokemonId) || POKEMONS[1];

      // Initiate combat
      if (onStartMultiplayerFight) {
        onStartMultiplayerFight(
          p1Obj,
          p2Obj,
          selectedArena,
          roomIdInput.trim().toUpperCase(),
          multiplayerSide,
          socketInstance
        );
      }
    });

    socketInstance.on('player_disconnected', ({ message }) => {
      setMultiplayerWarning(message);
      setMultiplayerStatus('idle');
      setSocket(null);
    });

    socketInstance.on('connect_error', () => {
      setMultiplayerWarning('Connection to the matchmaking hub failed. Please check your network!');
      setMultiplayerStatus('idle');
    });
  };

  const leaveMultiplayerLobby = () => {
    if (socket) {
      socket.emit('leave_room', { roomId: connectedRoomId });
      socket.disconnect();
    }
    setSocket(null);
    setMultiplayerStatus('idle');
    audio.playSelect();
  };

  const allAlbumPokemons = [...POKEMONS, ...BOOSTER_SECRET_POKEMONS];

  return (
    <div className="w-full max-w-5xl px-2 sm:px-4 py-3 flex flex-col gap-5 select-none animate-fade-in text-slate-100">
      
      {/* GLOWING HERO INTRO BANNER TITLE WITH CARTOON POKEMON STYLE */}
      <div className="text-center flex flex-col items-center bg-[#1e293b] cartoon-border cartoon-shadow-lg p-5 sm:p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/[0.12] blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/[0.12] blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_2px,transparent_2px),linear-gradient(to_bottom,#ffffff03_2px,transparent_2px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="inline-flex items-center gap-1.5 bg-[#ef4444] border-2 border-black text-white text-[10px] sm:text-xs font-black px-4 py-1 rounded-full cartoon-shadow-sm mb-3.5 uppercase tracking-wider font-mono">
            <Sword className="w-3.5 h-3.5 text-white animate-pulse" /> STADIUM FIGHTING LEAGUE 2026
          </div>
          
          <div className="flex items-center justify-center gap-3.5 my-1.5">
            <PokeBall className="w-8 h-8 hidden sm:block filter drop-shadow animate-bounce" type="classic" />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-yellow-400 font-cartoon drop-shadow-[4px_4px_0_#000] tracking-normal select-none py-1 transform -rotate-1">
              POKÉMON ARENA FIGHTER
            </h1>
            <PokeBall className="w-8 h-8 hidden sm:block filter drop-shadow animate-bounce" type="ultra" />
          </div>
          
          <p className="text-xs sm:text-sm text-yellow-100 max-w-xl mx-auto leading-relaxed font-semibold drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] mt-2">
            Control your legendary Pokémon in real-time in the ultimate battle coliseum! Rip randomized Mystery Packs to discover mythical deities, or challenge dual opponents online!
          </p>

          {/* CARTOON STYLED NAVIGATION TAB MENU */}
          <nav className="flex items-center gap-1.5 sm:gap-2.5 mt-6 p-1.5 bg-black rounded-2xl w-full max-w-xl shadow-2xl">
            <button
              onClick={() => handleTabChange('bot')}
              className={`flex-1 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm uppercase ${
                activeTab === 'bot'
                  ? 'bg-yellow-400 text-slate-950 border-2 border-black cartoon-shadow-sm font-cartoon tracking-wider'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sword className="w-4 h-4" /> VS BOT
            </button>
            <button
              onClick={() => handleTabChange('multiplayer')}
              className={`flex-1 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm uppercase relative ${
                activeTab === 'multiplayer'
                  ? 'bg-red-500 text-white border-2 border-black cartoon-shadow-sm font-cartoon tracking-wider'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="w-4 h-4" /> ONLINE PVP
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-black"></span>
              </span>
            </button>
            <button
              onClick={() => handleTabChange('album')}
              className={`flex-1 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm uppercase ${
                activeTab === 'album'
                  ? 'bg-cyan-400 text-slate-950 border-2 border-black cartoon-shadow-sm font-cartoon tracking-wider'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" /> ALBUM
            </button>
            <button
              onClick={() => handleTabChange('abilities')}
              className={`flex-1 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm uppercase ${
                activeTab === 'abilities'
                  ? 'bg-purple-500 text-white border-2 border-black cartoon-shadow-sm font-cartoon tracking-wider'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" /> PASSIVES
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'bot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
          
          {/* OFFLINE CHARACTER SELECTION SPLIT VIEWS */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* P1 SELECTOR */}
              <div className="bg-[#1e293b] cartoon-border cartoon-shadow p-4 sm:p-5 rounded-3xl flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-sm font-cartoon text-yellow-400 uppercase tracking-wide flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 drop-shadow-[1px_1px_0_#000]">
                      <PokeBall className="w-6 h-6 shrink-0" type="classic" /> PLAYER 1 (YOU)
                    </span>
                    <span className="text-[10px] font-mono text-slate-450 font-bold uppercase">CHOOSE ALLY</span>
                  </h3>

                  <button
                    onClick={() => {
                      setBoosterPackActive(true);
                      audio.playSelect();
                    }}
                    className="w-full mb-4 bg-gradient-to-r from-red-550 via-amber-500 to-yellow-400 hover:from-red-650 hover:to-yellow-500 text-slate-950 font-cartoon font-black text-xs tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 border-2 border-black cartoon-shadow-sm cursor-pointer transition-all duration-300 uppercase animate-pulse"
                  >
                    🎁 OPEN MYSTERY BOOSTER PACK!
                  </button>

                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {POKEMONS.map((poke) => {
                      const isSelected = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectP1Character(poke)}
                          className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 group ${
                            isSelected
                              ? 'bg-yellow-400/10 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                              : 'bg-slate-950 border-black hover:border-slate-700'
                          }`}
                        >
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-black overflow-hidden relative p-1 bg-slate-900 transition-transform group-hover:scale-105"
                            style={{ background: `radial-gradient(circle, ${poke.color}22 0%, ${poke.color}55 100%)` }}
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-8 h-8 object-contain filter drop-shadow hover:scale-110 duration-200 pointer-events-none" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[9px] font-sans font-black text-slate-100 truncate w-full text-center">{poke.name}</span>
                        </button>
                      );
                    })}

                    {/* Unlocked secret boosters show in select array! */}
                    {unlockedSecretIds.map(secId => {
                      const poke = BOOSTER_SECRET_POKEMONS.find(p => p.id === secId);
                      if (!poke) return null;
                      const isSelected = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectP1Character(poke)}
                          className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 relative group border-dashed ${
                            isSelected
                              ? 'bg-yellow-400/20 border-yellow-450 shadow-[0_0_14px_rgba(234,179,8,0.4)]'
                              : 'bg-slate-900 border-yellow-500/50 hover:border-yellow-400'
                          }`}
                        >
                          <span className="absolute -top-1.5 -right-0.5 bg-yellow-400 border border-black text-slate-950 text-[6.5px] font-black font-mono px-1 rounded-full scale-75 shadow-md z-10 animate-pulse">RARE</span>
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-black overflow-hidden relative p-1 bg-slate-900"
                            style={{ background: `radial-gradient(circle, #facc1522 0%, #facc1577 100%)` }}
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-8 h-8 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[9px] font-sans font-black text-yellow-300 truncate w-full text-center">{poke.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full flex justify-center">
                    <PokemonCard pokemon={selectedP1} label="YOUR HERO" badgeColor="bg-yellow-400 text-slate-950 border-2 border-black" />
                  </div>
                </div>
              </div>

              {/* CPU SELECTOR */}
              <div className="bg-[#1e293b] cartoon-border cartoon-shadow p-4 sm:p-5 rounded-3xl flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-sm font-cartoon text-red-400 uppercase tracking-wide flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 drop-shadow-[1px_1px_0_#000]">
                      <PokeBall className="w-6 h-6 shrink-0" type="ultra" /> OPPONENT NPC (BOT)
                    </span>
                    <span className="text-[10px] font-mono text-slate-450 font-bold uppercase">BOT FIGHTER</span>
                  </h3>

                  <div className="grid grid-cols-4 gap-1.5 mb-5 mt-10">
                    {POKEMONS.map((poke) => {
                      const isSelected = selectedCpu.id === poke.id;
                      const isSame = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectCpuCharacter(poke)}
                          className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 relative group ${
                            isSelected
                              ? 'bg-rose-550/10 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                              : 'bg-slate-950 border-black hover:border-slate-700'
                          }`}
                        >
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-black overflow-hidden relative p-1 bg-slate-900"
                            style={{ background: `radial-gradient(circle, ${poke.color}22 0%, ${poke.color}55 100%)` }}
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-8 h-8 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[9px] font-sans font-black text-slate-100 truncate w-full text-center">{poke.name}</span>
                          {isSame && (
                            <span className="absolute -top-1.5 -right-0.5 text-[6.5px] font-black font-mono bg-red-600 border border-black text-white px-1.5 py-0.2 rounded-full scale-90 shadow-md">CLONE</span>
                          )}
                        </button>
                      );
                    })}

                    {/* Unlocked secrets can also be battled as AI! */}
                    {unlockedSecretIds.map(secId => {
                      const poke = BOOSTER_SECRET_POKEMONS.find(p => p.id === secId);
                      if (!poke) return null;
                      const isSelected = selectedCpu.id === poke.id;
                      const isSame = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectCpuCharacter(poke)}
                          className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 border-dashed relative group ${
                            isSelected
                              ? 'bg-rose-500/10 border-rose-550 shadow-[0_0_14px_rgba(244,63,94,0.35)]'
                              : 'bg-slate-900 border-yellow-500/40 hover:border-yellow-450'
                          }`}
                        >
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-black overflow-hidden relative p-1 bg-slate-900"
                            style={{ background: `radial-gradient(circle, #facc1515 0%, #facc1555 100%)` }}
                          >
                            <img 
                              src={poke.imageUrl} 
                              alt={poke.name} 
                              className="w-8 h-8 object-contain filter drop-shadow" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[9px] font-sans font-black text-slate-100 truncate w-full text-center">{poke.name}</span>
                          {isSame && (
                            <span className="absolute -top-1.5 -right-0.5 text-[6.5px] font-black font-mono bg-red-600 border border-black text-white px-1.5 py-0.2 rounded-full scale-90 shadow-md">CLONE</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full flex justify-center">
                    <PokemonCard pokemon={selectedCpu} label="BOT OPPONENT" badgeColor="bg-rose-500 text-white border-2 border-black" isCpu />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* CHOOSE VENUE MAP & LAUNCH BLOCK */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-[#1e293b] cartoon-border cartoon-shadow p-4 sm:p-5 rounded-3xl flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-cartoon text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-4 bg-yellow-400 border border-black rounded-sm" /> CHOOSE BATTLEFIELD:
                </h3>

                <div className="flex flex-col gap-2.5">
                  {ARENAS.map((arena) => {
                    const isSel = selectedArena.id === arena.id;
                    return (
                      <button
                        key={arena.id}
                        onClick={() => selectArenaItem(arena)}
                        className={`p-3.5 rounded-xl border-2 flex flex-col items-start gap-1 transition-all duration-300 text-left cursor-pointer ${
                          isSel
                            ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_12px_rgba(250,204,21,0.2)] ring-1 ring-yellow-400/20'
                            : 'border-black bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-cartoon text-white tracking-wide uppercase">{arena.name}</span>
                        <p className="text-[10px] text-slate-350 leading-relaxed font-medium line-clamp-2">{arena.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-black/30 mt-4 flex flex-col gap-3.5">
                <div className="bg-slate-950 p-3 rounded-2xl border-2 border-black flex items-center justify-center gap-4.5 shadow-lg text-xs">
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-slate-400 uppercase font-black">YOUR HERO</div>
                    <div className="font-cartoon text-yellow-400 uppercase tracking-wider">{selectedP1.name}</div>
                  </div>
                  <span className="font-retro text-yellow-300 font-black text-[7px] bg-red-650 px-2 py-1 rounded border-2 border-black shadow animate-pulse">VS</span>
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-slate-400 uppercase font-black">OPPONENT</div>
                    <div className="font-cartoon text-rose-450 uppercase tracking-wider">{selectedCpu.name}</div>
                  </div>
                </div>

                <button
                  onClick={startMatch}
                  className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 font-cartoon font-black text-sm tracking-widest uppercase transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] py-4 rounded-2xl shadow-lg border-2 border-black cursor-pointer shadow-amber-400/20 flex items-center justify-center gap-2.5"
                >
                  <Play className="w-5 h-5 fill-slate-950 text-slate-950" /> BATTLE START! ⚔️
                </button>
              </div>
            </div>

            <div className="bg-[#1e293b] cartoon-border p-4 rounded-2xl flex items-start gap-3 shadow-md">
              <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse shrink-0" />
              <div className="text-[10px] font-medium text-slate-300 leading-relaxed">
                <strong className="text-yellow-400 uppercase font-cartoon tracking-wider text-xs block mb-1">Controls:</strong>
                <span>Move with <code className="text-yellow-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-black font-mono">W, A, S, D / Space</code>.</span>
                <span className="block mt-1">Attack/Defense actions use keys:</span>
                <span className="block mt-1 pl-1">⚡ <code className="text-yellow-400 font-mono font-bold">J</code> for <strong>Quick Melee</strong></span>
                <span className="block pl-1">🔥 <code className="text-yellow-400 font-mono font-bold">K</code> for <strong>Heavy Melee</strong></span>
                <span className="block pl-1">☄️ <code className="text-yellow-400 font-mono font-bold">L</code> for <strong>Special Projectile</strong> (cost 20 EN)</span>
                <span className="block pl-1">🌟 <code className="text-yellow-400 font-mono font-bold">I</code> for <strong>Ultimate Move</strong> (cost 100 EN)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ONLINE PVP MULTIPLAYER LOBBY TAB */}
      {activeTab === 'multiplayer' && (
        <div className="bg-[#1e293b] cartoon-border cartoon-shadow p-5 sm:p-6 rounded-3xl flex flex-col gap-6 animate-fade-in relative overflow-hidden text-slate-100">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.08] blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-black pb-4.5 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-cartoon text-yellow-400 uppercase tracking-wide flex items-center gap-2.5 drop-shadow-[1.5px_1.5px_0_#000]">
                <Globe className="w-6 h-6 text-red-500 animate-spin shrink-0" /> REAL-TIME ONLINE LOBBIES (PVP)
              </h2>
              <p className="text-xs text-yellow-105 font-medium mt-1">
                Join a dynamic game room via code or create your own custom hub to challenge dual trainers around the world!
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-mono bg-red-650 border-2 border-black px-3 py-1.5 rounded-xl text-white font-black animate-pulse shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> MATCHMAKING ONLINE
            </div>
          </div>

          {multiplayerWarning && (
            <div className="bg-red-500/10 border-2 border-red-500 p-3.5 rounded-2xl text-xs text-red-400 font-mono font-black flex items-center gap-2 animate-bounce">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {multiplayerWarning}
            </div>
          )}

          {multiplayerStatus === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* JOIN FORM */}
              <div className="flex flex-col gap-4 bg-slate-950/40 p-5 rounded-2xl border-2 border-black shadow-inner">
                <h3 className="text-xs font-cartoon text-yellow-400 uppercase tracking-wider border-b border-black/30 pb-2">
                  1. Lobby Credentials:
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-cartoon text-slate-350 uppercase tracking-wide pl-1">Trainer Nickname:</label>
                  <input
                    type="text"
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    maxLength={14}
                    className="bg-slate-900 border-2 border-black rounded-xl px-4 py-3 text-slate-100 text-xs font-mono font-bold focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all shadow-inner"
                    placeholder="Enter nickname (e.g. Ash Ketchum)"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-cartoon text-slate-350 uppercase tracking-wide pl-1">Target Room Code:</label>
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                    maxLength={16}
                    className="bg-slate-900 border-2 border-black rounded-xl px-4 py-3 text-yellow-300 text-xs font-mono font-black tracking-widest focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all shadow-inner uppercase"
                    placeholder="EXAMPLE: ARENA-99"
                  />
                  <span className="text-[9px] font-mono text-slate-500 font-semibold pl-1">Tip: Invent a code word or host with the automatic default above</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={joinOnlineRoom}
                    className="w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500 hover:from-red-700 hover:to-orange-600 text-white font-cartoon font-black text-sm py-4 px-5 rounded-2xl border-2 border-black cartoon-shadow-sm transition-all duration-300 transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 uppercase tracking-wider"
                  >
                    <Globe className="w-5 h-5 animate-spin text-white" /> ENTER DUEL ROOM!
                  </button>
                </div>
              </div>

              {/* POKEMON SELECTOR PREVIEW */}
              <div className="bg-slate-950/40 p-5 rounded-2xl border-2 border-black shadow-inner flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-xs font-cartoon text-yellow-400 uppercase tracking-wider border-b border-black/30 pb-2 mb-3">
                    2. Select Your Combatant:
                  </h3>

                  <div className="grid grid-cols-4 gap-1.5 mb-4 max-h-[120px] overflow-y-auto pr-1">
                    {POKEMONS.map((poke) => {
                      const isSelected = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectP1Character(poke)}
                          className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 relative group truncate ${
                            isSelected
                              ? 'bg-yellow-400/10 border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.2)]'
                              : 'bg-slate-900 border-black hover:border-slate-800'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center border border-black overflow-hidden shrink-0 relative p-0.5 bg-slate-950">
                            <img src={poke.imageUrl} alt={poke.name} className="w-6 h-6 object-contain filter" referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-[8px] sm:text-[9.5px] font-sans font-black text-slate-200 truncate w-full text-center">{poke.name}</span>
                        </button>
                      );
                    })}

                    {unlockedSecretIds.map(secId => {
                      const poke = BOOSTER_SECRET_POKEMONS.find(p => p.id === secId);
                      if (!poke) return null;
                      const isSelected = selectedP1.id === poke.id;
                      return (
                        <button
                          key={poke.id}
                          onClick={() => selectP1Character(poke)}
                          className={`p-1.5 rounded-lg border-2 border-dashed flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-400/10 border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.2)'
                              : 'bg-slate-900 border-yellow-500/45 hover:border-yellow-400'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center border border-black overflow-hidden shrink-0 relative p-0.5 bg-slate-950">
                            <img src={poke.imageUrl} alt={poke.name} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-[8px] font-sans font-black text-yellow-400 truncate w-full text-center">{poke.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center w-full">
                  <PokemonCard pokemon={selectedP1} label="ONLINE ROSTER" badgeColor="bg-yellow-400 text-slate-950 border-2 border-black" />
                </div>
              </div>

            </div>
          )}

          {/* QUEUE/LOBBY WAITING SCREEN */}
          {multiplayerStatus === 'connecting' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PokeBall className="w-10 h-10 animate-bounce" type="ultra" />
                </div>
              </div>
              <p className="text-sm font-cartoon text-yellow-400 animate-pulse uppercase tracking-wider">Latching onto matchmaker servers...</p>
              <p className="text-xs text-slate-400 font-sans font-medium">Please stand by while we compile the multiplayer channels.</p>
            </div>
          )}

          {multiplayerStatus === 'queue' && (
            <div className="flex flex-col items-center bg-slate-950/40 border-2 border-black p-6 rounded-3xl shadow-inner gap-6">
              
              <div className="text-center">
                <span className="bg-[#ef4444] border-2 border-black text-white text-xs font-cartoon border border-red-500/20 px-5 py-2 rounded-full uppercase tracking-wider animate-pulse cartoon-shadow-sm inline-block">
                  ⏳ WAITING FOR PVP CHALLENGER
                </span>
                <h3 className="text-4xl font-cartoon text-white tracking-wide uppercase leading-none mt-4 flex items-center justify-center gap-2">
                  LOBBY KEY: <span className="text-yellow-300 select-all font-black tracking-widest">{connectedRoomId}</span>
                </h3>
                <p className="text-xs text-yellow-100 font-medium mt-2 max-w-md mx-auto leading-relaxed">
                  Share this dual game code with a friend! They can paste it on their screen to automatically connect and launch the arena fight!
                </p>
              </div>

              {/* Real-time Roster visualization */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-lg my-2">
                
                {/* HOST P1 */}
                <div className="flex-1 flex flex-col items-center bg-[#1e293b] p-4 rounded-2xl border-2 border-black w-full cartoon-shadow">
                  <div className="w-10 h-10 rounded-full bg-yellow-400/10 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 font-black text-sm">P1</div>
                  <span className="text-[10px] font-mono text-slate-400 mt-2.5 font-bold uppercase">Player 1 (Host)</span>
                  <span className="text-base font-cartoon text-yellow-450 mt-1 max-w-[140px] truncate">
                    {(Object.values(lobbyPlayers) as any[]).find(p => p.idStr === 'player')?.name || 'Waiting...'}
                  </span>
                  <span className="text-[10px] font-cartoon text-green-400 font-black flex items-center gap-1.5 mt-3.5 bg-green-500/10 border-2 border-green-500 px-3 py-1 rounded-full uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" /> READY
                  </span>
                </div>

                <div className="font-cartoon text-slate-400 font-black text-sm animate-bounce bg-black px-4 py-2 border-2 border-black rounded-xl">VS</div>

                {/* GUEST P2 */}
                <div className="flex-1 flex flex-col items-center bg-[#1e293b] p-4 rounded-2xl border-2 border-black w-full cartoon-shadow">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center text-red-500 font-black text-sm">P2</div>
                  <span className="text-[10px] font-mono text-slate-400 mt-2.5 font-bold uppercase">Player 2 (Guest)</span>
                  <span className="text-base font-cartoon text-red-400 mt-1 max-w-[140px] truncate">
                    {(Object.values(lobbyPlayers) as any[]).find(p => p.idStr === 'cpu')?.name || 'Waiting...'}
                  </span>
                  {(Object.values(lobbyPlayers) as any[]).find(p => p.idStr === 'cpu') ? (
                    <span className="text-[10px] font-cartoon text-green-400 font-black flex items-center gap-1.5 mt-3.5 bg-green-500/10 border-2 border-green-500 px-3 py-1 rounded-full uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> CONNECTED
                    </span>
                  ) : (
                    <span className="text-[10px] font-cartoon text-yellow-500 font-black animate-pulse flex items-center gap-1.5 mt-3.5 bg-yellow-500/10 border-2 border-yellow-550 px-3 py-1 rounded-full uppercase tracking-wide">
                      🔒 WAITING
                    </span>
                  )}
                </div>

              </div>

              <div className="w-full max-w-xs pt-2">
                <button
                  onClick={leaveMultiplayerLobby}
                  className="w-full bg-[#ef4444] hover:bg-red-650 text-white border-2 border-black font-cartoon font-black text-xs py-3.5 rounded-2xl transition uppercase tracking-widest cursor-pointer cartoon-shadow-sm"
                >
                  Quit & Cancel Lobby
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* CARD ALBUM TAB (PORTRAIT SHOWCASE) */}
      {activeTab === 'album' && (
        <div className="bg-[#1e293b] cartoon-border cartoon-shadow p-5 sm:p-6 rounded-3xl flex flex-col gap-6 animate-fade-in relative text-slate-100">
          
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-600/[0.08] blur-3xl rounded-full pointer-events-none" />

          <div className="border-b-2 border-black pb-4">
            <h2 className="text-xl sm:text-2xl font-cartoon text-yellow-400 uppercase tracking-wide flex items-center gap-2.5 drop-shadow-[1.5px_1.5px_0_#000]">
              <BookOpen className="w-6 h-6 text-cyan-400 animate-pulse" /> POKÉMON CARD COLLECTION ALBUM
            </h2>
            <p className="text-xs text-yellow-105 font-medium mt-1">
              Browse the complete collection of Pokémon fighters. You can unlock elite secret legends (<strong className="text-yellow-400">RARE</strong>) by ripping mystery booster packs, permanently saving them to your collection!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* INVENTORY GRID - LEFT (7 COLS) */}
            <div className="md:col-span-7 flex flex-col gap-3.5 bg-slate-950/40 p-4 rounded-3xl border-2 border-black h-auto max-h-[500px] overflow-y-auto shadow-inner">
              <h3 className="text-xs font-cartoon text-yellow-400 uppercase tracking-wide pl-1 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-500" /> COLLECTIBLE CARD VAULT ({allAlbumPokemons.length} cards):
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {allAlbumPokemons.map((poke) => {
                  const isSec = poke.isSecret === true;
                  const isUnlocked = !isSec || unlockedSecretIds.includes(poke.id);
                  const isCurrentlySelected = albumSelected.id === poke.id;

                  return (
                    <button
                      key={poke.id}
                      onClick={() => {
                        if (isUnlocked) {
                          setAlbumSelected(poke);
                          audio.playSelect();
                        } else {
                          audio.playBlock();
                        }
                      }}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center justify-between gap-2.5 transition-all duration-350 shrink-0 select-none cursor-pointer group relative ${
                        isUnlocked
                          ? isCurrentlySelected
                            ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                            : 'bg-slate-900 border-black hover:border-slate-800'
                          : 'bg-slate-950 border-dashed border-slate-850 opacity-40 cursor-not-allowed'
                      }`}
                      disabled={!isUnlocked}
                      title={isUnlocked ? poke.name : "Secret Legend - Locked"}
                    >
                      {isSec && isUnlocked && (
                        <span className="absolute -top-1.5 -right-0.5 uppercase font-mono font-black text-[5px] bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 px-1 py-0.2 border border-black rounded-full shadow z-10">FOIL</span>
                      )}

                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden relative p-1 transition-all ${
                          isUnlocked 
                            ? 'bg-slate-950 border-black group-hover:scale-105'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                        style={{ background: isUnlocked ? `radial-gradient(circle, ${poke.color}22 0%, ${poke.color}55 100%)` : '' }}
                      >
                        {isUnlocked ? (
                          <img 
                            src={poke.imageUrl} 
                            alt={poke.name} 
                            className="w-9 h-9 object-contain filter drop-shadow select-none group-hover:rotate-2 duration-300 pointer-events-none" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-700" />
                        )}
                      </div>

                      <div className="text-center w-full min-w-0">
                        <span className={`text-[10px] font-sans font-black block truncate leading-tight ${isUnlocked ? 'text-slate-250' : 'text-slate-600 font-light'}`}>
                          {isUnlocked ? poke.name : '???'}
                        </span>
                        <span className="text-[7.5px] font-mono text-slate-500 uppercase block leading-none mt-0.5">
                          {isUnlocked ? (isSec ? 'Legend' : 'Starter') : 'Locked'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Booster Pack Prompt block inside Album */}
              <div className="mt-4 bg-[#facc15]/10 border-2 border-yellow-500 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-md">
                <p className="font-semibold text-yellow-100 leading-relaxed text-[10px] sm:text-xs">
                  Missing any secret god cards (<strong className="text-yellow-400">Rayquaza, Mew, Garchomp, Arceus</strong>)? Take a shortcut!
                </p>
                <button
                  onClick={() => {
                    setBoosterPackActive(true);
                    audio.playSelect();
                  }}
                  className="bg-yellow-400 text-slate-950 hover:bg-yellow-500 active:scale-95 font-cartoon font-black text-[10px] sm:text-xs px-4 py-2.5 rounded-xl border-2 border-black cartoon-shadow-sm transition shrink-0 cursor-pointer uppercase tracking-wider"
                >
                  OPEN MYSTERY PACK
                </button>
              </div>
            </div>

            {/* EXPANDED INTERACTIVE PREVIEW - RIGHT (5 COLS) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/40 border-2 border-black p-4 rounded-3xl relative shadow-xl min-h-[350px]">
              
              <div className="absolute top-1 bg-cyan-950 border-2 border-cyan-500 text-cyan-400 text-[8px] font-mono font-black tracking-widest px-3 py-1 rounded-full mb-2">
                HOLOGRAPHIC ENVELOPE SHOWCASE ✦
              </div>

              <div className="w-full flex justify-center mt-6">
                <PokemonCard pokemon={albumSelected} label="COLLECTION CARD" badgeColor="bg-cyan-45 * text-slate-950 border-2 border-black" />
              </div>

              {/* Detailed information description in English */}
              <div className="mt-4 bg-slate-900 border-2 border-black p-4 rounded-2xl w-full text-left">
                <div className="text-[10px] font-cartoon text-yellow-400 uppercase tracking-wide">CARD BIO & DESCRIPTION:</div>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold mt-1.5 text-justify">
                  {albumSelected.description}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* DETAILED POKÉMON ABILITIES TAB */}
      {activeTab === 'abilities' && (
        <div className="bg-[#1e293b] cartoon-border cartoon-shadow p-5 sm:p-6 rounded-3xl flex flex-col gap-6 animate-fade-in relative text-slate-100">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-650/[0.08] blur-3xl rounded-full pointer-events-none" />

          <div className="border-b-2 border-black pb-4">
            <h2 className="text-xl sm:text-2xl font-cartoon text-yellow-400 uppercase tracking-wide flex items-center gap-2.5 drop-shadow-[1.5px_1.5px_0_#000]">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse shrink-0" /> POKÉMON SPECIAL PASSIVES & ABILITIES
            </h2>
            <p className="text-xs text-yellow-105 font-medium mt-1">
              Every Pokémon possess an unique specialized passive skill and defensive combat perk that modifies their damage curves and active gameplay style!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 max-h-[500px] overflow-y-auto pr-1">
            {allAlbumPokemons.map((poke) => {
              const isSec = poke.isSecret === true;
              return (
                <div 
                  key={poke.id} 
                  className={`p-4 rounded-2xl border-2 flex gap-4 transition-all hover:bg-slate-950/40 relative ${
                    isSec 
                      ? 'bg-yellow-500/5 border-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.15)]' 
                      : 'bg-slate-950 border-black shadow'
                  }`}
                >
                  {isSec && (
                    <span className="absolute top-2 right-2.5 text-[7px] font-cartoon bg-yellow-450 border border-black text-slate-950 px-2 py-0.5 rounded-full scale-90 shadow-md uppercase tracking-wider animate-pulse">SECRET PASSIVE</span>
                  )}

                  {/* Icon */}
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 border-black"
                    style={{ background: `radial-gradient(circle, ${poke.color}22 0%, ${poke.color}55 100%)` }}
                  >
                    <img src={poke.imageUrl} alt={poke.name} className="w-10 h-10 object-contain filter drop-shadow" referrerPolicy="no-referrer" />
                  </div>

                  {/* Descriptions */}
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-sm font-cartoon text-slate-150 flex items-center gap-1.5 leading-tight uppercase">
                      {poke.name}
                      <span className="text-[9px] font-mono text-purple-400 font-extrabold bg-purple-500/10 border border-purple-550/35 px-2 py-0.2 rounded-full leading-none shrink-0">
                        {poke.abilityName || 'Passive'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-350 leading-relaxed font-semibold mt-1.5">
                      {poke.abilityDesc || 'Unique specialized passive skill under evaluation.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {boosterPackActive && (
        <BoosterPack 
          onClose={() => {
            setBoosterPackActive(false);
            reloadSecrets(); // automatically updates album and select grid with pulled rare pokemons!
          }}
          onAccept={(pokemon) => {
            selectP1Character(pokemon);
            setBoosterPackActive(false);
            reloadSecrets();
            onStartFight(pokemon, selectedCpu, selectedArena);
          }}
        />
      )}

    </div>
  );
}
