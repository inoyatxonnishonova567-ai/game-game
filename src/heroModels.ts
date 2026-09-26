/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createRuneCircleTexture } from './threeTextures.ts';

// Helper to create materials
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 });
const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.4 });
const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.8 });
const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
const redGlowMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

/**
 * 1. XAVIER 3D HERO MODEL (Defier of Light)
 * Detailed composite 3D character with cape, floating orb, shoulder crystals and glowing runes
 */
export function createXavierHeroModel(): {
  group: THREE.Group;
  orb: THREE.Mesh;
  cape: THREE.Mesh;
  runeRing: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
} {
  const group = new THREE.Group();

  // Root shadow disc / base
  const shadowGeo = new THREE.CircleGeometry(1.2, 16);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.05;
  group.add(shadowMesh);

  // Floating Rune Ring at feet
  const runeTex = createRuneCircleTexture('#38bdf8');
  const runeGeo = new THREE.PlaneGeometry(3.2, 3.2);
  const runeMat = new THREE.MeshBasicMaterial({
    map: runeTex,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const runeRing = new THREE.Mesh(runeGeo, runeMat);
  runeRing.rotation.x = -Math.PI / 2;
  runeRing.position.y = 0.08;
  group.add(runeRing);

  // Lower Body / Robe skirt (Cylinder conical)
  const robeGeo = new THREE.ConeGeometry(0.8, 1.6, 12, 1, true);
  const robeMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  const robe = new THREE.Mesh(robeGeo, robeMat);
  robe.position.y = 0.9;
  robe.castShadow = true;
  group.add(robe);

  // Torso / Arcane Chestplate (White & Gold trimmed)
  const torsoGeo = new THREE.BoxGeometry(0.85, 1.1, 0.55);
  const torso = new THREE.Mesh(torsoGeo, whiteMat);
  torso.position.y = 1.95;
  torso.castShadow = true;
  group.add(torso);

  // Gold belt buckle & sash
  const beltGeo = new THREE.BoxGeometry(0.9, 0.2, 0.6);
  const belt = new THREE.Mesh(beltGeo, goldMat);
  belt.position.y = 1.45;
  group.add(belt);

  // Chest gem / Arcane Core (Glowing Cyan)
  const gemGeo = new THREE.OctahedronGeometry(0.18);
  const gem = new THREE.Mesh(gemGeo, cyanGlowMat);
  gem.position.set(0, 2.05, 0.32);
  group.add(gem);

  // Cape / Robe Back (White with black trim and cyan lining)
  const capeGeo = new THREE.PlaneGeometry(1.0, 2.1, 4, 4);
  const capeMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 1.7, -0.35);
  cape.rotation.x = 0.12;
  cape.castShadow = true;
  group.add(cape);

  // Shoulders (Pauldrons with glowing tips)
  const pauldronGeo = new THREE.ConeGeometry(0.35, 0.6, 6);
  const leftPauldron = new THREE.Mesh(pauldronGeo, goldMat);
  leftPauldron.position.set(-0.6, 2.35, 0);
  leftPauldron.rotation.z = 0.5;
  group.add(leftPauldron);

  const rightPauldron = new THREE.Mesh(pauldronGeo, goldMat);
  rightPauldron.position.set(0.6, 2.35, 0);
  rightPauldron.rotation.z = -0.5;
  group.add(rightPauldron);

  // Shoulder crystals
  const crystalGeo = new THREE.ConeGeometry(0.12, 0.4, 4);
  const leftCrystal = new THREE.Mesh(crystalGeo, cyanGlowMat);
  leftCrystal.position.set(-0.65, 2.65, 0);
  group.add(leftCrystal);

  const rightCrystal = new THREE.Mesh(crystalGeo, cyanGlowMat);
  rightCrystal.position.set(0.65, 2.65, 0);
  group.add(rightCrystal);

  // Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.55, 2.1, 0);
  const armGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.9, 8);
  const lArmMesh = new THREE.Mesh(armGeo, blackMat);
  lArmMesh.position.y = -0.45;
  lArmMesh.castShadow = true;
  leftArm.add(lArmMesh);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.55, 2.1, 0);
  const rArmMesh = new THREE.Mesh(armGeo, blackMat);
  rArmMesh.position.y = -0.45;
  rArmMesh.castShadow = true;
  rightArm.add(rArmMesh);
  group.add(rightArm);

  // Head & Hair
  const headGeo = new THREE.SphereGeometry(0.3, 12, 12);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.6 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.65;
  head.castShadow = true;
  group.add(head);

  // Silver/White Hair
  const hairGeo = new THREE.ConeGeometry(0.42, 0.6, 8);
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 2.85, -0.05);
  hair.rotation.x = -0.25;
  group.add(hair);

  // Glowing Eyes (Cyan light visor)
  const eyesGeo = new THREE.BoxGeometry(0.32, 0.08, 0.1);
  const eyes = new THREE.Mesh(eyesGeo, cyanGlowMat);
  eyes.position.set(0, 2.68, 0.28);
  group.add(eyes);

  // Floating Mystic Orb (Hovers alongside Xavier)
  const orbGeo = new THREE.IcosahedronGeometry(0.32, 2);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.9,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.set(1.2, 2.2, 0.4);
  orb.castShadow = true;

  // Mini rings around the orb
  const orbRingGeo = new THREE.TorusGeometry(0.45, 0.03, 8, 24);
  const orbRing = new THREE.Mesh(orbRingGeo, cyanGlowMat);
  orb.add(orbRing);
  group.add(orb);

  group.scale.set(0.9, 0.9, 0.9);
  return { group, orb, cape, runeRing, leftArm, rightArm };
}

/**
 * 2. ZILONG / ENEMY HERO 3D MODEL
 * Fierce crimson armored warrior with dragon spear
 */
export function createEnemyHeroModel(): {
  group: THREE.Group;
  spear: THREE.Group;
} {
  const group = new THREE.Group();

  // Shadow
  const shadowGeo = new THREE.CircleGeometry(1.2, 16);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.05;
  group.add(shadow);

  // Armored legs
  const legGeo = new THREE.CylinderGeometry(0.18, 0.16, 1.2, 8);
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.7, roughness: 0.3 });
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });

  const leftLeg = new THREE.Mesh(legGeo, armorMat);
  leftLeg.position.set(-0.3, 0.6, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, armorMat);
  rightLeg.position.set(0.3, 0.6, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // Armored Torso
  const torsoGeo = new THREE.BoxGeometry(0.9, 1.15, 0.65);
  const torso = new THREE.Mesh(torsoGeo, armorMat);
  torso.position.y = 1.8;
  torso.castShadow = true;
  group.add(torso);

  // Golden Dragon Chest Crest
  const crestGeo = new THREE.OctahedronGeometry(0.25);
  const crest = new THREE.Mesh(crestGeo, goldTrimMat);
  crest.position.set(0, 1.9, 0.35);
  group.add(crest);

  // Spiked Pauldrons
  const pGeo = new THREE.ConeGeometry(0.4, 0.7, 5);
  const leftP = new THREE.Mesh(pGeo, goldTrimMat);
  leftP.position.set(-0.65, 2.2, 0);
  leftP.rotation.z = 0.7;
  group.add(leftP);

  const rightP = new THREE.Mesh(pGeo, goldTrimMat);
  rightP.position.set(0.65, 2.2, 0);
  rightP.rotation.z = -0.7;
  group.add(rightP);

  // Helmet with dragon horns & red plume
  const helmGeo = new THREE.BoxGeometry(0.65, 0.7, 0.65);
  const helm = new THREE.Mesh(helmGeo, armorMat);
  helm.position.y = 2.65;
  helm.castShadow = true;
  group.add(helm);

  // Glowing Red Visor
  const visorGeo = new THREE.BoxGeometry(0.4, 0.1, 0.1);
  const visor = new THREE.Mesh(visorGeo, redGlowMat);
  visor.position.set(0, 2.65, 0.34);
  group.add(visor);

  // Red Plume
  const plumeGeo = new THREE.ConeGeometry(0.2, 0.9, 6);
  const plumeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8 });
  const plume = new THREE.Mesh(plumeGeo, plumeMat);
  plume.position.set(0, 3.2, -0.2);
  plume.rotation.x = -0.4;
  group.add(plume);

  // Crimson Battle Cape
  const capeGeo = new THREE.PlaneGeometry(1.1, 2.0);
  const capeMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, side: THREE.DoubleSide });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 1.6, -0.4);
  cape.rotation.x = 0.15;
  cape.castShadow = true;
  group.add(cape);

  // Dragon Spear
  const spear = new THREE.Group();
  spear.position.set(0.7, 1.6, 0.3);
  const shaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.4, 8);
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.6 });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.castShadow = true;
  spear.add(shaft);

  // Spear tip (golden blade with glowing red core)
  const tipGeo = new THREE.ConeGeometry(0.22, 1.0, 4);
  const tip = new THREE.Mesh(tipGeo, goldTrimMat);
  tip.position.y = 1.9;
  spear.add(tip);

  const glowTipGeo = new THREE.ConeGeometry(0.12, 0.7, 4);
  const glowTip = new THREE.Mesh(glowTipGeo, redGlowMat);
  glowTip.position.y = 1.85;
  spear.add(glowTip);

  spear.rotation.x = Math.PI / 6;
  group.add(spear);

  group.scale.set(0.9, 0.9, 0.9);
  return { group, spear };
}

/**
 * 3. MINION 3D MODEL (Allied Melee/Ranged, Enemy Melee/Ranged)
 */
export function createMinionModel(team: 'allied' | 'enemy', type: 'melee' | 'ranged' | 'siege'): {
  group: THREE.Group;
  weapon: THREE.Mesh;
} {
  const group = new THREE.Group();
  const isAlly = team === 'allied';
  const mainColor = isAlly ? 0x2563eb : 0xdc2626;
  const trimColor = isAlly ? 0x60a5fa : 0xf87171;

  const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.4, metalness: 0.5 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, metalness: 0.7 });

  // Shadow
  const shadowGeo = new THREE.CircleGeometry(0.7, 12);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  group.add(shadow);

  // Cute armored mech torso
  const torsoGeo = new THREE.CylinderGeometry(0.42, 0.35, 0.85, 8);
  const torso = new THREE.Mesh(torsoGeo, bodyMat);
  torso.position.y = 0.75;
  torso.castShadow = true;
  group.add(torso);

  // Helmet/Head
  const headGeo = new THREE.SphereGeometry(0.35, 10, 10);
  const head = new THREE.Mesh(headGeo, trimMat);
  head.position.y = 1.35;
  head.castShadow = true;
  group.add(head);

  // Glowing Eye Visor
  const visorGeo = new THREE.BoxGeometry(0.36, 0.1, 0.15);
  const visorMat = new THREE.MeshBasicMaterial({ color: isAlly ? 0x38bdf8 : 0xfb7185 });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 1.35, 0.3);
  group.add(visor);

  let weapon: THREE.Mesh;
  if (type === 'melee') {
    // Shield
    const shieldGeo = new THREE.BoxGeometry(0.45, 0.7, 0.1);
    const shield = new THREE.Mesh(shieldGeo, trimMat);
    shield.position.set(-0.45, 0.75, 0.25);
    shield.castShadow = true;
    group.add(shield);

    // Sword
    const swordGeo = new THREE.BoxGeometry(0.1, 0.9, 0.05);
    weapon = new THREE.Mesh(swordGeo, trimMat);
    weapon.position.set(0.45, 0.8, 0.2);
    weapon.rotation.x = 0.4;
    weapon.castShadow = true;
    group.add(weapon);
  } else {
    // Ranged / Magic Cannon Orb
    const orbGeo = new THREE.SphereGeometry(0.25, 12, 12);
    weapon = new THREE.Mesh(orbGeo, visorMat);
    weapon.position.set(0.45, 0.9, 0.35);
    group.add(weapon);
  }

  group.scale.set(0.75, 0.75, 0.75);
  return { group, weapon };
}

/**
 * 4. 3D TURRET MODEL (High Fantasy Tower with Floating Crystal)
 */
export function createTurretModel(team: 'allied' | 'enemy', isBase: boolean = false): {
  group: THREE.Group;
  crystal: THREE.Mesh;
  light: THREE.PointLight;
} {
  const group = new THREE.Group();
  const isAlly = team === 'allied';
  const crystalColor = isAlly ? 0x38bdf8 : 0xef4444;
  const stoneColor = 0x1e293b;

  const stoneMat = new THREE.MeshStandardMaterial({ color: stoneColor, roughness: 0.8 });
  const metalMat = new THREE.MeshStandardMaterial({
    color: isAlly ? 0x1d4ed8 : 0x991b1b,
    roughness: 0.3,
    metalness: 0.8,
  });

  const baseScale = isBase ? 1.5 : 1.0;

  // Base tier 1 (Hexagonal Stone Steps)
  const tier1Geo = new THREE.CylinderGeometry(2.4 * baseScale, 2.8 * baseScale, 0.6, 6);
  const tier1 = new THREE.Mesh(tier1Geo, stoneMat);
  tier1.position.y = 0.3;
  tier1.receiveShadow = true;
  group.add(tier1);

  // Base tier 2
  const tier2Geo = new THREE.CylinderGeometry(1.8 * baseScale, 2.2 * baseScale, 0.8, 6);
  const tier2 = new THREE.Mesh(tier2Geo, metalMat);
  tier2.position.y = 0.9;
  tier2.receiveShadow = true;
  group.add(tier2);

  // Central Obelisk / Spire Column
  const colGeo = new THREE.CylinderGeometry(0.9 * baseScale, 1.4 * baseScale, 4.2 * baseScale, 6);
  const col = new THREE.Mesh(colGeo, stoneMat);
  col.position.y = 3.2 * baseScale;
  col.castShadow = true;
  col.receiveShadow = true;
  group.add(col);

  // Ornate Pillars & Claws
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const clawGeo = new THREE.ConeGeometry(0.3 * baseScale, 1.8 * baseScale, 4);
    const claw = new THREE.Mesh(clawGeo, metalMat);
    claw.position.set(
      Math.cos(angle) * 1.3 * baseScale,
      5.2 * baseScale,
      Math.sin(angle) * 1.3 * baseScale
    );
    claw.rotation.z = Math.cos(angle) * 0.3;
    claw.rotation.x = Math.sin(angle) * 0.3;
    claw.castShadow = true;
    group.add(claw);
  }

  // Floating Rotating Crystal
  const crystalGeo = new THREE.OctahedronGeometry(0.85 * baseScale, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: crystalColor,
    emissive: crystalColor,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.9,
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 6.2 * baseScale;
  crystal.castShadow = true;
  group.add(crystal);

  // Rotating Arcane Ring around crystal
  const ringGeo = new THREE.TorusGeometry(1.3 * baseScale, 0.08, 6, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: crystalColor });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  crystal.add(ring);

  // Dynamic point light
  const light = new THREE.PointLight(crystalColor, 2.5, 12 * baseScale);
  light.position.y = 6.2 * baseScale;
  group.add(light);

  return { group, crystal, light };
}

/**
 * 5. JUNGLE MONSTERS 3D MODELS
 */
export function createJungleMonsterModel(type: 'blue_buff' | 'red_buff' | 'crab' | 'turtle' | 'creep'): {
  group: THREE.Group;
} {
  const group = new THREE.Group();

  if (type === 'blue_buff') {
    // Blue Golem
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7, metalness: 0.3 });
    const crystalMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const bodyGeo = new THREE.DodecahedronGeometry(1.1);
    const body = new THREE.Mesh(bodyGeo, stoneMat);
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    // Glowing Crystals on back
    for (let i = 0; i < 5; i++) {
      const cGeo = new THREE.ConeGeometry(0.2, 0.8, 4);
      const c = new THREE.Mesh(cGeo, crystalMat);
      c.position.set((Math.random() - 0.5) * 0.9, 1.8 + Math.random() * 0.4, (Math.random() - 0.5) * 0.9);
      c.rotation.x = (Math.random() - 0.5) * 0.6;
      group.add(c);
    }
  } else if (type === 'red_buff') {
    // Red Fiend
    const fiendMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.4, metalness: 0.6 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2 });

    const bodyGeo = new THREE.DodecahedronGeometry(1.0);
    const body = new THREE.Mesh(bodyGeo, fiendMat);
    body.position.y = 1.2;
    body.castShadow = true;
    group.add(body);

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.25, 0.9, 5);
    const lHorn = new THREE.Mesh(hornGeo, hornMat);
    lHorn.position.set(-0.6, 2.1, 0.2);
    lHorn.rotation.z = 0.5;
    group.add(lHorn);

    const rHorn = new THREE.Mesh(hornGeo, hornMat);
    rHorn.position.set(0.6, 2.1, 0.2);
    rHorn.rotation.z = -0.5;
    group.add(rHorn);
  } else if (type === 'turtle') {
    // Ancient Turtle / Epic Monster
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.5, metalness: 0.5 });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

    const shellGeo = new THREE.SphereGeometry(1.6, 12, 10);
    shellGeo.scale(1.2, 0.6, 1.2);
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.y = 0.9;
    shell.castShadow = true;
    group.add(shell);

    // Shell spikes
    for (let i = 0; i < 6; i++) {
      const spGeo = new THREE.ConeGeometry(0.2, 0.6, 4);
      const sp = new THREE.Mesh(spGeo, runeMat);
      const a = (i * Math.PI * 2) / 6;
      sp.position.set(Math.cos(a) * 1.1, 1.2, Math.sin(a) * 1.1);
      group.add(sp);
    }
  } else {
    // Crab or Creep
    const mat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4, metalness: 0.7 });
    const geo = new THREE.SphereGeometry(0.7, 8, 8);
    geo.scale(1.2, 0.5, 0.9);
    const crab = new THREE.Mesh(geo, mat);
    crab.position.y = 0.45;
    crab.castShadow = true;
    group.add(crab);
  }

  return { group };
}
