/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural textures generator
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep rich MOBA grass / jungle floor
  ctx.fillStyle = '#162b1e';
  ctx.fillRect(0, 0, 512, 512);

  // Noise / Grass patches
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const shade = Math.random();
    if (shade > 0.6) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.08)'; // bright grass
    } else if (shade > 0.3) {
      ctx.fillStyle = 'rgba(20, 83, 45, 0.12)'; // deep forest
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'; // dark soil
    }
    ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }

  // Soft moss patches
  for (let i = 0; i < 60; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const r = 20 + Math.random() * 40;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(22, 101, 52, 0.25)');
    g.addColorStop(1, 'rgba(22, 101, 52, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

export function createStoneRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#2d3748';
  ctx.fillRect(0, 0, 256, 256);

  // Stone tiles
  ctx.strokeStyle = '#1a202c';
  ctx.lineWidth = 3;
  const tileSize = 32;
  for (let x = 0; x < 256; x += tileSize) {
    for (let y = 0; y < 256; y += tileSize) {
      const offsetX = ((y / tileSize) % 2 === 0) ? 0 : 16;
      ctx.fillStyle = (Math.random() > 0.5) ? '#374151' : '#4b5563';
      ctx.fillRect(x + offsetX, y, tileSize, tileSize);
      ctx.strokeRect(x + offsetX, y, tileSize, tileSize);

      // Highlights
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x + offsetX + 2, y + 2, tileSize - 4, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function createRuneCircleTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);
  const cx = 128, cy = 128;

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 110, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 95, 0, Math.PI * 2);
  ctx.stroke();

  // Runes pattern
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 8; i++) {
    ctx.rotate((Math.PI * 2) / 8);
    ctx.fillStyle = color;
    ctx.fillRect(-4, -105, 8, 12);
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(-8, -75);
    ctx.lineTo(8, -75);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}
