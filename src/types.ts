export interface JungleMonster {
  id: number;
  type: 'blue_buff' | 'red_buff' | 'crab' | 'turtle' | 'creep';
  name: string;
  x: number;
  y: number;
  radius: number;
  height: number;
  maxHp: number;
  hp: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  color: string;
  buffType: 'mana_regen_cdr' | 'attack_burn' | 'speed_gold' | 'turtle_shield_gold' | 'creep_heal';
  buffDuration: number; // soniyalarda
  hitFlash: number;
  isDead: boolean;
  respawnTimer: number;
  goldReward: number;
  xpReward: number;
}

export interface ActiveBuff {
  id: string;
  name: string;
  type: 'blue' | 'red' | 'gold_speed';
  duration: number; // frames
  maxDuration: number;
  icon: string;
  color: string;
  description: string;
}

export interface Player {
  x: number;
  y: number;
  z: number; // Sakrash yoki balandlik
  radius: number;
  speed: number;
  vx: number;
  vy: number;
  friction: number;
  acceleration: number;
  angle: number;
  name: string;
  heroClass: string;
  level: number;
  kills: number;
  deaths: number;
  score: number;
  gold: number;
  xp: number;
  maxXp: number;
  attackDamage: number;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  color: string;
  shield: number;
  shieldTimer: number;
  hitFlash: number;
  dashCooldown?: number;
  qCooldown: number;
  qMaxCooldown: number;
  wCooldown: number;
  wMaxCooldown: number;
  eCooldown: number;
  rCooldown: number;
  rMaxCooldown: number;
  attackCooldown: number;
  moveTarget: { x: number; y: number } | null;
  isAttacking: boolean;
  attackAnim: number;
  activeBuffs: ActiveBuff[];
  isDead?: boolean;
}

export interface MinionUnit {
  id: number;
  team: 'allied' | 'enemy';
  lane: 'top' | 'mid' | 'bot';
  type: 'melee' | 'ranged' | 'siege';
  name: string;
  x: number;
  y: number;
  radius: number;
  height: number;
  speed: number;
  angle: number;
  walkCycle: number;
  maxHp: number;
  hp: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  color: string;
  hitFlash: number;
  isDead: boolean;
  waypointIndex: number;
  waypoints?: { x: number; y: number }[];
  goldReward: number;
  xpReward: number;
}

export interface TurretUnit {
  id: number;
  team: 'allied' | 'enemy';
  lane?: 'top' | 'mid' | 'bot' | 'base';
  tier?: number;
  type: 'tower' | 'base';
  name: string;
  x: number;
  y: number;
  radius: number;
  height: number;
  hp: number;
  maxHp: number;
  attackRange: number;
  attackCooldown: number;
  damage: number;
  crystalAngle: number;
  isDestroyed: boolean;
  targetUnitId?: number | null;
}

export interface AnnouncementBanner {
  id: number;
  title: string;
  subtext: string;
  color: string;
  timer: number;
  maxTimer: number;
}

export interface EnemyBot {
  id: number;
  name: string;
  type: 'minion_melee' | 'minion_ranged' | 'tower' | 'boss';
  x: number;
  y: number;
  spawnX: number;
  spawnY: number;
  radius: number;
  height: number;
  speed: number;
  angle: number;
  walkCycle: number;
  maxHp: number;
  hp: number;
  color: string;
  hitFlash: number;
  isDead: boolean;
  respawnTimer: number;
  attackCooldown: number;
  attackRange: number;
  damage: number;
  scoreReward: number;
  goldReward: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  range: number;
  distanceTraveled: number;
  type: 'basic' | 'ice_spear' | 'fire_ball' | 'wind_slash' | 'nova' | 'tower_beam' | 'minion_bolt' | 'xavier_infinite_extension' | 'xavier_mystic_field' | 'xavier_dawning_light';
  trailColor: string;
  team?: 'allied' | 'enemy';
  width?: number;
  length?: number;
  expansionFactor?: number;
  isPenetrating?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  z?: number;
  vx: number;
  vy: number;
  vz?: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type?: 'spark' | 'smoke' | 'slash' | 'ring' | 'crystal' | 'gold' | 'levelup';
}

export interface DamageText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  isCrit?: boolean;
  alpha: number;
}

export interface ClickMarker {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

