/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface ThreeVFXItem {
  mesh: THREE.Object3D;
  update: (delta: number) => boolean; // returns false when dead
}

export class ThreeVFXManager {
  private scene: THREE.Scene;
  private items: ThreeVFXItem[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  update(delta: number) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const alive = item.update(delta);
      if (!alive) {
        this.scene.remove(item.mesh);
        this.items.splice(i, 1);
      }
    }
  }

  // 1. Xavier Ultimate (Dawning Light) - Massive 3D Global Laser Beam
  createDawningLightBeam(startPos: THREE.Vector3, dir: THREE.Vector3, length: number = 200): void {
    const group = new THREE.Group();

    // Inner bright core
    const coreGeo = new THREE.CylinderGeometry(0.8, 0.8, length, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);

    // Outer cyan glow sleeve
    const outerGeo = new THREE.CylinderGeometry(2.4, 2.4, length, 16);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);

    // Dynamic light
    const beamLight = new THREE.PointLight(0x38bdf8, 5.0, 45);
    beamLight.position.copy(startPos);
    group.add(beamLight);

    group.add(coreMesh);
    group.add(outerMesh);

    // Position & orient cylinder along direction vector
    const centerPos = startPos.clone().add(dir.clone().multiplyScalar(length / 2));
    centerPos.y = 1.8;
    group.position.copy(centerPos);

    // Default cylinder is aligned with Y axis. Rotate to align with dir
    const up = new THREE.Vector3(0, 1, 0);
    const targetDir = new THREE.Vector3(dir.x, 0, dir.z).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, targetDir);
    coreMesh.quaternion.copy(quaternion);
    outerMesh.quaternion.copy(quaternion);

    this.scene.add(group);

    let life = 0.55; // seconds
    this.items.push({
      mesh: group,
      update: (dt) => {
        life -= dt;
        const progress = life / 0.55;
        coreMat.opacity = progress * 0.95;
        outerMat.opacity = progress * 0.65;
        outerMesh.scale.x = 1 + (1 - progress) * 1.5;
        outerMesh.scale.z = 1 + (1 - progress) * 1.5;
        beamLight.intensity = progress * 5.0;
        return life > 0;
      },
    });
  }

  // 2. Xavier Mystic Field (W) - Glowing Magical Barrier Ring
  createMysticField(pos: THREE.Vector3, radius: number = 7.5): void {
    const group = new THREE.Group();
    group.position.set(pos.x, 0.1, pos.z);

    // Ground Ring
    const ringGeo = new THREE.RingGeometry(radius * 0.85, radius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    // Translucent Cylinder Dome Wall
    const wallGeo = new THREE.CylinderGeometry(radius, radius, 2.2, 32, 1, true);
    const wallMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 1.1;
    group.add(wall);

    // Light
    const light = new THREE.PointLight(0xa855f7, 3.0, 18);
    light.position.y = 1.5;
    group.add(light);

    this.scene.add(group);

    let life = 4.0; // 4 seconds
    this.items.push({
      mesh: group,
      update: (dt) => {
        life -= dt;
        ring.rotation.z += dt * 1.5;
        if (life < 0.6) {
          const fade = life / 0.6;
          ringMat.opacity = fade * 0.85;
          wallMat.opacity = fade * 0.35;
          light.intensity = fade * 3.0;
        }
        return life > 0;
      },
    });
  }

  // 3. Impact Particle Explosion (Sparks)
  createSparks(pos: THREE.Vector3, color: number = 0x38bdf8, count: number = 16): void {
    const group = new THREE.Group();
    group.position.copy(pos);

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0.5;
      positions[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const vY = 2 + Math.random() * 5;
      const vH = 2 + Math.random() * 4;
      velocities.push(new THREE.Vector3(Math.cos(angle) * vH, vY, Math.sin(angle) * vH));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color,
      size: 0.45,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });
    const pSystem = new THREE.Points(geo, mat);
    group.add(pSystem);

    this.scene.add(group);

    let life = 0.6;
    this.items.push({
      mesh: group,
      update: (dt) => {
        life -= dt;
        const posAttr = geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
          velocities[i].y -= 9.8 * dt; // gravity
          posAttr.setXYZ(
            i,
            posAttr.getX(i) + velocities[i].x * dt,
            Math.max(0.1, posAttr.getY(i) + velocities[i].y * dt),
            posAttr.getZ(i) + velocities[i].z * dt
          );
        }
        posAttr.needsUpdate = true;
        mat.opacity = life / 0.6;
        return life > 0;
      },
    });
  }
}
