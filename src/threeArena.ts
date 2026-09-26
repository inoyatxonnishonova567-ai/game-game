/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createGrassTexture, createStoneRoadTexture } from './threeTextures.ts';

// Scale factor: 2600 world coordinates mapped to 3D units (e.g. 2600 -> 260 units, factor 0.1)
export const WORLD_SCALE = 0.1;

export function to3DPos(worldX: number, worldY: number): THREE.Vector3 {
  // Center of world (1300, 1300) -> (0, 0)
  const x = (worldX - 1300) * WORLD_SCALE;
  const z = (worldY - 1300) * WORLD_SCALE;
  return new THREE.Vector3(x, 0, z);
}

export function toWorldPos(posX: number, posZ: number): { x: number; y: number } {
  const x = posX / WORLD_SCALE + 1300;
  const y = posZ / WORLD_SCALE + 1300;
  return { x, y };
}

export interface ThreeArenaInstance {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  dirLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  waterMesh: THREE.Mesh;
  cleanup: () => void;
}

export function initThreeArena(container: HTMLDivElement): ThreeArenaInstance {
  const width = container.clientWidth || 980;
  const height = container.clientHeight || 590;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a101d);
  scene.fog = new THREE.FogExp2(0x0a101d, 0.007);

  // Isometric MOBA Camera (Pitched at ~55 deg)
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 500);
  camera.position.set(0, 38, 32);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 1. LIGHTING
  const ambientLight = new THREE.AmbientLight(0xcfd8dc, 1.2);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x162b1e, 0.8);
  scene.add(hemiLight);

  // Sun Directional Light with Shadows
  const dirLight = new THREE.DirectionalLight(0xfffaed, 2.2);
  dirLight.position.set(40, 70, 35);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 250;
  const d = 80;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  // 2. GROUND & TERRAIN
  const arenaSize = 280;
  const grassTex = createGrassTexture();
  const groundGeo = new THREE.PlaneGeometry(arenaSize, arenaSize, 32, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 0.85,
    metalness: 0.1,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // 3. DIAGONAL RIVER (Water Bed)
  const waterGeo = new THREE.PlaneGeometry(arenaSize * 1.4, 28);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.75,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.rotation.z = Math.PI / 4;
  waterMesh.position.y = 0.05;
  scene.add(waterMesh);

  // River Bank Rocks
  for (let i = 0; i < 40; i++) {
    const t = (i / 40 - 0.5) * arenaSize;
    const offset = 14 + (Math.random() - 0.5) * 3;
    const rockGeo = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.9);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });

    // Side 1
    const r1 = new THREE.Mesh(rockGeo, rockMat);
    r1.position.set(t * Math.cos(Math.PI / 4) - offset * Math.sin(Math.PI / 4), 0.4, t * Math.sin(Math.PI / 4) + offset * Math.cos(Math.PI / 4));
    r1.castShadow = true;
    r1.receiveShadow = true;
    scene.add(r1);

    // Side 2
    const r2 = new THREE.Mesh(rockGeo, rockMat);
    r2.position.set(t * Math.cos(Math.PI / 4) + offset * Math.sin(Math.PI / 4), 0.4, t * Math.sin(Math.PI / 4) - offset * Math.cos(Math.PI / 4));
    r2.castShadow = true;
    r2.receiveShadow = true;
    scene.add(r2);
  }

  // 4. MID LANE, TOP LANE, BOT LANE (3D Stone Roads)
  const roadTex = createStoneRoadTexture();
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.7,
    metalness: 0.2,
  });

  const laneWidth = 12;

  // A) MID LANE (Diagonal Road with White Glowing Border Lines)
  const midRoadGeo = new THREE.PlaneGeometry(laneWidth, arenaSize * 1.2);
  const midRoad = new THREE.Mesh(midRoadGeo, roadMat);
  midRoad.rotation.x = -Math.PI / 2;
  midRoad.rotation.z = -Math.PI / 4;
  midRoad.position.y = 0.08;
  midRoad.receiveShadow = true;
  scene.add(midRoad);

  // White lane border lines for Mid
  const borderMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const lineGeo = new THREE.PlaneGeometry(0.35, arenaSize * 1.2);

  const leftBorder = new THREE.Mesh(lineGeo, borderMat);
  leftBorder.rotation.x = -Math.PI / 2;
  leftBorder.rotation.z = -Math.PI / 4;
  leftBorder.position.set(laneWidth / 2 * Math.cos(Math.PI / 4), 0.1, laneWidth / 2 * Math.sin(Math.PI / 4));
  scene.add(leftBorder);

  const rightBorder = new THREE.Mesh(lineGeo, borderMat);
  rightBorder.rotation.x = -Math.PI / 2;
  rightBorder.rotation.z = -Math.PI / 4;
  rightBorder.position.set(-laneWidth / 2 * Math.cos(Math.PI / 4), 0.1, -laneWidth / 2 * Math.sin(Math.PI / 4));
  scene.add(rightBorder);

  // B) TOP LANE: Allied Base (-104, 104) -> (-104, -95) -> (104, -95)
  const topVertGeo = new THREE.PlaneGeometry(laneWidth, 200);
  const topVertRoad = new THREE.Mesh(topVertGeo, roadMat);
  topVertRoad.rotation.x = -Math.PI / 2;
  topVertRoad.position.set(-104, 0.08, 0);
  topVertRoad.receiveShadow = true;
  scene.add(topVertRoad);

  const topHorizGeo = new THREE.PlaneGeometry(210, laneWidth);
  const topHorizRoad = new THREE.Mesh(topHorizGeo, roadMat);
  topHorizRoad.rotation.x = -Math.PI / 2;
  topHorizRoad.position.set(0, 0.08, -100);
  topHorizRoad.receiveShadow = true;
  scene.add(topHorizRoad);

  // C) BOT LANE: Allied Base (-104, 104) -> (100, 104) -> (100, -95)
  const botHorizGeo = new THREE.PlaneGeometry(210, laneWidth);
  const botHorizRoad = new THREE.Mesh(botHorizGeo, roadMat);
  botHorizRoad.rotation.x = -Math.PI / 2;
  botHorizRoad.position.set(0, 0.08, 102);
  botHorizRoad.receiveShadow = true;
  scene.add(botHorizRoad);

  const botVertGeo = new THREE.PlaneGeometry(laneWidth, 200);
  const botVertRoad = new THREE.Mesh(botVertGeo, roadMat);
  botVertRoad.rotation.x = -Math.PI / 2;
  botVertRoad.position.set(102, 0.08, 0);
  botVertRoad.receiveShadow = true;
  scene.add(botVertRoad);

  // 5. BASE SANCTUARIES (Allied Blue Base & Enemy Red Base)
  // Allied Base (Bottom-Left)
  const allyBasePos = to3DPos(260, 2340);
  const allyPedestalGeo = new THREE.CylinderGeometry(14, 16, 1.5, 16);
  const allyPedestalMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.2 });
  const allyPedestal = new THREE.Mesh(allyPedestalGeo, allyPedestalMat);
  allyPedestal.position.set(allyBasePos.x, 0.75, allyBasePos.z);
  allyPedestal.receiveShadow = true;
  scene.add(allyPedestal);

  // Allied Spire Light
  const allyLight = new THREE.PointLight(0x38bdf8, 4.0, 35);
  allyLight.position.set(allyBasePos.x, 6, allyBasePos.z);
  scene.add(allyLight);

  // Enemy Base (Top-Right)
  const enemyBasePos = to3DPos(2340, 260);
  const enemyPedestalMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, metalness: 0.8, roughness: 0.2 });
  const enemyPedestal = new THREE.Mesh(allyPedestalGeo, enemyPedestalMat);
  enemyPedestal.position.set(enemyBasePos.x, 0.75, enemyBasePos.z);
  enemyPedestal.receiveShadow = true;
  scene.add(enemyPedestal);

  const enemyLight = new THREE.PointLight(0xef4444, 4.0, 35);
  enemyLight.position.set(enemyBasePos.x, 6, enemyBasePos.z);
  scene.add(enemyLight);

  // Decorative trees/boulders along the jungle paths
  const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3.5, 6);
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const treeFoliageGeo = new THREE.DodecahedronGeometry(2.2);
  const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

  for (let i = 0; i < 35; i++) {
    const rx = (Math.random() - 0.5) * 200;
    const rz = (Math.random() - 0.5) * 200;
    // Don't place on main lanes
    if (Math.abs(rx + rz) < 18 || Math.abs(rx - 100) < 12 || Math.abs(rx + 100) < 12 || Math.abs(rz - 100) < 12 || Math.abs(rz + 100) < 12) {
      continue;
    }
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
    foliage.position.y = 4.2;
    foliage.castShadow = true;
    tree.add(foliage);

    tree.position.set(rx, 0, rz);
    scene.add(tree);
  }

  const handleResize = () => {
    const w = container.clientWidth || 980;
    const h = container.clientHeight || 590;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  return {
    scene,
    camera,
    renderer,
    dirLight,
    ambientLight,
    waterMesh,
    cleanup: () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
  };
}
