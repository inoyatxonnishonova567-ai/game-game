/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MAP_WIDTH, MAP_HEIGHT, MAP_BUSHES } from './mapData.ts';
import type { TurretUnit, MinionUnit, JungleMonster, ActiveBuff, Particle, DamageText, ClickMarker } from './types.ts';

export const ISO_Y_SKEW = 0.65;

export interface Camera {
  x: number;
  y: number;
}

export interface MysticFieldVFX {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  duration: number;
  maxDuration: number;
  color: string;
  isTriggered: boolean;
}

export interface LaserBeamVFX {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  alpha: number;
  color: string;
}

export interface SlashVFX {
  x: number;
  y: number;
  angle: number;
  radius: number;
  alpha: number;
  color: string;
  isRing?: boolean;
}

export function drawGroundAndLanes(ctx: CanvasRenderingContext2D, camera: Camera, viewW: number, viewH: number) {
  // Arena zamin foni (Dark MOBA grass / jungle soil)
  ctx.fillStyle = "#0c1524";
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Grid / Yer plitkalari
  ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
  ctx.lineWidth = 1;
  const startX = Math.floor(Math.max(0, camera.x) / 100) * 100;
  const endX = Math.min(MAP_WIDTH, camera.x + viewW + 100);
  const startY = Math.floor(Math.max(0, camera.y) / 100) * 100;
  const endY = Math.min(MAP_HEIGHT, camera.y + viewH + 100);

  ctx.beginPath();
  for (let x = startX; x <= endX; x += 100) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y <= endY; y += 100) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();

  // Daryo (River) - diagonal bo'ylab moviy suv oqimi
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 2200);
  ctx.lineTo(2200, 0);
  ctx.lineTo(2600, 400);
  ctx.lineTo(400, 2600);
  ctx.closePath();
  ctx.fillStyle = "rgba(14, 116, 144, 0.22)";
  ctx.fill();

  ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(100, 2500);
  ctx.lineTo(2500, 100);
  ctx.stroke();
  ctx.restore();

  // 3 TA ASOSIY YO'LAK (TOP, MID, BOT LANES)
  // Lane yo'laklari tosh qoplama bilan
  const laneColor = "rgba(51, 65, 85, 0.55)";
  const laneBorderColor = "rgba(100, 116, 139, 0.4)";
  const laneWidth = 110;

  // 1. TOP LANE: (280, 2340) -> (280, 300) -> (2340, 300)
  ctx.save();
  ctx.strokeStyle = laneColor;
  ctx.lineWidth = laneWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(280, 2340);
  ctx.lineTo(280, 350);
  ctx.lineTo(2340, 300);
  ctx.stroke();

  ctx.strokeStyle = laneBorderColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 2. MID LANE: (280, 2340) -> (2340, 260)
  ctx.save();
  ctx.strokeStyle = laneColor;
  ctx.lineWidth = laneWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(280, 2340);
  ctx.lineTo(2340, 280);
  ctx.stroke();

  ctx.strokeStyle = laneBorderColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 3. BOT LANE: (280, 2340) -> (2300, 2300) -> (2300, 280)
  ctx.save();
  ctx.strokeStyle = laneColor;
  ctx.lineWidth = laneWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(280, 2340);
  ctx.lineTo(2300, 2320);
  ctx.lineTo(2320, 280);
  ctx.stroke();

  ctx.strokeStyle = laneBorderColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // BAZALAR (ALLIED BASE & ENEMY BASE)
  // Ittifoqchi baza maydoni (Pastki chap)
  ctx.save();
  ctx.beginPath();
  ctx.arc(260, 2340, 170, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(30, 58, 138, 0.45)";
  ctx.fill();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Dushman baza maydoni (Yuqori o'ng)
  ctx.beginPath();
  ctx.arc(2340, 260, 170, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(127, 29, 29, 0.45)";
  ctx.fill();
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Butalar (Bushes / Tall Grass)
  MAP_BUSHES.forEach(b => {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.radius, b.radius * ISO_Y_SKEW, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(22, 101, 52, 0.55)";
    ctx.fill();
    ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  });
}

export function drawTurret(ctx: CanvasRenderingContext2D, t: TurretUnit) {
  ctx.save();
  const isAllied = t.team === 'allied';
  const baseColor = isAllied ? "#1e3a8a" : "#7f1d1d";
  const lightColor = isAllied ? "#60a5fa" : "#f87171";

  if (t.isDestroyed) {
    ctx.beginPath();
    ctx.ellipse(t.x, t.y + 4, t.radius * 0.9, t.radius * 0.9 * ISO_Y_SKEW, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Vayron bo'ldi", t.x, t.y - 12);
    ctx.restore();
    return;
  }

  // Minora himoya radiusi (Range circle)
  ctx.beginPath();
  ctx.ellipse(t.x, t.y, t.attackRange, t.attackRange * ISO_Y_SKEW, 0, 0, Math.PI * 2);
  ctx.strokeStyle = isAllied ? "rgba(59, 130, 246, 0.16)" : "rgba(239, 68, 68, 0.16)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Minora soyasi
  ctx.beginPath();
  ctx.ellipse(t.x, t.y + 8, t.radius * 1.1, t.radius * 1.1 * ISO_Y_SKEW, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fill();

  // Minora poydevori
  ctx.beginPath();
  ctx.ellipse(t.x, t.y, t.radius, t.radius * ISO_Y_SKEW, 0, 0, Math.PI * 2);
  ctx.fillStyle = baseColor;
  ctx.fill();
  ctx.strokeStyle = lightColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Minora ustuni
  const colWidth = t.type === 'base' ? 32 : 24;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(t.x - colWidth / 2, t.y - t.height, colWidth, t.height);

  // Aylanuvchi Magik Kristall
  const crystalY = t.y - t.height - 14 + Math.sin(t.crystalAngle * 2) * 5;
  ctx.save();
  ctx.translate(t.x, crystalY);
  ctx.rotate(t.crystalAngle);
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(10, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fillStyle = lightColor;
  ctx.shadowColor = lightColor;
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.restore();

  // HP Bar
  const barW = t.type === 'base' ? 64 : 50;
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(t.x - barW / 2, t.y - t.height - 32, barW, 6);
  ctx.fillStyle = isAllied ? "#3b82f6" : "#ef4444";
  ctx.fillRect(t.x - barW / 2, t.y - t.height - 32, Math.max(0, (t.hp / t.maxHp) * barW), 6);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(t.name, t.x, t.y - t.height - 40);

  ctx.restore();
}

export function drawMinion(ctx: CanvasRenderingContext2D, m: MinionUnit) {
  ctx.save();
  const isAllied = m.team === 'allied';
  const bodyY = m.y - m.height * 0.5;

  ctx.beginPath();
  ctx.ellipse(m.x, m.y + 2, m.radius * 0.9, m.radius * 0.9 * ISO_Y_SKEW, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(m.x, bodyY, m.radius, 0, Math.PI * 2);
  ctx.fillStyle = m.hitFlash > 0 ? "#ffffff" : (isAllied ? "#2563eb" : "#dc2626");
  ctx.fill();
  ctx.strokeStyle = isAllied ? "#93c5fd" : "#fca5a5";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const barW = 28;
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(m.x - barW / 2, bodyY - m.radius - 8, barW, 3.5);
  ctx.fillStyle = isAllied ? "#10b981" : "#ef4444";
  ctx.fillRect(m.x - barW / 2, bodyY - m.radius - 8, Math.max(0, (m.hp / m.maxHp) * barW), 3.5);

  ctx.restore();
}

export function drawJungleMonster(ctx: CanvasRenderingContext2D, j: JungleMonster) {
  if (j.isDead) {
    ctx.save();
    ctx.fillStyle = "rgba(100, 116, 139, 0.5)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`⏳ ${Math.ceil(j.respawnTimer / 60)}s`, j.x, j.y);
    ctx.restore();
    return;
  }

  ctx.save();
  const bodyY = j.y - j.height * 0.5;

  ctx.beginPath();
  ctx.ellipse(j.x, j.y + 4, j.radius * 1.1, j.radius * 1.1 * ISO_Y_SKEW, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(j.x, bodyY, j.radius, 0, Math.PI * 2);
  if (j.hitFlash > 0) {
    ctx.fillStyle = "#ffffff";
  } else {
    const g = ctx.createRadialGradient(j.x - 6, bodyY - 6, 2, j.x, bodyY, j.radius);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.4, j.color);
    g.addColorStop(1, "#0f172a");
    ctx.fillStyle = g;
  }
  ctx.fill();
  ctx.strokeStyle = j.color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = j.color;
  ctx.shadowBlur = 14;
  ctx.stroke();

  // Icon
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const icon = j.type === 'blue_buff' ? "🔷" : (j.type === 'red_buff' ? "🔥" : (j.type === 'turtle' ? "🐢" : "💰"));
  ctx.fillText(icon, j.x, bodyY);

  // HP Bar
  const barW = j.radius * 2.5;
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(j.x - barW / 2, bodyY - j.radius - 14, barW, 4);
  ctx.fillStyle = j.color;
  ctx.fillRect(j.x - barW / 2, bodyY - j.radius - 14, Math.max(0, (j.hp / j.maxHp) * barW), 4);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(j.name, j.x, bodyY - j.radius - 18);

  ctx.restore();
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  height: number,
  color: string,
  angle: number,
  isHit: boolean,
  name: string,
  hp: number,
  maxHp: number,
  isPlayer: boolean,
  activeBuffs?: ActiveBuff[]
) {
  ctx.save();
  const bodyY = y - height * 0.5;

  ctx.beginPath();
  ctx.ellipse(x, y + 4, radius * 0.95, radius * 0.95 * ISO_Y_SKEW, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fill();

  // Buff aura halqalari
  if (isPlayer && activeBuffs && activeBuffs.length > 0) {
    activeBuffs.forEach((buff, idx) => {
      ctx.beginPath();
      ctx.ellipse(x, bodyY, radius + 8 + idx * 5, (radius + 8 + idx * 5) * ISO_Y_SKEW, 0, 0, Math.PI * 2);
      ctx.strokeStyle = buff.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = buff.color;
      ctx.shadowBlur = 14;
      ctx.stroke();
    });
  }

  // Qahramon tanasi
  ctx.beginPath();
  ctx.arc(x, bodyY, radius, 0, Math.PI * 2);
  if (isHit) {
    ctx.fillStyle = "#ffffff";
  } else {
    const g = ctx.createRadialGradient(x - 5, bodyY - 6, 2, x, bodyY, radius);
    if (isPlayer) {
      g.addColorStop(0, "#bae6fd");
      g.addColorStop(0.5, "#0ea5e9");
      g.addColorStop(1, "#0369a1");
    } else {
      g.addColorStop(0, "#fca5a5");
      g.addColorStop(0.6, color);
      g.addColorStop(1, "#450a0a");
    }
    ctx.fillStyle = g;
  }
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = isPlayer ? "#7dd3fc" : "#fca5a5";
  ctx.stroke();

  // Qahramon ko'zlashi / Asosi
  ctx.save();
  ctx.translate(x, bodyY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(radius - 2, -3);
  ctx.lineTo(radius + 18, 0);
  ctx.lineTo(radius - 2, 3);
  ctx.fillStyle = isPlayer ? "#ffffff" : "#fecaca";
  ctx.shadowColor = isPlayer ? "#38bdf8" : "#ef4444";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.restore();

  // HP Bar
  const barW = radius * 2.6;
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(x - barW / 2, bodyY - radius - 16, barW, 5.5);
  ctx.fillStyle = isPlayer ? "#10b981" : "#ef4444";
  ctx.fillRect(x - barW / 2, bodyY - radius - 16, Math.max(0, (hp / maxHp) * barW), 5.5);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, bodyY - radius - 20);

  ctx.restore();
}
