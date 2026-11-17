import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { TrayView } from "../../types";

// 第 2 課的托盤場景：托盤是三個地方（遠端／快照／本機），方塊是 commit。
// 托盤名稱與分支標籤用網頁文字疊在畫面上（外層元件負責），這裡只畫托盤、方塊、框，並把位置回報出去。

/** 方塊在托盤上的固定位置：字母永遠代表同一次存檔，位置也固定 */
export const SLOT_ORDER = ["A", "B", "C", "D", "M", "E"];

export type TrayLayout = {
  /** 托盤前緣中央（放托盤名稱）與托盤在畫面上的寬度，單位 px */
  trays: { x: number; y: number; width: number }[];
  /** 每個托盤每個位置的方塊頂端中央（放分支標籤），單位 px */
  cubes: { x: number; y: number }[][];
};

const SIZE = {
  trayWidth: 2.92,
  trayDepth: 0.95,
  trayHeight: 0.16,
  spacing: 3.4,
  cube: 0.42,
  slotGap: 0.47,
  /** 一律以三個托盤的寬度取景，兩個托盤的卡片大小一致 */
  fitTrays: 3
};

const COLOR = {
  tray: 0xe9dcc8,
  cube: "#FFFDF8",
  ink: "#453A2F",
  inkHex: 0x453a2f,
  light: 0xfff4e2,
  sky: 0xfff8ec,
  ground: 0xd8c6a8
};

const FLY_MS = 760;
const DROP_MS = 820;

type Tween = {
  mesh: THREE.Object3D;
  kind: "fly" | "drop";
  from: THREE.Vector3;
  to: THREE.Vector3;
  start: number;
  duration: number;
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** 一條平放的「框」：外圈圓角矩形減掉內圈 */
function ringGeometry(width: number, depth: number, thickness: number, radius: number) {
  const rounded = (w: number, d: number, r: number) => {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -d / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r);
    s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d);
    s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  const outer = rounded(width, depth, radius);
  const inner = rounded(width - thickness * 2, depth - thickness * 2, Math.max(radius - thickness, 0.001));
  outer.holes.push(new THREE.Path(inner.getPoints(8).reverse()));
  const geometry = new THREE.ShapeGeometry(outer, 8);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

export class TrayScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  private readonly resizeObserver: ResizeObserver;
  private readonly disposables: { dispose(): void }[] = [];
  private readonly cubeGeometry: RoundedBoxGeometry;
  private readonly focusGeometry: THREE.ShapeGeometry;
  private readonly inkMaterial: THREE.MeshBasicMaterial;
  /** 每個托盤自己的材質（變淡時只影響那個托盤） */
  private readonly trayMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly cubeMaterials: Map<string, THREE.MeshStandardMaterial[]>[] = [];
  private readonly cubes: Map<string, THREE.Mesh>[] = [];
  private readonly focusRings: Map<string, { mesh: THREE.Mesh; showAt: number }>[] = [];
  private frameMeshes: THREE.Mesh[] = [];
  private tweens: Tween[] = [];
  private view: TrayView;
  private readonly count: number;
  private frame = 0;
  private disposed = false;

  constructor(
    private readonly container: HTMLElement,
    initial: TrayView,
    private readonly onLayout: (layout: TrayLayout) => void
  ) {
    this.count = initial.trays.length;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    // 環境反射讓方塊的圓角有高光，看得出是立體的
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04).texture;
    this.scene.environment = environment;
    this.scene.environmentIntensity = 0.45;
    pmrem.dispose();
    room.dispose();
    this.disposables.push(environment);

    const key = new THREE.DirectionalLight(COLOR.light, 2.3);
    key.position.set(-4, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 1024);
    Object.assign(key.shadow.camera, { left: -7, right: 7, top: 3, bottom: -3, near: 1, far: 22 });
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
    this.scene.add(key, new THREE.HemisphereLight(COLOR.sky, COLOR.ground, 0.8));

    // 地面只接陰影、本身透明，讓頁面的底色透出來
    const groundGeometry = new THREE.PlaneGeometry(40, 20);
    const groundMaterial = new THREE.ShadowMaterial({ color: COLOR.inkHex, opacity: 0.14 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.disposables.push(groundGeometry, groundMaterial);

    this.cubeGeometry = new RoundedBoxGeometry(SIZE.cube, SIZE.cube, SIZE.cube, 4, 0.045);
    const pad = 0.05;
    this.focusGeometry = ringGeometry(SIZE.cube + pad * 2 + 0.06, SIZE.cube + pad * 2 + 0.06, 0.035, 0.05);
    this.inkMaterial = new THREE.MeshBasicMaterial({ color: COLOR.inkHex });
    this.disposables.push(this.cubeGeometry, this.focusGeometry, this.inkMaterial);

    const trayGeometry = new RoundedBoxGeometry(SIZE.trayWidth, SIZE.trayHeight, SIZE.trayDepth, 4, 0.06);
    this.disposables.push(trayGeometry);
    for (let t = 0; t < this.count; t += 1) {
      const material = new THREE.MeshStandardMaterial({ color: COLOR.tray, roughness: 0.75, transparent: true });
      this.trayMaterials.push(material);
      this.disposables.push(material);
      const tray = new THREE.Mesh(trayGeometry, material);
      tray.position.set(this.trayX(t), SIZE.trayHeight / 2, 0);
      tray.castShadow = true;
      tray.receiveShadow = true;
      this.scene.add(tray);
      this.cubeMaterials.push(new Map());
      this.cubes.push(new Map());
      this.focusRings.push(new Map());
    }

    this.view = { trays: initial.trays.map((tray) => ({ ...tray, commits: [] })) };
    this.setView(initial, false);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  /** 換成新的畫面；animate 時新出現的方塊會從來源托盤飛過來（或從上方落下） */
  setView(next: TrayView, animate: boolean): void {
    if (this.disposed) return;
    const now = performance.now();
    const arrival = new Map<string, number>(); // `${t}:${letter}` → 落地時間

    next.trays.forEach((tray, t) => {
      const before = new Set(this.view.trays[t]?.commits ?? []);
      const after = new Set(tray.commits);

      for (const letter of SLOT_ORDER) {
        const mapKey = letter;
        if (after.has(letter) && !before.has(letter)) {
          const mesh = this.makeCube(t, letter);
          const to = this.slot(t, letter);
          mesh.position.copy(to);
          this.scene.add(mesh);
          this.cubes[t].set(mapKey, mesh);
          if (!animate) continue;
          // 來源：左邊最近、也有這顆的托盤
          let source = -1;
          for (let s = t - 1; s >= 0; s -= 1) if (next.trays[s].commits.includes(letter)) { source = s; break; }
          if (source < 0) {
            this.tweens.push({ mesh, kind: "drop", from: to.clone().setY(to.y + 2.4), to, start: now, duration: DROP_MS });
            arrival.set(`${t}:${letter}`, now + DROP_MS);
          } else {
            const start = arrival.get(`${source}:${letter}`) ?? now;
            this.tweens.push({ mesh, kind: "fly", from: this.slot(source, letter), to, start, duration: FLY_MS });
            arrival.set(`${t}:${letter}`, start + FLY_MS);
          }
          mesh.visible = false;
        } else if (!after.has(letter) && before.has(letter)) {
          const mesh = this.cubes[t].get(mapKey);
          if (mesh) {
            this.tweens = this.tweens.filter((tween) => tween.mesh !== mesh);
            this.scene.remove(mesh);
            this.cubes[t].delete(mapKey);
          }
        }
      }

      // 目前這一步的方塊：底下畫一圈深色框（方塊落地後才出現）
      const focus = new Set(tray.focus ?? []);
      for (const [letter, ring] of this.focusRings[t]) {
        if (!focus.has(letter)) {
          this.scene.remove(ring.mesh);
          this.focusRings[t].delete(letter);
        }
      }
      for (const letter of focus) {
        if (this.focusRings[t].has(letter)) continue;
        const mesh = new THREE.Mesh(this.focusGeometry, this.inkMaterial);
        const at = this.slot(t, letter);
        mesh.position.set(at.x, SIZE.trayHeight + 0.004, at.z);
        mesh.visible = false;
        this.scene.add(mesh);
        this.focusRings[t].set(letter, { mesh, showAt: arrival.get(`${t}:${letter}`) ?? now });
      }

      // 變淡
      const opacity = tray.state === "dim" ? 0.28 : 1;
      this.trayMaterials[t].opacity = opacity;
      this.trayMaterials[t].depthWrite = opacity === 1;
      for (const materials of this.cubeMaterials[t].values())
        for (const material of materials) {
          material.opacity = opacity;
          material.depthWrite = opacity === 1;
        }
      for (const mesh of this.cubes[t].values()) mesh.castShadow = opacity === 1;
    });

    this.buildFrames(next);
    this.view = { trays: next.trays.map((tray) => ({ ...tray, commits: [...tray.commits] })) };
    this.invalidate();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    for (const mesh of this.frameMeshes) mesh.geometry.dispose();
    for (const item of this.disposables) item.dispose();
    for (const map of this.cubeMaterials)
      for (const materials of map.values())
        for (const material of new Set(materials)) {
          material.map?.dispose();
          material.dispose();
        }
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  private trayX(t: number) {
    return (t - (this.count - 1) / 2) * SIZE.spacing;
  }

  private slot(t: number, letter: string) {
    const index = SLOT_ORDER.indexOf(letter);
    return new THREE.Vector3(
      this.trayX(t) + (index - (SLOT_ORDER.length - 1) / 2) * SIZE.slotGap,
      SIZE.trayHeight + SIZE.cube / 2,
      -0.05
    );
  }

  /** 相鄰而且都被框起來的托盤，框在同一個框裡 */
  private buildFrames(next: TrayView) {
    for (const mesh of this.frameMeshes) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    }
    this.frameMeshes = [];
    let t = 0;
    while (t < next.trays.length) {
      if (next.trays[t].state !== "framed") {
        t += 1;
        continue;
      }
      let end = t;
      while (end + 1 < next.trays.length && next.trays[end + 1].state === "framed") end += 1;
      const left = this.trayX(t) - SIZE.trayWidth / 2 - 0.16;
      const right = this.trayX(end) + SIZE.trayWidth / 2 + 0.16;
      const mesh = new THREE.Mesh(ringGeometry(right - left, SIZE.trayDepth + 0.32, 0.04, 0.12), this.inkMaterial);
      mesh.position.set((left + right) / 2, 0.003, 0);
      this.scene.add(mesh);
      this.frameMeshes.push(mesh);
      t = end + 1;
    }
  }

  private makeCube(t: number, letter: string): THREE.Mesh {
    let materials = this.cubeMaterials[t].get(letter);
    if (!materials) {
      const finish = { roughness: 0.5, metalness: 0, transparent: true };
      const plain = new THREE.MeshStandardMaterial({ color: COLOR.cube, ...finish });
      // 只有正面有字（面的順序：+x、-x、+y、-y、+z、-z）。
      // RoundedBoxGeometry 這一面的貼圖座標是倒的，所以字先轉 180 度再畫才是正的。
      const lettered = new THREE.MeshStandardMaterial({ map: this.letterTexture(letter), ...finish });
      materials = [plain, plain, plain, plain, lettered, plain];
      this.cubeMaterials[t].set(letter, materials);
    }
    const mesh = new THREE.Mesh(this.cubeGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private letterTexture(letter: string): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = COLOR.cube;
    ctx.fillRect(0, 0, size, size);
    ctx.translate(size, size);
    ctx.rotate(Math.PI);
    ctx.fillStyle = COLOR.ink;
    ctx.font = "700 108px 'Noto Sans TC', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, size / 2, size / 2 + 4);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  private resize(): void {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    this.renderer.setSize(width, height, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    const aspect = width / height;
    // 正交攝影機：取景寬度固定為三個托盤，畫面上方留空間給分支標籤、下方留空間給托盤名稱
    const halfX = ((SIZE.fitTrays - 1) * SIZE.spacing + SIZE.trayWidth) / 2 + 0.34;
    const halfY = halfX / aspect;
    Object.assign(this.camera, { left: -halfX, right: halfX, top: halfY, bottom: -halfY });
    const target = new THREE.Vector3(0, -0.02, -0.1);
    const direction = new THREE.Vector3(0, 0.45, 0.89).normalize();
    this.camera.position.copy(target).addScaledVector(direction, 20);
    this.camera.lookAt(target);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.reportLayout(width, height);
    this.invalidate();
  }

  private toScreen(point: THREE.Vector3, width: number, height: number) {
    const p = point.clone().project(this.camera);
    return { x: ((p.x + 1) / 2) * width, y: ((1 - p.y) / 2) * height };
  }

  private reportLayout(width: number, height: number) {
    const trays = [];
    const cubes = [];
    for (let t = 0; t < this.count; t += 1) {
      const x = this.trayX(t);
      const front = new THREE.Vector3(x, 0, SIZE.trayDepth / 2);
      const center = this.toScreen(front, width, height);
      const leftEdge = this.toScreen(new THREE.Vector3(x - SIZE.trayWidth / 2, 0, SIZE.trayDepth / 2), width, height);
      const rightEdge = this.toScreen(new THREE.Vector3(x + SIZE.trayWidth / 2, 0, SIZE.trayDepth / 2), width, height);
      trays.push({ x: center.x, y: center.y, width: rightEdge.x - leftEdge.x });
      cubes.push(
        SLOT_ORDER.map((letter) => {
          const top = this.slot(t, letter).add(new THREE.Vector3(0, SIZE.cube / 2, -SIZE.cube / 2));
          return this.toScreen(top, width, height);
        })
      );
    }
    this.onLayout({ trays, cubes });
  }

  /** 只在有東西變動時才畫 */
  private invalidate(): void {
    if (this.disposed) return;
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.tick());
  }

  private tick(): void {
    if (this.disposed) return;
    const now = performance.now();

    this.tweens = this.tweens.filter((tween) => {
      const raw = (now - tween.start) / tween.duration;
      if (raw < 0) return true;
      const t = Math.min(raw, 1);
      const { mesh } = tween;
      mesh.visible = true;
      if (tween.kind === "fly") {
        const k = easeInOutCubic(t);
        mesh.position.lerpVectors(tween.from, tween.to, k);
        mesh.position.y += Math.sin(Math.PI * k) * 0.9;
      } else {
        mesh.position.lerpVectors(tween.from, tween.to, easeOutCubic(t));
      }
      if (t < 1) return true;
      mesh.position.copy(tween.to);
      return false;
    });

    let waiting = false;
    for (const rings of this.focusRings)
      for (const ring of rings.values()) {
        ring.mesh.visible = now >= ring.showAt;
        if (!ring.mesh.visible) waiting = true;
      }

    this.renderer.render(this.scene, this.camera);
    if (this.tweens.length > 0 || waiting) this.frame = requestAnimationFrame(() => this.tick());
  }
}
