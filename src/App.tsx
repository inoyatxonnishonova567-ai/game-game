/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  Code2,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Swords,
  Shield,
  Coins,
  Clock,
  Crosshair,
  MapPin,
  Compass
} from 'lucide-react';
import { sound } from './sound.ts';
import { STANDALONE_HTML_CODE } from './standaloneCode.ts';
import type {
  Player,
  EnemyBot,
  MinionUnit,
  TurretUnit,
  JungleMonster,
  ActiveBuff,
  Projectile,
  Particle,
  DamageText,
  ClickMarker,
  AnnouncementBanner
} from './types.ts';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  WORLD,
  INITIAL_TURRETS,
  INITIAL_JUNGLE_MONSTERS
} from './mapData.ts';
import {
  spawnThreeLaneWaves,
  renderFullMinimap
} from './gameLogic.ts';
import { ThreeGameBridge } from './threeGameBridge.ts';
import { to3DPos } from './threeArena.ts';

const CANVAS_WIDTH = 980;
const CANVAS_HEIGHT = 590;

export default function App() {
  const threeContainerRef = useRef<HTMLDivElement | null>(null);
  const threeBridgeRef = useRef<ThreeGameBridge | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);

  // Tovush va Modal
  const [isMuted, setIsMuted] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // HUD ko'rsatkichlari
  const [hudHp, setHudHp] = useState(750);
  const [hudMaxHp, setHudMaxHp] = useState(750);
  const [hudMp, setHudMp] = useState(380);
  const [hudMaxMp, setHudMaxMp] = useState(380);
  const [hudLevel, setHudLevel] = useState(1);
  const [hudXp, setHudXp] = useState(0);
  const [hudMaxXp, setHudMaxXp] = useState(120);
  const [hudGold, setHudGold] = useState(300);
  const [hudKills, setHudKills] = useState(0);
  const [hudDeaths, setHudDeaths] = useState(0);
  const [gameTimeSeconds, setGameTimeSeconds] = useState(0);
  const [fps, setFps] = useState(60);

  // Active Buffs holati
  const [playerBuffs, setPlayerBuffs] = useState<ActiveBuff[]>([]);

  // Skill Cooldownlar
  const [cooldowns, setCooldowns] = useState({
    q: 0,
    qMax: 150,
    w: 0,
    wMax: 240,
    r: 0,
    rMax: 480,
  });

  // Joystick boshqaruvi
  const joystickContainerRef = useRef<HTMLDivElement | null>(null);
  const [joystickNubOffset, setJoystickNubOffset] = useState({ x: 0, y: 0 });
  const isDraggingJoystick = useRef(false);

  // Banner
  const [activeBanner, setActiveBanner] = useState<AnnouncementBanner | null>(null);
  const [respawnSeconds, setRespawnSeconds] = useState(0);

  // Game State Ref
  const gameStateRef = useRef<{
    camera: { x: number; y: number };
    player: Player;
    minions: MinionUnit[];
    enemyHero: EnemyBot | null;
    turrets: TurretUnit[];
    jungles: JungleMonster[];
    projectiles: Projectile[];
    particles: Particle[];
    damageTexts: DamageText[];
    clickMarkers: ClickMarker[];
    banner: AnnouncementBanner | null;
    keys: Record<string, boolean>;
    nextId: { id: number };
    frameCount: number;
    gameSeconds: number;
    lastFpsTime: number;
    waveTimer: number;
    waveCount: number;
    screenShake: number;
    respawnTimer: number;
  }>({
    camera: { x: 0, y: 1900 },
    player: {
      x: 340,
      y: 2260,
      z: 0,
      radius: 20,
      speed: 5.2,
      vx: 0,
      vy: 0,
      friction: 0.86,
      acceleration: 1.05,
      angle: -0.65,
      name: "Xavier",
      heroClass: "Defier of Light / Sehrgar",
      level: 1,
      kills: 0,
      deaths: 0,
      score: 0,
      gold: 300,
      xp: 0,
      maxXp: 120,
      attackDamage: 65,
      maxHp: 750,
      hp: 750,
      maxMp: 380,
      mp: 380,
      color: "#0ea5e9",
      shield: 0,
      shieldTimer: 0,
      hitFlash: 0,
      qCooldown: 0,
      qMaxCooldown: 150,
      wCooldown: 0,
      wMaxCooldown: 240,
      eCooldown: 0,
      rCooldown: 0,
      rMaxCooldown: 480,
      attackCooldown: 0,
      moveTarget: null,
      isAttacking: false,
      attackAnim: 0,
      activeBuffs: [],
    },
    jungles: JSON.parse(JSON.stringify(INITIAL_JUNGLE_MONSTERS)),
    turrets: JSON.parse(JSON.stringify(INITIAL_TURRETS)),
    minions: [],
    enemyHero: {
      id: 999,
      name: "Zilong (Dushman)",
      type: 'boss',
      x: 1450,
      y: 1150,
      spawnX: 2320,
      spawnY: 340,
      radius: 20,
      height: 38,
      speed: 2.3,
      angle: 3.14,
      walkCycle: 0,
      maxHp: 850,
      hp: 850,
      color: "#dc2626",
      hitFlash: 0,
      isDead: false,
      respawnTimer: 0,
      attackCooldown: 0,
      attackRange: 55,
      damage: 24,
      scoreReward: 350,
      goldReward: 220,
    },
    projectiles: [],
    particles: [],
    damageTexts: [],
    clickMarkers: [],
    banner: null,
    keys: {},
    nextId: { id: 1000 },
    frameCount: 0,
    gameSeconds: 0,
    lastFpsTime: performance.now(),
    waveTimer: 60,
    waveCount: 0,
    screenShake: 0,
    respawnTimer: 0,
  });

  const toggleSound = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(STANDALONE_HTML_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([STANDALONE_HTML_CODE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mlbb_3d_moba_arena.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const triggerBanner = (title: string, subtext: string, color: string) => {
    const banner: AnnouncementBanner = {
      id: Date.now(),
      title,
      subtext,
      color,
      timer: 180,
      maxTimer: 180
    };
    gameStateRef.current.banner = banner;
    setActiveBanner(banner);
  };

  const resetGame = () => {
    const state = gameStateRef.current;
    state.player.x = 340;
    state.player.y = 2260;
    state.player.hp = state.player.maxHp;
    state.player.mp = state.player.maxMp;
    state.player.kills = 0;
    state.player.deaths = 0;
    state.player.gold = 300;
    state.player.level = 1;
    state.player.xp = 0;
    state.player.activeBuffs = [];
    state.player.moveTarget = null;
    state.turrets = JSON.parse(JSON.stringify(INITIAL_TURRETS));
    state.jungles = JSON.parse(JSON.stringify(INITIAL_JUNGLE_MONSTERS));
    state.minions = [];
    state.projectiles = [];
    state.damageTexts = [];
    state.waveTimer = 60;
    state.waveCount = 0;
    state.gameSeconds = 0;

    if (state.enemyHero) {
      state.enemyHero.x = 1450;
      state.enemyHero.y = 1150;
      state.enemyHero.hp = state.enemyHero.maxHp;
      state.enemyHero.isDead = false;
    }

    setHudHp(state.player.hp);
    setHudMp(state.player.mp);
    setHudGold(300);
    setHudKills(0);
    setHudDeaths(0);
    setHudLevel(1);
    setHudXp(0);
    setPlayerBuffs([]);
    triggerBanner("YANGI 3D JANG BOSHLANDI!", "3 ta yo'lak bo'ylab dushmanga qarshi jangga kiring!", "#38bdf8");
  };

  const addPlayerXp = useCallback((amount: number) => {
    const p = gameStateRef.current.player;
    p.xp += amount;
    while (p.xp >= p.maxXp && p.level < 15) {
      p.xp -= p.maxXp;
      p.level++;
      p.maxXp = Math.round(p.maxXp * 1.35);
      p.maxHp += 80;
      p.hp = p.maxHp;
      p.maxMp += 35;
      p.mp = p.maxMp;
      p.attackDamage += 10;

      // 3D Level up sparks
      threeBridgeRef.current?.vfx.createSparks(to3DPos(p.x, p.y), 0xfbbf24, 30);
      triggerBanner(`LEVEL UP! (Lv.${p.level})`, "HP va Attack kuchi oshdi!", "#eab308");
      sound.playLevelUp();
    }
    setHudLevel(p.level);
    setHudXp(p.xp);
    setHudMaxXp(p.maxXp);
    setHudMaxHp(p.maxHp);
    setHudMaxMp(p.maxMp);
  }, []);

  const getNearestEnemyTarget = () => {
    const state = gameStateRef.current;
    const p = state.player;
    let closest: { x: number; y: number; hp: number; ref: any } | null = null;
    let minD = 480;

    if (state.enemyHero && !state.enemyHero.isDead) {
      const d = Math.hypot(state.enemyHero.x - p.x, state.enemyHero.y - p.y);
      if (d < minD) {
        minD = d;
        closest = { x: state.enemyHero.x, y: state.enemyHero.y, hp: state.enemyHero.hp, ref: state.enemyHero };
      }
    }

    state.minions.forEach(m => {
      if (m.team === 'enemy' && !m.isDead) {
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        if (d < minD) {
          minD = d;
          closest = { x: m.x, y: m.y, hp: m.hp, ref: m };
        }
      }
    });

    state.turrets.forEach(t => {
      if (t.team === 'enemy' && !t.isDestroyed) {
        const d = Math.hypot(t.x - p.x, t.y - p.y);
        if (d < minD) {
          minD = d;
          closest = { x: t.x, y: t.y, hp: t.hp, ref: t };
        }
      }
    });

    state.jungles.forEach(j => {
      if (!j.isDead) {
        const d = Math.hypot(j.x - p.x, j.y - p.y);
        if (d < minD * 0.7) {
          minD = d;
          closest = { x: j.x, y: j.y, hp: j.hp, ref: j };
        }
      }
    });

    return closest;
  };

  // ASOSIY HUJUM (BASIC ATTACK)
  const executeBasicAttack = useCallback(() => {
    const state = gameStateRef.current;
    const { player, projectiles } = state;
    if (player.attackCooldown > 0) return;

    player.attackCooldown = 32;
    const target = getNearestEnemyTarget();
    let attackAngle = player.angle;
    if (target) {
      attackAngle = Math.atan2(target.y - player.y, target.x - player.x);
      player.angle = attackAngle;
    }

    const hasRed = player.activeBuffs.some(b => b.id === 'attack_burn');
    const finalDamage = player.attackDamage + (hasRed ? 25 : 0);

    projectiles.push({
      id: state.nextId.id++,
      team: 'allied',
      x: player.x + Math.cos(attackAngle) * 20,
      y: player.y + Math.sin(attackAngle) * 14,
      vx: Math.cos(attackAngle) * 11,
      vy: Math.sin(attackAngle) * 11,
      radius: 8,
      color: hasRed ? "#ef4444" : "#38bdf8",
      damage: finalDamage,
      range: 400,
      distanceTraveled: 0,
      type: 'wind_slash',
      trailColor: hasRed ? "#fca5a5" : "#7dd3fc"
    });

    threeBridgeRef.current?.vfx.createSparks(to3DPos(player.x, player.y), hasRed ? 0xef4444 : 0x38bdf8, 8);
    sound.playAttack();
  }, []);

  // XAVIER 1-SKILL: INFINITE EXTENSION (Q)
  const executeSkill1 = useCallback(() => {
    const state = gameStateRef.current;
    const { player, projectiles } = state;
    if (player.qCooldown > 0 || player.mp < 30) return;

    const hasBlue = player.activeBuffs.some(b => b.id === 'mana_regen_cdr');
    player.mp -= 30;
    player.qMaxCooldown = hasBlue ? 100 : 140;
    player.qCooldown = player.qMaxCooldown;

    const target = getNearestEnemyTarget();
    const angle = target ? Math.atan2(target.y - player.y, target.x - player.x) : player.angle;
    player.angle = angle;

    projectiles.push({
      id: state.nextId.id++,
      team: 'allied',
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * 13,
      vy: Math.sin(angle) * 13,
      radius: 14,
      color: "#06b6d4",
      damage: player.attackDamage * 2.5,
      range: 650,
      distanceTraveled: 0,
      type: 'xavier_infinite_extension',
      trailColor: "#67e8f9",
      expansionFactor: 1,
      isPenetrating: true
    });

    threeBridgeRef.current?.vfx.createSparks(to3DPos(player.x, player.y), 0x06b6d4, 20);
    sound.playAttack();
  }, []);

  // XAVIER 2-SKILL: MYSTIC FIELD (W)
  const executeSkill2 = useCallback(() => {
    const state = gameStateRef.current;
    const { player } = state;
    if (player.wCooldown > 0 || player.mp < 45) return;

    const hasBlue = player.activeBuffs.some(b => b.id === 'mana_regen_cdr');
    player.mp -= 45;
    player.wMaxCooldown = hasBlue ? 160 : 220;
    player.wCooldown = player.wMaxCooldown;

    const target = getNearestEnemyTarget();
    let spawnDist = 160;
    let angle = player.angle;
    if (target) {
      angle = Math.atan2(target.y - player.y, target.x - player.x);
      spawnDist = Math.min(220, Math.hypot(target.x - player.x, target.y - player.y));
    }

    const fieldX = player.x + Math.cos(angle) * spawnDist;
    const fieldY = player.y + Math.sin(angle) * spawnDist;

    // 3D Mystic Field barrier & particles
    threeBridgeRef.current?.vfx.createMysticField(to3DPos(fieldX, fieldY), 8.5);
    threeBridgeRef.current?.vfx.createSparks(to3DPos(fieldX, fieldY), 0xc084fc, 24);
    sound.playXavierBarrier();
  }, []);

  // XAVIER 3-SKILL: DAWNING LIGHT ULTIMATE (R)
  const executeSkill3 = useCallback(() => {
    const state = gameStateRef.current;
    const { player } = state;
    if (player.rCooldown > 0 || player.mp < 75) return;

    const hasBlue = player.activeBuffs.some(b => b.id === 'mana_regen_cdr');
    player.mp -= 75;
    player.rMaxCooldown = hasBlue ? 360 : 480;
    player.rCooldown = player.rMaxCooldown;

    const target = getNearestEnemyTarget();
    const angle = target ? Math.atan2(target.y - player.y, target.x - player.x) : player.angle;
    player.angle = angle;

    const beamLength = 2600;
    const x2 = player.x + Math.cos(angle) * beamLength;
    const y2 = player.y + Math.sin(angle) * beamLength;

    // 3D Dawning Light Beam
    const p3d = to3DPos(player.x, player.y);
    const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    threeBridgeRef.current?.vfx.createDawningLightBeam(p3d, dir, 260);

    const laserDamage = player.attackDamage * 4.8;

    // Hit checks
    if (state.enemyHero && !state.enemyHero.isDead) {
      if (pointToLineDistance(state.enemyHero.x, state.enemyHero.y, player.x, player.y, x2, y2) < 55) {
        state.enemyHero.hp -= laserDamage;
        state.enemyHero.hitFlash = 12;
        state.damageTexts.push({
          id: state.nextId.id++,
          x: state.enemyHero.x,
          y: state.enemyHero.y - 30,
          text: `-${Math.round(laserDamage)}`,
          color: "#38bdf8",
          alpha: 1.5
        });
        threeBridgeRef.current?.vfx.createSparks(to3DPos(state.enemyHero.x, state.enemyHero.y), 0x38bdf8, 25);

        if (state.enemyHero.hp <= 0) {
          state.enemyHero.isDead = true;
          state.enemyHero.respawnTimer = 340;
          player.kills++;
          player.score += 350;
          player.gold += 240;
          addPlayerXp(350);
          triggerBanner("DAWNING LIGHT SNIPE!", "Xavier dushmanni uzoqdan nishonga oldi!", "#38bdf8");
          sound.playKill();
        }
      }
    }

    state.minions.forEach(m => {
      if (m.team === 'enemy' && !m.isDead) {
        if (pointToLineDistance(m.x, m.y, player.x, player.y, x2, y2) < 45) {
          m.hp -= laserDamage;
          m.hitFlash = 10;
          state.damageTexts.push({
            id: state.nextId.id++,
            x: m.x,
            y: m.y - 20,
            text: `-${Math.round(laserDamage)}`,
            color: "#38bdf8",
            alpha: 1.2
          });
        }
      }
    });

    state.turrets.forEach(t => {
      if (t.team === 'enemy' && !t.isDestroyed) {
        if (pointToLineDistance(t.x, t.y, player.x, player.y, x2, y2) < 52) {
          t.hp -= laserDamage * 0.7;
          state.damageTexts.push({
            id: state.nextId.id++,
            x: t.x,
            y: t.y - 45,
            text: `-${Math.round(laserDamage * 0.7)}`,
            color: "#38bdf8",
            alpha: 1.2
          });
        }
      }
    });

    threeBridgeRef.current?.vfx.createSparks(p3d, 0x38bdf8, 35);
    state.screenShake = 1.0;
    sound.playXavierLaser();
    triggerBanner("DAWNING LIGHT (ULTIMATE)!", "Xavier butun xarita bo'ylab global 3D lazer otdi!", "#38bdf8");
  }, [addPlayerXp]);

  function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // Virtual Joystick
  const handleJoystickStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingJoystick.current = true;
    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingJoystick.current || !joystickContainerRef.current) return;
    const rect = joystickContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 12;

    if (dist > 0) {
      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);
      setJoystickNubOffset({
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist
      });

      const p = gameStateRef.current.player;
      const intensity = clampedDist / maxRadius;
      p.vx = Math.cos(angle) * p.speed * intensity;
      p.vy = Math.sin(angle) * p.speed * intensity;
      p.angle = angle;
      p.moveTarget = null;
    }
  };

  const handleJoystickEnd = () => {
    isDraggingJoystick.current = false;
    setJoystickNubOffset({ x: 0, y: 0 });
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        executeBasicAttack();
      } else if (e.key === 'q' || e.key === 'Q') {
        executeSkill1();
      } else if (e.key === 'w' || e.key === 'W') {
        executeSkill2();
      } else if (e.key === 'r' || e.key === 'R') {
        executeSkill3();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [executeBasicAttack, executeSkill1, executeSkill2, executeSkill3]);

  // Three.js Mount & Main Game Loop
  useEffect(() => {
    if (threeContainerRef.current && !threeBridgeRef.current) {
      threeBridgeRef.current = new ThreeGameBridge(
        threeContainerRef.current,
        gameStateRef.current.turrets,
        gameStateRef.current.jungles
      );
    }

    let animId: number;

    const updateGame = () => {
      const state = gameStateRef.current;
      const { player, minions, enemyHero, turrets, jungles, projectiles, damageTexts, clickMarkers, keys } = state;

      // 1. Vaqt va To'lqinlar
      state.frameCount++;
      if (state.frameCount % 60 === 0) {
        state.gameSeconds++;
        setGameTimeSeconds(state.gameSeconds);

        if (player.activeBuffs.some(b => b.id === 'speed_gold')) {
          player.gold += 6;
        }
      }

      state.waveTimer--;
      if (state.waveTimer <= 0) {
        const spawned = spawnThreeLaneWaves(state.nextId);
        state.minions.push(...spawned);
        state.waveCount++;
        state.waveTimer = 15 * 60; // Har 15 soniyada 3 ta yo'lakka
        triggerBanner(`MINION TO'LQINI #${state.waveCount}`, "3 ta yo'lak bo'ylab qo'shinlar jangga otlandi!", "#38bdf8");
      }

      if (state.banner) {
        state.banner.timer--;
        if (state.banner.timer <= 0) {
          state.banner = null;
          setActiveBanner(null);
        }
      }

      // Respawn hisoblash
      if (player.isDead) {
        state.respawnTimer--;
        setRespawnSeconds(Math.ceil(state.respawnTimer / 60));
        if (state.respawnTimer <= 0) {
          player.isDead = false;
          player.hp = player.maxHp;
          player.mp = player.maxMp;
          player.x = 340;
          player.y = 2260;
          player.vx = 0;
          player.vy = 0;
          player.shield = 500;
          player.shieldTimer = 180;
          setRespawnSeconds(0);
          state.screenShake = 0.5;
          threeBridgeRef.current?.vfx.createSparks(to3DPos(player.x, player.y), 0x38bdf8, 30);
          triggerBanner("QAYTA TIRILDINGIZ!", "Bazada himoya qalqoni bilan jangga qaytdingiz!", "#10b981");
          sound.playRespawn();
        }
      }

      // 2. Qahramon harakati
      for (let i = player.activeBuffs.length - 1; i >= 0; i--) {
        player.activeBuffs[i].duration--;
        if (player.activeBuffs[i].duration <= 0) {
          player.activeBuffs.splice(i, 1);
        }
      }
      setPlayerBuffs([...player.activeBuffs]);

      const hasGoldBuff = player.activeBuffs.some(b => b.id === 'speed_gold');
      let mx = 0, my = 0;
      if (!player.isDead) {
        if (keys['w'] || keys['arrowup']) my -= 1;
        if (keys['s'] || keys['arrowdown']) my += 1;
        if (keys['a'] || keys['arrowleft']) mx -= 1;
        if (keys['d'] || keys['arrowright']) mx += 1;
      }

      if (mx !== 0 || my !== 0) {
        const inv = 1 / Math.hypot(mx, my);
        player.vx += mx * inv * player.acceleration * (hasGoldBuff ? 1.25 : 1.0);
        player.vy += my * inv * player.acceleration * (hasGoldBuff ? 1.25 : 1.0);
        player.angle = Math.atan2(my, mx);
      } else if (player.moveTarget) {
        const dx = player.moveTarget.x - player.x;
        const dy = player.moveTarget.y - player.y;
        const d = Math.hypot(dx, dy);
        if (d > 8) {
          player.vx += (dx / d) * player.acceleration * (hasGoldBuff ? 1.25 : 1.0);
          player.vy += (dy / d) * player.acceleration * (hasGoldBuff ? 1.25 : 1.0);
          player.angle = Math.atan2(dy, dx);
        } else {
          player.moveTarget = null;
        }
      }

      player.vx *= player.friction;
      player.vy *= player.friction;
      player.x += player.vx;
      player.y += player.vy;

      player.x = Math.max(WORLD.minX, Math.min(WORLD.maxX, player.x));
      player.y = Math.max(WORLD.minY, Math.min(WORLD.maxY, player.y));

      if (player.qCooldown > 0) player.qCooldown--;
      if (player.wCooldown > 0) player.wCooldown--;
      if (player.rCooldown > 0) player.rCooldown--;
      if (player.attackCooldown > 0) player.attackCooldown--;
      if (player.hitFlash > 0) player.hitFlash--;

      const hasBlueBuff = player.activeBuffs.some(b => b.id === 'mana_regen_cdr');
      if (player.mp < player.maxMp) {
        player.mp = Math.min(player.maxMp, player.mp + (hasBlueBuff ? 0.75 : 0.35));
      }

      // 3. O'rmon Maxluqlari AI
      for (const j of jungles) {
        if (j.isDead) {
          j.respawnTimer--;
          if (j.respawnTimer <= 0) {
            j.isDead = false;
            j.hp = j.maxHp;
            damageTexts.push({
              id: state.nextId.id++,
              x: j.x,
              y: j.y - 25,
              text: `${j.name} tirildi!`,
              color: j.color,
              alpha: 1.2
            });
          }
          continue;
        }

        if (j.hitFlash > 0) j.hitFlash--;
        if (j.attackCooldown > 0) j.attackCooldown--;

        const dToPlayer = Math.hypot(player.x - j.x, player.y - j.y);
        if (dToPlayer < j.attackRange + 25 && j.attackCooldown <= 0) {
          j.attackCooldown = 65;
          let dmg = j.damage;
          if (player.shield > 0) {
            player.shield -= dmg;
            if (player.shield < 0) {
              player.hp += player.shield;
              player.shield = 0;
            }
          } else {
            player.hp = Math.max(0, player.hp - dmg);
          }
          player.hitFlash = 7;
          damageTexts.push({
            id: state.nextId.id++,
            x: player.x,
            y: player.y - 25,
            text: `-${dmg}`,
            color: "#f87171",
            alpha: 1
          });
          sound.playHit();
        }
      }

      // 4. Minionlar AI
      for (let i = minions.length - 1; i >= 0; i--) {
        const m = minions[i];
        if (m.isDead) {
          minions.splice(i, 1);
          continue;
        }

        if (m.hitFlash > 0) m.hitFlash--;
        if (m.attackCooldown > 0) m.attackCooldown--;

        let target: { x: number; y: number; hp: number; ref: any; isTurret?: boolean; isHero?: boolean } | null = null;
        let minD = m.attackRange + 30;

        for (const other of minions) {
          if (other.team !== m.team && !other.isDead) {
            const d = Math.hypot(other.x - m.x, other.y - m.y);
            if (d < minD) {
              minD = d;
              target = { x: other.x, y: other.y, hp: other.hp, ref: other };
            }
          }
        }

        if (!target) {
          if (m.team === 'enemy') {
            const dToP = Math.hypot(player.x - m.x, player.y - m.y);
            if (dToP < minD) {
              target = { x: player.x, y: player.y, hp: player.hp, ref: player, isHero: true };
            }
          } else if (enemyHero && !enemyHero.isDead) {
            const dToE = Math.hypot(enemyHero.x - m.x, enemyHero.y - m.y);
            if (dToE < minD) {
              target = { x: enemyHero.x, y: enemyHero.y, hp: enemyHero.hp, ref: enemyHero, isHero: true };
            }
          }
        }

        if (!target) {
          for (const t of turrets) {
            if (t.team !== m.team && !t.isDestroyed) {
              const d = Math.hypot(t.x - m.x, t.y - m.y);
              if (d < minD + 40) {
                target = { x: t.x, y: t.y, hp: t.hp, ref: t, isTurret: true };
                break;
              }
            }
          }
        }

        if (target) {
          m.angle = Math.atan2(target.y - m.y, target.x - m.x);
          const dist = Math.hypot(target.x - m.x, target.y - m.y);

          if (dist <= m.attackRange) {
            if (m.attackCooldown <= 0) {
              m.attackCooldown = 55;
              target.ref.hp -= m.damage;
              target.ref.hitFlash = 7;
              damageTexts.push({
                id: state.nextId.id++,
                x: target.x,
                y: target.y - 20,
                text: `-${m.damage}`,
                color: m.team === 'allied' ? "#93c5fd" : "#fca5a5",
                alpha: 1
              });

              if (target.ref.hp <= 0 && !target.isTurret && !target.isHero) {
                target.ref.isDead = true;
              }
            }
          } else {
            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
          }
        } else if (m.waypoints && m.waypoints.length > 0) {
          const wp = m.waypoints[m.waypointIndex];
          if (wp) {
            const dx = wp.x - m.x;
            const dy = wp.y - m.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 30) {
              if (m.waypointIndex < m.waypoints.length - 1) {
                m.waypointIndex++;
              }
            } else {
              m.angle = Math.atan2(dy, dx);
              m.x += (dx / dist) * m.speed;
              m.y += (dy / dist) * m.speed;
            }
          }
        }
      }

      // 5. Minoralar AI
      for (const t of turrets) {
        if (t.isDestroyed) continue;
        if (t.attackCooldown > 0) t.attackCooldown--;

        if (t.attackCooldown <= 0) {
          let turretTarget: { x: number; y: number; hp: number; ref: any } | null = null;
          let bestD = t.attackRange;

          for (const m of minions) {
            if (m.team !== t.team && !m.isDead) {
              const d = Math.hypot(m.x - t.x, m.y - t.y);
              if (d < bestD) {
                bestD = d;
                turretTarget = { x: m.x, y: m.y, hp: m.hp, ref: m };
              }
            }
          }

          if (!turretTarget) {
            if (t.team === 'enemy') {
              const dToP = Math.hypot(player.x - t.x, player.y - t.y);
              if (dToP < bestD) {
                turretTarget = { x: player.x, y: player.y, hp: player.hp, ref: player };
              }
            } else if (enemyHero && !enemyHero.isDead) {
              const dToE = Math.hypot(enemyHero.x - t.x, enemyHero.y - t.y);
              if (dToE < bestD) {
                turretTarget = { x: enemyHero.x, y: enemyHero.y, hp: enemyHero.hp, ref: enemyHero };
              }
            }
          }

          if (turretTarget) {
            t.attackCooldown = 70;
            const angleToTarget = Math.atan2(turretTarget.y - t.y, turretTarget.x - t.x);

            projectiles.push({
              id: state.nextId.id++,
              team: t.team,
              x: t.x,
              y: t.y,
              vx: Math.cos(angleToTarget) * 11,
              vy: Math.sin(angleToTarget) * 11,
              radius: 10,
              color: t.team === 'allied' ? "#38bdf8" : "#ef4444",
              damage: t.damage,
              range: t.attackRange + 40,
              distanceTraveled: 0,
              type: 'tower_beam',
              trailColor: t.team === 'allied' ? "#bae6fd" : "#fca5a5"
            });

            sound.playTowerAttack();
          }
        }

        if (t.hp <= 0 && !t.isDestroyed) {
          t.isDestroyed = true;
          t.hp = 0;
          threeBridgeRef.current?.vfx.createSparks(to3DPos(t.x, t.y), t.team === 'allied' ? 0x38bdf8 : 0xef4444, 45);
          sound.playTowerDestroyed();

          if (t.team === 'enemy') {
            player.gold += 350;
            addPlayerXp(400);
            if (t.type === 'base') {
              triggerBanner("G'ALABA (VICTORY)!", "Dushman bazasi (Core) yakson qilindi!", "#10b981");
              sound.playVictory();
            } else {
              triggerBanner("MINORA QULATILDI!", `${t.name} yo'q qilindi! (+350 Gold)`, "#f59e0b");
            }
          } else {
            if (t.type === 'base') {
              triggerBanner("MAG'LUBIYAT (DEFEAT)!", "Bizning baza yo'q qilindi!", "#ef4444");
            } else {
              triggerBanner("MINORA BOY BERILDI!", `${t.name} quladi!`, "#ef4444");
            }
          }
        }
      }

      // 6. Dushman Bot (Zilong)
      if (enemyHero) {
        if (enemyHero.isDead) {
          enemyHero.respawnTimer--;
          if (enemyHero.respawnTimer <= 0) {
            enemyHero.isDead = false;
            enemyHero.hp = enemyHero.maxHp;
            enemyHero.x = enemyHero.spawnX;
            enemyHero.y = enemyHero.spawnY;
            triggerBanner("ZILONG TIRILDI!", "Dushman qahramon bazada qayta safga qaytdi!", "#ef4444");
          }
        } else {
          if (enemyHero.hitFlash > 0) enemyHero.hitFlash--;
          if (enemyHero.attackCooldown > 0) enemyHero.attackCooldown--;

          const dToP = Math.hypot(player.x - enemyHero.x, player.y - enemyHero.y);
          if (dToP < 320) {
            enemyHero.angle = Math.atan2(player.y - enemyHero.y, player.x - enemyHero.x);
            if (dToP > enemyHero.attackRange) {
              enemyHero.x += Math.cos(enemyHero.angle) * enemyHero.speed;
              enemyHero.y += Math.sin(enemyHero.angle) * enemyHero.speed;
            } else if (enemyHero.attackCooldown <= 0) {
              enemyHero.attackCooldown = 50;
              let dmg = enemyHero.damage;
              if (player.shield > 0) {
                player.shield -= dmg;
                if (player.shield < 0) {
                  player.hp += player.shield;
                  player.shield = 0;
                }
              } else {
                player.hp = Math.max(0, player.hp - dmg);
              }
              player.hitFlash = 8;
              damageTexts.push({
                id: state.nextId.id++,
                x: player.x,
                y: player.y - 25,
                text: `-${dmg}`,
                color: "#ef4444",
                alpha: 1
              });
              threeBridgeRef.current?.vfx.createSparks(to3DPos(player.x, player.y), 0xef4444, 12);
              sound.playHit();

              if (player.hp <= 0 && !player.isDead) {
                player.isDead = true;
                player.deaths++;
                setHudDeaths(player.deaths);
                state.respawnTimer = 5 * 60;
                state.screenShake = 0.8;
                triggerBanner("SENI MAG'LUB ETISHDILAR!", "Qayta tirilish tayyorlanmoqda (5s)...", "#ef4444");
                sound.playDefeat();
              }
            }
          }
        }
      }

      // 7. Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.distanceTraveled += Math.hypot(p.vx, p.vy);

        let hit = false;
        if (p.team === 'allied') {
          if (enemyHero && !enemyHero.isDead && Math.hypot(p.x - enemyHero.x, p.y - enemyHero.y) < p.radius + enemyHero.radius) {
            enemyHero.hp -= p.damage;
            enemyHero.hitFlash = 8;
            hit = !p.isPenetrating;
            damageTexts.push({
              id: state.nextId.id++,
              x: enemyHero.x,
              y: enemyHero.y - 25,
              text: `-${Math.round(p.damage)}`,
              color: "#38bdf8",
              alpha: 1
            });
            threeBridgeRef.current?.vfx.createSparks(to3DPos(enemyHero.x, enemyHero.y), 0x38bdf8, 12);

            if (enemyHero.hp <= 0) {
              enemyHero.isDead = true;
              enemyHero.respawnTimer = 320;
              player.kills++;
              player.score += 350;
              player.gold += 240;
              addPlayerXp(350);
              triggerBanner("SEN DUSHMANNI O'LDIRDING!", "Zilong mag'lub etildi! (+240 Gold)", "#38bdf8");
              sound.playKill();
            }
          }

          if (!hit) {
            for (const m of minions) {
              if (m.team === 'enemy' && !m.isDead && Math.hypot(p.x - m.x, p.y - m.y) < p.radius + m.radius) {
                m.hp -= p.damage;
                m.hitFlash = 8;
                hit = !p.isPenetrating;
                damageTexts.push({
                  id: state.nextId.id++,
                  x: m.x,
                  y: m.y - 20,
                  text: `-${Math.round(p.damage)}`,
                  color: "#38bdf8",
                  alpha: 1
                });
                threeBridgeRef.current?.vfx.createSparks(to3DPos(m.x, m.y), 0x38bdf8, 8);

                if (m.hp <= 0) {
                  m.isDead = true;
                  player.gold += m.goldReward;
                  player.score += 40;
                  addPlayerXp(m.xpReward);
                  damageTexts.push({
                    id: state.nextId.id++,
                    x: m.x,
                    y: m.y - 35,
                    text: `+${m.goldReward}💰`,
                    color: "#fbbf24",
                    alpha: 1.4
                  });
                  threeBridgeRef.current?.vfx.createSparks(to3DPos(m.x, m.y), 0xfbbf24, 14);
                  sound.playCoin();
                }
                break;
              }
            }
          }

          if (!hit) {
            for (const t of turrets) {
              if (t.team === 'enemy' && !t.isDestroyed && Math.hypot(p.x - t.x, p.y - t.y) < p.radius + t.radius) {
                t.hp -= p.damage;
                hit = !p.isPenetrating;
                damageTexts.push({
                  id: state.nextId.id++,
                  x: t.x,
                  y: t.y - 45,
                  text: `-${Math.round(p.damage)}`,
                  color: "#38bdf8",
                  alpha: 1
                });
                threeBridgeRef.current?.vfx.createSparks(to3DPos(t.x, t.y), 0x38bdf8, 10);
                break;
              }
            }
          }

          if (!hit) {
            for (const j of jungles) {
              if (!j.isDead && Math.hypot(p.x - j.x, p.y - j.y) < p.radius + j.radius) {
                j.hp -= p.damage;
                j.hitFlash = 8;
                hit = !p.isPenetrating;
                damageTexts.push({
                  id: state.nextId.id++,
                  x: j.x,
                  y: j.y - 25,
                  text: `-${Math.round(p.damage)}`,
                  color: j.color,
                  alpha: 1
                });
                threeBridgeRef.current?.vfx.createSparks(to3DPos(j.x, j.y), new THREE.Color(j.color).getHex(), 10);

                if (j.hp <= 0) {
                  j.isDead = true;
                  j.respawnTimer = 30 * 60;
                  player.gold += j.goldReward;
                  addPlayerXp(j.xpReward);

                  const buffId = j.buffType;
                  player.activeBuffs = player.activeBuffs.filter(b => b.id !== buffId);
                  player.activeBuffs.push({
                    id: buffId,
                    name: j.name,
                    type: j.type === 'blue_buff' ? 'blue' : (j.type === 'red_buff' ? 'red' : 'gold_speed'),
                    duration: j.buffDuration * 60,
                    maxDuration: j.buffDuration * 60,
                    icon: j.type === 'blue_buff' ? "🔷" : (j.type === 'red_buff' ? "🔥" : "💰"),
                    color: j.color,
                    description: j.name
                  });

                  if (j.type === 'turtle') {
                    player.shield = 400;
                    triggerBanner("TOSHBAQA MAG'LUB ETILDI!", "Jamoaga ulkan qalqon va oltin berildi!", "#06b6d4");
                  } else {
                    triggerBanner(`${j.name.toUpperCase()} OLINDI!`, `Buff faollashdi (${j.buffDuration}s)`, j.color);
                  }
                  sound.playBuffAcquired();
                }
                break;
              }
            }
          }
        } else if (p.team === 'enemy') {
          if (Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius) {
            let dmg = p.damage;
            if (player.shield > 0) {
              player.shield -= dmg;
              if (player.shield < 0) {
                player.hp += player.shield;
                player.shield = 0;
              }
            } else {
              player.hp = Math.max(0, player.hp - dmg);
            }
            player.hitFlash = 8;
            hit = true;
            damageTexts.push({
              id: state.nextId.id++,
              x: player.x,
              y: player.y - 25,
              text: `-${dmg}`,
              color: "#ef4444",
              alpha: 1
            });
            threeBridgeRef.current?.vfx.createSparks(to3DPos(player.x, player.y), 0xef4444, 10);
            sound.playHit();

            if (player.hp <= 0 && !player.isDead) {
              player.isDead = true;
              player.deaths++;
              setHudDeaths(player.deaths);
              state.respawnTimer = 5 * 60;
              state.screenShake = 0.8;
              triggerBanner("SENI MAG'LUB ETISHDILAR!", "Qayta tirilish tayyorlanmoqda (5s)...", "#ef4444");
              sound.playDefeat();
            }
          }

          if (!hit) {
            for (const m of minions) {
              if (m.team === 'allied' && !m.isDead && Math.hypot(p.x - m.x, p.y - m.y) < p.radius + m.radius) {
                m.hp -= p.damage;
                m.hitFlash = 8;
                hit = true;
                break;
              }
            }
          }

          if (!hit) {
            for (const t of turrets) {
              if (t.team === 'allied' && !t.isDestroyed && Math.hypot(p.x - t.x, p.y - t.y) < p.radius + t.radius) {
                t.hp -= p.damage;
                hit = true;
                break;
              }
            }
          }
        }

        if (hit || p.distanceTraveled >= p.range || p.x < WORLD.minX || p.x > WORLD.maxX || p.y < WORLD.minY || p.y > WORLD.maxY) {
          projectiles.splice(i, 1);
        }
      }

      // Damage texts
      for (let i = damageTexts.length - 1; i >= 0; i--) {
        const dt = damageTexts[i];
        dt.y -= 0.8;
        dt.alpha -= 0.022;
        if (dt.alpha <= 0) damageTexts.splice(i, 1);
      }

      // Click markers
      for (let i = clickMarkers.length - 1; i >= 0; i--) {
        const m = clickMarkers[i];
        m.radius += 1.2;
        m.alpha -= 0.05;
        if (m.alpha <= 0) clickMarkers.splice(i, 1);
      }

      // HUD yangilash
      setHudHp(Math.round(player.hp));
      setHudMp(Math.round(player.mp));
      setHudGold(player.gold);
      setHudKills(player.kills);

      setCooldowns({
        q: Math.ceil(player.qCooldown / 60),
        qMax: player.qMaxCooldown,
        w: Math.ceil(player.wCooldown / 60),
        wMax: player.wMaxCooldown,
        r: Math.ceil(player.rCooldown / 60),
        rMax: player.rMaxCooldown,
      });

      // Screen shake decay
      if (state.screenShake > 0) {
        state.screenShake *= 0.92;
        if (state.screenShake < 0.02) state.screenShake = 0;
      }

      // 8. THREE.JS 3D SCENE UPDATE & RENDER
      threeBridgeRef.current?.update(
        player,
        enemyHero,
        turrets,
        minions,
        jungles,
        projectiles,
        state.frameCount,
        0.016,
        state.screenShake,
        !!player.isDead
      );

      // 9. OVERLAY 2D CANVAS (FLOATING TEXTS & CLICK RIPPLES)
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Project 3D floating damage and gold texts
          if (threeBridgeRef.current) {
            const cam = threeBridgeRef.current.arena.camera;
            damageTexts.forEach(dt => {
              const p3 = to3DPos(dt.x, dt.y);
              p3.y = 2.4;
              const projected = p3.project(cam);
              if (projected.z < 1) {
                const sx = ((projected.x + 1) * CANVAS_WIDTH) / 2;
                const sy = ((-projected.y + 1) * CANVAS_HEIGHT) / 2;
                ctx.save();
                ctx.font = 'bold 15px sans-serif';
                ctx.fillStyle = dt.color;
                ctx.globalAlpha = Math.max(0, dt.alpha);
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 6;
                ctx.textAlign = 'center';
                ctx.fillText(dt.text, sx, sy);
                ctx.restore();
              }
            });
          }

          // Render click markers
          clickMarkers.forEach(m => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, m.radius, 0, Math.PI * 2);
            ctx.strokeStyle = m.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = Math.max(0, m.alpha);
            ctx.stroke();
            ctx.restore();
          });
        }
      }

      // 10. MINIMAP CHIZISH (EKRAN BURCHAGIDAGI KICHIK XARITA)
      if (minimapRef.current) {
        renderFullMinimap(
          minimapRef.current,
          turrets,
          minions,
          jungles,
          player,
          enemyHero,
          { x: player.x - 300, y: player.y - 300 },
          600,
          600
        );
      }

      // FPS hisoblash
      const now = performance.now();
      if (now - state.lastFpsTime >= 1000) {
        setFps(Math.round((state.frameCount * 1000) / (now - state.lastFpsTime)));
        state.lastFpsTime = now;
      }

      animId = requestAnimationFrame(updateGame);
    };

    animId = requestAnimationFrame(updateGame);
    return () => {
      cancelAnimationFrame(animId);
      threeBridgeRef.current?.cleanup();
      threeBridgeRef.current = null;
    };
  }, [addPlayerXp]);

  // Three.js Ground Click to Move (Raycasting)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!threeContainerRef.current || !threeBridgeRef.current) return;
    const rect = threeContainerRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const hit = threeBridgeRef.current.raycastGround(screenX, screenY, rect.width, rect.height);
    if (hit) {
      gameStateRef.current.player.moveTarget = { x: hit.x, y: hit.y };
      gameStateRef.current.clickMarkers.push({
        id: gameStateRef.current.nextId.id++,
        x: hit.x,
        y: hit.y,
        radius: 6,
        maxRadius: 28,
        alpha: 1,
        color: "#38bdf8"
      });
      threeBridgeRef.current.vfx.createSparks(to3DPos(hit.x, hit.y), 0x38bdf8, 8);
      sound.playMovePing();
    }
  };

  // Minimap ustiga bosib harakatlantirish
  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mm = minimapRef.current;
    if (!mm) return;
    const rect = mm.getBoundingClientRect();
    const mmX = (e.clientX - rect.left) / rect.width;
    const mmY = (e.clientY - rect.top) / rect.height;

    const targetX = mmX * MAP_WIDTH;
    const targetY = mmY * MAP_HEIGHT;

    gameStateRef.current.player.moveTarget = { x: targetX, y: targetY };
    gameStateRef.current.clickMarkers.push({
      id: gameStateRef.current.nextId.id++,
      x: targetX,
      y: targetY,
      radius: 8,
      maxRadius: 35,
      alpha: 1,
      color: "#06b6d4"
    });
    threeBridgeRef.current?.vfx.createSparks(to3DPos(targetX, targetY), 0x06b6d4, 12);
    sound.playMovePing();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP HEADER */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            3D MLBB MOBA Arena (Three.js WebGL)
          </span>
          <span className="text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full hidden sm:inline">
            3D Xavier · Mid Lane · Dynamic Lighting & Shadows
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            aria-label={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={resetGame}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Qayta boshlash"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta boshlash</span>
          </button>

          <button
            onClick={() => setShowCodeModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>HTML Kodni olish</span>
          </button>
        </div>
      </header>

      {/* 2. THREE.JS 3D VIEWPORT & MLBB HUD */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden">
        <div className="relative w-full max-w-[980px] h-[590px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/90">

          {/* YUQORI HUD: PROFIL, KILLS/DEATHS HISOBI VA O'YIN VAQTI */}
          <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            {/* Hero Profile */}
            <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-cyan-500/40 shadow-lg pointer-events-auto">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 border-2 border-cyan-300 flex items-center justify-center font-black text-sm text-white shadow relative">
                ✨
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 rounded-full border border-slate-900">
                  {hudLevel}
                </span>
              </div>
              <div className="flex flex-col gap-1 w-36">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-200">
                  <span>Xavier (3D)</span>
                  <span className="text-amber-400 font-mono text-[10px]">Lv.{hudLevel}</span>
                </div>
                {/* HP */}
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-100"
                    style={{ width: `${Math.max(0, (hudHp / hudMaxHp) * 100)}%` }}
                  />
                </div>
                {/* MP */}
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100"
                    style={{ width: `${Math.max(0, (hudMp / hudMaxMp) * 100)}%` }}
                  />
                </div>
                {/* XP */}
                <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-100"
                    style={{ width: `${Math.max(0, (hudXp / hudMaxXp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* O'RTA STATISTIKA: VAQT, KILLS / DEATHS, OLTIN */}
            <div className="flex items-center gap-3.5 bg-slate-950/90 backdrop-blur-md px-5 py-2 rounded-2xl border border-slate-700/70 shadow-lg text-xs font-bold pointer-events-auto">
              <span className="flex items-center gap-1.5 text-cyan-300 font-mono text-sm">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {formatTime(gameTimeSeconds)}
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-slate-100">
                <span className="text-emerald-400">{hudKills}</span>
                <span className="text-slate-500">/</span>
                <span className="text-rose-400">{hudDeaths}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Coins className="w-3.5 h-3.5" />
                <b className="tabular-nums">{hudGold}</b>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                FPS: {fps}
              </span>
            </div>

            {/* TACTICAL MINIMAP */}
            <div
              className="group relative w-32 h-32 bg-slate-950/95 border-2 border-cyan-500/80 rounded-2xl overflow-hidden shadow-2xl shadow-black pointer-events-auto cursor-pointer"
              title="Katta Xarita (Bosish orqali qahramonni yo'naltiring)"
            >
              <canvas
                ref={minimapRef}
                width={128}
                height={128}
                onClick={handleMinimapClick}
                className="w-full h-full block"
              />
              <div className="absolute bottom-1 left-1.5 right-1.5 bg-black/60 rounded px-1 text-[8px] font-bold text-cyan-300 flex items-center justify-between pointer-events-none">
                <span>3D ARENA</span>
                <span>BOSIB YURING</span>
              </div>
            </div>
          </div>

          {/* ACTIVE BUFFS HUD */}
          {playerBuffs.length > 0 && (
            <div className="absolute top-22 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
              {playerBuffs.map(buff => (
                <div
                  key={buff.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border backdrop-blur-md shadow-md animate-pulse"
                  style={{ borderColor: buff.color }}
                >
                  <span className="text-sm">{buff.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black" style={{ color: buff.color }}>
                      {buff.name}
                    </span>
                    <span className="text-[9px] text-slate-300">
                      {Math.ceil(buff.duration / 60)}s qoldi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ANNOUNCEMENT BANNER */}
          {activeBanner && (
            <div
              className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl bg-slate-950/90 border-2 backdrop-blur-md shadow-2xl flex flex-col items-center z-30 animate-bounce"
              style={{ borderColor: activeBanner.color }}
            >
              <span className="text-sm font-black uppercase tracking-wider" style={{ color: activeBanner.color }}>
                {activeBanner.title}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                {activeBanner.subtext}
              </span>
            </div>
          )}

          {/* RESPAWN COUNTDOWN OVERLAY */}
          {respawnSeconds > 0 && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm z-30 flex flex-col items-center justify-center pointer-events-none">
              <div className="px-8 py-5 rounded-2xl bg-slate-950/95 border-2 border-rose-500 shadow-2xl shadow-rose-950/80 flex flex-col items-center gap-2">
                <span className="text-rose-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  Siz Mag'lub Bo'ldingiz
                </span>
                <span className="text-white text-4xl font-black font-mono animate-pulse">
                  {respawnSeconds}s
                </span>
                <span className="text-slate-300 text-xs font-medium">
                  Bazada himoya qalqoni bilan qayta tirilmoqda...
                </span>
              </div>
            </div>
          )}

          {/* 3D WEBGL CONTAINER (THREE.JS ARENA) */}
          <div
            ref={threeContainerRef}
            onMouseDown={handleCanvasMouseDown}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full block cursor-crosshair overflow-hidden"
          />

          {/* 2D Overlay Canvas for click ripples & damage texts */}
          <canvas
            ref={overlayCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute inset-0 pointer-events-none w-full h-full block"
          />

          {/* SENSORLI VIRTUAL JOYSTICK */}
          <div
            ref={joystickContainerRef}
            onMouseDown={handleJoystickStart}
            onMouseMove={handleJoystickMove}
            onMouseUp={handleJoystickEnd}
            onMouseLeave={handleJoystickEnd}
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            className="absolute bottom-5 left-5 w-28 h-28 rounded-full bg-slate-950/70 border-2 border-cyan-500/40 flex items-center justify-center cursor-pointer pointer-events-auto z-20 shadow-xl shadow-black/80"
          >
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 border-2 border-cyan-200 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-[10px] font-black text-white pointer-events-none transition-transform duration-75"
              style={{ transform: `translate(${joystickNubOffset.x}px, ${joystickNubOffset.y}px)` }}
            >
              WASD
            </div>
          </div>

          {/* MLBB ACTION BUTTONS CLUSTER (Xavier Skills + Basic Attack) */}
          <div className="absolute bottom-4 right-4 w-52 h-52 pointer-events-auto z-20">
            {/* Katta Hujum Tugmasi (Basic Attack) */}
            <button
              onClick={executeBasicAttack}
              className="absolute bottom-1 right-1 w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-slate-900 border-3 border-amber-300 shadow-xl shadow-amber-600/50 hover:shadow-amber-400/80 active:scale-90 flex flex-col items-center justify-center transition-transform cursor-pointer outline-none group"
              title="Asosiy Magik Hujum (Space / Bosish)"
            >
              <Swords className="w-7 h-7 text-white drop-shadow group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-200 mt-0.5">
                Hujum
              </span>
            </button>

            {/* Skill 1: Infinite Extension (Q) */}
            <button
              onClick={executeSkill1}
              disabled={cooldowns.q > 0 || hudMp < 30}
              className="absolute bottom-5 right-26 w-13 h-13 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-800 border-2 border-cyan-300 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-400/70 active:scale-90 flex flex-col items-center justify-center transition-transform cursor-pointer disabled:opacity-75 outline-none relative overflow-hidden"
              title="Q - Infinite Extension (30 MP)"
            >
              {cooldowns.q > 0 ? (
                <>
                  <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center" />
                  <span className="relative z-10 text-xs font-mono font-black text-amber-300">{cooldowns.q}s</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-cyan-100" />
                  <span className="text-[9px] font-extrabold text-cyan-200">Q</span>
                </>
              )}
            </button>

            {/* Skill 2: Mystic Field Barrier (W) */}
            <button
              onClick={executeSkill2}
              disabled={cooldowns.w > 0 || hudMp < 45}
              className="absolute bottom-22 right-22 w-13 h-13 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 border-2 border-purple-300 shadow-lg shadow-purple-500/40 hover:shadow-purple-400/70 active:scale-90 flex flex-col items-center justify-center transition-transform cursor-pointer disabled:opacity-75 outline-none relative overflow-hidden"
              title="W - Mystic Field Barrier (45 MP)"
            >
              {cooldowns.w > 0 ? (
                <>
                  <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center" />
                  <span className="relative z-10 text-xs font-mono font-black text-purple-300">{cooldowns.w}s</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-purple-100" />
                  <span className="text-[9px] font-extrabold text-purple-200">W</span>
                </>
              )}
            </button>

            {/* Skill 3: Dawning Light Global Laser (R - Ultimate) */}
            <button
              onClick={executeSkill3}
              disabled={cooldowns.r > 0 || hudMp < 75}
              className="absolute bottom-26 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-800 border-2.5 border-sky-300 shadow-xl shadow-cyan-500/50 hover:shadow-cyan-400/80 active:scale-90 flex flex-col items-center justify-center transition-transform cursor-pointer disabled:opacity-75 outline-none relative overflow-hidden"
              title="R - Dawning Light Ultimate Global Laser (75 MP)"
            >
              {cooldowns.r > 0 ? (
                <>
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center" />
                  <span className="relative z-10 text-xs font-mono font-black text-cyan-300">{cooldowns.r}s</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-5 h-5 text-sky-100" />
                  <span className="text-[9px] font-extrabold text-sky-200">R</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. PASTKI QO'LLANMA */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400 flex-wrap">
          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
            Harakat: <b className="text-white">WASD</b>, <b className="text-white">Joystick</b> yoki <b className="text-cyan-400">3D Maydon/Minimapga bosish</b>
          </span>
          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
            3D Arena: <b className="text-emerald-400">Teksturali zamin</b> · <b className="text-amber-400">Mid Lane oq chiziqlar</b> · <b className="text-sky-400">Soyalar (Shadows)</b>
          </span>
          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
            3D Xavier: <b className="text-white">Plash, aylanuvchi shar va ko'k nurli nurlar</b>
          </span>
          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
            Lazer Snipe: <b className="text-sky-400">R (Dawning Light)</b> ulkan 3D yorqin nur taratadi
          </span>
        </div>
      </main>

      {/* 4. MODAL: TO'LIQ BIRLIKDAGI HTML/JS KOD */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h3 className="text-base font-semibold text-white">To'liq Mustaqil HTML5/WebGL MOBA Kodi</h3>
                <p className="text-xs text-slate-400">
                  3D Arena, Xavier 3D modeli, yorug'lik va soyalar, Turret AI, har 20s minion to'lqinlari, minimap.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Nusxalandi!" : "Kodni nusxalash"}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Yuklab olish (.html)</span>
                </button>

                <button
                  onClick={() => setShowCodeModal(false)}
                  className="text-slate-400 hover:text-white text-lg px-2 py-1 rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border-t border-slate-900">
              <pre className="whitespace-pre-wrap select-text">
                {STANDALONE_HTML_CODE}
              </pre>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
              <span>Fayl formati: <b className="text-slate-400">index.html</b> · Brauzerda mustaqil ishlaydi</span>
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
