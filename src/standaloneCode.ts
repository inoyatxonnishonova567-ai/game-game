/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const STANDALONE_HTML_CODE = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-select=none">
  <title>2D MOBA Arena - 2.5D Isometric MLBB Edition</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }
    body {
      background-color: #030712;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    #game-container {
      position: relative;
      width: 980px;
      height: 590px;
      border: 2px solid #1e293b;
      border-radius: 18px;
      box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(6, 182, 212, 0.2);
      background-color: #070e1a;
      overflow: hidden;
    }
    canvas#gameCanvas {
      display: block;
      width: 100%;
      height: 100%;
      cursor: crosshair;
    }

    /* YUQORI HUD: PROFIL, STATISTIKA, MINIXARITA */
    .hud-top {
      position: absolute;
      top: 12px;
      left: 16px;
      right: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: none;
      z-index: 20;
    }
    .hero-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(15, 23, 42, 0.88);
      padding: 6px 14px 6px 8px;
      border-radius: 20px;
      border: 1px solid rgba(6, 182, 212, 0.45);
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
      pointer-events: auto;
    }
    .hero-avatar-wrap {
      position: relative;
    }
    .hero-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #0369a1);
      border: 2px solid #7dd3fc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;
      box-shadow: 0 0 10px rgba(14, 165, 233, 0.6);
    }
    .hero-level-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #f59e0b;
      color: #030712;
      font-size: 10px;
      font-weight: 900;
      padding: 1px 5px;
      border-radius: 10px;
      border: 1.5px solid #0f172a;
    }
    .hero-vitals {
      display: flex;
      flex-direction: column;
      gap: 3.5px;
      width: 140px;
    }
    .hero-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: bold;
      color: #94a3b8;
    }
    .hero-meta span:first-child { color: #f1f5f9; }
    .hero-meta span:last-child { color: #f59e0b; }

    .bar-wrap {
      width: 100%;
      height: 8px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .bar-hp {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #34d399);
      width: 100%;
      transition: width 0.1s ease-out;
    }
    .bar-mp {
      height: 100%;
      background: linear-gradient(90deg, #0284c7, #38bdf8);
      width: 100%;
      transition: width 0.1s ease-out;
    }
    .bar-xp {
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #fde047);
      width: 0%;
      border-radius: 4px;
      transition: width 0.1s ease-out;
    }

    /* O'RTA STATISTIKA */
    .hud-center {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 7px 18px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 800;
      backdrop-filter: blur(8px);
    }
    .stat-timer { color: #38bdf8; font-family: monospace; font-size: 14px; }
    .stat-kda { color: #f1f5f9; }
    .stat-gold { color: #fbbf24; }

    /* MINIXARITA */
    .minimap-card {
      width: 104px;
      height: 72px;
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid #0284c7;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.7);
      pointer-events: auto;
    }
    #minimapCanvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* BUFF BADGES (XARITANING CHAPIDA) */
    .buff-list {
      position: absolute;
      top: 86px;
      left: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 20;
      pointer-events: none;
    }
    .buff-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.85);
      border: 1.5px solid #38bdf8;
      border-radius: 12px;
      padding: 4px 10px;
      font-size: 10px;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      backdrop-filter: blur(6px);
      animation: pulse 1.8s infinite;
    }

    /* ANNOUNCEMENT BANNER */
    #announcementBanner {
      position: absolute;
      top: 72px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      border: 2px solid #f59e0b;
      padding: 6px 22px;
      border-radius: 14px;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 30;
      transition: opacity 0.25s, transform 0.25s;
      opacity: 0;
      pointer-events: none;
    }
    #announcementBanner.active {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    #bannerTitle {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #f59e0b;
    }
    #bannerSubtext {
      font-size: 11px;
      color: #cbd5e1;
    }

    /* JOYSTICK */
    .joystick-zone {
      position: absolute;
      bottom: 22px;
      left: 24px;
      width: 115px;
      height: 115px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.3) 70%);
      border: 2px solid rgba(6, 182, 212, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 25;
      touch-action: none;
    }
    .joystick-nub {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #38bdf8, #0369a1);
      border: 2px solid #bae6fd;
      box-shadow: 0 0 16px rgba(6, 182, 212, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 900;
      color: #fff;
      pointer-events: none;
      transition: transform 0.04s ease-out;
    }

    /* MLBB ACTION CLUSTER */
    .mlbb-action-cluster {
      position: absolute;
      bottom: 20px;
      right: 24px;
      width: 215px;
      height: 215px;
      pointer-events: auto;
      z-index: 25;
    }

    .btn-attack {
      position: absolute;
      bottom: 6px;
      right: 6px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #f59e0b, #b45309 80%);
      border: 3.5px solid #fde68a;
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.65), inset 0 0 12px rgba(255, 255, 255, 0.4);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
      transition: transform 0.08s, box-shadow 0.08s;
    }
    .btn-attack:active {
      transform: scale(0.92);
      box-shadow: 0 0 35px rgba(245, 158, 11, 0.95);
    }
    .btn-attack svg {
      width: 34px;
      height: 34px;
      fill: none;
      stroke: #fff;
      stroke-width: 2.2;
    }
    .btn-attack .key-hint {
      position: absolute;
      bottom: -6px;
      background: #0f172a;
      color: #fde68a;
      border: 1px solid #f59e0b;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 8px;
    }

    .skill-btn {
      position: absolute;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #1e293b, #0f172a);
      border: 2px solid #06b6d4;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.35);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
      transition: transform 0.08s;
      overflow: hidden;
    }
    .skill-btn:active { transform: scale(0.92); }
    .skill-btn svg { width: 22px; height: 22px; fill: none; stroke: #38bdf8; stroke-width: 2; }
    .skill-btn .key-hint {
      position: absolute;
      top: -6px;
      background: #0f172a;
      color: #38bdf8;
      border: 1px solid #0284c7;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 6px;
      z-index: 10;
    }
    .skill-btn .mana-cost {
      position: absolute;
      bottom: -4px;
      background: rgba(30, 58, 138, 0.95);
      color: #93c5fd;
      font-size: 8px;
      font-weight: 800;
      padding: 0 4px;
      border-radius: 4px;
      z-index: 10;
    }
    .cooldown-overlay {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(3, 7, 18, 0.78);
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 900;
      color: #facc15;
      z-index: 5;
    }

    #btnSkill1 { bottom: 24px; left: 12px; }
    #btnSkill2 { top: 36px; left: 48px; border-color: #a855f7; box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); }
    #btnSkill2 svg { stroke: #c084fc; }
    #btnSkill2 .key-hint { color: #c084fc; border-color: #9333ea; }

    #btnSkill3 {
      top: 8px;
      right: 48px;
      width: 60px;
      height: 60px;
      border-color: #38bdf8;
      box-shadow: 0 0 22px rgba(56, 189, 248, 0.5);
    }
    #btnSkill3 svg { stroke: #bae6fd; width: 26px; height: 26px; }
    #btnSkill3 .key-hint { color: #bae6fd; border-color: #0284c7; }

    .controls-hint {
      margin-top: 14px;
      font-size: 12px;
      color: #64748b;
      display: flex;
      gap: 16px;
    }
    .controls-hint span {
      background: #0f172a;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #1e293b;
      color: #94a3b8;
    }
    .controls-hint strong { color: #e2e8f0; }
  </style>
</head>
<body>

  <div id="game-container">
    <!-- YUQORI HUD -->
    <div class="hud-top">
      <div class="hero-profile">
        <div class="hero-avatar-wrap">
          <div class="hero-avatar">✨</div>
          <div id="heroLevelBadge" class="hero-level-badge">1</div>
        </div>
        <div class="hero-vitals">
          <div class="hero-meta">
            <span>Xavier</span>
            <span id="levelText">Lv. 1</span>
          </div>
          <div class="bar-wrap">
            <div id="hpBar" class="bar-hp"></div>
          </div>
          <div class="bar-wrap">
            <div id="mpBar" class="bar-mp"></div>
          </div>
          <div class="bar-wrap" style="height: 4px;">
            <div id="xpBar" class="bar-xp"></div>
          </div>
        </div>
      </div>

      <div class="hud-center">
        <div id="timerVal" class="stat-timer">00:00</div>
        <div class="stat-kda"><span id="killsVal" style="color: #34d399;">0</span> / <span id="deathsVal" style="color: #f87171;">0</span></div>
        <div class="stat-gold">Oltin: <span id="goldVal">300</span></div>
        <div style="color: #10b981; font-family: monospace;">FPS: <span id="fpsVal">60</span></div>
      </div>

      <div class="minimap-card">
        <canvas id="minimapCanvas" width="104" height="72"></canvas>
      </div>
    </div>

    <!-- BUFF STATUS LIST -->
    <div id="buffList" class="buff-list"></div>

    <!-- ANNOUNCEMENT BANNER -->
    <div id="announcementBanner">
      <div id="bannerTitle">JANG BOSHLANDI!</div>
      <div id="bannerSubtext">O'rmon maxluqlarini o'ldirib Buff oling!</div>
    </div>

    <!-- JOYSTICK -->
    <div id="joystickZone" class="joystick-zone">
      <div id="joystickNub" class="joystick-nub">WASD</div>
    </div>

    <!-- MLBB ACTION BUTTONS CLUSTER -->
    <div class="mlbb-action-cluster">
      <!-- 1-Skill (Q: Infinite Extension) -->
      <button id="btnSkill1" class="skill-btn" title="Skill 1: Infinite Extension (Q)">
        <div class="key-hint">Q</div>
        <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span class="mana-cost">30</span>
        <div id="cdSkill1" class="cooldown-overlay"></div>
      </button>

      <!-- 2-Skill (W: Mystic Field Barrier) -->
      <button id="btnSkill2" class="skill-btn" title="Skill 2: Mystic Field Barrier (W)">
        <div class="key-hint">W</div>
        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span class="mana-cost">45</span>
        <div id="cdSkill2" class="cooldown-overlay"></div>
      </button>

      <!-- 3-Skill (R: Dawning Light Global Laser) -->
      <button id="btnSkill3" class="skill-btn" title="Ultimate: Dawning Light (R)">
        <div class="key-hint">R</div>
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
        <span class="mana-cost">75</span>
        <div id="cdSkill3" class="cooldown-overlay"></div>
      </button>

      <!-- Asosiy Zarba (Basic Attack) -->
      <button id="btnAttack" class="btn-attack" title="Basic Attack (Space / Bosish)">
        <svg viewBox="0 0 24 24"><line x1="6" y1="18" x2="18" y2="6"/><polyline points="10 6 18 6 18 14"/><line x1="10" y1="14" x2="6" y2="18"/></svg>
        <div class="key-hint">SPACE</div>
      </button>
    </div>

    <!-- CANVAS -->
    <canvas id="gameCanvas" width="980" height="590"></canvas>
  </div>

  <div class="controls-hint">
    <span>Harakat: <strong>WASD</strong> yoki <strong>Joystick</strong> / <strong>Sichqoncha</strong></span>
    <span>Hujum: <strong>Katta Tugma</strong> yoki <strong>Space</strong></span>
    <span>Xavier Skillar: <strong>Q</strong> (Kengayuvchi Nur), <strong>W</strong> (To'siq Maydon), <strong>R</strong> (Global Lazer)</span>
  </div>

  <script>
    class SoundEngine {
      constructor() { this.ctx = null; }
      init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
          const AudioClass = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioClass();
        }
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      }
      playSwordSlash() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.12);
      }
      playXavierLaser() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.38);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.38);
      }
      playXavierBarrier() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.28);
      }
      playBuffAcquired() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const freqs = [440, 554, 659, 880, 1108];
        freqs.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.18, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05); osc.stop(now + i * 0.05 + 0.22);
        });
      }
      playHit() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.08);
      }
      playLevelUp() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const freqs = [392, 523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + i * 0.07);
          gain.gain.setValueAtTime(0.2, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now + i * 0.07); osc.stop(now + i * 0.07 + 0.24);
        });
      }
      playTowerBeam() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.18);
      }
      playVictory() {
        this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const chords = [523.25, 659.25, 783.99, 1046.5];
        chords.forEach(f => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(now); osc.stop(now + 0.8);
        });
      }
    }
    const sounds = new SoundEngine();

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const minimapCanvas = document.getElementById("minimapCanvas");
    const mmCtx = minimapCanvas.getContext("2d");

    const WORLD_W = 980;
    const WORLD_H = 590;
    const ISO_Y = 0.62;

    const MID_LANE = [
      { x: 120, y: 460 },
      { x: 290, y: 390 },
      { x: 490, y: 295 },
      { x: 690, y: 200 },
      { x: 860, y: 130 }
    ];

    // QAHRAMON (XAVIER)
    const hero = {
      x: 170,
      y: 430,
      radius: 20,
      speed: 4.8,
      vx: 0,
      vy: 0,
      friction: 0.85,
      accel: 0.95,
      angle: -0.6,
      name: "Xavier",
      level: 1,
      xp: 0,
      maxXp: 120,
      kills: 0,
      deaths: 0,
      gold: 300,
      attackDamage: 60,
      maxHp: 680,
      hp: 680,
      maxMp: 340,
      mp: 340,
      shield: 0,
      hitFlash: 0,
      moveTarget: null,
      cooldowns: { attack: 0, skill1: 0, skill2: 0, skill3: 0 },
      activeBuffs: []
    };

    // O'RMON MAXLUQLARI (JUNGLE BUFFS)
    const jungles = [
      { id: 1, type: 'blue', name: "Moviy Monstr", x: 210, y: 190, radius: 24, height: 38, maxHp: 950, hp: 950, damage: 16, range: 50, cd: 0, color: "#3b82f6", buffDuration: 30, hitFlash: 0, isDead: false, respawn: 0, gold: 120, xp: 180 },
      { id: 2, type: 'red', name: "Qizil Maxluq", x: 770, y: 400, radius: 24, height: 38, maxHp: 950, hp: 950, damage: 20, range: 50, cd: 0, color: "#ef4444", buffDuration: 30, hitFlash: 0, isDead: false, respawn: 0, gold: 120, xp: 180 },
      { id: 3, type: 'gold', name: "Oltin Qisqichbaqa", x: 490, y: 130, radius: 17, height: 25, maxHp: 580, hp: 580, damage: 8, range: 35, cd: 0, color: "#eab308", buffDuration: 25, hitFlash: 0, isDead: false, respawn: 0, gold: 150, xp: 120 }
    ];

    // MINORALAR (TURRETS)
    const turrets = [
      { id: 1, team: "allied", type: "tower", name: "Ittifoqchi Minora", x: 290, y: 390, radius: 30, height: 70, hp: 1800, maxHp: 1800, range: 190, cd: 0, damage: 85, crystalAngle: 0, isDestroyed: false },
      { id: 2, team: "allied", type: "base", name: "Ittifoqchi Baza", x: 110, y: 470, radius: 36, height: 80, hp: 2800, maxHp: 2800, range: 200, cd: 0, damage: 100, crystalAngle: 0, isDestroyed: false },
      { id: 3, team: "enemy", type: "tower", name: "Dushman Minorasi", x: 690, y: 200, radius: 30, height: 70, hp: 1800, maxHp: 1800, range: 190, cd: 0, damage: 85, crystalAngle: 0, isDestroyed: false },
      { id: 4, team: "enemy", type: "base", name: "Dushman Bazasi", x: 870, y: 120, radius: 36, height: 80, hp: 2800, maxHp: 2800, range: 200, cd: 0, damage: 100, crystalAngle: 0, isDestroyed: false }
    ];

    // DUSHMAN BOT (ZILONG)
    const enemyHero = {
      id: 999, name: "Zilong", x: 750, y: 170, spawnX: 840, spawnY: 140, radius: 20, height: 38, speed: 2.1, angle: 3.14, maxHp: 720, hp: 720, color: "#dc2626", hitFlash: 0, isDead: false, respawnTimer: 0, attackCd: 0, damage: 22, goldReward: 200, xpReward: 300
    };

    let minions = [];
    let mysticFields = [];
    let laserBeams = [];
    let projectiles = [];
    let slashes = [];
    let particles = [];
    let floatTexts = [];
    let clickRipple = null;
    let waveTimer = 40;
    let nextId = 100;
    let gameSeconds = 0;
    let frameCount = 0;
    let bannerTimer = 0;

    function showBanner(title, subtext, color = "#f59e0b") {
      const banner = document.getElementById("announcementBanner");
      const titleEl = document.getElementById("bannerTitle");
      const subEl = document.getElementById("bannerSubtext");
      titleEl.textContent = title;
      titleEl.style.color = color;
      subEl.textContent = subtext;
      banner.style.borderColor = color;
      banner.classList.add("active");
      bannerTimer = 180;
    }

    function applyBuff(type, durSec) {
      const durFrames = durSec * 60;
      let name = type === 'blue' ? "Moviy Buff (Mana + CDR)" : (type === 'red' ? "Qizil Buff (Zarar + Olov)" : "Oltin Buff (Tezlik + Oltin)");
      let icon = type === 'blue' ? "🔷" : (type === 'red' ? "🔥" : "💰");
      let col = type === 'blue' ? "#38bdf8" : (type === 'red' ? "#f87171" : "#facc15");

      const idx = hero.activeBuffs.findIndex(b => b.type === type);
      if (idx >= 0) {
        hero.activeBuffs[idx].duration = durFrames;
      } else {
        hero.activeBuffs.push({ type, name, icon, color: col, duration: durFrames });
      }
      sounds.playBuffAcquired();
      showBanner(name, "Qahramonga faol buff berildi!", col);
      renderBuffsUI();
    }

    function renderBuffsUI() {
      const list = document.getElementById("buffList");
      list.innerHTML = "";
      hero.activeBuffs.forEach(b => {
        const item = document.createElement("div");
        item.className = "buff-badge";
        item.style.borderColor = b.color;
        item.innerHTML = "<span>" + b.icon + "</span><span style='color:" + b.color + "'>" + b.name + " (" + Math.ceil(b.duration / 60) + "s)</span>";
        list.appendChild(item);
      });
    }

    function spawnWave() {
      const a = MID_LANE[0];
      minions.push(
        { id: nextId++, team: 'allied', type: 'melee', x: a.x - 15, y: a.y + 10, radius: 13, height: 24, speed: 1.45, angle: -0.6, maxHp: 240, hp: 240, damage: 10, range: 32, cd: 0, color: "#3b82f6", hitFlash: 0, waypoint: 1, gold: 35, xp: 45 },
        { id: nextId++, team: 'allied', type: 'melee', x: a.x, y: a.y, radius: 13, height: 24, speed: 1.45, angle: -0.6, maxHp: 240, hp: 240, damage: 10, range: 32, cd: 0, color: "#3b82f6", hitFlash: 0, waypoint: 1, gold: 35, xp: 45 },
        { id: nextId++, team: 'allied', type: 'ranged', x: a.x - 30, y: a.y + 20, radius: 11, height: 22, speed: 1.4, angle: -0.6, maxHp: 160, hp: 160, damage: 15, range: 130, cd: 0, color: "#60a5fa", hitFlash: 0, waypoint: 1, gold: 45, xp: 55 }
      );
      const e = MID_LANE[MID_LANE.length - 1];
      minions.push(
        { id: nextId++, team: 'enemy', type: 'melee', x: e.x + 15, y: e.y - 10, radius: 13, height: 24, speed: 1.45, angle: 2.5, maxHp: 240, hp: 240, damage: 10, range: 32, cd: 0, color: "#ef4444", hitFlash: 0, waypoint: MID_LANE.length - 2, gold: 40, xp: 50 },
        { id: nextId++, team: 'enemy', type: 'melee', x: e.x, y: e.y, radius: 13, height: 24, speed: 1.45, angle: 2.5, maxHp: 240, hp: 240, damage: 10, range: 32, cd: 0, color: "#ef4444", hitFlash: 0, waypoint: MID_LANE.length - 2, gold: 40, xp: 50 },
        { id: nextId++, team: 'enemy', type: 'ranged', x: e.x + 30, y: e.y - 20, radius: 11, height: 22, speed: 1.4, angle: 2.5, maxHp: 160, hp: 160, damage: 15, range: 130, cd: 0, color: "#f87171", hitFlash: 0, waypoint: MID_LANE.length - 2, gold: 50, xp: 60 }
      );
    }

    function addXp(amount) {
      hero.xp += amount;
      floatTexts.push({ text: "+" + amount + " XP", x: hero.x, y: hero.y - 30, color: "#38bdf8", alpha: 1, vy: -1 });

      while (hero.xp >= hero.maxXp && hero.level < 15) {
        hero.level++;
        hero.xp -= hero.maxXp;
        hero.maxXp = Math.floor(hero.maxXp * 1.35);

        hero.maxHp += 80; hero.hp = hero.maxHp;
        hero.maxMp += 40; hero.mp = hero.maxMp;
        hero.attackDamage += 12;

        createParticles(hero.x, hero.y, "#facc15", 35);
        slashes.push({ x: hero.x, y: hero.y, radius: 95, color: "#fde047", alpha: 1, isRing: true, life: 1, maxLife: 18 });
        floatTexts.push({ text: "LEVEL UP! Lv." + hero.level, x: hero.x, y: hero.y - 48, color: "#facc15", alpha: 1.6, vy: -1.2 });

        sounds.playLevelUp();
        showBanner("LEVEL UP! Lv." + hero.level, "HP, Mana va Hujum kuchi oshirildi!", "#facc15");
      }

      document.getElementById("heroLevelBadge").textContent = hero.level;
      document.getElementById("levelText").textContent = "Lv. " + hero.level;
    }

    const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
    window.addEventListener("keydown", (e) => {
      if (keys.hasOwnProperty(e.key)) { keys[e.key] = true; hero.moveTarget = null; }
      if (e.code === "Space") { e.preventDefault(); triggerAttack(); }
      if (e.key === "q" || e.key === "Q") triggerSkill1();
      if (e.key === "w" || e.key === "W") triggerSkill2();
      if (e.key === "r" || e.key === "R") triggerSkill3();
    });
    window.addEventListener("keyup", (e) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
    });

    const joystickZone = document.getElementById("joystickZone");
    const joystickNub = document.getElementById("joystickNub");
    let isDraggingJoy = false;

    function handleJoy(e) {
      if (!isDraggingJoy) return;
      const rect = joystickZone.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      const maxR = rect.width / 2 - 14;

      let nx = dx; let ny = dy;
      if (dist > maxR) { nx = (dx / dist) * maxR; ny = (dy / dist) * maxR; }
      joystickNub.style.transform = "translate(" + nx + "px, " + ny + "px)";

      if (dist > 4) {
        hero.vx += (nx / maxR) * hero.accel;
        hero.vy += (ny / maxR) * hero.accel;
        hero.angle = Math.atan2(ny, nx);
        hero.moveTarget = null;
      }
    }

    joystickZone.addEventListener("mousedown", (e) => { isDraggingJoy = true; handleJoy(e); });
    window.addEventListener("mousemove", (e) => { if (isDraggingJoy) handleJoy(e); });
    window.addEventListener("mouseup", () => { isDraggingJoy = false; joystickNub.style.transform = "translate(0,0)"; });
    joystickZone.addEventListener("touchstart", (e) => { isDraggingJoy = true; handleJoy(e); }, { passive: false });
    window.addEventListener("touchmove", (e) => { if (isDraggingJoy) handleJoy(e); }, { passive: false });
    window.addEventListener("touchend", () => { isDraggingJoy = false; joystickNub.style.transform = "translate(0,0)"; });

    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) * (WORLD_W / rect.width);
      const clickY = (e.clientY - rect.top) * (WORLD_H / rect.height);
      hero.moveTarget = { x: clickX, y: clickY };
      clickRipple = { x: clickX, y: clickY, radius: 4, alpha: 1 };
    });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    document.getElementById("btnAttack").addEventListener("click", triggerAttack);
    document.getElementById("btnSkill1").addEventListener("click", triggerSkill1);
    document.getElementById("btnSkill2").addEventListener("click", triggerSkill2);
    document.getElementById("btnSkill3").addEventListener("click", triggerSkill3);

    function getTarget() {
      let nearest = null;
      let minD = 520;
      if (enemyHero && !enemyHero.isDead) {
        const d = Math.hypot(enemyHero.x - hero.x, enemyHero.y - hero.y);
        if (d < minD) { minD = d; nearest = enemyHero; }
      }
      for (const m of minions) {
        if (m.team === 'enemy' && m.hp > 0) {
          const d = Math.hypot(m.x - hero.x, m.y - hero.y);
          if (d < minD) { minD = d; nearest = m; }
        }
      }
      for (const j of jungles) {
        if (!j.isDead) {
          const d = Math.hypot(j.x - hero.x, j.y - hero.y);
          if (d < minD) { minD = d; nearest = j; }
        }
      }
      for (const t of turrets) {
        if (t.team === 'enemy' && !t.isDestroyed) {
          const d = Math.hypot(t.x - hero.x, t.y - hero.y);
          if (d < minD) { minD = d; nearest = t; }
        }
      }
      return nearest;
    }

    function triggerAttack() {
      if (hero.cooldowns.attack > 0) return;
      const hasBlue = hero.activeBuffs.some(b => b.type === 'blue');
      hero.cooldowns.attack = hasBlue ? 14 : 18;
      sounds.playSwordSlash();

      const target = getTarget();
      let angle = hero.angle;
      if (target) {
        angle = Math.atan2(target.y - hero.y, target.x - hero.x);
        hero.angle = angle;
      }

      const hasRed = hero.activeBuffs.some(b => b.type === 'red');
      const dmg = hero.attackDamage + (hasRed ? 25 : 0);

      slashes.push({
        x: hero.x + Math.cos(angle) * 20,
        y: hero.y + Math.sin(angle) * 14,
        angle: angle,
        radius: 42,
        color: hasRed ? "#ef4444" : "#38bdf8",
        life: 1,
        maxLife: 10
      });

      projectiles.push({
        team: 'allied',
        x: hero.x + Math.cos(angle) * 20,
        y: hero.y + Math.sin(angle) * 14,
        vx: Math.cos(angle) * 11,
        vy: Math.sin(angle) * 11,
        radius: 8,
        color: hasRed ? "#f87171" : "#38bdf8",
        damage: dmg,
        range: 380,
        dist: 0
      });
    }

    // XAVIER 1-SKILL: INFINITE EXTENSION (Q)
    function triggerSkill1() {
      if (hero.cooldowns.skill1 > 0 || hero.mp < 30) return;
      const hasBlue = hero.activeBuffs.some(b => b.type === 'blue');
      hero.mp -= 30;
      hero.cooldowns.skill1 = hasBlue ? 110 : 150;
      sounds.playSwordSlash();

      const target = getTarget();
      const angle = target ? Math.atan2(target.y - hero.y, target.x - hero.x) : hero.angle;
      hero.angle = angle;

      projectiles.push({
        team: 'allied',
        x: hero.x,
        y: hero.y,
        vx: Math.cos(angle) * 12,
        vy: Math.sin(angle) * 12,
        radius: 12,
        color: "#06b6d4",
        damage: hero.attackDamage * 2.4,
        range: 560,
        dist: 0,
        isPenetrating: true
      });
      createParticles(hero.x, hero.y, "#06b6d4", 15);
    }

    // XAVIER 2-SKILL: MYSTIC FIELD (W)
    function triggerSkill2() {
      if (hero.cooldowns.skill2 > 0 || hero.mp < 45) return;
      const hasBlue = hero.activeBuffs.some(b => b.type === 'blue');
      hero.mp -= 45;
      hero.cooldowns.skill2 = hasBlue ? 180 : 240;
      sounds.playXavierBarrier();

      const target = getTarget();
      let dist = 140;
      let angle = hero.angle;
      if (target) {
        angle = Math.atan2(target.y - hero.y, target.x - hero.x);
        dist = Math.min(180, Math.hypot(target.x - hero.x, target.y - hero.y));
      }

      mysticFields.push({
        x: hero.x + Math.cos(angle) * dist,
        y: hero.y + Math.sin(angle) * dist,
        radius: 28,
        maxRadius: 75,
        duration: 220,
        color: "#a855f7",
        isTriggered: false
      });
      createParticles(hero.x + Math.cos(angle) * dist, hero.y + Math.sin(angle) * dist, "#c084fc", 16);
    }

    // XAVIER 3-SKILL: DAWNING LIGHT GLOBAL LASER (R)
    function triggerSkill3() {
      if (hero.cooldowns.skill3 > 0 || hero.mp < 75) return;
      const hasBlue = hero.activeBuffs.some(b => b.type === 'blue');
      hero.mp -= 75;
      hero.cooldowns.skill3 = hasBlue ? 360 : 480;
      sounds.playXavierLaser();
      showBanner("DAWNING LIGHT (ULTIMATE)!", "Xavier butun xarita bo'ylab lazer otdi!", "#38bdf8");

      const target = getTarget();
      const angle = target ? Math.atan2(target.y - hero.y, target.x - hero.x) : hero.angle;
      hero.angle = angle;

      const beamLen = 1200;
      const x2 = hero.x + Math.cos(angle) * beamLen;
      const y2 = hero.y + Math.sin(angle) * beamLen;

      laserBeams.push({ x1: hero.x, y1: hero.y, x2: x2, y2: y2, width: 32, alpha: 1, color: "#38bdf8" });

      const dmg = hero.attackDamage * 4.5;
      if (enemyHero && !enemyHero.isDead && pToLine(enemyHero.x, enemyHero.y, hero.x, hero.y, x2, y2) < 40) {
        enemyHero.hp -= dmg;
        enemyHero.hitFlash = 12;
        floatTexts.push({ text: "-" + Math.round(dmg), x: enemyHero.x, y: enemyHero.y - 30, color: "#38bdf8", alpha: 1.5, vy: -1.2 });
        if (enemyHero.hp <= 0) {
          enemyHero.isDead = true;
          enemyHero.respawnTimer = 340;
          hero.kills++;
          hero.gold += 220;
          addXp(320);
          showBanner("DAWNING LIGHT SNIPE!", "Xavier dushmanni uzoqdan nishonga oldi!", "#38bdf8");
        }
      }

      minions.forEach(m => {
        if (m.team === 'enemy' && pToLine(m.x, m.y, hero.x, hero.y, x2, y2) < 35) {
          m.hp -= dmg; m.hitFlash = 10;
          floatTexts.push({ text: "-" + Math.round(dmg), x: m.x, y: m.y - 20, color: "#38bdf8", alpha: 1.2, vy: -1 });
        }
      });

      jungles.forEach(j => {
        if (!j.isDead && pToLine(j.x, j.y, hero.x, hero.y, x2, y2) < 40) {
          j.hp -= dmg; j.hitFlash = 10;
          floatTexts.push({ text: "-" + Math.round(dmg), x: j.x, y: j.y - 25, color: "#38bdf8", alpha: 1.2, vy: -1 });
        }
      });

      turrets.forEach(t => {
        if (t.team === 'enemy' && !t.isDestroyed && pToLine(t.x, t.y, hero.x, hero.y, x2, y2) < 45) {
          t.hp -= dmg * 0.7;
          floatTexts.push({ text: "-" + Math.round(dmg * 0.7), x: t.x, y: t.y - 45, color: "#38bdf8", alpha: 1.2, vy: -1 });
        }
      });

      createParticles(hero.x, hero.y, "#38bdf8", 28);
    }

    function pToLine(px, py, x1, y1, x2, y2) {
      const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    }

    function createParticles(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const spd = 2 + Math.random() * 4;
        const a = Math.random() * Math.PI * 2;
        particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, radius: 2 + Math.random() * 3, color, alpha: 1, decay: 0.035 });
      }
    }

    function update() {
      frameCount++;
      if (frameCount % 60 === 0) {
        gameSeconds++;
        const m = Math.floor(gameSeconds / 60).toString().padStart(2, '0');
        const s = (gameSeconds % 60).toString().padStart(2, '0');
        document.getElementById("timerVal").textContent = m + ":" + s;
        if (hero.activeBuffs.some(b => b.type === 'gold')) hero.gold += 5;
      }

      waveTimer--;
      if (waveTimer <= 0) { spawnWave(); waveTimer = 950; }

      if (bannerTimer > 0) {
        bannerTimer--;
        if (bannerTimer <= 0) document.getElementById("announcementBanner").classList.remove("active");
      }

      for (let i = hero.activeBuffs.length - 1; i >= 0; i--) {
        hero.activeBuffs[i].duration--;
        if (hero.activeBuffs[i].duration <= 0) hero.activeBuffs.splice(i, 1);
      }
      if (frameCount % 30 === 0) renderBuffsUI();

      let mx = 0, my = 0;
      if (keys.w || keys.ArrowUp) my -= 1;
      if (keys.s || keys.ArrowDown) my += 1;
      if (keys.a || keys.ArrowLeft) mx -= 1;
      if (keys.d || keys.ArrowRight) mx += 1;

      const hasGold = hero.activeBuffs.some(b => b.type === 'gold');
      const accel = hero.accel * (hasGold ? 1.25 : 1.0);

      if (mx !== 0 || my !== 0) {
        const inv = 1 / Math.hypot(mx, my);
        hero.vx += mx * inv * accel;
        hero.vy += my * inv * accel;
        hero.angle = Math.atan2(my, mx);
      } else if (hero.moveTarget) {
        const dx = hero.moveTarget.x - hero.x;
        const dy = hero.moveTarget.y - hero.y;
        const d = Math.hypot(dx, dy);
        if (d > 6) {
          hero.vx += (dx / d) * accel;
          hero.vy += (dy / d) * accel;
          hero.angle = Math.atan2(dy, dx);
        } else {
          hero.moveTarget = null;
        }
      }

      hero.vx *= hero.friction; hero.vy *= hero.friction;
      hero.x += hero.vx; hero.y += hero.vy;
      hero.x = Math.max(50, Math.min(WORLD_W - 50, hero.x));
      hero.y = Math.max(60, Math.min(WORLD_H - 50, hero.y));

      for (let k in hero.cooldowns) { if (hero.cooldowns[k] > 0) hero.cooldowns[k]--; }
      const hasBlue = hero.activeBuffs.some(b => b.type === 'blue');
      if (hero.mp < hero.maxMp) hero.mp = Math.min(hero.maxMp, hero.mp + (hasBlue ? 0.65 : 0.28));
      if (hero.hitFlash > 0) hero.hitFlash--;

      // Jungle AI
      for (const j of jungles) {
        if (j.isDead) {
          j.respawn--;
          if (j.respawn <= 0) {
            j.isDead = false; j.hp = j.maxHp;
            floatTexts.push({ text: j.name + " qaytdi!", x: j.x, y: j.y - 25, color: j.color, alpha: 1.2, vy: -1 });
          }
          continue;
        }
        if (j.hitFlash > 0) j.hitFlash--;
        if (j.cd > 0) j.cd--;

        if (Math.hypot(hero.x - j.x, hero.y - j.y) < j.range + 25 && j.cd <= 0) {
          j.cd = 65;
          let dmg = j.damage;
          hero.hp = Math.max(0, hero.hp - dmg);
          hero.hitFlash = 7;
          floatTexts.push({ text: "-" + dmg, x: hero.x, y: hero.y - 25, color: j.color, alpha: 1, vy: -1 });
          sounds.playHit();
        }

        if (j.hp <= 0 && !j.isDead) {
          j.isDead = true; j.hp = 0; j.respawn = 480;
          createParticles(j.x, j.y, j.color, 25);
          hero.gold += j.gold;
          addXp(j.xp);
          applyBuff(j.type, j.buffDuration);
        }
      }

      // Minionlar
      for (let i = minions.length - 1; i >= 0; i--) {
        const m = minions[i];
        if (m.hitFlash > 0) m.hitFlash--;
        if (m.cd > 0) m.cd--;

        let target = null; let bestDist = m.range + 70;
        for (const other of minions) {
          if (other.team !== m.team && other.hp > 0) {
            const d = Math.hypot(other.x - m.x, other.y - m.y);
            if (d < bestDist) { bestDist = d; target = other; }
          }
        }
        if (m.team === 'enemy') {
          const dToP = Math.hypot(hero.x - m.x, hero.y - m.y);
          if (dToP < bestDist) { bestDist = dToP; target = hero; }
        } else if (enemyHero && !enemyHero.isDead) {
          const dToE = Math.hypot(enemyHero.x - m.x, enemyHero.y - m.y);
          if (dToE < bestDist) { bestDist = dToE; target = enemyHero; }
        }
        for (const t of turrets) {
          if (t.team !== m.team && !t.isDestroyed) {
            const dToT = Math.hypot(t.x - m.x, t.y - m.y);
            if (dToT < bestDist) { bestDist = dToT; target = t; }
          }
        }

        if (target) {
          const dx = target.x - m.x; const dy = target.y - m.y; const dist = Math.hypot(dx, dy);
          m.angle = Math.atan2(dy, dx);
          if (dist > m.range) {
            m.x += (dx / dist) * m.speed; m.y += (dy / dist) * m.speed;
          } else if (m.cd <= 0) {
            m.cd = 55;
            if (m.type === 'ranged') {
              projectiles.push({ team: m.team, x: m.x, y: m.y - 8, vx: (dx / dist) * 7.5, vy: (dy / dist) * 7.5, radius: 5, color: m.team === 'allied' ? "#60a5fa" : "#f87171", damage: m.damage, range: 220, dist: 0 });
            } else {
              target.hp -= m.damage;
              if ('hitFlash' in target) target.hitFlash = 6;
              floatTexts.push({ text: "-" + m.damage, x: target.x, y: target.y - 18, color: m.team === 'allied' ? "#93c5fd" : "#fca5a5", alpha: 1, vy: -0.8 });
              sounds.playHit();
            }
          }
        } else {
          const wp = MID_LANE[m.waypoint];
          if (wp) {
            const dx = wp.x - m.x; const dy = wp.y - m.y; const dist = Math.hypot(dx, dy);
            if (dist > 15) {
              m.x += (dx / dist) * m.speed; m.y += (dy / dist) * m.speed; m.angle = Math.atan2(dy, dx);
            } else {
              if (m.team === 'allied') { if (m.waypoint < MID_LANE.length - 1) m.waypoint++; }
              else { if (m.waypoint > 0) m.waypoint--; }
            }
          }
        }

        if (m.hp <= 0) {
          createParticles(m.x, m.y, m.color, 10);
          if (m.team === 'enemy') { hero.gold += m.gold; addXp(m.xp); }
          minions.splice(i, 1);
        }
      }

      // Zilong (Bot)
      if (enemyHero) {
        if (enemyHero.isDead) {
          enemyHero.respawnTimer--;
          if (enemyHero.respawnTimer <= 0) {
            enemyHero.isDead = false; enemyHero.hp = enemyHero.maxHp;
            enemyHero.x = enemyHero.spawnX; enemyHero.y = enemyHero.spawnY;
            floatTexts.push({ text: "Zilong qaytdi!", x: enemyHero.x, y: enemyHero.y - 30, color: "#f87171", alpha: 1.2, vy: -1 });
          }
        } else {
          if (enemyHero.hitFlash > 0) enemyHero.hitFlash--;
          if (enemyHero.attackCd > 0) enemyHero.attackCd--;
          const dx = hero.x - enemyHero.x; const dy = hero.y - enemyHero.y; const dist = Math.hypot(dx, dy);
          enemyHero.angle = Math.atan2(dy, dx);

          if (dist < 320 && dist > 45) {
            enemyHero.x += (dx / dist) * enemyHero.speed; enemyHero.y += (dy / dist) * enemyHero.speed;
          } else if (dist <= 45 && enemyHero.attackCd <= 0) {
            enemyHero.attackCd = 50;
            let dmg = enemyHero.damage;
            hero.hp = Math.max(0, hero.hp - dmg);
            hero.hitFlash = 8;
            floatTexts.push({ text: "-" + dmg, x: hero.x, y: hero.y - 25, color: "#ef4444", alpha: 1, vy: -1 });
            sounds.playHit();
            if (hero.hp <= 0) {
              hero.deaths++;
              document.getElementById("deathsVal").textContent = hero.deaths;
              hero.hp = hero.maxHp; hero.x = 130; hero.y = 450;
              showBanner("MAG'LUB BO'LDINGIZ!", "Bazada qayta tirildingiz!", "#ef4444");
            }
          }
        }
      }

      // Minoralar (Turret AI)
      for (const t of turrets) {
        if (t.isDestroyed) continue;
        t.crystalAngle += 0.035;
        if (t.cd > 0) t.cd--;

        if (t.cd <= 0) {
          let target = null; let bestD = t.range;
          for (const m of minions) {
            if (m.team !== t.team && m.hp > 0) {
              const d = Math.hypot(m.x - t.x, m.y - t.y);
              if (d < bestD) { bestD = d; target = m; }
            }
          }
          if (!target) {
            if (t.team === 'enemy') {
              const dToP = Math.hypot(hero.x - t.x, hero.y - t.y);
              if (dToP < bestD) target = hero;
            } else if (enemyHero && !enemyHero.isDead) {
              const dToE = Math.hypot(enemyHero.x - t.x, enemyHero.y - t.y);
              if (dToE < bestD) target = enemyHero;
            }
          }

          if (target) {
            t.cd = 75;
            const a = Math.atan2(target.y - t.y, target.x - t.x);
            projectiles.push({ team: t.team, x: t.x, y: t.y - t.height * 0.7, vx: Math.cos(a) * 9.5, vy: Math.sin(a) * 9.5, radius: 9, color: t.team === 'allied' ? "#38bdf8" : "#ef4444", damage: t.damage, range: t.range + 30, dist: 0 });
            sounds.playTowerBeam();
          }
        }

        if (t.hp <= 0 && !t.isDestroyed) {
          t.isDestroyed = true; t.hp = 0;
          createParticles(t.x, t.y, t.team === 'allied' ? "#3b82f6" : "#ef4444", 45);
          if (t.team === 'enemy') {
            hero.gold += 350; addXp(400);
            if (t.type === 'base') { showBanner("G'ALABA (VICTORY)!", "Dushman bazasi vayron qilindi!", "#10b981"); sounds.playVictory(); }
            else { showBanner("MINORA QULATILDI!", "Dushman minorasi yo'q qilindi! (+350 Gold)", "#f59e0b"); }
          } else {
            showBanner(t.type === 'base' ? "MAG'LUBIYAT!" : "MINORA BOY BERILDI!", "Ittifoqchi bino quladi!", "#ef4444");
          }
        }
      }

      // Mystic Fields (Xavier W Skill)
      for (let i = mysticFields.length - 1; i >= 0; i--) {
        const f = mysticFields[i];
        f.duration--;
        if (!f.isTriggered) {
          let trg = false;
          if (enemyHero && !enemyHero.isDead && Math.hypot(enemyHero.x - f.x, enemyHero.y - f.y) < f.radius + enemyHero.radius) trg = true;
          if (!trg) {
            for (const m of minions) {
              if (m.team === 'enemy' && Math.hypot(m.x - f.x, m.y - f.y) < f.radius + m.radius) { trg = true; break; }
            }
          }
          if (trg) {
            f.isTriggered = true; f.radius = f.maxRadius;
            createParticles(f.x, f.y, "#a855f7", 20);
            const dmg = hero.attackDamage * 2.2;
            if (enemyHero && !enemyHero.isDead && Math.hypot(enemyHero.x - f.x, enemyHero.y - f.y) < f.maxRadius) {
              enemyHero.hp -= dmg; enemyHero.hitFlash = 10;
              floatTexts.push({ text: "-" + Math.round(dmg), x: enemyHero.x, y: enemyHero.y - 25, color: "#c084fc", alpha: 1, vy: -1 });
            }
            minions.forEach(m => {
              if (m.team === 'enemy' && Math.hypot(m.x - f.x, m.y - f.y) < f.maxRadius) {
                m.hp -= dmg; m.hitFlash = 8;
                floatTexts.push({ text: "-" + Math.round(dmg), x: m.x, y: m.y - 20, color: "#c084fc", alpha: 1, vy: -0.8 });
              }
            });
          }
        }
        if (f.duration <= 0) mysticFields.splice(i, 1);
      }

      // Laser Beams
      for (let i = laserBeams.length - 1; i >= 0; i--) {
        laserBeams[i].alpha -= 0.05;
        laserBeams[i].width *= 0.92;
        if (laserBeams[i].alpha <= 0) laserBeams.splice(i, 1);
      }

      // Snaryadlar to'qnashuvi
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx; p.y += p.vy; p.dist += Math.hypot(p.vx, p.vy);

        let hit = false;
        if (p.team === 'allied') {
          if (enemyHero && !enemyHero.isDead && Math.hypot(p.x - enemyHero.x, p.y - enemyHero.y) < p.radius + enemyHero.radius) {
            enemyHero.hp -= p.damage; enemyHero.hitFlash = 8;
            hit = !p.isPenetrating;
            floatTexts.push({ text: "-" + Math.round(p.damage), x: enemyHero.x, y: enemyHero.y - 25, color: p.color, alpha: 1, vy: -1 });
            createParticles(enemyHero.x, enemyHero.y, p.color, 8);
            sounds.playHit();
            if (enemyHero.hp <= 0) {
              enemyHero.isDead = true; enemyHero.respawnTimer = 320;
              hero.kills++; hero.gold += enemyHero.goldReward;
              addXp(enemyHero.xpReward);
              showBanner("FIRST BLOOD!", "Zilong yo'q qilindi! (+200 Gold)", "#fbbf24");
            }
          }

          if (!hit) {
            for (const j of jungles) {
              if (!j.isDead && Math.hypot(p.x - j.x, p.y - j.y) < p.radius + j.radius) {
                j.hp -= p.damage; j.hitFlash = 8;
                hit = !p.isPenetrating;
                floatTexts.push({ text: "-" + Math.round(p.damage), x: j.x, y: j.y - 20, color: p.color, alpha: 1, vy: -0.8 });
                createParticles(j.x, j.y, p.color, 7);
                sounds.playHit();
                break;
              }
            }
          }

          if (!hit) {
            for (const m of minions) {
              if (m.team === 'enemy' && Math.hypot(p.x - m.x, p.y - m.y) < p.radius + m.radius) {
                m.hp -= p.damage; m.hitFlash = 8;
                hit = !p.isPenetrating;
                floatTexts.push({ text: "-" + Math.round(p.damage), x: m.x, y: m.y - 20, color: p.color, alpha: 1, vy: -0.8 });
                createParticles(m.x, m.y, p.color, 6);
                sounds.playHit();
                break;
              }
            }
          }

          if (!hit) {
            for (const t of turrets) {
              if (t.team === 'enemy' && !t.isDestroyed && Math.hypot(p.x - t.x, p.y - t.y) < p.radius + t.radius) {
                t.hp -= p.damage; hit = !p.isPenetrating;
                floatTexts.push({ text: "-" + Math.round(p.damage), x: t.x, y: t.y - 40, color: p.color, alpha: 1, vy: -1 });
                createParticles(t.x, t.y, p.color, 8);
                sounds.playHit();
                break;
              }
            }
          }
        } else if (p.team === 'enemy') {
          if (Math.hypot(p.x - hero.x, p.y - hero.y) < p.radius + hero.radius) {
            hit = true;
            let dmg = Math.round(p.damage);
            hero.hp = Math.max(0, hero.hp - dmg);
            hero.hitFlash = 8;
            floatTexts.push({ text: "-" + dmg, x: hero.x, y: hero.y - 25, color: "#ef4444", alpha: 1, vy: -1 });
            createParticles(hero.x, hero.y, "#ef4444", 8);
            sounds.playHit();
            if (hero.hp <= 0) {
              hero.deaths++;
              document.getElementById("deathsVal").textContent = hero.deaths;
              hero.hp = hero.maxHp; hero.x = 130; hero.y = 450;
              showBanner("MAG'LUB BO'LDINGIZ!", "Bazada qayta tirildingiz!", "#ef4444");
            }
          }
          if (!hit) {
            for (const m of minions) {
              if (m.team === 'allied' && Math.hypot(p.x - m.x, p.y - m.y) < p.radius + m.radius) {
                m.hp -= p.damage; m.hitFlash = 8; hit = true;
                floatTexts.push({ text: "-" + Math.round(p.damage), x: m.x, y: m.y - 20, color: "#ef4444", alpha: 1, vy: -0.8 });
                createParticles(m.x, m.y, "#ef4444", 6);
                break;
              }
            }
          }
          if (!hit) {
            for (const t of turrets) {
              if (t.team === 'allied' && !t.isDestroyed && Math.hypot(p.x - t.x, p.y - t.y) < p.radius + t.radius) {
                t.hp -= p.damage; hit = true;
                floatTexts.push({ text: "-" + Math.round(p.damage), x: t.x, y: t.y - 40, color: "#ef4444", alpha: 1, vy: -1 });
                createParticles(t.x, t.y, "#ef4444", 8);
                break;
              }
            }
          }
        }

        if (hit || p.dist >= p.range || p.x < 40 || p.x > WORLD_W - 40) {
          projectiles.splice(i, 1);
        }
      }

      for (let i = slashes.length - 1; i >= 0; i--) {
        slashes[i].life++;
        if (slashes[i].life >= slashes[i].maxLife) slashes.splice(i, 1);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx; pt.y += pt.vy; pt.alpha -= pt.decay;
        if (pt.alpha <= 0) particles.splice(i, 1);
      }
      for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.y += ft.vy; ft.alpha -= 0.025;
        if (ft.alpha <= 0) floatTexts.splice(i, 1);
      }
      if (clickRipple) {
        clickRipple.radius += 1.4; clickRipple.alpha -= 0.05;
        if (clickRipple.alpha <= 0) clickRipple = null;
      }

      document.getElementById("hpBar").style.width = Math.max(0, (hero.hp / hero.maxHp) * 100) + "%";
      document.getElementById("mpBar").style.width = Math.max(0, (hero.mp / hero.maxMp) * 100) + "%";
      document.getElementById("xpBar").style.width = Math.max(0, (hero.xp / hero.maxXp) * 100) + "%";
      document.getElementById("goldVal").textContent = hero.gold;
      document.getElementById("killsVal").textContent = hero.kills;

      updateCdBtn("cdSkill1", hero.cooldowns.skill1);
      updateCdBtn("cdSkill2", hero.cooldowns.skill2);
      updateCdBtn("cdSkill3", hero.cooldowns.skill3);
    }

    function updateCdBtn(id, cd) {
      const el = document.getElementById(id);
      if (cd > 0) {
        el.style.display = "flex";
        el.textContent = (cd / 60).toFixed(1) + "s";
      } else {
        el.style.display = "none";
      }
    }

    function draw() {
      ctx.clearRect(0, 0, WORLD_W, WORLD_H);
      ctx.fillStyle = "#070e1a";
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);

      // Mid Lane
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(30, 520); ctx.lineTo(210, 560); ctx.lineTo(WORLD_W - 20, 190); ctx.lineTo(WORLD_W - 150, 70); ctx.lineTo(720, 50); ctx.lineTo(30, 410); ctx.closePath();
      const g = ctx.createLinearGradient(100, 500, 850, 140);
      g.addColorStop(0, "#162540"); g.addColorStop(0.5, "#1e293b"); g.addColorStop(1, "#3b1717");
      ctx.fillStyle = g; ctx.fill();

      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(30, 410); ctx.lineTo(WORLD_W - 150, 70); ctx.stroke();
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.beginPath(); ctx.moveTo(210, 560); ctx.lineTo(WORLD_W - 20, 190); ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"; ctx.lineWidth = 2; ctx.setLineDash([12, 16]);
      ctx.beginPath(); ctx.moveTo(120, 460); ctx.lineTo(860, 130); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();

      // Daryo
      ctx.save();
      ctx.beginPath(); ctx.moveTo(370, 0); ctx.lineTo(590, WORLD_H);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.12)"; ctx.lineWidth = 68; ctx.stroke();
      ctx.restore();

      // O'rmon zonalari
      jungles.forEach(j => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(j.x, j.y, j.radius * 2.2, j.radius * 2.2 * ISO_Y, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
        ctx.fill();
        ctx.strokeStyle = j.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 8]);
        ctx.stroke();
        ctx.restore();
      });

      // Minoralar
      turrets.forEach(drawTurret);

      // Mystic Fields
      mysticFields.forEach(f => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.radius, f.radius * ISO_Y, 0, 0, Math.PI * 2);
        ctx.fillStyle = f.isTriggered ? "rgba(168, 85, 247, 0.35)" : "rgba(168, 85, 247, 0.18)";
        ctx.fill();
        ctx.strokeStyle = f.color;
        ctx.lineWidth = f.isTriggered ? 3 : 2;
        ctx.stroke();
        ctx.restore();
      });

      // Laser Beams
      laserBeams.forEach(b => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.strokeStyle = b.color;
        ctx.globalAlpha = Math.max(0, b.alpha);
        ctx.lineWidth = b.width;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = b.width * 0.4;
        ctx.stroke();
        ctx.restore();
      });

      // Click ripple
      if (clickRipple) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(clickRipple.x, clickRipple.y, clickRipple.radius, clickRipple.radius * ISO_Y, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, " + clickRipple.alpha + ")";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Slashes
      slashes.forEach(s => {
        ctx.save();
        const p = s.life / s.maxLife;
        ctx.globalAlpha = 1 - p;
        if (s.isRing) {
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * p, s.radius * p * ISO_Y, 0, 0, Math.PI * 2);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 6 * (1 - p);
          ctx.stroke();
        } else {
          ctx.translate(s.x, s.y);
          ctx.rotate(s.angle);
          ctx.beginPath();
          ctx.arc(0, 0, s.radius, -Math.PI / 3, Math.PI / 3);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 5 * (1 - p);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Snaryadlar
      projectiles.forEach(p => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      });

      // Jungle Monsters
      jungles.forEach(drawJungleMonster);

      // Minionlar
      minions.forEach(drawMinion);

      // Zilong (Bot)
      if (enemyHero && !enemyHero.isDead) {
        drawCharacter(enemyHero.x, enemyHero.y, enemyHero.radius, enemyHero.height, enemyHero.color, enemyHero.angle, enemyHero.hitFlash > 0, enemyHero.name, enemyHero.hp, enemyHero.maxHp, false);
      }

      // Xavier
      drawCharacter(hero.x, hero.y, hero.radius, 38, "#0284c7", hero.angle, hero.hitFlash > 0, "Xavier Lv." + hero.level, hero.hp, hero.maxHp, true, hero.activeBuffs);

      // Zarrachalar
      particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Suzuvchi matnlar
      floatTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      drawMinimap();
    }

    function drawTurret(t) {
      ctx.save();
      const isAllied = t.team === 'allied';
      const baseCol = isAllied ? "#1e3a8a" : "#7f1d1d";
      const lightCol = isAllied ? "#60a5fa" : "#f87171";

      if (t.isDestroyed) {
        ctx.beginPath();
        ctx.ellipse(t.x, t.y + 4, t.radius * 0.9, t.radius * 0.9 * ISO_Y, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
        ctx.fill();
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Vayron bo'ldi", t.x, t.y - 10);
        ctx.restore();
        return;
      }

      ctx.beginPath();
      ctx.ellipse(t.x, t.y, t.range, t.range * ISO_Y, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isAllied ? "rgba(59, 130, 246, 0.15)" : "rgba(239, 68, 68, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(t.x, t.y + 8, t.radius * 1.1, t.radius * 1.1 * ISO_Y, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(t.x, t.y, t.radius, t.radius * ISO_Y, 0, 0, Math.PI * 2);
      ctx.fillStyle = baseCol;
      ctx.fill();
      ctx.strokeStyle = lightCol;
      ctx.lineWidth = 2;
      ctx.stroke();

      const colW = t.type === 'base' ? 28 : 20;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(t.x - colW / 2, t.y - t.height, colW, t.height);

      const cryY = t.y - t.height - 14 + Math.sin(t.crystalAngle * 2) * 4;
      ctx.save();
      ctx.translate(t.x, cryY);
      ctx.rotate(t.crystalAngle);
      ctx.beginPath();
      ctx.moveTo(0, -14); ctx.lineTo(9, 0); ctx.lineTo(0, 14); ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fillStyle = lightCol;
      ctx.shadowColor = lightCol;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();

      const barW = t.type === 'base' ? 56 : 46;
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(t.x - barW / 2, t.y - t.height - 30, barW, 5);
      ctx.fillStyle = isAllied ? "#3b82f6" : "#ef4444";
      ctx.fillRect(t.x - barW / 2, t.y - t.height - 30, Math.max(0, (t.hp / t.maxHp) * barW), 5);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.name, t.x, t.y - t.height - 36);

      ctx.restore();
    }

    function drawJungleMonster(j) {
      if (j.isDead) return;
      ctx.save();
      const bodyY = j.y - j.height * 0.5;

      ctx.beginPath();
      ctx.ellipse(j.x, j.y + 4, j.radius * 1.1, j.radius * 1.1 * ISO_Y, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(j.x, bodyY, j.radius, 0, Math.PI * 2);
      if (j.hitFlash > 0) {
        ctx.fillStyle = "#ffffff";
      } else {
        const g = ctx.createRadialGradient(j.x - 5, bodyY - 5, 2, j.x, bodyY, j.radius);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.4, j.color);
        g.addColorStop(1, "#0f172a");
        ctx.fillStyle = g;
      }
      ctx.fill();
      ctx.strokeStyle = j.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const icon = j.type === 'blue' ? "🔷" : (j.type === 'red' ? "🔥" : "💰");
      ctx.fillText(icon, j.x, bodyY);

      const barW = j.radius * 2.4;
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

    function drawMinion(m) {
      ctx.save();
      const isAllied = m.team === 'allied';
      const bodyY = m.y - m.height * 0.5;

      ctx.beginPath();
      ctx.ellipse(m.x, m.y + 2, m.radius * 0.9, m.radius * 0.9 * ISO_Y, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(m.x, bodyY, m.radius, 0, Math.PI * 2);
      ctx.fillStyle = m.hitFlash > 0 ? "#ffffff" : (isAllied ? "#2563eb" : "#dc2626");
      ctx.fill();
      ctx.strokeStyle = isAllied ? "#93c5fd" : "#fca5a5";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const barW = 26;
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(m.x - barW / 2, bodyY - m.radius - 8, barW, 3.5);
      ctx.fillStyle = isAllied ? "#10b981" : "#ef4444";
      ctx.fillRect(m.x - barW / 2, bodyY - m.radius - 8, Math.max(0, (m.hp / m.maxHp) * barW), 3.5);
      ctx.restore();
    }

    function drawCharacter(x, y, radius, height, color, angle, isHit, name, hp, maxHp, isPlayer, activeBuffs) {
      ctx.save();
      const bodyY = y - height * 0.5;

      ctx.beginPath();
      ctx.ellipse(x, y + 4, radius * 0.95, radius * 0.95 * ISO_Y, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fill();

      if (isPlayer && activeBuffs && activeBuffs.length > 0) {
        activeBuffs.forEach((b, idx) => {
          ctx.beginPath();
          ctx.ellipse(x, bodyY, radius + 6 + idx * 4, (radius + 6 + idx * 4) * ISO_Y, 0, 0, Math.PI * 2);
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      ctx.beginPath();
      ctx.arc(x, bodyY, radius, 0, Math.PI * 2);
      if (isHit) {
        ctx.fillStyle = "#ffffff";
      } else {
        const g = ctx.createRadialGradient(x - 5, bodyY - 6, 2, x, bodyY, radius);
        if (isPlayer) {
          g.addColorStop(0, "#bae6fd"); g.addColorStop(0.5, "#0ea5e9"); g.addColorStop(1, "#0369a1");
        } else {
          g.addColorStop(0, "#fca5a5"); g.addColorStop(0.6, color); g.addColorStop(1, "#450a0a");
        }
        ctx.fillStyle = g;
      }
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isPlayer ? "#7dd3fc" : "#fca5a5";
      ctx.stroke();

      ctx.save();
      ctx.translate(x, bodyY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(radius - 2, -3); ctx.lineTo(radius + 16, 0); ctx.lineTo(radius - 2, 3);
      ctx.fillStyle = isPlayer ? "#ffffff" : "#fecaca";
      ctx.shadowColor = isPlayer ? "#38bdf8" : "#ef4444";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      const barW = radius * 2.4;
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(x - barW / 2, bodyY - radius - 15, barW, 5);
      ctx.fillStyle = isPlayer ? "#10b981" : "#ef4444";
      ctx.fillRect(x - barW / 2, bodyY - radius - 15, Math.max(0, (hp / maxHp) * barW), 5);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name, x, bodyY - radius - 18);
      ctx.restore();
    }

    function drawMinimap() {
      mmCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
      const sx = minimapCanvas.width / WORLD_W;
      const sy = minimapCanvas.height / WORLD_H;

      mmCtx.fillStyle = "rgba(15, 23, 42, 0.95)";
      mmCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

      mmCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      mmCtx.lineWidth = 3;
      mmCtx.beginPath();
      mmCtx.moveTo(120 * sx, 460 * sy);
      mmCtx.lineTo(860 * sx, 130 * sy);
      mmCtx.stroke();

      turrets.forEach(t => {
        if (t.isDestroyed) return;
        mmCtx.fillStyle = t.team === 'allied' ? "#3b82f6" : "#ef4444";
        mmCtx.fillRect(t.x * sx - 3, t.y * sy - 3, 6, 6);
      });

      jungles.forEach(j => {
        if (j.isDead) return;
        mmCtx.fillStyle = j.color;
        mmCtx.beginPath();
        mmCtx.arc(j.x * sx, j.y * sy, 3, 0, Math.PI * 2);
        mmCtx.fill();
      });

      minions.forEach(m => {
        mmCtx.fillStyle = m.team === 'allied' ? "#60a5fa" : "#f87171";
        mmCtx.beginPath();
        mmCtx.arc(m.x * sx, m.y * sy, 1.8, 0, Math.PI * 2);
        mmCtx.fill();
      });

      if (enemyHero && !enemyHero.isDead) {
        mmCtx.fillStyle = "#ef4444";
        mmCtx.beginPath();
        mmCtx.arc(enemyHero.x * sx, enemyHero.y * sy, 3.5, 0, Math.PI * 2);
        mmCtx.fill();
      }

      mmCtx.fillStyle = "#38bdf8";
      mmCtx.beginPath();
      mmCtx.arc(hero.x * sx, hero.y * sy, 4, 0, Math.PI * 2);
      mmCtx.fill();
    }

    let lastTime = performance.now();
    let frames = 0;
    function gameLoop(time) {
      update();
      draw();
      frames++;
      if (time - lastTime >= 1000) {
        document.getElementById("fpsVal").textContent = frames;
        frames = 0;
        lastTime = time;
      }
      requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
    showBanner("JANG BOSHLANDI!", "O'rmon maxluqlarini o'ldirib Buff oling!", "#38bdf8");
  </script>
</body>
</html>`;
