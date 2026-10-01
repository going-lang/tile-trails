import * as THREE from 'three';
import { audio } from './audio';
import { doTilesOverlap2D, isSolvableWithTray, LevelConfig, TilePlacement } from './levels';
import { isTutorialLevel, PowerUpType } from './powerups';
import { SaveSystem } from './saveSystem';
import {
  getConfettiTexture,
  getCoveredTileTexture,
  getGlowTexture,
  getHintHaloTexture,
  getRingTexture,
  getSparkleParticleTexture,
  getStarBurstTexture,
  getTileTexture,
  getTextPopupTexture,
  getTrayDockTexture,
  getWorldBackgroundTexture,
  TILE_MOTIFS,
} from './tile';

export type TileState = 'board' | 'flying_to_tray' | 'tray' | 'matching' | 'returning' | 'cleared';

export interface ActiveTile {
  id: string;
  gx: number;
  gy: number;
  layer: number;
  motifId: number;
  state: TileState;
  isBlocked: boolean;
  /** Mystery tile: fruit is hidden until the player taps once to peel the cover */
  isCovered: boolean;
  /** Flip animation progress for the uncover reveal (0 = idle) */
  flipTime: number;
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  // 2D World coordinates on board
  boardX: number;
  boardY: number;
  boardZ: number;
  // Current animated 2D position & scale
  currX: number;
  currY: number;
  currScale: number;
  // Flight animation parameters
  animStartX: number;
  animStartY: number;
  animCtrlX: number;
  animCtrlY: number;
  animTargetX: number;
  animTargetY: number;
  animProgress: number;
  animDuration: number;
  // Bounce / shake feedback
  shakeTime: number;
  popScaleTime: number;
}

interface PooledParticle {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  startScale: number;
  rotSpeed: number;
}

interface AmbientCloud {
  sprite: THREE.Sprite;
  speed: number;
  baseY: number;
  phase: number;
}

/** Expanding shockwave ring spawned on triple matches */
interface PooledRipple {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  active: boolean;
  life: number;
  maxLife: number;
  startScale: number;
  endScale: number;
}

/** Rising floating text popup (combo counters, coin gains, praise) */
interface PooledTextPopup {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  active: boolean;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  baseScale: number;
}

/** Soft bloom puff that expands then fades behind matches */
interface PooledGlow {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  active: boolean;
  life: number;
  maxLife: number;
  startScale: number;
  endScale: number;
  spin: number;
}

/** Twinkling celebration star that drifts upward */
interface PooledStar {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  active: boolean;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  spin: number;
  scale: number;
}

export interface GameHUDState {
  remainingTiles: number;
  totalTiles: number;
  trayCount: number;
  maxTraySlots: number;
  canUndo: boolean;
  extraSlotUsed: boolean;
  comboCount: number;
  elapsedSec: number;
  /** Mystery tiles still hidden under a cover */
  coveredTiles: number;
  /** True when only 1 free slot remains — tray danger state */
  trayDanger: boolean;
  /** Number of tiles currently free (selectable) on the board */
  freeTiles: number;
  /** 0..1 fraction of the combo window remaining (drives the combo meter) */
  comboMeter: number;
  /** Bonus coins earned from combos this level */
  comboCoins: number;
}

export interface WinMeta {
  usedPowerUp: boolean;
  beatParTime: boolean;
}

export interface GameCallbacks {
  onHUDUpdate: (hud: GameHUDState) => void;
  onWin: (
    elapsedSec: number,
    usedExtraOrRevive: boolean,
    discoveredMotifs: number[],
    meta: WinMeta
  ) => void;
  onLose: () => void;
}

export class TileTrailsGameEngine {
  private container: HTMLElement;
  private callbacks: GameCallbacks;

  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  // Virtual 2D design space dimensions
  private readonly viewWidth = 720;
  private viewHeight = 1280;
  private readonly tileBaseSize = 98;

  private bgMesh: THREE.Mesh | null = null;
  private trayMesh: THREE.Mesh | null = null;
  private hintHaloMesh: THREE.Mesh | null = null;
  private hintedTileId: string | null = null;

  private tiles: ActiveTile[] = [];
  private trayOrder: ActiveTile[] = [];
  private undoStack: ActiveTile[] = [];
  private particles: PooledParticle[] = [];
  private ambientSprites: AmbientCloud[] = [];

  // ===== VFX Pools =====
  private ripples: PooledRipple[] = [];
  private textPopups: PooledTextPopup[] = [];
  private glows: PooledGlow[] = [];
  private stars: PooledStar[] = [];
  private confetti: PooledParticle[] = [];
  private flashMesh: THREE.Mesh | null = null;
  private flashMaterial: THREE.MeshBasicMaterial | null = null;
  private flashAlpha = 0;
  private flashColor = new THREE.Color('#FFFFFF');
  private screenShakeTime = 0;
  private screenShakeStrength = 0;

  private maxTraySlots = 5;
  private extraSlotUsed = false;
  private usedPowerUpThisLevel = false;
  /** True during tutorial levels 1–5 where every power-up is free & unlimited */
  private freePowerUps = false;
  /** Tracks the tray-danger edge so the warning chime fires exactly once per entry */
  private wasInDanger = false;
  /** Pulses the tray dock red while in danger */
  private dangerPulseTime = 0;
  /** Bonus coins earned from combos during this level (shown on win screen) */
  private comboCoinsThisLevel = 0;
  /** Seconds remaining in the current combo window (for HUD combo meter) */
  private comboWindowSec = 0;
  private comboEmitAccumulator = 0;
  private static readonly COMBO_WINDOW = 3.2;
  /** True while the WebGL context is lost; rendering is suspended until restored */
  private contextLost = false;
  /** Adaptive frame budget: skip VFX-only work when the device is struggling */
  private slowFrameCount = 0;
  private lowPowerMode = false;
  private frameErrorCount = 0;
  /** Set on destroy() so any in-flight rAF callback exits immediately */
  private destroyed = false;

  private hasPowerUpAvailable(type: PowerUpType): boolean {
    if (this.freePowerUps) return true;
    return (SaveSystem.get().powerups[type] || 0) > 0;
  }

  private consumePowerUpStock(type: PowerUpType) {
    if (this.freePowerUps) return;
    SaveSystem.save((draft) => {
      draft.powerups[type] = Math.max(0, draft.powerups[type] - 1);
    });
  }

  public isFreePowerUpLevel(): boolean {
    return this.freePowerUps;
  }

  /** Returns the right face texture for a tile given cover / blocked state */
  private textureFor(tile: ActiveTile, blockedOverride?: boolean): THREE.CanvasTexture {
    const save = SaveSystem.get();
    const blocked = blockedOverride ?? tile.isBlocked;
    if (tile.isCovered) {
      return getCoveredTileTexture(save.activeTileTheme, blocked);
    }
    return getTileTexture(tile.motifId, save.activeTileTheme, save.settings.colorFriendly, blocked);
  }

  /**
   * Decides which board tiles start covered. Deterministic per level so the same
   * puzzle always hides the same tiles. Level 1–2 have none; the share grows later.
   */
  private static pickCoveredIds(config: LevelConfig): Set<string> {
    const covered = new Set<string>();
    const lvl = config.levelNumber;
    if (lvl <= 2) return covered;

    // Mystery-tile ratio scales up alongside the difficulty step at World 5
    let ratio = 0;
    if (lvl <= 5) ratio = 0.12; // Tutorial world
    else if (lvl <= 20) ratio = 0.18; // Worlds 2–4
    else if (lvl <= 25) ratio = 0.30; // World 5 spike
    else if (lvl <= 75) ratio = 0.36; // Worlds 6–15
    else if (lvl <= 150) ratio = 0.42; // Worlds 16–30
    else ratio = 0.48; // Worlds 31–50 — nearly half the board is a mystery
    if (lvl === 999) ratio = 0.35; // Daily challenge

    // Seeded shuffle so covered tiles are stable across restarts
    let seed = lvl * 7919 + config.totalTiles * 31;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Prefer covering tiles that are not on the very top layer so the reveal matters
    const candidates = [...config.tiles].sort((a, b) => a.layer - b.layer);
    const target = Math.max(1, Math.round(config.tiles.length * ratio));
    const pool = candidates.map((c, i) => ({ c, r: rand() + (i < candidates.length * 0.6 ? 0 : 0.35) }));
    pool.sort((a, b) => a.r - b.r);
    pool.slice(0, target).forEach((p) => covered.add(p.c.id));
    return covered;
  }

  /** Peel the cover off a mystery tile with a flip + sparkle reveal */
  private uncoverTile(tile: ActiveTile) {
    tile.isCovered = false;
    tile.flipTime = 0.34;
    tile.popScaleTime = 0.22;
    tile.material.map = this.textureFor(tile);
    tile.material.needsUpdate = true;

    audio.playReveal();
    this.spawnGlow(tile.currX, tile.currY, '#86EFAC', 150);
    this.spawnRipple(tile.currX, tile.currY, '#4ADE80', 170);
    this.spawnBurst(tile.currX, tile.currY, '#BBF7D0', 10);
    this.spawnStars(tile.currX, tile.currY, '#FDE047', 4);
    this.emitHUD();
  }
  private levelConfig: LevelConfig | null = null;
  private isGameOver = false;
  private isPaused = false;

  private comboCount = 0;
  private lastMatchTimestamp = 0;
  private elapsedSec = 0;
  private lastFrameTime = 0;
  private animFrameId: number | null = null;

  private tileGeometry: THREE.PlaneGeometry;
  private raycaster = new THREE.Raycaster();
  private pointerNDC = new THREE.Vector2();

  constructor(container: HTMLElement, callbacks: GameCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.scene = new THREE.Scene();

    const rect = container.getBoundingClientRect();
    const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 9 / 16;
    this.viewHeight = Math.max(1140, Math.min(1480, this.viewWidth / aspect));

    this.camera = new THREE.OrthographicCamera(
      -this.viewWidth / 2,
      this.viewWidth / 2,
      this.viewHeight / 2,
      -this.viewHeight / 2,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 500);
    this.camera.lookAt(0, 0, 0);

    // Mobile-first renderer settings:
    //  - antialias off on high-DPR screens (DPR already smooths edges; big GPU saving)
    //  - pixel ratio capped at 1.75 to avoid 3x rendering on flagship phones
    //  - preserveDrawingBuffer off, no stencil, default power for battery/thermal stability
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer = new THREE.WebGLRenderer({
      antialias: dpr < 1.5,
      alpha: false,
      stencil: false,
      depth: true,
      powerPreference: 'default',
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
    });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(rect.width || 390, rect.height || 844);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Paint the scene backdrop colour immediately so the first frame is never white
    this.renderer.setClearColor(0x1a2332, 1);

    // Clear container and mount canvas
    this.container.innerHTML = '';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.touchAction = 'none';
    this.renderer.domElement.style.backgroundColor = '#1a2332';
    this.container.appendChild(this.renderer.domElement);

    // WebGL context loss recovery — Android WebViews drop the context when the app is
    // backgrounded under memory pressure. Without this handler the canvas goes blank forever.
    const canvas = this.renderer.domElement;
    canvas.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        this.contextLost = true;
        if (this.animFrameId !== null) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
      },
      false
    );
    canvas.addEventListener(
      'webglcontextrestored',
      () => {
        this.contextLost = false;
        // Force every material/texture to re-upload, then resume the loop
        this.tiles.forEach((t) => {
          t.material.needsUpdate = true;
          if (t.material.map) t.material.map.needsUpdate = true;
        });
        if (this.bgMesh) (this.bgMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        if (this.trayMesh) (this.trayMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        this.lastFrameTime = performance.now();
        this.startLoop();
      },
      false
    );

    this.tileGeometry = new THREE.PlaneGeometry(this.tileBaseSize, this.tileBaseSize);

    this.initSceneElements();
    this.initParticlePool();
    this.bindEvents();
    this.startLoop();
  }

  private initSceneElements() {
    // 1. 2D Illustrated World Background Plane
    const bgGeo = new THREE.PlaneGeometry(this.viewWidth, 1520);
    const bgMat = new THREE.MeshBasicMaterial({
      map: getWorldBackgroundTexture(1),
      depthWrite: false,
    });
    this.bgMesh = new THREE.Mesh(bgGeo, bgMat);
    this.bgMesh.position.set(0, 0, -50);
    this.bgMesh.renderOrder = 0;
    this.scene.add(this.bgMesh);

    // 2. Ambient floating 2D sparkles in the sky
    const sparkleTex = getSparkleParticleTexture();
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.SpriteMaterial({
        map: sparkleTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0.32,
      });
      const sprite = new THREE.Sprite(mat);
      const scale = 14 + (i % 4) * 6;
      sprite.scale.set(scale, scale, 1);
      const x = (Math.random() - 0.5) * this.viewWidth * 0.9;
      // Keep ambient sparkles in the board zone, below the top tray dock
      const y = -this.viewHeight * 0.42 + Math.random() * this.viewHeight * 0.6;
      sprite.position.set(x, y, -20);
      this.scene.add(sprite);
      this.ambientSprites.push({
        sprite,
        speed: 12 + (i % 5) * 5,
        baseY: y,
        phase: i * 1.1,
      });
    }

    // 3. 2D Wooden Tray Dock at bottom
    const trayGeo = new THREE.PlaneGeometry(688, 128);
    const trayMat = new THREE.MeshBasicMaterial({
      map: getTrayDockTexture(5),
      transparent: true,
    });
    this.trayMesh = new THREE.Mesh(trayGeo, trayMat);
    this.trayMesh.position.set(0, this.getTrayCenterY(), 5);
    this.trayMesh.renderOrder = 5;
    this.scene.add(this.trayMesh);

    // 4. Hint Golden Halo Ring
    const haloGeo = new THREE.PlaneGeometry(this.tileBaseSize * 1.18, this.tileBaseSize * 1.18);
    const haloMat = new THREE.MeshBasicMaterial({
      map: getHintHaloTexture(),
      transparent: true,
      depthTest: false,
    });
    this.hintHaloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.hintHaloMesh.visible = false;
    this.hintHaloMesh.renderOrder = 999;
    this.scene.add(this.hintHaloMesh);

    this.initVfxPools();
  }

  /** Pre-allocates every VFX sprite up-front so gameplay never allocates mid-frame */
  private initVfxPools() {
    // Full-screen flash overlay for combo / celebration highlights (oversized so it always covers on resize)
    const flashGeo = new THREE.PlaneGeometry(this.viewWidth + 120, this.viewHeight + 240);
    this.flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
    });
    this.flashMesh = new THREE.Mesh(flashGeo, this.flashMaterial);
    this.flashMesh.position.set(0, 0, 700);
    this.flashMesh.renderOrder = 1200;
    this.flashMesh.visible = false;
    this.scene.add(this.flashMesh);

    // Shockwave rings
    const ringTex = getRingTexture();
    for (let i = 0; i < 10; i++) {
      const material = new THREE.SpriteMaterial({
        map: ringTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.renderOrder = 1000;
      this.scene.add(sprite);
      this.ripples.push({
        sprite,
        material,
        active: false,
        life: 0,
        maxLife: 0.5,
        startScale: 60,
        endScale: 240,
      });
    }

    // Soft bloom glows
    const glowTex = getGlowTexture();
    for (let i = 0; i < 14; i++) {
      const material = new THREE.SpriteMaterial({
        map: glowTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.renderOrder = 990;
      this.scene.add(sprite);
      this.glows.push({
        sprite,
        material,
        active: false,
        life: 0,
        maxLife: 0.45,
        startScale: 70,
        endScale: 190,
        spin: 0,
      });
    }

    // Floating text popups
    for (let i = 0; i < 8; i++) {
      const material = new THREE.SpriteMaterial({
        map: null,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.renderOrder = 1100;
      this.scene.add(sprite);
      this.textPopups.push({
        sprite,
        material,
        active: false,
        life: 0,
        maxLife: 0.95,
        vx: 0,
        vy: 0,
        baseScale: 1,
      });
    }

    // Twinkling stars
    const starTex = getStarBurstTexture();
    for (let i = 0; i < 26; i++) {
      const material = new THREE.SpriteMaterial({
        map: starTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.renderOrder = 1010;
      this.scene.add(sprite);
      this.stars.push({
        sprite,
        material,
        active: false,
        life: 0,
        maxLife: 1.1,
        vx: 0,
        vy: 0,
        spin: 0,
        scale: 30,
      });
    }

    // Celebration confetti strips (separate pool from sparkles)
    const confettiTex = getConfettiTexture();
    for (let i = 0; i < 60; i++) {
      const material = new THREE.SpriteMaterial({
        map: confettiTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.renderOrder = 1030;
      this.scene.add(sprite);
      this.confetti.push({
        sprite,
        material,
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1.6,
        startScale: 22,
        rotSpeed: 0,
      });
    }
  }

  private initParticlePool() {
    const tex = getSparkleParticleTexture();
    for (let i = 0; i < 72; i++) {
      const material = new THREE.SpriteMaterial({
        map: tex,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.renderOrder = 950;
      this.scene.add(sprite);
      this.particles.push({
        sprite,
        material,
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.5,
        startScale: 28,
        rotSpeed: 0,
      });
    }
  }

  /** Tray dock sits at the TOP of the play area, just under the HUD pill */
  private getTrayCenterY(): number {
    return this.viewHeight / 2 - 215;
  }

  /** Board is centred in the space between the top tray and the bottom power-up bar */
  private getBoardCenterY(): number {
    return -95;
  }

  private getTraySlotX(slotIndex: number): number {
    const dockWidth = 688;
    const marginX = 26;
    const usableW = dockWidth - marginX * 2;
    const slotW = usableW / this.maxTraySlots;
    return -dockWidth / 2 + marginX + slotW * (slotIndex + 0.5);
  }

  public loadLevel(config: LevelConfig) {
    // Clear existing tile meshes
    this.tiles.forEach((t) => {
      this.scene.remove(t.mesh);
      t.material.dispose();
    });
    this.tiles = [];
    this.trayOrder = [];
    this.undoStack = [];
    this.hintedTileId = null;
    if (this.hintHaloMesh) this.hintHaloMesh.visible = false;

    this.levelConfig = config;
    this.maxTraySlots = 5;
    this.extraSlotUsed = false;
    this.usedPowerUpThisLevel = false;
    // Tutorial levels 1–5 grant unlimited free power-ups (daily challenge is never free)
    this.freePowerUps = isTutorialLevel(config.levelNumber, config.levelNumber === 999);
    this.isGameOver = false;
    this.isPaused = false;
    this.comboCount = 0;
    this.comboWindowSec = 0;
    this.comboEmitAccumulator = 0;
    this.comboCoinsThisLevel = 0;
    this.lastMatchTimestamp = 0;
    this.elapsedSec = 0;
    this.wasInDanger = false;
    this.dangerPulseTime = 0;
    if (this.trayMesh) {
      (this.trayMesh.material as THREE.MeshBasicMaterial).color.setRGB(1, 1, 1);
    }

    // Update 2D world background texture
    const save = SaveSystem.get();
    const bgWorldId = save.activeBackground === 'auto' ? config.worldId : Number(save.activeBackground) || config.worldId;
    if (this.bgMesh) {
      (this.bgMesh.material as THREE.MeshBasicMaterial).map = getWorldBackgroundTexture(bgWorldId);
      (this.bgMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }

    // Reset tray texture to 5 slots
    if (this.trayMesh) {
      (this.trayMesh.material as THREE.MeshBasicMaterial).map = getTrayDockTexture(5);
      (this.trayMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }

    const theme = save.activeTileTheme;
    const colorFriendly = save.settings.colorFriendly;
    const stepUnit = this.tileBaseSize * 0.48; // 1gx = half-tile width
    const boardCenterY = this.getBoardCenterY();
    const coveredIds = TileTrailsGameEngine.pickCoveredIds(config);

    config.tiles.forEach((placement, idx) => {
      const boardX = placement.gx * stepUnit;
      // Add subtle vertical layer lift so upper layers feel stacked in 2D
      const boardY = boardCenterY + placement.gy * stepUnit + placement.layer * 7;
      const boardZ = 20 + placement.layer * 10 + (10 - placement.gy) * 0.1 + idx * 0.001;
      const startsCovered = coveredIds.has(placement.id);

      const mat = new THREE.MeshBasicMaterial({
        map: startsCovered
          ? getCoveredTileTexture(theme, false)
          : getTileTexture(placement.motifId, theme, colorFriendly, false),
        transparent: true,
      });

      const mesh = new THREE.Mesh(this.tileGeometry, mat);
      // Entrance intro: tiles rise up from below (tray now lives at the top)
      const startY = boardY - 180 - placement.layer * 45;
      mesh.position.set(boardX, startY, boardZ);
      mesh.renderOrder = Math.round(boardZ * 10);
      this.scene.add(mesh);

      this.tiles.push({
        id: placement.id,
        gx: placement.gx,
        gy: placement.gy,
        layer: placement.layer,
        motifId: placement.motifId,
        state: 'board',
        isBlocked: false,
        isCovered: startsCovered,
        flipTime: 0,
        mesh,
        material: mat,
        boardX,
        boardY,
        boardZ,
        currX: boardX,
        currY: boardY,
        currScale: 1,
        animStartX: boardX,
        animStartY: startY,
        animCtrlX: boardX,
        animCtrlY: (startY + boardY) / 2,
        animTargetX: boardX,
        animTargetY: boardY,
        animProgress: 1,
        animDuration: 0.25,
        shakeTime: 0,
        popScaleTime: 0.18,
      });
    });

    this.recalculateBlockedStates(false);
    this.emitHUD();
  }

  public refreshVisualSettings() {
    const save = SaveSystem.get();
    if (this.levelConfig && this.bgMesh) {
      const bgWorldId =
        save.activeBackground === 'auto' ? this.levelConfig.worldId : Number(save.activeBackground) || this.levelConfig.worldId;
      (this.bgMesh.material as THREE.MeshBasicMaterial).map = getWorldBackgroundTexture(bgWorldId);
      (this.bgMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
    this.tiles.forEach((tile) => {
      if (tile.state === 'cleared') return;
      const blocked = tile.state === 'board' ? tile.isBlocked : false;
      tile.material.map = this.textureFor(tile, blocked);
      tile.material.needsUpdate = true;
    });
  }

  private recalculateBlockedStates(animateNewlyFreed = true) {
    const boardTiles = this.tiles.filter((t) => t.state === 'board' || t.state === 'returning');

    for (const tile of boardTiles) {
      const wasBlocked = tile.isBlocked;
      const nowBlocked = boardTiles.some(
        (other) =>
          other.id !== tile.id &&
          other.layer > tile.layer &&
          doTilesOverlap2D(tile.gx, tile.gy, other.gx, other.gy)
      );

      tile.isBlocked = nowBlocked;
      tile.material.map = this.textureFor(tile, nowBlocked);
      tile.material.needsUpdate = true;

      if (wasBlocked && !nowBlocked && animateNewlyFreed) {
        tile.popScaleTime = 0.2;
      }
    }
  }

  private bindEvents() {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('resize', this.handleResize);
  }

  public destroy() {
    this.destroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('resize', this.handleResize);

    // Release every per-level material so GPU memory doesn't accumulate across
    // the hundreds of level loads a player will do over the app's lifetime.
    // (Textures live in a shared cache and are intentionally kept warm.)
    this.tiles.forEach((t) => {
      t.material.dispose();
      this.scene.remove(t.mesh);
    });
    this.tiles = [];
    this.trayOrder = [];
    this.undoStack = [];

    const disposeSprites = (list: Array<{ sprite: THREE.Sprite; material: THREE.SpriteMaterial }>) => {
      list.forEach((p) => {
        p.material.dispose();
        this.scene.remove(p.sprite);
      });
    };
    disposeSprites(this.particles);
    disposeSprites(this.confetti);
    disposeSprites(this.ripples);
    disposeSprites(this.glows);
    disposeSprites(this.textPopups);
    disposeSprites(this.stars);
    this.ambientSprites.forEach((a) => {
      (a.sprite.material as THREE.SpriteMaterial).dispose();
      this.scene.remove(a.sprite);
    });

    if (this.flashMaterial) this.flashMaterial.dispose();
    if (this.flashMesh) this.scene.remove(this.flashMesh);
    if (this.hintHaloMesh) {
      (this.hintHaloMesh.material as THREE.MeshBasicMaterial).dispose();
      this.scene.remove(this.hintHaloMesh);
    }
    if (this.trayMesh) {
      (this.trayMesh.material as THREE.MeshBasicMaterial).dispose();
      this.scene.remove(this.trayMesh);
    }
    if (this.bgMesh) {
      (this.bgMesh.material as THREE.MeshBasicMaterial).dispose();
      this.scene.remove(this.bgMesh);
    }

    this.tileGeometry.dispose();
    this.renderer.dispose();
    // Explicitly free the GL context so the WebView reclaims it right away
    try {
      this.renderer.forceContextLoss();
    } catch {
      /* not supported on every platform */
    }
    if (dom.parentElement) dom.parentElement.removeChild(dom);
  }

  private resizeTimer: number | null = null;
  private lastSizeKey = '';

  /** Debounced: Android fires resize bursts on rotation / keyboard; we apply once when settled */
  public handleResize = () => {
    if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      this.resizeTimer = null;
      this.applyResize();
    }, 80);
  };

  private applyResize() {
    if (!this.container || this.destroyed) return;
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Skip no-op resizes (same dimensions) to avoid needless GPU buffer reallocations
    const key = `${Math.round(rect.width)}x${Math.round(rect.height)}`;
    if (key === this.lastSizeKey) return;
    this.lastSizeKey = key;

    const aspect = rect.width / rect.height;
    this.viewHeight = Math.max(1140, Math.min(1500, this.viewWidth / aspect));

    this.camera.left = -this.viewWidth / 2;
    this.camera.right = this.viewWidth / 2;
    this.camera.top = this.viewHeight / 2;
    this.camera.bottom = -this.viewHeight / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(rect.width, rect.height);

    if (this.trayMesh) {
      this.trayMesh.position.y = this.getTrayCenterY();
    }
    // Keep the tray dock + tiles in their correct positions for the new height
    this.tiles.forEach((tile) => {
      if (tile.state === 'board') {
        // boardY was computed from the old centre; recompute against the new one
        const stepUnit = this.tileBaseSize * 0.48;
        tile.boardY = this.getBoardCenterY() + tile.gy * stepUnit + tile.layer * 7;
        tile.currY = tile.boardY;
      }
    });
    this.updateTraySlotTargets();
  }

  private lastTapAt = 0;

  private handlePointerDown = (e: PointerEvent) => {
    if (this.isGameOver || this.isPaused) return;
    // Only react to the primary pointer (ignore secondary fingers / right-click)
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;

    // Debounce ultra-fast double taps so one intended tap never grabs two tiles
    const now = performance.now();
    if (now - this.lastTapAt < 90) return;
    this.lastTapAt = now;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.pointerNDC.set(x, y);

    this.raycaster.setFromCamera(this.pointerNDC, this.camera);

    const boardMeshes = this.tiles
      .filter((t) => t.state === 'board')
      .map((t) => t.mesh);

    const intersects = this.raycaster.intersectObjects(boardMeshes, false);
    if (intersects.length === 0) return;

    // Sort by highest renderOrder / z so top layer tile is always picked first
    intersects.sort((a, b) => b.object.renderOrder - a.object.renderOrder);
    const hitMesh = intersects[0].object;
    const tappedTile = this.tiles.find((t) => t.mesh === hitMesh);
    if (!tappedTile) return;

    if (tappedTile.isBlocked) {
      tappedTile.shakeTime = 0.28;
      audio.playBlockedTap();
      // Rejected-tap feedback: red flash ring on the blocked tile
      this.spawnRipple(tappedTile.currX, tappedTile.currY, '#F87171', 120);
      this.spawnBurst(tappedTile.currX, tappedTile.currY, '#FCA5A5', 4);
      return;
    }

    // Covered mystery tile: first tap peels the cover, second tap collects it
    if (tappedTile.isCovered) {
      this.uncoverTile(tappedTile);
      return;
    }

    this.selectBoardTile(tappedTile);
  };

  private selectBoardTile(tile: ActiveTile) {
    // Count active tray tiles (excluding tiles currently disappearing in a match)
    const activeTrayCount = this.trayOrder.filter((t) => t.state !== 'matching').length;
    if (activeTrayCount >= this.maxTraySlots) {
      audio.playBlockedTap();
      return;
    }

    if (this.hintedTileId === tile.id) {
      this.hintedTileId = null;
      if (this.hintHaloMesh) this.hintHaloMesh.visible = false;
    }

    audio.playTileTap(tile.layer);
    audio.playTileSlide();

    // Update blocked states immediately now that this tile left the board
    tile.state = 'flying_to_tray';
    tile.isBlocked = false;
    const save = SaveSystem.get();
    tile.material.map = getTileTexture(tile.motifId, save.activeTileTheme, save.settings.colorFriendly, false);

    // Smartly insert into trayOrder next to matching motif if present
    let insertIndex = this.trayOrder.length;
    for (let i = this.trayOrder.length - 1; i >= 0; i--) {
      if (this.trayOrder[i].motifId === tile.motifId && this.trayOrder[i].state !== 'matching') {
        insertIndex = i + 1;
        break;
      }
    }
    this.trayOrder.splice(insertIndex, 0, tile);
    this.undoStack.push(tile);

    // Spawn tap VFX: sparkle burst, soft glow bloom and a tiny ripple
    this.spawnBurst(tile.currX, tile.currY, '#FFFBEB', 6);
    this.spawnGlow(tile.currX, tile.currY, '#FEF3C7', 110);
    this.spawnRipple(tile.currX, tile.currY, '#FFFFFF', 130);

    this.recalculateBlockedStates(true);
    this.updateTraySlotTargets(tile);
    this.emitHUD();
  }

  private updateTraySlotTargets(newlyTappedTile?: ActiveTile) {
    const trayY = this.getTrayCenterY() + 3;
    const slotScale = this.maxTraySlots === 6 ? 0.84 : 0.94;

    this.trayOrder.forEach((tile, index) => {
      const targetX = this.getTraySlotX(index);
      const targetY = trayY;

      tile.mesh.position.z = 220 + index;
      tile.mesh.renderOrder = 600 + index;

      if (tile === newlyTappedTile) {
        tile.animStartX = tile.currX;
        tile.animStartY = tile.currY;
        // Curved 2D arc: bow sideways so the tile sweeps up into the top tray
        const sideBow = tile.currX < targetX ? -70 : 70;
        tile.animCtrlX = (tile.currX + targetX) * 0.5 + sideBow;
        tile.animCtrlY = (tile.currY + targetY) * 0.5 + 40;
        tile.animTargetX = targetX;
        tile.animTargetY = targetY;
        tile.animProgress = 0;
        tile.animDuration = 0.22;
      } else if (tile.state === 'tray' || tile.state === 'flying_to_tray') {
        tile.animStartX = tile.currX;
        tile.animStartY = tile.currY;
        tile.animCtrlX = (tile.currX + targetX) * 0.5;
        tile.animCtrlY = (tile.currY + targetY) * 0.5;
        tile.animTargetX = targetX;
        tile.animTargetY = targetY;
        if (Math.abs(tile.currX - targetX) > 2 || Math.abs(tile.currY - targetY) > 2) {
          tile.animProgress = 0;
          tile.animDuration = 0.15;
        }
      }
      tile.currScale = slotScale;
    });
  }

  private checkTrayMatchesAndEndConditions() {
    if (this.isGameOver) return;

    // Look for any 3 tiles of identical motifId that have landed in the tray
    const landedTrayTiles = this.trayOrder.filter((t) => t.state === 'tray');
    const countsByMotif = new Map<number, ActiveTile[]>();

    for (const t of landedTrayTiles) {
      const arr = countsByMotif.get(t.motifId) || [];
      arr.push(t);
      countsByMotif.set(t.motifId, arr);
    }

    for (const [motifId, group] of countsByMotif.entries()) {
      if (group.length >= 3) {
        const matchedThree = group.slice(0, 3);
        const now = performance.now();
        this.comboWindowSec = TileTrailsGameEngine.COMBO_WINDOW;
        if (now - this.lastMatchTimestamp < TileTrailsGameEngine.COMBO_WINDOW * 1000) {
          this.comboCount++;
        } else {
          this.comboCount = 1;
        }
        this.lastMatchTimestamp = now;

        audio.playTripleMatch(this.comboCount);

        const accent = TILE_MOTIFS[motifId % TILE_MOTIFS.length].accentColor;

        // Center of the matched trio drives the ripple / glow / text placement
        const centerX =
          matchedThree.reduce((sum, t) => sum + t.currX, 0) / matchedThree.length;
        const centerY =
          matchedThree.reduce((sum, t) => sum + t.currY, 0) / matchedThree.length;

        this.playMatchVfx(centerX, centerY, accent, this.comboCount);

        matchedThree.forEach((mTile, mIdx) => {
          mTile.state = 'matching';
          mTile.animProgress = 0;
          mTile.animDuration = 0.22;
          // Remove from undo stack if matched
          this.undoStack = this.undoStack.filter((u) => u.id !== mTile.id);
          this.spawnBurst(mTile.currX, mTile.currY, accent, 14);
          // Stagger the glow puffs so the trio lights up in sequence
          window.setTimeout(() => {
            if (this.destroyed) return;
            if (mTile.state === 'matching' || mTile.state === 'cleared') {
              this.spawnGlow(mTile.currX, mTile.currY, accent, 120);
            }
          }, mIdx * 45);
        });

        // Combo coin bonus: x3 = +1, x4 = +2, x5+ = +3 (small, capped, in-level reward)
        const comboBonus = this.comboCount >= 5 ? 3 : this.comboCount === 4 ? 2 : this.comboCount === 3 ? 1 : 0;
        if (comboBonus > 0) {
          this.comboCoinsThisLevel += comboBonus;
          this.spawnTextPopup(centerX, centerY - 46, `+${comboBonus} 🪙`, '#FBBF24', 0.7);
        }

        SaveSystem.save((draft) => {
          draft.stats.totalMatches += 1;
          if (!draft.discoveredTiles.includes(motifId)) {
            draft.discoveredTiles.push(motifId);
          }
          if (comboBonus > 0) {
            draft.coins += comboBonus;
            draft.stats.totalCoinsEarned += comboBonus;
          }
        });
        SaveSystem.trackMaxStat('maxCombo', this.comboCount);

        SaveSystem.progressTask('task_match_fruits', 3);
        if (this.comboCount >= 2) {
          SaveSystem.progressTask('task_combo', 1);
        }

        this.emitHUD();
        return;
      }
    }

    // Check if any tiles are still animating
    const anyAnimating = this.tiles.some(
      (t) => t.state === 'flying_to_tray' || t.state === 'matching' || t.state === 'returning'
    );
    if (anyAnimating) return;

    // Check WIN condition: every tile cleared!
    const remaining = this.tiles.filter((t) => t.state !== 'cleared');
    if (remaining.length === 0) {
      this.isGameOver = true;
      audio.playLevelWin();

      // Full celebration VFX package
      this.spawnConfettiRain(56);
      this.spawnScreenFlash('#FEF9C3', 0.42);
      this.spawnScreenShake(10, 0.35);
      const bcy = this.getBoardCenterY();
      this.spawnTextPopup(0, bcy + 40, 'LEVEL CLEAR!', '#34D399', 1.35);
      this.spawnRipple(0, bcy, '#FACC15', 420);
      this.spawnGlow(0, bcy, '#FEF08A', 420);
      this.spawnStars(-140, bcy + 120, '#FACC15', 8);
      this.spawnStars(140, bcy + 120, '#F472B6', 8);

      // Celebratory bursts across the board
      this.spawnBurst(-160, bcy + 90, '#FACC15', 18);
      this.spawnBurst(160, bcy + 90, '#34D399', 18);
      this.spawnBurst(0, bcy - 40, '#F472B6', 22);

      const discovered = Array.from(new Set(this.tiles.map((t) => t.motifId)));
      const parTime = this.levelConfig?.parTimeSec ?? 999;
      this.callbacks.onWin(
        Math.round(this.elapsedSec),
        this.extraSlotUsed,
        discovered,
        {
          usedPowerUp: this.usedPowerUpThisLevel,
          beatParTime: Math.round(this.elapsedSec) <= parTime,
        }
      );
      return;
    }

    // Check LOSE condition: all tray slots full and no triple match possible
    if (this.trayOrder.length >= this.maxTraySlots) {
      this.isGameOver = true;
      audio.playLevelLose();
      this.callbacks.onLose();
    }
  }

  // ==================== POWER-UPS ====================

  public canUndo(): boolean {
    return this.undoStack.some((t) => t.state === 'tray');
  }

  public executeUndo(): boolean {
    if (this.isGameOver) return false;
    // Free in tutorial levels, otherwise requires stock
    if (!this.hasPowerUpAvailable('undo')) return false;
    // Find last tile in undoStack that is currently in tray
    let targetTile: ActiveTile | null = null;
    for (let i = this.undoStack.length - 1; i >= 0; i--) {
      if (this.undoStack[i].state === 'tray') {
        targetTile = this.undoStack[i];
        this.undoStack.splice(i, 1);
        break;
      }
    }
    if (!targetTile) return false;

    this.consumePowerUpStock('undo');

    audio.playPowerUp();
    this.trayOrder = this.trayOrder.filter((t) => t.id !== targetTile!.id);

    targetTile.state = 'returning';
    targetTile.animStartX = targetTile.currX;
    targetTile.animStartY = targetTile.currY;
    targetTile.animCtrlX = (targetTile.currX + targetTile.boardX) * 0.5 + (targetTile.currX < targetTile.boardX ? -60 : 60);
    targetTile.animCtrlY = (targetTile.currY + targetTile.boardY) * 0.5 + 30;
    targetTile.animTargetX = targetTile.boardX;
    targetTile.animTargetY = targetTile.boardY;
    targetTile.animProgress = 0;
    targetTile.animDuration = 0.24;
    targetTile.currScale = 1;
    targetTile.mesh.position.z = targetTile.boardZ;
    targetTile.mesh.renderOrder = Math.round(targetTile.boardZ * 10);

    this.spawnBurst(targetTile.currX, targetTile.currY, '#60A5FA', 10);
    this.spawnRipple(targetTile.currX, targetTile.currY, '#60A5FA', 170);
    this.spawnTextPopup(targetTile.currX, targetTile.currY + 42, 'UNDO', '#60A5FA', 0.75);
    this.updateTraySlotTargets();
    this.recalculateBlockedStates(false);
    this.emitHUD();
    SaveSystem.progressTask('task_powerup', 1);
    SaveSystem.trackStat('powerupsUsed');
    SaveSystem.trackStat('undoUsed');
    this.usedPowerUpThisLevel = true;
    return true;
  }

  public executeShuffle(): boolean {
    if (this.isGameOver) return false;
    if (!this.hasPowerUpAvailable('shuffle')) return false;
    const boardTiles = this.tiles.filter((t) => t.state === 'board');
    if (boardTiles.length === 0) return false;

    this.consumePowerUpStock('shuffle');

    audio.playPowerUp();

    // Shuffle motifIds among remaining board tiles while keeping exact counts intact.
    // Covered tiles keep their mystery cover but still participate in the redistribution.
    // We retry up to 30 times and keep the first arrangement that is provably beatable
    // with the remaining tray capacity, so Shuffle can never leave the player stuck.
    const baseMotifs = boardTiles.map((t) => t.motifId);
    const trayMotifs = this.trayOrder.filter((t) => t.state === 'tray').map((t) => t.motifId);
    const freeSlots = Math.max(1, this.maxTraySlots - trayMotifs.length);

    let chosen: number[] = [...baseMotifs];
    for (let attempt = 0; attempt < 30; attempt++) {
      const motifs = [...baseMotifs];
      for (let i = motifs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [motifs[i], motifs[j]] = [motifs[j], motifs[i]];
      }
      // Build a placement snapshot to verify; tray tiles count as pre-loaded motifs
      const snapshot: TilePlacement[] = boardTiles.map((t, i) => ({
        id: t.id,
        gx: t.gx,
        gy: t.gy,
        layer: t.layer,
        motifId: motifs[i],
      }));
      // Include tray contents as already-free "virtual" tiles on a top layer far away so
      // the verifier accounts for what is already sitting in the tray
      const virtual: TilePlacement[] = trayMotifs.map((m, i) => ({
        id: `__tray_${i}`,
        gx: 100 + i * 3,
        gy: 100,
        layer: 0,
        motifId: m,
      }));
      if (isSolvableWithTray([...virtual, ...snapshot], freeSlots + trayMotifs.length)) {
        chosen = motifs;
        break;
      }
      if (attempt === 29) chosen = motifs; // fall back to last try
    }

    boardTiles.forEach((tile, idx) => {
      tile.motifId = chosen[idx];
      tile.material.map = this.textureFor(tile);
      tile.material.needsUpdate = true;
      tile.popScaleTime = 0.26;
    });

    this.spawnBurst(0, this.getBoardCenterY(), '#A855F7', 22);
    this.spawnRipple(0, this.getBoardCenterY(), '#C084FC', 400);
    this.spawnGlow(0, this.getBoardCenterY(), '#A855F7', 380);
    this.spawnTextPopup(0, this.getBoardCenterY() + 60, 'SHUFFLE!', '#C084FC', 0.95);
    this.spawnScreenFlash('#EDE9FE', 0.24);
    SaveSystem.progressTask('task_powerup', 1);
    SaveSystem.trackStat('powerupsUsed');
    SaveSystem.trackStat('shuffleUsed');
    this.usedPowerUpThisLevel = true;
    return true;
  }

  public executeHint(): boolean {
    if (this.isGameOver) return false;
    if (!this.hasPowerUpAvailable('hint')) return false;
    // Hints only ever point at revealed tiles — covered fruits stay a mystery
    const freeBoardTiles = this.tiles.filter((t) => t.state === 'board' && !t.isBlocked && !t.isCovered);
    if (freeBoardTiles.length === 0) return false;

    this.consumePowerUpStock('hint');

    audio.playPowerUp();

    // Prioritize a motif that already has tiles sitting in the tray
    let bestTile: ActiveTile | null = null;
    const trayMotifCounts = new Map<number, number>();
    this.trayOrder.forEach((t) => {
      if (t.state === 'tray') {
        trayMotifCounts.set(t.motifId, (trayMotifCounts.get(t.motifId) || 0) + 1);
      }
    });

    // Try finding a free board tile whose motif has 2 in tray, then 1 in tray
    for (const targetCount of [2, 1]) {
      for (const ft of freeBoardTiles) {
        if (trayMotifCounts.get(ft.motifId) === targetCount) {
          bestTile = ft;
          break;
        }
      }
      if (bestTile) break;
    }

    if (!bestTile) {
      // Otherwise pick the highest-layer free tile
      freeBoardTiles.sort((a, b) => b.layer - a.layer);
      bestTile = freeBoardTiles[0];
    }

    this.hintedTileId = bestTile.id;
    bestTile.popScaleTime = 0.3;
    // Golden hint VFX: burst, glow, ripple and a "HINT!" label
    this.spawnBurst(bestTile.currX, bestTile.currY, '#FACC15', 14);
    this.spawnGlow(bestTile.currX, bestTile.currY, '#FDE047', 170);
    this.spawnRipple(bestTile.currX, bestTile.currY, '#FACC15', 200);
    this.spawnTextPopup(bestTile.currX, bestTile.currY + 46, 'HINT!', '#FACC15', 0.8);
    SaveSystem.trackStat('powerupsUsed');
    SaveSystem.trackStat('hintUsed');
    this.usedPowerUpThisLevel = true;
    return true;
  }

  public executeExtraSlot(): boolean {
    if (this.maxTraySlots >= 6) return false;
    if (!this.hasPowerUpAvailable('extraSlot')) return false;

    this.consumePowerUpStock('extraSlot');

    audio.playPowerUp();
    this.maxTraySlots = 6;
    this.extraSlotUsed = true;

    if (this.trayMesh) {
      (this.trayMesh.material as THREE.MeshBasicMaterial).map = getTrayDockTexture(6);
      (this.trayMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
    this.spawnBurst(0, this.getTrayCenterY(), '#34D399', 18);
    this.spawnRipple(0, this.getTrayCenterY(), '#34D399', 320);
    this.spawnGlow(0, this.getTrayCenterY(), '#6EE7B7', 300);
    this.spawnTextPopup(0, this.getTrayCenterY() - 95, '+1 SLOT!', '#34D399', 0.95);
    SaveSystem.progressTask('task_powerup', 1);
    SaveSystem.trackStat('powerupsUsed');
    SaveSystem.trackStat('extraSlotUsed');
    this.usedPowerUpThisLevel = true;
    return true;
  }

  /**
   * Second-chance revive when tray is full: returns up to 2 tiles from the tray back to the board
   * and expands tray to 6 slots!
   */
  public reviveFromFullTray() {
    this.isGameOver = false;
    audio.playPowerUp();
    if (this.maxTraySlots < 6) {
      this.maxTraySlots = 6;
      this.extraSlotUsed = true;
      if (this.trayMesh) {
        (this.trayMesh.material as THREE.MeshBasicMaterial).map = getTrayDockTexture(6);
        (this.trayMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
      }
    }

    // Return up to 2 tiles from the right end of the tray back to their original board positions
    const toReturn = this.trayOrder.splice(-2);
    toReturn.forEach((tile) => {
      tile.state = 'returning';
      tile.animStartX = tile.currX;
      tile.animStartY = tile.currY;
      tile.animCtrlX = (tile.currX + tile.boardX) * 0.5 + (tile.currX < tile.boardX ? -70 : 70);
      tile.animCtrlY = (tile.currY + tile.boardY) * 0.5 + 30;
      tile.animTargetX = tile.boardX;
      tile.animTargetY = tile.boardY;
      tile.animProgress = 0;
      tile.animDuration = 0.25;
      tile.currScale = 1;
      tile.mesh.position.z = tile.boardZ;
      tile.mesh.renderOrder = Math.round(tile.boardZ * 10);
    });

    this.updateTraySlotTargets();
    this.recalculateBlockedStates(false);
    this.emitHUD();
  }

  // ==================== VFX SPAWNERS ====================

  /** Expanding hollow shockwave ring */
  private spawnRipple(x: number, y: number, hexColor: string, endScale = 240) {
    for (const r of this.ripples) {
      if (r.active) continue;
      r.active = true;
      r.life = 0;
      r.sprite.visible = true;
      r.material.color.set(hexColor);
      r.material.opacity = 0.9;
      r.endScale = endScale;
      r.sprite.position.set(x, y, 500);
      r.sprite.scale.set(r.startScale, r.startScale, 1);
      return;
    }
  }

  /** Additive bloom puff behind a match */
  private spawnGlow(x: number, y: number, hexColor: string, scale = 190) {
    for (const g of this.glows) {
      if (g.active) continue;
      g.active = true;
      g.life = 0;
      g.sprite.visible = true;
      g.material.color.set(hexColor);
      g.material.opacity = 0.75;
      g.endScale = scale;
      g.sprite.position.set(x, y, 480);
      g.sprite.scale.set(g.startScale, g.startScale, 1);
      return;
    }
  }

  /** Rising outlined text popup (e.g. "COMBO x3!") */
  private spawnTextPopup(x: number, y: number, text: string, hexColor: string, scale = 1) {
    for (const t of this.textPopups) {
      if (t.active) continue;
      t.active = true;
      t.life = 0;
      t.maxLife = text.length > 8 ? 1.15 : 0.95;
      t.sprite.visible = true;
      t.material.map = getTextPopupTexture(text, hexColor);
      t.material.needsUpdate = true;
      t.material.opacity = 1;
      t.vx = (Math.random() - 0.5) * 26;
      t.vy = 105;
      t.baseScale = scale;
      t.sprite.position.set(x, y, 520);
      const aspect = 512 / 192;
      const w = 210 * scale;
      t.sprite.scale.set(w, w / aspect, 1);
      return;
    }
  }

  /** Twinkling star that floats upward and spins */
  private spawnStars(x: number, y: number, hexColor: string, count: number) {
    if (this.lowPowerMode) count = Math.max(1, Math.ceil(count / 2));
    let spawned = 0;
    for (const s of this.stars) {
      if (s.active) continue;
      s.active = true;
      s.life = 0;
      s.maxLife = 0.8 + Math.random() * 0.5;
      s.sprite.visible = true;
      s.material.color.set(hexColor);
      s.material.opacity = 1;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 150;
      s.vx = Math.cos(angle) * speed;
      s.vy = Math.abs(Math.sin(angle)) * speed + 70;
      s.spin = (Math.random() - 0.5) * 7;
      s.scale = 20 + Math.random() * 22;
      s.sprite.position.set(x, y, 505);
      s.sprite.scale.set(s.scale, s.scale, 1);
      spawned++;
      if (spawned >= count) break;
    }
  }

  /** Falling confetti celebration across the whole board */
  private spawnConfettiRain(count: number) {
    if (this.lowPowerMode) count = Math.ceil(count / 2);
    const colors = ['#FACC15', '#F43F5E', '#34D399', '#60A5FA', '#C084FC', '#FB923C', '#FFFFFF'];
    let spawned = 0;
    for (const c of this.confetti) {
      if (c.active) continue;
      c.active = true;
      c.life = 0;
      c.maxLife = 1.4 + Math.random() * 0.9;
      c.sprite.visible = true;
      c.material.color.set(colors[spawned % colors.length]);
      c.material.opacity = 1;
      c.x = (Math.random() - 0.5) * this.viewWidth * 0.95;
      c.y = this.viewHeight / 2 + 40 + Math.random() * 220;
      c.vx = (Math.random() - 0.5) * 90;
      c.vy = -140 - Math.random() * 190;
      c.startScale = 16 + Math.random() * 14;
      c.rotSpeed = (Math.random() - 0.5) * 9;
      c.sprite.position.set(c.x, c.y, 490);
      c.sprite.scale.set(c.startScale, c.startScale * 0.55, 1);
      spawned++;
      if (spawned >= count) break;
    }
  }

  /** Brief full-screen tint flash */
  private spawnScreenFlash(hexColor: string, strength = 0.3) {
    if (!this.flashMaterial || !this.flashMesh) return;
    this.flashColor.set(hexColor);
    this.flashMaterial.color.copy(this.flashColor);
    this.flashAlpha = Math.max(this.flashAlpha, strength);
    this.flashMesh.visible = true;
  }

  /** Quick camera shake for impactful matches */
  private spawnScreenShake(strength: number, duration = 0.22) {
    this.screenShakeStrength = Math.max(this.screenShakeStrength, strength);
    this.screenShakeTime = Math.max(this.screenShakeTime, duration);
  }

  /** Full celebratory VFX package for a triple match */
  private playMatchVfx(x: number, y: number, hexColor: string, combo: number) {
    this.spawnGlow(x, y, hexColor, combo >= 3 ? 230 : 180);
    this.spawnRipple(x, y, hexColor, combo >= 3 ? 290 : 230);

    if (combo >= 2) {
      this.spawnTextPopup(x, Math.min(y + 40, this.viewHeight / 2 - 60), `COMBO x${combo}!`, '#FACC15', 1.05);
      this.spawnScreenFlash(combo >= 4 ? '#FDE047' : '#FEF9C3', combo >= 4 ? 0.34 : 0.22);
      this.spawnScreenShake(combo >= 4 ? 9 : 5);
      this.spawnStars(x, y, hexColor, combo >= 4 ? 10 : 6);
    } else {
      this.spawnStars(x, y, hexColor, 3);
    }
  }

  private spawnBurst(x: number, y: number, hexColor: string, count: number) {
    if (this.lowPowerMode) count = Math.max(2, Math.ceil(count / 2));
    const color = new THREE.Color(hexColor);
    let spawned = 0;
    for (const p of this.particles) {
      if (p.active) continue;
      p.active = true;
      p.sprite.visible = true;
      p.material.color.copy(color);
      p.material.opacity = 1;
      p.x = x;
      p.y = y;
      const angle = (Math.PI * 2 * spawned) / count + (Math.random() - 0.5) * 0.4;
      const speed = 90 + Math.random() * 170;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0;
      p.maxLife = 0.35 + Math.random() * 0.2;
      p.startScale = 22 + Math.random() * 16;
      p.sprite.scale.set(p.startScale, p.startScale, 1);
      p.sprite.position.set(x, y, 400);

      spawned++;
      if (spawned >= count) break;
    }
  }

  private emitHUD() {
    const remaining = this.tiles.filter((t) => t.state !== 'cleared').length;
    const trayCount = this.trayOrder.filter((t) => t.state !== 'matching').length;
    const coveredTiles = this.tiles.filter((t) => t.state === 'board' && t.isCovered).length;
    const freeTiles = this.tiles.filter((t) => t.state === 'board' && !t.isBlocked).length;
    const trayDanger = trayCount >= this.maxTraySlots - 1 && remaining > 0;

    // Play a soft warning chime the moment the tray enters the danger zone
    if (trayDanger && !this.wasInDanger) {
      audio.playTrayWarning();
    }
    this.wasInDanger = trayDanger;

    this.callbacks.onHUDUpdate({
      remainingTiles: remaining,
      totalTiles: this.levelConfig?.totalTiles || 0,
      trayCount,
      maxTraySlots: this.maxTraySlots,
      canUndo: this.canUndo(),
      extraSlotUsed: this.extraSlotUsed,
      comboCount: this.comboCount,
      elapsedSec: Math.floor(this.elapsedSec),
      coveredTiles,
      trayDanger,
      freeTiles,
      comboMeter: this.comboCount > 0 ? Math.max(0, this.comboWindowSec / TileTrailsGameEngine.COMBO_WINDOW) : 0,
      comboCoins: this.comboCoinsThisLevel,
    });
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  private startLoop() {
    // Never run two loops at once (e.g. after a context-restore)
    if (this.animFrameId !== null) return;
    this.lastFrameTime = performance.now();

    const tick = (now: number) => {
      if (this.destroyed) return;
      this.animFrameId = requestAnimationFrame(tick);
      if (this.contextLost) return;

      // Clamp dt so a long background stall never teleports animations
      const rawDt = (now - this.lastFrameTime) / 1000;
      const dt = Math.min(0.05, Math.max(0, rawDt));
      this.lastFrameTime = now;

      // Adaptive quality: if we see sustained slow frames (>28ms), enter low-power mode
      // which halves particle spawn counts and skips ambient sparkle motion.
      if (rawDt > 0.028) {
        this.slowFrameCount = Math.min(60, this.slowFrameCount + 1);
      } else {
        this.slowFrameCount = Math.max(0, this.slowFrameCount - 1);
      }
      const shouldLowPower = this.slowFrameCount > 30;
      if (shouldLowPower !== this.lowPowerMode) {
        this.lowPowerMode = shouldLowPower;
      }

      try {
        this.update(dt, now / 1000);
        this.renderer.render(this.scene, this.camera);
      } catch (err) {
        // A single bad frame must never take the whole game down
        this.frameErrorCount++;
        if (this.frameErrorCount <= 3) console.warn('[TileTrails] frame error (recovered):', err);
      }
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private update(dt: number, timeSec: number) {
    if (!this.isPaused && !this.isGameOver) {
      const prevFloor = Math.floor(this.elapsedSec);
      this.elapsedSec += dt;
      if (Math.floor(this.elapsedSec) !== prevFloor) {
        this.emitHUD();
      }
    }

    // 1. Update ambient 2D sky sparkles (these keep drifting even while paused — purely decorative)
    for (const amb of this.ambientSprites) {
      amb.sprite.position.y = amb.baseY + Math.sin(timeSec * 1.4 + amb.phase) * 14;
      amb.sprite.position.x += amb.speed * dt;
      if (amb.sprite.position.x > this.viewWidth / 2 + 30) {
        amb.sprite.position.x = -this.viewWidth / 2 - 30;
      }
    }

    // While paused, freeze all gameplay simulation (tiles, matches, VFX) so nothing
    // resolves behind the pause menu. Rendering continues so the board stays visible.
    if (this.isPaused) {
      return;
    }

    // Combo window countdown — drives the HUD combo meter and expires the streak
    if (this.comboCount > 0 && this.comboWindowSec > 0) {
      this.comboWindowSec = Math.max(0, this.comboWindowSec - dt);
      // Emit at ~10Hz for a smooth meter without flooding React
      this.comboEmitAccumulator += dt;
      if (this.comboEmitAccumulator >= 0.1 || this.comboWindowSec === 0) {
        this.comboEmitAccumulator = 0;
        if (this.comboWindowSec === 0) {
          this.comboCount = 0;
        }
        this.emitHUD();
      }
    }

    // 2. Update tiles
    let stateChanged = false;
    for (const tile of this.tiles) {
      if (tile.state === 'cleared') continue;

      if (tile.state === 'flying_to_tray' || tile.state === 'returning') {
        tile.animProgress = Math.min(1, tile.animProgress + dt / tile.animDuration);
        const t = 1 - Math.pow(1 - tile.animProgress, 3); // EaseOutCubic
        const inv = 1 - t;
        // Quadratic bezier curve in 2D
        tile.currX =
          inv * inv * tile.animStartX +
          2 * inv * t * tile.animCtrlX +
          t * t * tile.animTargetX;
        tile.currY =
          inv * inv * tile.animStartY +
          2 * inv * t * tile.animCtrlY +
          t * t * tile.animTargetY;

        if (tile.animProgress >= 1) {
          tile.currX = tile.animTargetX;
          tile.currY = tile.animTargetY;
          if (tile.state === 'flying_to_tray') {
            tile.state = 'tray';
          } else if (tile.state === 'returning') {
            tile.state = 'board';
            this.recalculateBlockedStates(false);
          }
          stateChanged = true;
        }
      } else if (tile.state === 'tray') {
        if (tile.animProgress < 1) {
          tile.animProgress = Math.min(1, tile.animProgress + dt / tile.animDuration);
          const t = 1 - Math.pow(1 - tile.animProgress, 2);
          tile.currX = tile.animStartX + (tile.animTargetX - tile.animStartX) * t;
          tile.currY = tile.animStartY + (tile.animTargetY - tile.animStartY) * t;
        }
      } else if (tile.state === 'matching') {
        tile.animProgress = Math.min(1, tile.animProgress + dt / tile.animDuration);
        const p = tile.animProgress;
        // Scale pop 0.85 -> 1.18 -> 0
        const scale = p < 0.35 ? 0.85 + (p / 0.35) * 0.35 : 1.2 * (1 - (p - 0.35) / 0.65);
        tile.mesh.scale.set( Math.max(0.01, scale), Math.max(0.01, scale), 1);

        if (tile.animProgress >= 1) {
          tile.state = 'cleared';
          tile.mesh.visible = false;
          this.trayOrder = this.trayOrder.filter((t) => t.id !== tile.id);
          this.updateTraySlotTargets();
          stateChanged = true;
        }
        continue;
      }

      // Apply shake or pop scale on board/tray
      let offsetX = 0;
      if (tile.shakeTime > 0) {
        tile.shakeTime = Math.max(0, tile.shakeTime - dt);
        offsetX = Math.sin(tile.shakeTime * 55) * 7;
      }

      let popMult = 1;
      if (tile.popScaleTime > 0) {
        tile.popScaleTime = Math.max(0, tile.popScaleTime - dt);
        popMult = 1 + Math.sin((tile.popScaleTime / 0.25) * Math.PI) * 0.14;
      }

      // Uncover reveal: horizontal card flip (squash X to 0 and back)
      let flipX = 1;
      if (tile.flipTime > 0) {
        tile.flipTime = Math.max(0, tile.flipTime - dt);
        const p = 1 - tile.flipTime / 0.34; // 0 → 1
        flipX = Math.abs(Math.cos(p * Math.PI));
        flipX = Math.max(0.06, flipX);
      }

      tile.mesh.position.x = tile.currX + offsetX;
      tile.mesh.position.y = tile.currY;
      tile.mesh.scale.set(tile.currScale * popMult * flipX, tile.currScale * popMult, 1);
    }

    // 3. Update Hint Halo Ring if active
    if (this.hintHaloMesh) {
      const hinted = this.hintedTileId ? this.tiles.find((t) => t.id === this.hintedTileId && t.state === 'board') : null;
      if (hinted) {
        this.hintHaloMesh.visible = true;
        this.hintHaloMesh.position.set(hinted.currX, hinted.currY, hinted.boardZ + 2);
        const pulse = 1 + Math.sin(timeSec * 7) * 0.08;
        this.hintHaloMesh.scale.set(pulse, pulse, 1);
      } else {
        this.hintHaloMesh.visible = false;
      }
    }

    // 4. Update Pooled 2D Particles
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.sprite.visible = false;
        continue;
      }
      const progress = p.life / p.maxLife;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 180 * dt; // Slight 2D gravity arc
      p.sprite.position.x = p.x;
      p.sprite.position.y = p.y;
      const sc = p.startScale * (1 - progress * 0.7);
      p.sprite.scale.set(sc, sc, 1);
      p.material.opacity = 1 - progress;
    }

    // 5. Update Celebration Confetti
    for (const c of this.confetti) {
      if (!c.active) continue;
      c.life += dt;
      if (c.life >= c.maxLife) {
        c.active = false;
        c.sprite.visible = false;
        continue;
      }
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy -= 55 * dt; // Gentle flutter gravity
      c.vx += Math.sin((c.life + c.startScale) * 6) * 34 * dt; // Swaying drift
      c.sprite.position.set(c.x, c.y, 490);
      c.sprite.material.rotation += c.rotSpeed * dt;
      const fadeStart = c.maxLife * 0.62;
      c.material.opacity =
        c.life < fadeStart ? 1 : Math.max(0, 1 - (c.life - fadeStart) / (c.maxLife - fadeStart));
    }

    // 6. Update Shockwave Ripples
    for (const r of this.ripples) {
      if (!r.active) continue;
      r.life += dt;
      const progress = r.life / r.maxLife;
      if (progress >= 1) {
        r.active = false;
        r.sprite.visible = false;
        continue;
      }
      const eased = 1 - Math.pow(1 - progress, 3);
      const scale = r.startScale + (r.endScale - r.startScale) * eased;
      r.sprite.scale.set(scale, scale, 1);
      r.material.opacity = 0.9 * (1 - progress);
    }

    // 7. Update Bloom Glows
    for (const g of this.glows) {
      if (!g.active) continue;
      g.life += dt;
      const progress = g.life / g.maxLife;
      if (progress >= 1) {
        g.active = false;
        g.sprite.visible = false;
        continue;
      }
      // Fast expand then settle
      const eased = 1 - Math.pow(1 - Math.min(1, progress * 1.5), 2);
      const scale = g.startScale + (g.endScale - g.startScale) * eased;
      g.sprite.scale.set(scale, scale, 1);
      g.material.opacity = 0.75 * (1 - progress);
    }

    // 8. Update Floating Text Popups
    for (const t of this.textPopups) {
      if (!t.active) continue;
      t.life += dt;
      const progress = t.life / t.maxLife;
      if (progress >= 1) {
        t.active = false;
        t.sprite.visible = false;
        continue;
      }
      const pos = t.sprite.position;
      pos.x += t.vx * dt;
      pos.y += t.vy * dt;
      t.vy *= 1 - 1.6 * dt; // Ease upward drift

      // Pop-in scale then gentle hold, fade near the end
      let scaleMul: number;
      if (progress < 0.18) {
        scaleMul = 0.6 + (progress / 0.18) * 0.5; // 0.6 -> 1.1 overshoot
      } else if (progress < 0.32) {
        scaleMul = 1.1 - ((progress - 0.18) / 0.14) * 0.1; // settle to 1.0
      } else {
        scaleMul = 1;
      }
      const aspect = 512 / 192;
      const w = 210 * t.baseScale * scaleMul;
      t.sprite.scale.set(w, w / aspect, 1);
      t.material.opacity = progress > 0.66 ? Math.max(0, 1 - (progress - 0.66) / 0.34) : 1;
    }

    // 9. Update Twinkling Stars
    for (const s of this.stars) {
      if (!s.active) continue;
      s.life += dt;
      const progress = s.life / s.maxLife;
      if (progress >= 1) {
        s.active = false;
        s.sprite.visible = false;
        continue;
      }
      s.sprite.position.x += s.vx * dt;
      s.sprite.position.y += s.vy * dt;
      s.vy -= 90 * dt;
      s.vx *= 1 - 1.1 * dt;
      s.sprite.material.rotation += s.spin * dt;

      // Twinkle via sinusoidal opacity
      const twinkle = 0.65 + Math.sin(progress * Math.PI * 6) * 0.35;
      s.material.opacity = twinkle * (1 - progress * 0.55);
      const sc = s.scale * (1 - progress * 0.3);
      s.sprite.scale.set(sc, sc, 1);
    }

    // 9b. Tray danger pulse: tint the dock red when one slot away from losing
    if (this.trayMesh) {
      const trayMat = this.trayMesh.material as THREE.MeshBasicMaterial;
      if (this.wasInDanger && !this.isGameOver) {
        this.dangerPulseTime += dt;
        const pulse = 0.5 + 0.5 * Math.sin(this.dangerPulseTime * 7);
        // Blend between white (no tint) and a warm red
        const r = 1;
        const g = 1 - pulse * 0.45;
        const b = 1 - pulse * 0.5;
        trayMat.color.setRGB(r, g, b);
      } else if (this.dangerPulseTime > 0 || trayMat.color.g < 0.999) {
        this.dangerPulseTime = 0;
        trayMat.color.setRGB(1, 1, 1);
      }
    }

    // 10. Update Screen Flash
    if (this.flashAlpha > 0 && this.flashMaterial) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 1.5);
      this.flashMaterial.opacity = this.flashAlpha;
      if (this.flashAlpha <= 0 && this.flashMesh) {
        this.flashMesh.visible = false;
      }
    }

    // 11. Screen Shake offsets the whole scene container
    if (this.screenShakeTime > 0) {
      this.screenShakeTime = Math.max(0, this.screenShakeTime - dt);
      const decay = this.screenShakeTime / 0.35;
      const mag = this.screenShakeStrength * Math.max(0, decay);
      this.scene.position.x = (Math.random() - 0.5) * mag * 2;
      this.scene.position.y = (Math.random() - 0.5) * mag * 2;
      if (this.screenShakeTime <= 0) {
        this.screenShakeStrength = 0;
        this.scene.position.set(0, 0, 0);
      }
    }

    if (stateChanged) {
      this.checkTrayMatchesAndEndConditions();
      this.emitHUD();
    }
  }
}
