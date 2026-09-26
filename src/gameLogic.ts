/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TOP_LANE_WAYPOINTS_ALLY,
  TOP_LANE_WAYPOINTS_ENEMY,
  MID_LANE_WAYPOINTS_ALLY,
  MID_LANE_WAYPOINTS_ENEMY,
  BOT_LANE_WAYPOINTS_ALLY,
  BOT_LANE_WAYPOINTS_ENEMY
} from './mapData.ts';
import type { MinionUnit, TurretUnit, Projectile, Player, EnemyBot, JungleMonster } from './types.ts';
import { sound } from './sound.ts';

// 3 TA YO'LAK BO'YLAB MINIONLAR OQIMI (HAR 20 SEKUNDDA HAR IKKALA BAZADAN)
export function spawnThreeLaneWaves(nextIdRef: { id: number }): MinionUnit[] {
  const newMinions: MinionUnit[] = [];

  const lanes: Array<{
    name: 'top' | 'mid' | 'bot';
    allyWaypoints: Array<{ x: number; y: number }>;
    enemyWaypoints: Array<{ x: number; y: number }>;
  }> = [
    {
      name: 'top',
      allyWaypoints: TOP_LANE_WAYPOINTS_ALLY,
      enemyWaypoints: TOP_LANE_WAYPOINTS_ENEMY,
    },
    {
      name: 'mid',
      allyWaypoints: MID_LANE_WAYPOINTS_ALLY,
      enemyWaypoints: MID_LANE_WAYPOINTS_ENEMY,
    },
    {
      name: 'bot',
      allyWaypoints: BOT_LANE_WAYPOINTS_ALLY,
      enemyWaypoints: BOT_LANE_WAYPOINTS_ENEMY,
    },
  ];

  lanes.forEach(lane => {
    const allySpawn = lane.allyWaypoints[0];
    const enemySpawn = lane.enemyWaypoints[0];

    // ITTIFOQCHI MINIONLAR (2 Melee + 1 Ranged)
    newMinions.push(
      {
        id: nextIdRef.id++,
        team: 'allied',
        lane: lane.name,
        type: 'melee',
        name: `Ittifoqchi ${lane.name.toUpperCase()} Jangchi`,
        x: allySpawn.x - 15,
        y: allySpawn.y + 10,
        radius: 14,
        height: 26,
        speed: 2.2,
        angle: -0.6,
        walkCycle: 0,
        maxHp: 320,
        hp: 320,
        damage: 16,
        attackRange: 42,
        attackCooldown: 0,
        color: "#3b82f6",
        hitFlash: 0,
        isDead: false,
        waypointIndex: 1,
        waypoints: lane.allyWaypoints,
        goldReward: 40,
        xpReward: 50,
      },
      {
        id: nextIdRef.id++,
        team: 'allied',
        lane: lane.name,
        type: 'melee',
        name: `Ittifoqchi ${lane.name.toUpperCase()} Qilichboz`,
        x: allySpawn.x,
        y: allySpawn.y,
        radius: 14,
        height: 26,
        speed: 2.2,
        angle: -0.6,
        walkCycle: 0,
        maxHp: 320,
        hp: 320,
        damage: 16,
        attackRange: 42,
        attackCooldown: 0,
        color: "#3b82f6",
        hitFlash: 0,
        isDead: false,
        waypointIndex: 1,
        waypoints: lane.allyWaypoints,
        goldReward: 40,
        xpReward: 50,
      },
      {
        id: nextIdRef.id++,
        team: 'allied',
        lane: lane.name,
        type: 'ranged',
        name: `Ittifoqchi ${lane.name.toUpperCase()} To'pchi`,
        x: allySpawn.x - 30,
        y: allySpawn.y + 20,
        radius: 12,
        height: 22,
        speed: 2.1,
        angle: -0.6,
        walkCycle: 0,
        maxHp: 220,
        hp: 220,
        damage: 22,
        attackRange: 150,
        attackCooldown: 0,
        color: "#60a5fa",
        hitFlash: 0,
        isDead: false,
        waypointIndex: 1,
        waypoints: lane.allyWaypoints,
        goldReward: 50,
        xpReward: 60,
      }
    );

    // DUSHMAN MINIONLAR (2 Melee + 1 Ranged)
    newMinions.push(
      {
        id: nextIdRef.id++,
        team: 'enemy',
        lane: lane.name,
        type: 'melee',
        name: `Dushman ${lane.name.toUpperCase()} Jangchi`,
        x: enemySpawn.x + 15,
        y: enemySpawn.y - 10,
        radius: 14,
        height: 26,
        speed: 2.2,
        angle: 2.5,
        walkCycle: 0,
        maxHp: 320,
        hp: 320,
        damage: 16,
        attackRange: 42,
        attackCooldown: 0,
        color: "#ef4444",
        hitFlash: 0,
        isDead: false,
        waypointIndex: 1,
        waypoints: lane.enemyWaypoints,
        goldReward: 40,
        xpReward: 50,
      },
      {
        id: nextIdRef.id++,
        team: 'enemy',
        lane: lane.name,
        type: 'melee',
        name: `Dushman ${lane.name.toUpperCase()} Qilichboz`,
        x: enemySpawn.x,
        y: enemySpawn.y,
        radius: 14,
        height: 26,
        speed: 2.2,
        angle: 2.5,
        walkCycle: 0,
        maxHp: 320,
        hp: 320,
        damage: 16,
        attackRange: 42,
        attackCooldown: 0,
        color: "#ef4444",
        hitFlash: 0,
        isDead: false,
        waypointIndex: 1,
        waypoints: lane.enemyWaypoints,
        goldReward: 40,
        xpReward: 50,
      },
      {
        id: nextIdRef.id++,
        team: 'enemy',
        lane: lane.name,
        type: 'ranged',
        name: `Dushman ${lane.name.toUpperCase()} To'pchi`,
        x: enemySpawn.x + 30,
        y: enemySpawn.y - 20,
        radius: 12,
        height: 22,
        speed: 2.1,
        angle: 2.5,
        walkCycle: 0,
        maxHp: 220,
        hp: 220,
        damage: 22,
        attackRange: 150,
        attackCooldown: 0,
        color: "#f87171",
        hitFlash: 0,
        isDead: false,
        waypointIndex: 1,
        waypoints: lane.enemyWaypoints,
        goldReward: 50,
        xpReward: 60,
      }
    );
  });

  return newMinions;
}

// MINIMAP CHIZISH (EKRANNING BURCHAGIDAGI TO'LIQ KICHIK XARITA)
export function renderFullMinimap(
  canvas: HTMLCanvasElement,
  turrets: TurretUnit[],
  minions: MinionUnit[],
  jungles: JungleMonster[],
  player: Player,
  enemyHero: EnemyBot | null,
  camera: { x: number; y: number },
  viewW: number,
  viewH: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const sx = w / MAP_WIDTH;
  const sy = h / MAP_HEIGHT;

  // Fon
  ctx.fillStyle = "rgba(10, 15, 29, 0.96)";
  ctx.fillRect(0, 0, w, h);

  // Daryo chizig'i
  ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(10 * sx, 2590 * sy);
  ctx.lineTo(2590 * sx, 10 * sy);
  ctx.stroke();

  // 3 TA YO'LAK (TOP, MID, BOT)
  ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
  ctx.lineWidth = 3;

  // Top Lane
  ctx.beginPath();
  ctx.moveTo(280 * sx, 2340 * sy);
  ctx.lineTo(280 * sx, 350 * sy);
  ctx.lineTo(2340 * sx, 300 * sy);
  ctx.stroke();

  // Mid Lane
  ctx.beginPath();
  ctx.moveTo(280 * sx, 2340 * sy);
  ctx.lineTo(2340 * sx, 280 * sy);
  ctx.stroke();

  // Bot Lane
  ctx.beginPath();
  ctx.moveTo(280 * sx, 2340 * sy);
  ctx.lineTo(2300 * sx, 2320 * sy);
  ctx.lineTo(2320 * sx, 280 * sy);
  ctx.stroke();

  // Yo'lak nomlari
  ctx.font = "bold 8px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText("TOP", 30 * sx + 5, 260 * sy);
  ctx.fillText("MID", 1250 * sx, 1250 * sy);
  ctx.fillText("BOT", 2150 * sx, 2450 * sy);

  // Bazalar
  // Ittifoqchi baza (Pastki chap)
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.arc(260 * sx, 2340 * sy, 7, 0, Math.PI * 2);
  ctx.fill();

  // Dushman baza (Yuqori o'ng)
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(2340 * sx, 260 * sy, 7, 0, Math.PI * 2);
  ctx.fill();

  // Minoralar (Turrets)
  turrets.forEach(t => {
    if (t.isDestroyed) return;
    ctx.fillStyle = t.team === 'allied' ? "#38bdf8" : "#ef4444";
    const size = t.type === 'base' ? 6 : 4.5;
    ctx.fillRect(t.x * sx - size / 2, t.y * sy - size / 2, size, size);
  });

  // O'rmon maxluqlari (Jungle Buffs)
  jungles.forEach(j => {
    if (j.isDead) return;
    ctx.fillStyle = j.color;
    ctx.beginPath();
    ctx.arc(j.x * sx, j.y * sy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Minionlar
  minions.forEach(m => {
    if (m.isDead) return;
    ctx.fillStyle = m.team === 'allied' ? "#60a5fa" : "#f87171";
    ctx.beginPath();
    ctx.arc(m.x * sx, m.y * sy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Dushman qahramon
  if (enemyHero && !enemyHero.isDead) {
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(enemyHero.x * sx, enemyHero.y * sy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // O'yinchi Qahramon (Xavier)
  ctx.fillStyle = "#06b6d4";
  ctx.beginPath();
  ctx.arc(player.x * sx, player.y * sy, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Kamera ko'rish ramkasi (Camera Frustum Viewport)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(camera.x * sx, camera.y * sy, viewW * sx, viewH * sy);
}
