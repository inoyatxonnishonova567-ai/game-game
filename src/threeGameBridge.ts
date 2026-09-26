/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import {
  initThreeArena,
  to3DPos,
  toWorldPos,
  type ThreeArenaInstance
} from './threeArena.ts';
import {
  createXavierHeroModel,
  createEnemyHeroModel,
  createTurretModel,
  createMinionModel,
  createJungleMonsterModel
} from './heroModels.ts';
import { ThreeVFXManager } from './threeVFX.ts';
import type {
  Player,
  EnemyBot,
  MinionUnit,
  TurretUnit,
  JungleMonster,
  Projectile
} from './types.ts';

export class ThreeGameBridge {
  public arena: ThreeArenaInstance;
  public vfx: ThreeVFXManager;

  // 3D Unit references
  public xavierMesh: ReturnType<typeof createXavierHeroModel>;
  public enemyHeroMesh: ReturnType<typeof createEnemyHeroModel>;
  public turretMeshes: Map<number, ReturnType<typeof createTurretModel>> = new Map();
  public jungleMeshes: Map<number, ReturnType<typeof createJungleMonsterModel>> = new Map();
  public minionMeshes: Map<number, ReturnType<typeof createMinionModel>> = new Map();
  public projectileMeshes: Map<number, THREE.Mesh> = new Map();

  private raycaster = new THREE.Raycaster();
  private mouseVec = new THREE.Vector2();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  constructor(container: HTMLDivElement, initialTurrets: TurretUnit[], initialJungles: JungleMonster[]) {
    this.arena = initThreeArena(container);
    this.vfx = new ThreeVFXManager(this.arena.scene);

    // 1. Xavier 3D Hero Model
    this.xavierMesh = createXavierHeroModel();
    this.arena.scene.add(this.xavierMesh.group);

    // 2. Enemy Hero (Zilong) 3D Model
    this.enemyHeroMesh = createEnemyHeroModel();
    this.arena.scene.add(this.enemyHeroMesh.group);

    // 3. Turrets (20 turrets)
    initialTurrets.forEach(t => {
      const turretModel = createTurretModel(t.team, t.type === 'base');
      const pos3D = to3DPos(t.x, t.y);
      turretModel.group.position.set(pos3D.x, 0, pos3D.z);
      this.arena.scene.add(turretModel.group);
      this.turretMeshes.set(t.id, turretModel);
    });

    // 4. Jungle Monsters
    initialJungles.forEach(j => {
      const jungleModel = createJungleMonsterModel(j.type);
      const pos3D = to3DPos(j.x, j.y);
      jungleModel.group.position.set(pos3D.x, 0, pos3D.z);
      this.arena.scene.add(jungleModel.group);
      this.jungleMeshes.set(j.id, jungleModel);
    });
  }

  // Raycast from screen click to 3D ground world coordinates
  public raycastGround(screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): { x: number; y: number } | null {
    this.mouseVec.x = (screenX / canvasWidth) * 2 - 1;
    this.mouseVec.y = -(screenY / canvasHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseVec, this.arena.camera);
    const targetPoint = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, targetPoint);
    if (hit) {
      return toWorldPos(hit.x, hit.z);
    }
    return null;
  }

  // Update loop for each frame
  public update(
    player: Player,
    enemyHero: EnemyBot | null,
    turrets: TurretUnit[],
    minions: MinionUnit[],
    jungles: JungleMonster[],
    projectiles: Projectile[],
    frameCount: number,
    deltaSec: number,
    screenShake: number = 0,
    isPlayerDead: boolean = false
  ) {
    // 1. Camera follows Xavier smoothly with isometric pitch & Screen Shake
    const player3D = to3DPos(player.x, player.y);
    const targetCamX = player3D.x;
    const targetCamZ = player3D.z + 26;
    const targetCamY = 32;

    // Screen Shake Offset
    let shakeX = 0;
    let shakeY = 0;
    let shakeZ = 0;
    if (screenShake > 0) {
      const traumaSq = Math.min(1.0, screenShake) * Math.min(1.0, screenShake);
      shakeX = (Math.random() * 2 - 1) * 1.8 * traumaSq;
      shakeY = (Math.random() * 2 - 1) * 1.4 * traumaSq;
      shakeZ = (Math.random() * 2 - 1) * 1.8 * traumaSq;
    }

    this.arena.camera.position.x += (targetCamX + shakeX - this.arena.camera.position.x) * 0.15;
    this.arena.camera.position.z += (targetCamZ + shakeZ - this.arena.camera.position.z) * 0.15;
    this.arena.camera.position.y += (targetCamY + shakeY - this.arena.camera.position.y) * 0.15;
    this.arena.camera.lookAt(player3D.x + shakeX * 0.5, 1.2 + shakeY * 0.5, player3D.z + shakeZ * 0.5);

    // Keep sunlight tracking player's general area for optimal shadow fidelity
    this.arena.dirLight.position.set(player3D.x + 35, 60, player3D.z + 30);
    this.arena.dirLight.target.position.set(player3D.x, 0, player3D.z);
    this.arena.dirLight.target.updateMatrixWorld();

    // 2. Xavier 3D Animations & Positioning
    if (isPlayerDead) {
      this.xavierMesh.group.visible = false;
    } else {
      this.xavierMesh.group.visible = true;
    }

    const isMoving = Math.hypot(player.vx, player.vy) > 0.1;
    this.xavierMesh.group.position.set(player3D.x, 0, player3D.z);
    this.xavierMesh.group.rotation.y = -player.angle - Math.PI / 2;

    // Walking animation (gentle stride bobbing)
    if (isMoving) {
      const bob = Math.sin(frameCount * 0.28) * 0.12;
      this.xavierMesh.group.position.y = Math.max(0, bob);
      this.xavierMesh.cape.rotation.x = 0.25 + Math.sin(frameCount * 0.3) * 0.18;
      this.xavierMesh.leftArm.rotation.x = Math.sin(frameCount * 0.28) * 0.4;
      this.xavierMesh.rightArm.rotation.x = -Math.sin(frameCount * 0.28) * 0.4;
    } else {
      this.xavierMesh.group.position.y = 0;
      this.xavierMesh.cape.rotation.x = 0.12 + Math.sin(frameCount * 0.05) * 0.04;
      this.xavierMesh.leftArm.rotation.x = 0;
      this.xavierMesh.rightArm.rotation.x = 0;
    }

    // Floating Mystic Orb orbit around Xavier
    const orbAngle = frameCount * 0.045;
    const orbDist = 1.35;
    this.xavierMesh.orb.position.set(
      Math.cos(orbAngle) * orbDist,
      2.1 + Math.sin(frameCount * 0.08) * 0.25,
      Math.sin(orbAngle) * orbDist
    );
    this.xavierMesh.orb.rotation.y += 0.03;
    this.xavierMesh.orb.rotation.x += 0.02;

    // Glowing Arcane Rune Ring at Xavier's feet
    this.xavierMesh.runeRing.rotation.z += 0.02;

    // Hit flash reaction
    if (player.hitFlash > 0) {
      this.xavierMesh.group.scale.set(0.95, 0.95, 0.95);
    } else {
      this.xavierMesh.group.scale.set(0.9, 0.9, 0.9);
    }

    // 3. Enemy Hero (Zilong) 3D Model
    if (enemyHero) {
      if (enemyHero.isDead) {
        this.enemyHeroMesh.group.visible = false;
      } else {
        this.enemyHeroMesh.group.visible = true;
        const enemy3D = to3DPos(enemyHero.x, enemyHero.y);
        this.enemyHeroMesh.group.position.set(enemy3D.x, 0, enemy3D.z);
        this.enemyHeroMesh.group.rotation.y = -enemyHero.angle - Math.PI / 2;

        // Walking & spear thrust animation
        if (enemyHero.attackCooldown > 35) {
          // Thrust
          this.enemyHeroMesh.spear.rotation.x = Math.PI / 2;
          this.enemyHeroMesh.spear.position.z = 0.8;
        } else {
          this.enemyHeroMesh.spear.rotation.x = Math.PI / 6;
          this.enemyHeroMesh.spear.position.z = 0.3;
        }
      }
    }

    // 4. Turrets (20 turrets)
    turrets.forEach(t => {
      const turretModel = this.turretMeshes.get(t.id);
      if (!turretModel) return;

      if (t.isDestroyed) {
        turretModel.crystal.visible = false;
        turretModel.light.intensity = 0;
      } else {
        turretModel.crystal.visible = true;
        turretModel.crystal.rotation.y += 0.03;
        turretModel.crystal.position.y = (t.type === 'base' ? 8.5 : 6.2) + Math.sin(frameCount * 0.04) * 0.3;
        turretModel.light.intensity = 2.5 + Math.sin(frameCount * 0.05) * 0.5;
      }
    });

    // 5. Jungle Monsters
    jungles.forEach(j => {
      const jModel = this.jungleMeshes.get(j.id);
      if (!jModel) return;
      jModel.group.visible = !j.isDead;
      if (!j.isDead) {
        jModel.group.position.y = Math.sin(frameCount * 0.05 + j.id) * 0.15;
      }
    });

    // 6. Minions 3D Sync (Add / Update / Remove)
    const activeMinionIds = new Set<number>();
    minions.forEach(m => {
      if (m.isDead) return;
      activeMinionIds.add(m.id);

      let mModel = this.minionMeshes.get(m.id);
      if (!mModel) {
        mModel = createMinionModel(m.team, m.type);
        this.arena.scene.add(mModel.group);
        this.minionMeshes.set(m.id, mModel);
      }

      const m3D = to3DPos(m.x, m.y);
      mModel.group.position.set(m3D.x, 0, m3D.z);
      mModel.group.rotation.y = -m.angle - Math.PI / 2;

      // Bobbing walking
      mModel.group.position.y = Math.sin(frameCount * 0.3 + m.id) * 0.08;

      // Attack swing
      if (m.attackCooldown > 35) {
        mModel.weapon.rotation.x = -0.5;
      } else {
        mModel.weapon.rotation.x = 0.4;
      }
    });

    // Remove dead minion 3D models
    this.minionMeshes.forEach((mModel, id) => {
      if (!activeMinionIds.has(id)) {
        this.arena.scene.remove(mModel.group);
        this.minionMeshes.delete(id);
      }
    });

    // 7. Projectiles 3D Sync
    const activeProjIds = new Set<number>();
    projectiles.forEach(p => {
      activeProjIds.add(p.id);

      let pMesh = this.projectileMeshes.get(p.id);
      if (!pMesh) {
        const isXavier = p.type === 'xavier_infinite_extension';
        const geo = new THREE.SphereGeometry(isXavier ? 0.65 : 0.35, 12, 12);
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(p.color),
        });
        pMesh = new THREE.Mesh(geo, mat);

        // Add glow light
        const pLight = new THREE.PointLight(new THREE.Color(p.color), isXavier ? 3.0 : 1.5, isXavier ? 14 : 7);
        pMesh.add(pLight);

        this.arena.scene.add(pMesh);
        this.projectileMeshes.set(p.id, pMesh);
      }

      const p3D = to3DPos(p.x, p.y);
      pMesh.position.set(p3D.x, 1.3, p3D.z);
    });

    // Remove expired projectiles
    this.projectileMeshes.forEach((pMesh, id) => {
      if (!activeProjIds.has(id)) {
        this.arena.scene.remove(pMesh);
        this.projectileMeshes.delete(id);
      }
    });

    // 8. VFX Manager (Laser beams, Mystic fields, Sparks)
    this.vfx.update(deltaSec);

    // 9. Water ripple animation
    if (this.arena.waterMesh) {
      const mat = this.arena.waterMesh.material as THREE.MeshStandardMaterial;
      mat.roughness = 0.1 + Math.sin(frameCount * 0.02) * 0.05;
    }

    // 10. Render 3D Scene
    this.arena.renderer.render(this.arena.scene, this.arena.camera);
  }

  public cleanup() {
    this.arena.cleanup();
  }
}
