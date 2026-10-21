import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import gsap from 'gsap';
import { HotspotItem, OrganItem } from './anatomyData';

export const FIT_SIZE = 3.8;
const DOT_PIXELS = 34;
const CAMERA_FOV = 34;
const PLINTH_Y = -2.45;
const PLINTH_TOP = PLINTH_Y + 0.17;
// Perfectly centered camera looking straight at the heart midpoint
const HOME_CAMERA = { x: 0, y: 0.65, z: 8.0 };
const HOME_TARGET = { x: 0, y: 0.05, z: 0 };
const TAU = Math.PI * 2;
const SURFACE_LIFT = 0.02;
const VIEW_LIFT = 0.3;
const PULSE_SECONDS = 4.5;
const FLASH_SECONDS = 1.8;
const FLASH_CORRECT = '#10B981';
const FLASH_WRONG = '#EF4444';

export interface Marker {
  hotspot: HotspotItem;
  dot: THREE.Sprite;
  pulse: THREE.Sprite;
  anchor: THREE.Vector3;
  opacity: number;
  emphasis: number;
}

export interface EngineCallbacks {
  onLoading: (loading: boolean, progress: number) => void;
  onSelect: (hotspot: HotspotItem | null) => void;
  onPick?: (hotspot: HotspotItem) => void;
}

export type CameraPreset = 'anterior' | 'posterior' | 'lateral-l' | 'lateral-r' | 'superior';

function rgba(color: THREE.Color, alpha: number) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function dotTexture(hex: string) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  const color = new THREE.Color(hex);

  const halo = ctx.createRadialGradient(c, c, size * 0.3, c, c, size * 0.5);
  halo.addColorStop(0, rgba(color, 0.45));
  halo.addColorStop(0.5, rgba(color, 0.18));
  halo.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, TAU);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(c, c, size * 0.3, 0, TAU);
  ctx.fillStyle = 'rgba(48, 32, 24, 0.22)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(c, c, size * 0.285, 0, TAU);
  ctx.fillStyle = 'rgba(255, 253, 249, 0.98)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(c, c, size * 0.185, 0, TAU);
  ctx.fillStyle = rgba(color, 1);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function ringTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.arc(c, c, size * 0.42, 0, TAU);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function contactShadowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.04,
    size / 2,
    size / 2,
    size * 0.5
  );
  gradient.addColorStop(0, 'rgba(94, 62, 42, 0.62)');
  gradient.addColorStop(0.45, 'rgba(94, 62, 42, 0.26)');
  gradient.addColorStop(1, 'rgba(94, 62, 42, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

const DIRECTION_CONES = [0.94, 0.82, 0.6, -1.1];
interface Candidate {
  distance: number;
  mesh: THREE.Mesh;
  index: number;
  point: THREE.Vector3;
}

function snapToSurface(hotspots: HotspotItem[], pivot: THREE.Group, meshes: THREE.Mesh[]) {
  const targets = hotspots.map((h) => new THREE.Vector3(...h.position));
  const directions = targets.map((t) => t.clone().normalize());
  const tiers: (Candidate | null)[][] = hotspots.map(() => DIRECTION_CONES.map(() => null));
  if (!meshes.length) return targets;

  pivot.updateWorldMatrix(true, true);
  const toPivot = new THREE.Matrix4().copy(pivot.matrixWorld).invert();
  const local = new THREE.Matrix4();
  const vertex = new THREE.Vector3();

  for (const mesh of meshes) {
    const position = mesh.geometry.getAttribute('position');
    if (!position) continue;
    local.multiplyMatrices(toPivot, mesh.matrixWorld);

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i).applyMatrix4(local);
      const radius = vertex.length();
      for (let h = 0; h < targets.length; h++) {
        const distance = vertex.distanceToSquared(targets[h]);
        const cosine = radius > 1e-5 ? vertex.dot(directions[h]) / radius : 1;
        for (let t = 0; t < DIRECTION_CONES.length; t++) {
          if (cosine < DIRECTION_CONES[t]) continue;
          const best = tiers[h][t];
          if (best && best.distance <= distance) continue;
          if (best) {
            best.distance = distance;
            best.mesh = mesh;
            best.index = i;
            best.point.copy(vertex);
          } else {
            tiers[h][t] = { distance, mesh, index: i, point: vertex.clone() };
          }
        }
      }
    }
  }

  const normal = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();
  return targets.map((target, h) => {
    const chosen = tiers[h].find(Boolean);
    if (!chosen) return target;
    const normals = chosen.mesh.geometry.getAttribute('normal');
    if (normals) {
      local.multiplyMatrices(toPivot, chosen.mesh.matrixWorld);
      normalMatrix.getNormalMatrix(local);
      normal.fromBufferAttribute(normals, chosen.index).applyMatrix3(normalMatrix).normalize();
    } else {
      normal.copy(chosen.point).normalize();
    }
    if (normal.dot(chosen.point) < 0) normal.negate();
    return chosen.point.addScaledVector(normal, SURFACE_LIFT);
  });
}

export class HotspotLayer {
  public markers: Marker[] = [];
  private ring = ringTexture();
  public group = new THREE.Group();
  private pixelScale = 0.021;
  private time = 0;
  private selectedAt = -PULSE_SECONDS;
  private lastSelectedId: string | null = null;
  private flashes = new Map<string, { correct: boolean; until: number }>();

  private readonly world = new THREE.Vector3();
  private readonly toCamera = new THREE.Vector3();
  private readonly outward = new THREE.Vector3();
  private readonly center = new THREE.Vector3();
  private readonly projected = new THREE.Vector3();
  private readonly localCamera = new THREE.Vector3();
  private readonly lift = new THREE.Vector3();

  constructor() {
    this.group.name = 'hotspot-layer';
    this.group.renderOrder = 10;
  }

  attach(pivot: THREE.Group, hotspots: HotspotItem[], meshes: THREE.Mesh[]) {
    this.clear();
    if (!hotspots.length) return;

    const anchors = snapToSurface(hotspots, pivot, meshes);
    hotspots.forEach((hotspot, index) => {
      const dot = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: dotTexture(hotspot.color),
          transparent: true,
          depthWrite: false,
          depthTest: true,
          sizeAttenuation: false,
          toneMapped: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -12,
        })
      );
      dot.position.copy(anchors[index]);
      dot.renderOrder = 11;

      const pulse = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.ring,
          color: new THREE.Color(hotspot.color),
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: true,
          sizeAttenuation: false,
          toneMapped: false,
        })
      );
      pulse.position.copy(anchors[index]);
      pulse.renderOrder = 10;

      this.group.add(pulse, dot);
      this.markers.push({
        hotspot,
        dot,
        pulse,
        anchor: anchors[index].clone(),
        opacity: 0,
        emphasis: 0,
      });
    });

    this.group.position.set(0, 0, 0);
    pivot.add(this.group);
    this.applyScale();
  }

  flash(id: string, correct: boolean) {
    this.flashes.set(id, { correct, until: this.time + FLASH_SECONDS });
  }

  clearFlash() {
    this.flashes.clear();
  }

  setPixelSize(pixels: number, viewportHeight: number, fovDegrees: number) {
    const fov = THREE.MathUtils.degToRad(fovDegrees);
    this.pixelScale = 2 * (pixels / Math.max(viewportHeight, 1)) * Math.tan(fov / 2);
    this.applyScale();
  }

  private applyScale() {
    this.markers.forEach((marker) => {
      const scale = this.pixelScale * (1 + marker.emphasis * 0.3) * (0.74 + 0.26 * marker.opacity);
      marker.dot.scale.setScalar(scale);
    });
  }

  update(
    camera: THREE.Camera,
    delta: number,
    selectedId: string | null,
    hoveredId: string | null
  ): boolean {
    if (!this.markers.length) return true;
    this.time += delta;
    this.group.updateWorldMatrix(true, false);
    this.group.getWorldPosition(this.center);
    this.localCamera.copy(camera.position);
    this.group.worldToLocal(this.localCamera);

    if (selectedId !== this.lastSelectedId) {
      this.lastSelectedId = selectedId;
      this.selectedAt = this.time;
    }
    const beating = this.time - this.selectedAt < PULSE_SECONDS;

    let settled = true;
    for (const marker of this.markers) {
      this.lift.copy(this.localCamera).sub(marker.anchor);
      const span = this.lift.length();
      if (span > 1e-4) this.lift.multiplyScalar(VIEW_LIFT / span);
      else this.lift.set(0, 0, 0);
      marker.dot.position.copy(marker.anchor).add(this.lift);
      marker.pulse.position.copy(marker.dot.position);

      marker.dot.getWorldPosition(this.world);
      this.outward.copy(this.world).sub(this.center);
      const radius = this.outward.length();
      this.toCamera.copy(camera.position).sub(this.world).normalize();
      const facing = radius > 1e-4 ? this.outward.divideScalar(radius).dot(this.toCamera) : 1;
      const target = THREE.MathUtils.smoothstep(facing, -0.05, 0.3);

      const active = marker.hotspot.id === selectedId || marker.hotspot.id === hoveredId;
      const emphasisTarget = active ? 1 : 0;
      const ease = 1 - Math.exp(-delta * 12);

      if (Math.abs(target - marker.opacity) > 0.002) settled = false;
      if (Math.abs(emphasisTarget - marker.emphasis) > 0.002) settled = false;
      marker.opacity += (target - marker.opacity) * ease;
      marker.emphasis += (emphasisTarget - marker.emphasis) * ease;

      marker.dot.material.opacity = marker.opacity;
      marker.dot.visible = marker.opacity > 0.01;

      const pending = this.flashes.get(marker.hotspot.id);
      const flash = pending && this.time < pending.until ? pending : null;
      if (flash) {
        const life = (flash.until - this.time) / FLASH_SECONDS;
        marker.pulse.visible = true;
        marker.pulse.material.color.set(flash.correct ? FLASH_CORRECT : FLASH_WRONG);
        marker.pulse.material.opacity = Math.min(1, life * 2.2) * marker.opacity;
        marker.pulse.scale.setScalar(this.pixelScale * (1.35 + (1 - life) * 2.1));
        settled = false;
      } else if (marker.emphasis > 0.01) {
        marker.pulse.material.color.set(marker.hotspot.color);
        marker.pulse.visible = true;
        if (beating || marker.hotspot.id === hoveredId) {
          const beat = (this.time * 0.75) % 1;
          marker.pulse.material.opacity = marker.emphasis * marker.opacity * (1 - beat) * 0.85;
          marker.pulse.scale.setScalar(this.pixelScale * (1.15 + beat * 1.5));
          settled = false;
        } else {
          marker.pulse.material.opacity = marker.emphasis * marker.opacity * 0.42;
          marker.pulse.scale.setScalar(this.pixelScale * 1.6);
        }
      } else if (marker.pulse.visible) {
        marker.pulse.material.color.set(marker.hotspot.color);
        marker.pulse.visible = false;
      }
    }
    this.applyScale();
    return settled;
  }

  pick(
    x: number,
    y: number,
    camera: THREE.Camera,
    width: number,
    height: number,
    radius = 28
  ): Marker | null {
    let best: Marker | null = null;
    let bestDistance = radius;
    for (const marker of this.markers) {
      if (marker.opacity < 0.25) continue;
      marker.dot.getWorldPosition(this.projected).project(camera as THREE.PerspectiveCamera);
      if (this.projected.z > 1) continue;
      const px = (this.projected.x * 0.5 + 0.5) * width;
      const py = (-this.projected.y * 0.5 + 0.5) * height;
      const distance = Math.hypot(px - x, py - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = marker;
      }
    }
    return best;
  }

  screenPosition(id: string, camera: THREE.PerspectiveCamera, width: number, height: number) {
    const marker = this.markers.find((m) => m.hotspot.id === id);
    if (!marker) return null;
    marker.dot.getWorldPosition(this.projected).project(camera);
    return {
      x: (this.projected.x * 0.5 + 0.5) * width,
      y: (-this.projected.y * 0.5 + 0.5) * height,
      opacity: marker.opacity,
    };
  }

  clear() {
    this.markers.forEach((m) => {
      m.dot.material.map?.dispose();
      m.dot.material.dispose();
      m.pulse.material.dispose();
    });
    this.markers = [];
    this.group.clear();
    this.group.removeFromParent();
  }

  dispose() {
    this.clear();
    this.ring.dispose();
  }
}

export interface LoadedOrgan {
  url: string;
  pivot: THREE.Group;
  meshes: THREE.Mesh[];
  mixer: THREE.AnimationMixer | null;
}

export class AnatomyAssetManager {
  private loader: GLTFLoader;
  private cache = new Map<string, LoadedOrgan>();
  private inflight = new Map<string, Promise<LoadedOrgan>>();
  private current: LoadedOrgan | null = null;
  private maxAnisotropy: number;

  constructor(renderer: THREE.WebGLRenderer) {
    this.maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    this.loader = new GLTFLoader()
      .setDRACOLoader(dracoLoader)
      .setMeshoptDecoder(MeshoptDecoder);
  }

  get hasAnimation() {
    return Boolean(this.current?.mixer);
  }

  prefetch(url: string) {
    if (this.cache.has(url) || this.inflight.has(url)) return;
    void fetch(url, { priority: 'low' } as RequestInit).catch(() => {});
  }

  async load(url: string, onProgress?: (progress: number) => void): Promise<LoadedOrgan> {
    const cached = this.cache.get(url);
    if (cached) {
      this.cache.delete(url);
      this.cache.set(url, cached);
      this.resetMaterials(cached);
      onProgress?.(1);
      this.current = cached;
      return cached;
    }

    const pending = this.inflight.get(url) ?? this.parse(url, onProgress);
    this.inflight.set(url, pending);
    try {
      const organ = await pending;
      this.cache.set(url, organ);
      this.current = organ;
      return organ;
    } finally {
      this.inflight.delete(url);
    }
  }

  private async parse(url: string, onProgress?: (progress: number) => void): Promise<LoadedOrgan> {
    const gltf = await this.loader.loadAsync(url, (event) => {
      if (event.total > 0) onProgress?.(event.loaded / event.total);
    });

    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = FIT_SIZE / Math.max(size.x, size.y, size.z, 0.001);
    model.scale.setScalar(scale);
    // Center bounding box exactly at (0, 0, 0)
    model.position.copy(center.multiplyScalar(-scale));

    const pivot = new THREE.Group();
    pivot.name = 'organ-pivot';
    pivot.add(model);
    pivot.rotation.set(0.05, -0.28, 0);

    const meshes: THREE.Mesh[] = [];
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      meshes.push(child);
      child.frustumCulled = false;
      child.castShadow = false;
      child.receiveShadow = false;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.depthTest = true;
        material.side = THREE.FrontSide;

        if (material instanceof THREE.MeshStandardMaterial) {
          material.roughness = THREE.MathUtils.clamp(material.roughness ?? 0.5, 0.42, 0.62);
          material.metalness = 0;
          material.envMapIntensity = 0.32;
          if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
          if (material.normalMap) material.normalScale.multiplyScalar(0.62);

          for (const map of [
            material.map,
            material.normalMap,
            material.roughnessMap,
            material.metalnessMap,
            material.aoMap,
          ]) {
            if (!map) continue;
            map.anisotropy = this.maxAnisotropy;
            map.generateMipmaps = true;
            map.minFilter = THREE.LinearMipmapLinearFilter;
            map.magFilter = THREE.LinearFilter;
            map.needsUpdate = true;
          }
        }
        material.needsUpdate = true;
      });
    });

    let mixer: THREE.AnimationMixer | null = null;
    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());
    }

    return { url, pivot, meshes, mixer };
  }

  private resetMaterials(organ: LoadedOrgan) {
    organ.pivot.rotation.set(0.05, -0.28, 0);
    organ.pivot.position.set(0, 0, 0);
    organ.meshes.forEach((mesh) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
        material.clippingPlanes = null;
        material.clipShadows = false;
        if (material instanceof THREE.MeshStandardMaterial) material.wireframe = false;
        material.needsUpdate = true;
      });
    });
  }

  update(delta: number) {
    this.current?.mixer?.update(delta);
  }

  release(organ: LoadedOrgan | null = this.current) {
    if (!organ) return;
    organ.mixer?.stopAllAction();
    organ.pivot.removeFromParent();
    if (organ === this.current) this.current = null;
  }

  dispose() {
    this.release();
    this.cache.forEach((organ) => {
      organ.mixer?.stopAllAction();
      organ.mixer?.uncacheRoot(organ.pivot);
      organ.pivot.removeFromParent();
      disposeObject(organ.pivot);
    });
    this.cache.clear();
  }
}

export class AnatomyEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  private controls: OrbitControls;
  private assets: AnatomyAssetManager;
  public hotspots = new HotspotLayer();
  private callbacks: EngineCallbacks;
  private container: HTMLElement;
  private organ: LoadedOrgan | null = null;
  private plinth!: THREE.Mesh;
  private contactShadow!: THREE.Mesh;

  private frame = 0;
  private clock = new THREE.Clock();
  private resizeObserver: ResizeObserver;
  private clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
  private depthMaterial = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: true,
    depthTest: true,
  });

  public crossSection = false;
  public wireframe = false;
  public isolated = false;
  public clipConstant = 0;
  public showLabels = true;

  private width = 1;
  private height = 1;
  private isVisible = true;
  private dirty = true;
  private busyUntil = 0;
  private loadRequest = 0;

  public autoRotateWanted = true;
  private interactionUntil = 0;
  private selectedId: string | null = null;
  private hoveredId: string | null = null;
  private pointerId: number | null = null;
  private pointerStart = { x: 0, y: 0 };
  private dragged = false;
  private calloutEl: HTMLElement | null = null;
  private labelsContainerEl: HTMLElement | null = null;
  private disposed = false;
  public quizMode = false;

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    const lowPower =
      window.matchMedia('(max-width: 780px)').matches || (navigator.hardwareConcurrency ?? 8) < 6;
    const pixelRatio = Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !lowPower,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = false;
    this.renderer.localClippingEnabled = true;
    this.renderer.domElement.setAttribute('aria-label', 'Interactive 3D Anatomy Model');
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(HOME_CAMERA.x, HOME_CAMERA.y, HOME_CAMERA.z);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;
    this.controls.enablePan = false;
    this.controls.minDistance = 4.5;
    this.controls.maxDistance = 12;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.65;
    this.controls.target.set(HOME_TARGET.x, HOME_TARGET.y, HOME_TARGET.z);

    this.assets = new AnatomyAssetManager(this.renderer);
    this.buildEnvironment();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);

    this.controls.addEventListener('start', this.onControlStart);
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerLeave);

    this.resize();
    this.animate();
  }

  private buildEnvironment() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.42));
    this.scene.add(new THREE.HemisphereLight(0xfff8ee, 0x33252d, 0.72));

    const key = new THREE.DirectionalLight(0xfff3e7, 3.5);
    key.position.set(4.8, 6.5, 6.8);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xe6ecff, 1.12);
    fill.position.set(-4.5, 1.2, 5.2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffb7a5, 1.6);
    rim.position.set(-4, 3.5, -5.5);
    this.scene.add(rim);

    const warm = new THREE.PointLight(0xff8d70, 0.72, 11, 2);
    warm.position.set(-3, -1.4, 3.5);
    this.scene.add(warm);

    const glow = new THREE.PointLight(0xee7c6a, 0.5, 8, 2);
    glow.name = 'organ-glow';
    glow.position.set(2.8, 0.4, 2.8);
    this.scene.add(glow);

    this.scene.environment = this.buildEnvironmentMap();

    // Studio pedestal disc
    this.plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.48, 0.34, 56),
      new THREE.MeshStandardMaterial({
        color: 0xead7c1,
        roughness: 0.78,
        metalness: 0,
      })
    );
    this.plinth.position.y = PLINTH_Y;
    this.scene.add(this.plinth);

    this.contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({
        map: contactShadowTexture(),
        transparent: true,
        depthWrite: false,
        opacity: 0.62,
        toneMapped: false,
      })
    );
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.y = PLINTH_TOP + 0.005;
    this.contactShadow.renderOrder = 1;
    this.scene.add(this.contactShadow);

    // Subtle atmospheric dust particles
    const positions = new Float32Array(48 * 3);
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * 9;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 5 - 2;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.scene.add(
      new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0xe7a18e,
          size: 0.013,
          transparent: true,
          opacity: 0.16,
        })
      )
    );
  }

  private buildEnvironmentMap() {
    const width = 16;
    const height = 32;
    const data = new Uint8Array(width * height * 4);
    const top = new THREE.Color(0xfff3e4);
    const bottom = new THREE.Color(0x6b4f45);
    const mixed = new THREE.Color();
    for (let y = 0; y < height; y++) {
      mixed.copy(bottom).lerp(top, Math.pow(1 - y / (height - 1), 0.7));
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        data[i] = mixed.r * 255;
        data[i + 1] = mixed.g * 255;
        data[i + 2] = mixed.b * 255;
        data[i + 3] = 255;
      }
    }
    const source = new THREE.DataTexture(data, width, height);
    source.mapping = THREE.EquirectangularReflectionMapping;
    source.colorSpace = THREE.SRGBColorSpace;
    source.needsUpdate = true;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const environment = pmrem.fromEquirectangular(source).texture;
    pmrem.dispose();
    source.dispose();
    return environment;
  }

  public prefetch(url: string) {
    this.assets.prefetch(url);
  }

  public async setOrgan(organData: OrganItem) {
    const request = ++this.loadRequest;
    this.select(null);
    this.callbacks.onLoading(true, 0);

    const outgoing = this.organ;
    if (outgoing) {
      this.hotspots.clear();
      this.busy(0.7);
      await gsap.to(outgoing.pivot.scale, {
        x: 0.72,
        y: 0.72,
        z: 0.72,
        duration: 0.34,
        ease: 'power2.in',
        onUpdate: () => (this.dirty = true),
      });
      this.assets.release(outgoing);
      this.organ = null;
      this.dirty = true;
    }

    this.tween(this.camera.position, { z: 9.0, duration: 0.42, ease: 'power2.inOut' });

    let organ: LoadedOrgan;
    try {
      organ = await this.assets.load(organData.model, (progress) => {
        if (request === this.loadRequest) this.callbacks.onLoading(true, progress);
      });
    } catch (err) {
      if (request === this.loadRequest) this.callbacks.onLoading(false, 0);
      throw err;
    }

    if (request !== this.loadRequest || this.disposed) return;

    this.organ = organ;
    organ.pivot.scale.setScalar(1);
    organ.pivot.position.set(0, 0, 0);
    this.scene.add(organ.pivot);
    organ.pivot.updateWorldMatrix(true, true);

    this.hotspots.attach(organ.pivot, organData.hotspots, organ.meshes);
    this.hotspots.setPixelSize(DOT_PIXELS, this.height, CAMERA_FOV);

    if (this.crossSection) this.applyClipping(true);
    if (this.wireframe) this.applyWireframe(true);

    const glow = this.scene.getObjectByName('organ-glow') as THREE.PointLight | undefined;
    glow?.color.set(organData.accent);

    organ.pivot.scale.setScalar(0.58);
    organ.pivot.position.z = -1.3;
    this.busy(1.4);
    this.callbacks.onLoading(false, 1);

    gsap
      .timeline({ onUpdate: () => (this.dirty = true) })
      .to(organ.pivot.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.25)' }, 0)
      .to(organ.pivot.position, { z: 0, duration: 0.85, ease: 'power3.out' }, 0)
      .to(this.camera.position, { z: HOME_CAMERA.z, duration: 0.9, ease: 'power2.out' }, 0.08);
  }

  private animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    if (!this.isVisible) return;

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const now = performance.now();

    this.controls.autoRotate =
      this.autoRotateWanted && !this.selectedId && now >= this.interactionUntil;
    if (this.controls.update(delta)) this.dirty = true;
    if (this.assets.hasAnimation) {
      this.assets.update(delta);
      this.dirty = true;
    }

    if (!this.dirty && now >= this.busyUntil) return;

    if (!this.hotspots.update(this.camera, delta, this.selectedId, this.hoveredId)) {
      this.dirty = true;
    } else {
      this.dirty = false;
    }
    if (now < this.busyUntil) this.dirty = true;

    this.positionCallout();
    this.positionLabels();
    this.renderer.render(this.scene, this.camera);
  };

  private busy(seconds: number) {
    this.busyUntil = Math.max(this.busyUntil, performance.now() + seconds * 1000);
    this.dirty = true;
  }

  private tween(target: object, vars: gsap.TweenVars) {
    this.busy((vars.duration as number) ?? 0.5);
    return gsap.to(target, { ...vars, onUpdate: () => (this.dirty = true) });
  }

  private resize() {
    this.width = Math.max(this.container.clientWidth, 1);
    this.height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
    this.hotspots.setPixelSize(DOT_PIXELS, this.height, CAMERA_FOV);
    this.dirty = true;
  }

  private onControlStart = () => {
    this.interactionUntil = performance.now() + 3000;
    this.dirty = true;
  };

  private onPointerDown = (event: PointerEvent) => {
    this.pointerId = event.pointerId;
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.dragged = false;
  };

  private onPointerMove = (event: PointerEvent) => {
    if (this.pointerId !== null) {
      if (Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 5) {
        this.dragged = true;
      }
      return;
    }
    const marker = this.hotspots.pick(
      event.offsetX,
      event.offsetY,
      this.camera,
      this.width,
      this.height
    );
    const id = marker?.hotspot.id ?? null;
    if (id !== this.hoveredId) {
      this.hoveredId = id;
      this.renderer.domElement.style.cursor = id ? 'pointer' : '';
      this.dirty = true;
    }
  };

  private onPointerUp = (event: PointerEvent) => {
    const wasDragging = this.dragged;
    this.pointerId = null;
    this.dragged = false;
    if (wasDragging) return;

    const marker = this.hotspots.pick(
      event.offsetX,
      event.offsetY,
      this.camera,
      this.width,
      this.height
    );
    if (this.quizMode) {
      if (marker) this.callbacks.onPick?.(marker.hotspot);
      return;
    }
    this.select(marker && marker.hotspot.id !== this.selectedId ? marker.hotspot.id : null);
  };

  private onPointerLeave = () => {
    this.pointerId = null;
    if (this.hoveredId) {
      this.hoveredId = null;
      this.dirty = true;
    }
  };

  public select(id: string | null, force = false) {
    if (!force && this.selectedId === id) return;
    this.selectedId = id;
    this.busy(0.4);
    const marker = this.hotspots.markers.find((m) => m.hotspot.id === id);
    this.callbacks.onSelect(marker?.hotspot ?? null);
  }

  public clearSelection() {
    this.select(null);
  }

  public attachCallout(element: HTMLElement | null) {
    this.calloutEl = element;
    this.positionCallout();
    this.dirty = true;
  }

  public attachLabelsContainer(element: HTMLElement | null) {
    this.labelsContainerEl = element;
    this.positionLabels();
    this.dirty = true;
  }

  public setShowLabels(show: boolean) {
    this.showLabels = show;
    if (this.labelsContainerEl) {
      this.labelsContainerEl.style.display = show ? 'block' : 'none';
    }
    this.dirty = true;
  }

  private positionCallout() {
    if (!this.calloutEl || !this.selectedId) return;
    const point = this.hotspots.screenPosition(
      this.selectedId,
      this.camera,
      this.width,
      this.height
    );
    if (!point) return;
    this.calloutEl.style.transform = `translate3d(${Math.round(point.x)}px, ${Math.round(point.y)}px, 0)`;
    this.calloutEl.dataset.side = point.x > this.width * 0.58 ? 'left' : 'right';
    this.calloutEl.dataset.behind = point.opacity < 0.28 ? 'true' : 'false';
  }

  private positionLabels() {
    if (!this.labelsContainerEl || !this.showLabels || this.quizMode) {
      if (this.labelsContainerEl) this.labelsContainerEl.style.display = 'none';
      return;
    }
    this.labelsContainerEl.style.display = 'block';

    const childNodes = this.labelsContainerEl.children;
    for (let i = 0; i < childNodes.length; i++) {
      const el = childNodes[i] as HTMLElement;
      const id = el.dataset.hotspotId;
      if (!id) continue;

      const point = this.hotspots.screenPosition(id, this.camera, this.width, this.height);
      if (point && point.opacity > 0.3) {
        el.style.transform = `translate3d(${Math.round(point.x)}px, ${Math.round(point.y)}px, 0)`;
        el.style.opacity = `${Math.min(1, point.opacity * 1.2)}`;
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    }
  }

  public setAutoRotate(enabled: boolean) {
    this.autoRotateWanted = enabled;
    if (enabled) this.interactionUntil = 0;
    this.dirty = true;
  }

  public setQuizMode(enabled: boolean) {
    this.quizMode = enabled;
    this.select(null);
    this.hotspots.clearFlash();
    if (this.labelsContainerEl) {
      this.labelsContainerEl.style.display = enabled ? 'none' : this.showLabels ? 'block' : 'none';
    }
    this.dirty = true;
  }

  public flash(id: string, correct: boolean) {
    this.hotspots.flash(id, correct);
    this.busy(1.2);
  }

  public hotspotScreenY(id: string): number | null {
    const point = this.hotspots.screenPosition(id, this.camera, this.width, this.height);
    return point ? point.y / this.height : null;
  }

  public reset() {
    this.select(null);
    this.tween(this.camera.position, { ...HOME_CAMERA, duration: 0.8, ease: 'power3.out' });
    this.tween(this.controls.target, { ...HOME_TARGET, duration: 0.8, ease: 'power3.out' });
    if (this.organ) {
      this.tween(this.organ.pivot.rotation, {
        x: 0.05,
        y: -0.28,
        z: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }

  public zoom(direction: 1 | -1) {
    this.tween(this.camera.position, {
      z: THREE.MathUtils.clamp(this.camera.position.z + direction * 1.3, 4.5, 12),
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  public setCameraPreset(preset: CameraPreset) {
    if (!this.organ) return;
    this.select(null);
    let targetRotY = 0;
    let targetRotX = 0;
    let targetCamY = HOME_CAMERA.y;
    let targetCamZ = HOME_CAMERA.z;

    switch (preset) {
      case 'anterior':
        targetRotY = 0;
        targetRotX = 0;
        break;
      case 'posterior':
        targetRotY = Math.PI;
        targetRotX = 0;
        break;
      case 'lateral-l':
        targetRotY = Math.PI / 2;
        targetRotX = 0;
        break;
      case 'lateral-r':
        targetRotY = -Math.PI / 2;
        targetRotX = 0;
        break;
      case 'superior':
        targetRotX = Math.PI / 3;
        targetCamY = 4.0;
        targetCamZ = 6.5;
        break;
    }

    this.tween(this.organ.pivot.rotation, {
      x: targetRotX,
      y: targetRotY,
      z: 0,
      duration: 0.9,
      ease: 'power3.inOut',
    });
    this.tween(this.camera.position, {
      x: 0,
      y: targetCamY,
      z: targetCamZ,
      duration: 0.9,
      ease: 'power3.inOut',
    });
  }

  public focusHotspot(hotspot: HotspotItem) {
    if (!this.organ) return;
    this.select(hotspot.id, true);
    const anchor = new THREE.Vector3(...hotspot.position).normalize();
    const targetAngle = -Math.atan2(anchor.x, anchor.z);
    this.tween(this.organ.pivot.rotation, {
      y: targetAngle,
      x: 0.05,
      duration: 0.8,
      ease: 'power3.out',
    });
  }

  public toggleCrossSection(): boolean {
    this.crossSection = !this.crossSection;
    this.applyClipping(this.crossSection);
    gsap.fromTo(
      this.clipPlane,
      { constant: -2.0 },
      {
        constant: this.crossSection ? this.clipConstant : -2.0,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => (this.dirty = true),
      }
    );
    this.busy(0.95);
    return this.crossSection;
  }

  public setSliceDepth(value: number) {
    this.clipConstant = value;
    if (this.crossSection) {
      this.clipPlane.constant = value;
      this.dirty = true;
    }
  }

  private applyClipping(enabled: boolean) {
    if (!this.organ) return;
    const planes = enabled ? [this.clipPlane] : null;
    this.organ.meshes.forEach((mesh) => {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        m.clippingPlanes = planes;
        m.clipShadows = false;
        m.needsUpdate = true;
      });
    });
    this.depthMaterial.clippingPlanes = planes;
    this.depthMaterial.needsUpdate = true;
    this.dirty = true;
  }

  public toggleWireframe(): boolean {
    if (!this.organ) return false;
    this.wireframe = !this.wireframe;
    this.applyWireframe(this.wireframe);
    return this.wireframe;
  }

  private applyWireframe(enabled: boolean) {
    if (!this.organ) return;
    this.organ.meshes.forEach((mesh) => {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.wireframe = enabled;
          m.needsUpdate = true;
        }
      });
    });
    this.dirty = true;
  }

  public toggleIsolate(): boolean {
    this.isolated = !this.isolated;
    const plinthMat = this.plinth.material as THREE.MeshStandardMaterial;
    plinthMat.transparent = true;
    this.tween(plinthMat, { opacity: this.isolated ? 0.12 : 1, duration: 0.45 });
    this.tween(this.contactShadow.material, {
      opacity: this.isolated ? 0.08 : 0.62,
      duration: 0.45,
    });
    return this.isolated;
  }

  public dispose() {
    this.disposed = true;
    this.loadRequest++;
    cancelAnimationFrame(this.frame);
    gsap.killTweensOf(this.camera.position);
    this.controls.removeEventListener('start', this.onControlStart);
    this.controls.dispose();
    this.resizeObserver.disconnect();

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerup', this.onPointerUp);
    canvas.removeEventListener('pointerleave', this.onPointerLeave);

    this.hotspots.dispose();
    this.depthMaterial.dispose();
    this.assets.dispose();
    this.scene.environment?.dispose();
    (this.contactShadow.material as THREE.MeshBasicMaterial).map?.dispose();
    this.renderer.dispose();
    canvas.remove();
  }
}
