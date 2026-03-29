// ===== 3D Room Simulation Page =====
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimulationState, tick, createInitialState, SCENARIOS, Scenario, RoomType } from '../simulation';
import { createGaugeSVG } from '../utils/gauge';

let state: SimulationState = createInitialState();
let intervalId: number | null = null;
let renderer: any = null;
let animationId: number | null = null;

// 3D scene refs
let scene: any;
let camera: any;
let controls: any;
let roomGroup: any;
let fogParticles: any;
let ceilingLights: any[] = [];
let lightHelpers: any[] = [];
let alarmLights: any[] = [];
let sensorBox: any;
let ledIndicator: any;
let windowFrames: { group: any; frameMat: any; barMat: any; baseX: number; phase: number }[] = [];
let computerScreens: any[] = [];
let projectorScreen: any;

// Wall transparency
let wallMeshes: { mesh: any; normal: any }[] = [];

// Labels system
interface Label3D {
  name: string;
  position: any; // THREE.Vector3
  element?: HTMLElement;
  lineElement?: SVGLineElement;
}
let labels3D: Label3D[] = [];
let labelOverlay: HTMLElement | null = null;
let labelSvg: SVGSVGElement | null = null;
let roomAlarmOverlay: HTMLElement | null = null;
let alertBannerEl: HTMLElement | null = null;
let alertTitleEl: HTMLElement | null = null;
let alertSubEl: HTMLElement | null = null;
let alertNoteEl: HTMLElement | null = null;

type AlertState = 'ok' | 'warning' | 'danger';
let alertState: AlertState = 'ok';

let currentRoom: RoomType = 'classroom';

interface RoomCapabilities {
  lights: boolean;
  projector: boolean;
  computers: boolean;
  heating: boolean;
  windows: boolean;
}

function getRoomCapabilities(room: RoomType): RoomCapabilities {
  return {
    lights: true,
    projector: room !== 'gym',
    computers: room !== 'gym',
    heating: true,
    windows: true,
  };
}

export function renderRoom3D(container: HTMLElement): void {
  state = createInitialState();

  container.innerHTML = `
    <div style="display:flex; height:calc(100vh - 56px); overflow:hidden;">
      <!-- 3D Canvas -->
      <div id="room-canvas-container" class="room-canvas-container" style="flex:1; position:relative;">
        <div id="room-bg-logo" class="room-bg-logo" aria-hidden="true"></div>
        <canvas id="room-canvas" class="room-canvas"></canvas>
        <div id="room-alarm-overlay" class="room-alarm-overlay" aria-hidden="true"></div>
        
        <!-- SVG overlay for label lines -->
        <svg id="label-lines-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5;"></svg>

        <!-- HTML overlay for labels -->
        <div id="label-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:6;"></div>
        
        <!-- Room selector overlay -->
        <div style="position:absolute; top:16px; left:16px; display:flex; gap:8px; z-index:10;">
          <button class="room-btn active" data-room="classroom"><span class="material-symbols-rounded icon-sm">school</span> Aula</button>
          <button class="room-btn" data-room="lab"><span class="material-symbols-rounded icon-sm">computer</span> Laboratorio</button>
          <button class="room-btn" data-room="gym"><span class="material-symbols-rounded icon-sm">sports_basketball</span> Palestra</button>
        </div>
        
        <!-- Mini gauges overlay -->
        <div style="position:absolute; bottom:16px; left:16px; display:flex; gap:12px; z-index:10;">
          <div class="mini-gauge-card">
            <div id="mini-gauge-co2" style="width:100px; height:100px;"></div>
          </div>
          <div class="mini-gauge-card">
            <div id="mini-gauge-power" style="width:100px; height:100px;"></div>
          </div>
        </div>

        <!-- Alert overlay -->
        <div id="room-alerts" style="position:absolute; top:16px; right:320px; z-index:10; display:flex; flex-direction:column; gap:8px; max-width:350px;">
          <div class="alert-banner ok smooth" id="room-alert-banner">
            <span class="material-symbols-rounded icon-md" id="room-alert-icon">check_circle</span>
            <div>
              <div class="alert-title" id="room-alert-title">Sistema OK</div>
              <div class="alert-sub" id="room-alert-sub">CO₂ eq 500 ppm · Consumo 300 W</div>
              <div class="alert-note" id="room-alert-note">Sistema in equilibrio — nessuna azione richiesta</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Panel -->
      <div class="dashboard-panel" id="dashboard-panel">
        <div class="panel-header">
          <span class="material-symbols-rounded icon-md">settings</span> Pannello Operativo
        </div>

        <!-- Status -->
        <div class="panel-section">
          <div class="panel-section-title"><span class="material-symbols-rounded icon-sm">monitoring</span> Stato in Tempo Reale</div>
          <div class="status-row">
            <span>Qualità aria (CO₂ eq)</span>
            <span id="status-co2-val" class="status-value ok">500 ppm</span>
            <span id="status-co2-led" class="led led-green"></span>
          </div>
          <div class="status-row">
            <span>Consumo</span>
            <span id="status-power-val" class="status-value ok">315 W</span>
            <span id="status-power-led" class="led led-green"></span>
          </div>
          <div id="power-timer-row" class="status-row" style="display:none;">
            <span><span class="material-symbols-rounded icon-sm">timer</span> Timer allarme</span>
            <span id="power-timer-val" class="status-value warning">0s / 60s</span>
          </div>
        </div>

        <!-- Thresholds -->
        <div class="panel-section">
          <div class="panel-section-title"><span class="material-symbols-rounded icon-sm">tune</span> Soglie di Allarme</div>
          <div class="control-group">
            <label>Soglia qualità aria (CO₂ eq)</label>
            <div class="spinner-row">
              <input type="range" id="sl-co2-thresh" min="400" max="2000" step="50" value="${state.co2Threshold}" class="panel-slider">
              <div class="spinner">
                <button class="sp-btn" data-target="sl-co2-thresh" data-delta="-50">−</button>
                <span id="val-co2-thresh" class="sp-val">${state.co2Threshold}</span>
                <button class="sp-btn" data-target="sl-co2-thresh" data-delta="50">+</button>
                <span class="sp-unit">ppm</span>
              </div>
            </div>
          </div>
          <div class="control-group">
            <label>Soglia consumo massimo</label>
            <div class="spinner-row">
              <input type="range" id="sl-power-thresh" min="100" max="3000" step="50" value="${state.powerThreshold}" class="panel-slider">
              <div class="spinner">
                <button class="sp-btn" data-target="sl-power-thresh" data-delta="-50">−</button>
                <span id="val-power-thresh" class="sp-val">${state.powerThreshold}</span>
                <button class="sp-btn" data-target="sl-power-thresh" data-delta="50">+</button>
                <span class="sp-unit">W</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Environment -->
        <div class="panel-section">
          <div class="panel-section-title"><span class="material-symbols-rounded icon-sm">domain</span> Ambiente</div>
          <div class="control-group">
            <label>Numero studenti</label>
            <div class="spinner-row">
              <input type="range" id="sl-students" min="0" max="35" step="1" value="${state.students}" class="panel-slider">
              <div class="spinner">
                <button class="sp-btn" data-target="sl-students" data-delta="-1">−</button>
                <span id="val-students" class="sp-val">${state.students}</span>
                <button class="sp-btn" data-target="sl-students" data-delta="1">+</button>
              </div>
            </div>
          </div>

        <div class="checkbox-group">
            <label class="checkbox-label" data-option="lights">
              <input type="checkbox" id="cb-lights" ${state.lightsOn ? 'checked' : ''}>
              <span class="cb-custom"></span>
              <span>Luci (280W)</span>
            </label>
            <label class="checkbox-label" data-option="projector">
              <input type="checkbox" id="cb-projector" ${state.projectorOn ? 'checked' : ''}>
              <span class="cb-custom"></span>
              <span>Proiettore (230W)</span>
            </label>
            <label class="checkbox-label" data-option="computers">
              <input type="checkbox" id="cb-computers" ${state.computersOn ? 'checked' : ''}>
              <span class="cb-custom"></span>
              <span>PC + Monitor (380W)</span>
            </label>
            <label class="checkbox-label" data-option="heating">
              <input type="checkbox" id="cb-heating" ${state.heatingOn ? 'checked' : ''}>
              <span class="cb-custom"></span>
              <span>Riscaldamento (1500W)</span>
            </label>
            <label class="checkbox-label" data-option="windows">
              <input type="checkbox" id="cb-windows" ${state.windowsOpen ? 'checked' : ''}>
              <span class="cb-custom"></span>
              <span>Finestre aperte</span>
            </label>
          </div>
        </div>

        <!-- Scenarios -->
        <div class="panel-section">
          <div class="panel-section-title"><span class="material-symbols-rounded icon-sm">play_circle</span> Scenari Rapidi</div>
          <div class="scenario-list">
            ${SCENARIOS.map((s, i) => `
              <button class="scenario-mini-btn" data-scenario="${i}">
                <span class="material-symbols-rounded icon-sm">${s.icon}</span> ${s.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  labelOverlay = document.getElementById('label-overlay');
  labelSvg = document.getElementById('label-lines-svg') as unknown as SVGSVGElement;
  roomAlarmOverlay = document.getElementById('room-alarm-overlay');
  alertBannerEl = document.getElementById('room-alert-banner');
  alertTitleEl = document.getElementById('room-alert-title');
  alertSubEl = document.getElementById('room-alert-sub');
  alertNoteEl = document.getElementById('room-alert-note');
  startLogoIntro();

  initThreeJS();
  buildRoom(currentRoom);
  updateRoomOptionsVisibility();
  bindDashboardControls();
  startSimulation();
}

// ===== THREE.JS SETUP =====
function initThreeJS(): void {
  const canvas = document.getElementById('room-canvas') as HTMLCanvasElement;
  const container = document.getElementById('room-canvas-container')!;
  const w = container.clientWidth;
  const h = container.clientHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = null;

  // Camera
  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(8, 6, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.setClearColor(0x000000, 0);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1.5, 0);
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.minDistance = 3;
  controls.maxDistance = 20;

  // Ambient light (soft, balanced)
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  // Hemisphere light for gentle sky/ground tint
  const hemiLight = new THREE.HemisphereLight(0xe8f6ff, 0x9fb2c8, 0.35);
  scene.add(hemiLight);

  // Directional light from above (sun-like)
  const dirLight = new THREE.DirectionalLight(0xffefe0, 0.9);
  dirLight.position.set(6, 10, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.radius = 3;
  scene.add(dirLight);

  // Cool rim light to separate the room from background
  const rimLight = new THREE.DirectionalLight(0xaed6ff, 0.35);
  rimLight.position.set(-6, 6, -6);
  scene.add(rimLight);

  // Resize handler
  const onResize = () => {
    const w2 = container.clientWidth;
    const h2 = container.clientHeight;
    camera.aspect = w2 / h2;
    camera.updateProjectionMatrix();
    renderer!.setSize(w2, h2);
  };
  window.addEventListener('resize', onResize);

  // Animation loop
  const animate = (time = 0) => {
    animationId = requestAnimationFrame(animate);
    animateLights(time);
    animateAlarmLights(time);
    animateWindows(time);
    controls.update();
    updateWallTransparency();
    updateFog();
    updateLabels();
    renderer!.render(scene, camera);
  };
  animate();
}

function startLogoIntro(): void {
  const logo = document.getElementById('room-bg-logo');
  if (!logo) return;
  logo.classList.remove('logo-intro');
  void (logo as HTMLElement).offsetHeight;
  logo.classList.add('logo-intro');
}

// ===== WALL TRANSPARENCY (camera-based) =====
function updateWallTransparency(): void {
  if (!camera || wallMeshes.length === 0) return;
  
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);

  wallMeshes.forEach(({ mesh, normal }) => {
    // Dot product of camera direction and wall outward normal
    const dot = cameraDir.dot(normal);
    // If camera looks at the wall face (dot > 0 means wall faces away from camera = we see its front)
    // We want to hide walls whose outward normal points TOWARD the camera
    // dot < 0 means normal points toward camera = wall blocks our view
    const mat = mesh.material;
    if (dot < -0.15) {
      // Wall faces camera — fade it out
      const fade = Math.min(1, Math.abs(dot + 0.15) * 2);
      mat.opacity = 0.08 + (1 - fade) * 0.5;
    } else {
      // Wall is on the side or back — keep it visible
      mat.opacity = 0.6;
    }
  });
}

// ===== BUILD ROOM =====
function buildRoom(type: RoomType): void {
  // Clear old room
  if (roomGroup) {
    scene.remove(roomGroup);
    roomGroup.traverse((obj: any) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
  roomGroup = new THREE.Group();
  ceilingLights = [];
  lightHelpers = [];
  alarmLights = [];
  windowFrames = [];
  computerScreens = [];
  wallMeshes = [];
  labels3D = [];

  const roomConfigs: Record<string, { w: number; h: number; d: number; desks: number; hasProjector: boolean }> = {
    classroom: { w: 8, h: 3.2, d: 7, desks: 12, hasProjector: true },
    lab: { w: 10, h: 3.2, d: 7, desks: 10, hasProjector: true },
    gym: { w: 14, h: 5, d: 10, desks: 0, hasProjector: false },
  };
  const cfg = roomConfigs[type];

  // ===== FLOOR (smaller, invisible from below) =====
  const floorW = cfg.w - 0.02;
  const floorD = cfg.d - 0.02;
  const floorMat = new THREE.MeshStandardMaterial({
    color: type === 'gym' ? 0xC4A45A : 0xb8c4cc,
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.FrontSide,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorW, floorD), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Floor grid texture (top-only)
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = 256;
  gridCanvas.height = 256;
  const gctx = gridCanvas.getContext('2d')!;
  gctx.clearRect(0, 0, 256, 256);
  gctx.strokeStyle = 'rgba(150, 180, 200, 0.35)';
  gctx.lineWidth = 1;
  for (let i = 0; i <= 256; i += 16) {
    gctx.beginPath();
    gctx.moveTo(i, 0);
    gctx.lineTo(i, 256);
    gctx.stroke();
    gctx.beginPath();
    gctx.moveTo(0, i);
    gctx.lineTo(256, i);
    gctx.stroke();
  }
  gctx.strokeStyle = 'rgba(130, 165, 185, 0.55)';
  gctx.lineWidth = 1.4;
  for (let i = 0; i <= 256; i += 64) {
    gctx.beginPath();
    gctx.moveTo(i, 0);
    gctx.lineTo(i, 256);
    gctx.stroke();
    gctx.beginPath();
    gctx.moveTo(0, i);
    gctx.lineTo(256, i);
    gctx.stroke();
  }
  const gridTex = new THREE.CanvasTexture(gridCanvas);
  gridTex.wrapS = THREE.RepeatWrapping;
  gridTex.wrapT = THREE.RepeatWrapping;
  gridTex.repeat.set(floorW / 2, floorD / 2);
  const gridMat = new THREE.MeshBasicMaterial({
    map: gridTex,
    transparent: true,
    opacity: 0.4,
    side: THREE.FrontSide,
  });
  const gridPlane = new THREE.Mesh(new THREE.PlaneGeometry(floorW, floorD), gridMat);
  gridPlane.rotation.x = -Math.PI / 2;
  gridPlane.position.y = 0.011;
  roomGroup.add(gridPlane);

  // Corner spheres
  const cornerMat = new THREE.MeshStandardMaterial({
    color: 0x7fc7d9,
    emissive: 0x3ea7bf,
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });
  const cornerGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const cornerPositions: Array<[number, number, number]> = [
    [floorW / 2 + 0.01, 0, floorD / 2 + 0.01],
    [-floorW / 2 - 0.01, 0, floorD / 2 + 0.01],
    [floorW / 2 + 0.01, 0, -floorD / 2 - 0.01],
    [-floorW / 2 - 0.01, 0, -floorD / 2 - 0.01],
  ];
  cornerPositions.forEach(([x, y, z]) => {
    const dot = new THREE.Mesh(cornerGeo, cornerMat);
    dot.position.set(x, 0, z);
    roomGroup.add(dot);

    const cap = new THREE.Mesh(cornerGeo, cornerMat);
    cap.position.set(x, cfg.h, z);
    roomGroup.add(cap);
  });

  // Gym floor lines
  if (type === 'gym') {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const createLine = (x: number, z: number, w2: number, d2: number) => {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(w2, d2), lineMat);
      l.rotation.x = -Math.PI / 2;
      l.position.set(x, 0.02, z);
      return l;
    };
    roomGroup.add(createLine(0, 0, cfg.w * 0.6, 0.05));
    roomGroup.add(createLine(0, 0, 0.05, cfg.d * 0.6));
  }

  // ===== WALLS (transparent material, DoubleSide) =====
  const createWall = (width: number, height: number, pos: number[], rotY: number, outwardNormal: number[]) => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xcdd5de,
      roughness: 0.8,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (rotY !== 0) mesh.rotation.y = rotY;
    mesh.renderOrder = 1; // Render walls after opaque objects
    roomGroup.add(mesh);
    wallMeshes.push({ mesh, normal: new THREE.Vector3(outwardNormal[0], outwardNormal[1], outwardNormal[2]) });
    return mesh;
  };

  // Back wall (faces +Z)
  createWall(cfg.w, cfg.h, [0, cfg.h / 2, -cfg.d / 2], 0, [0, 0, -1]);
  // Front wall (faces -Z)
  createWall(cfg.w, cfg.h, [0, cfg.h / 2, cfg.d / 2], Math.PI, [0, 0, 1]);
  // Left wall (faces +X)
  createWall(cfg.d, cfg.h, [-cfg.w / 2, cfg.h / 2, 0], Math.PI / 2, [-1, 0, 0]);
  // Right wall (faces -X)
  createWall(cfg.d, cfg.h, [cfg.w / 2, cfg.h / 2, 0], -Math.PI / 2, [1, 0, 0]);

  // ===== CEILING (transparent) =====
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xd8dde5,
    roughness: 0.85,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(cfg.w, cfg.d), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = cfg.h;
  ceiling.renderOrder = 1;
  roomGroup.add(ceiling);
  wallMeshes.push({ mesh: ceiling, normal: new THREE.Vector3(0, 1, 0) });

  // ===== ROOM EDGES (lines on borders/spigoli) =====
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x8fb8c8,
    transparent: true,
    opacity: 0.35,
  });
  const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d));
  const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
  edgeLines.position.set(0, cfg.h / 2, 0);
  edgeLines.renderOrder = 2;
  roomGroup.add(edgeLines);

  // ===== WINDOWS =====
  const winCount = type === 'gym' ? 4 : 2;
  for (let i = 0; i < winCount; i++) {
    const winZ = -cfg.d / 2 + (i + 1) * cfg.d / (winCount + 1);
    const windowGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x607080, roughness: 0.6 });
    const barMat = new THREE.MeshStandardMaterial({ color: 0x6b7a88, roughness: 0.6 });
    const frameDepth = 0.05;
    const frameThickness = 0.04;
    const barThickness = 0.03;
    const winW = 1.2;
    const winH = 1.5;

    // Outer frame (built in YZ plane with depth on X)
    const top = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, frameThickness, winW), frameMat);
    top.position.set(0, winH / 2 - frameThickness / 2, 0);
    windowGroup.add(top);
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, frameThickness, winW), frameMat);
    bottom.position.set(0, -winH / 2 + frameThickness / 2, 0);
    windowGroup.add(bottom);
    const left = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, winH, frameThickness), frameMat);
    left.position.set(0, 0, -winW / 2 + frameThickness / 2);
    windowGroup.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(frameDepth, winH, frameThickness), frameMat);
    right.position.set(0, 0, winW / 2 - frameThickness / 2);
    windowGroup.add(right);

    // Inner bars to create 8 empty panes (2 columns x 4 rows)
    const vBar = new THREE.Mesh(
      new THREE.BoxGeometry(frameDepth, winH - frameThickness * 2, barThickness),
      barMat
    );
    vBar.position.set(0, 0, 0);
    windowGroup.add(vBar);

    const hBarGeo = new THREE.BoxGeometry(frameDepth, barThickness, winW - frameThickness * 2);
    for (let r = 1; r <= 3; r++) {
      const y = winH / 2 - r * (winH / 4);
      const hBar = new THREE.Mesh(hBarGeo, barMat);
      hBar.position.set(0, y, 0);
      windowGroup.add(hBar);
    }

    // Place flush to right wall, hinge at bottom for vasistas opening
    const inset = 0.005;
    const baseX = cfg.w / 2 - frameDepth / 2 - inset;
    const baseY = cfg.h * 0.55 - winH / 2;
    const windowPivot = new THREE.Group();
    windowGroup.position.set(0, winH / 2, 0);
    windowPivot.add(windowGroup);
    windowPivot.position.set(baseX, baseY, winZ);
    roomGroup.add(windowPivot);
    windowFrames.push({ group: windowPivot, frameMat, barMat, baseX, phase: Math.random() * Math.PI * 2 });

    if (i === 0) {
      labels3D.push({ name: 'Finestre', position: new THREE.Vector3(cfg.w / 2 - 0.01, cfg.h * 0.55 + 0.4, winZ) });
    }
  }

  // ===== GYM BASKETBALL COURT (near windows) =====
  if (type === 'gym') {
    const courtGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7ea6b8, transparent: true, opacity: 0.45 });
    const yLine = 0.012;
    const keyWidth = Math.min(3.6, cfg.d * 0.45);
    const keyDepth = Math.min(3.0, cfg.w * 0.32);
    const xWall = cfg.w / 2 - 0.02;
    const xKey = xWall - keyDepth;
    const zMin = -keyWidth / 2;
    const zMax = keyWidth / 2;

    const rectPts = new Float32Array([
      xWall, yLine, zMin, xKey, yLine, zMin,
      xKey, yLine, zMin, xKey, yLine, zMax,
      xKey, yLine, zMax, xWall, yLine, zMax,
    ]);
    const rectGeo = new THREE.BufferGeometry();
    rectGeo.setAttribute('position', new THREE.BufferAttribute(rectPts, 3));
    const rectLines = new THREE.LineSegments(rectGeo, lineMat);
    courtGroup.add(rectLines);

    const arcRadius = keyWidth / 2;
    const arcPts: number[] = [];
    const arcSegments = 32;
    for (let s = 0; s <= arcSegments; s++) {
      const t = -Math.PI / 2 + (s / arcSegments) * Math.PI;
      const x = xKey - Math.cos(t) * arcRadius;
      const z = Math.sin(t) * arcRadius;
      arcPts.push(x, yLine, z);
    }
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(arcPts, 3));
    const arcLine = new THREE.Line(arcGeo, lineMat);
    courtGroup.add(arcLine);

    // Hoop + backboard moved away from wall with visible pole
    const poleX = cfg.w / 2 - 1.1;
    const poleZ = 0;
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x7f8f9f, roughness: 0.5 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.6, 16), poleMat);
    pole.position.set(poleX, 1.3, poleZ);
    courtGroup.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.06), poleMat);
    arm.position.set(poleX - 0.25, 2.35, poleZ);
    courtGroup.add(arm);

    const boardMat = new THREE.MeshStandardMaterial({ color: 0xf0f3f7, roughness: 0.4, side: THREE.DoubleSide });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), boardMat);
    board.rotation.y = -Math.PI / 2;
    board.position.set(poleX - 0.55, 2.45, poleZ);
    courtGroup.add(board);

    const hoopMat = new THREE.MeshStandardMaterial({ color: 0xff6a3d, roughness: 0.4, metalness: 0.3 });
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 12, 24), hoopMat);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(poleX - 0.72, 2.05, poleZ);
    courtGroup.add(hoop);

    roomGroup.add(courtGroup);
  }

  // ===== CEILING LIGHTS =====
  const cols = type === 'gym' ? 3 : 2;
  const rows = type === 'gym' ? 2 : 2;
  const lightDistance = Math.max(cfg.w, cfg.d) * 0.7;
  const lightIntensityOn = 0.65;
  const lightIntensityOff = 0.04;
  
  const spacingX = cfg.w / cols;
  const spacingZ = cfg.d / rows;
  const startX = -cfg.w / 2 + spacingX / 2;
  const startZ = -cfg.d / 2 + spacingZ / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lx = startX + c * spacingX;
      const lz = startZ + r * spacingZ;
      
      const lightFixture = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.05, 0.3),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: state.lightsOn ? 0xffffee : 0x222222,
          emissiveIntensity: state.lightsOn ? 1.0 : 0.1,
        })
      );
      lightFixture.position.set(lx, cfg.h - 0.03, lz);
      roomGroup.add(lightFixture);
      ceilingLights.push(lightFixture);

      const pointLight = new THREE.PointLight(
        0xffffee,
        state.lightsOn ? lightIntensityOn : lightIntensityOff,
        lightDistance,
        2
      );
      pointLight.position.set(lx, cfg.h - 0.1, lz);
      pointLight.castShadow = true;
      roomGroup.add(pointLight);
      lightHelpers.push(pointLight);

      if (r === 0 && c === 0) {
        labels3D.push({ name: 'Illuminazione', position: new THREE.Vector3(lx, cfg.h - 0.1, lz) });
      }
    }
  }

  // ===== ALARM LIGHTS (red warning) =====
  const alarmPositions: Array<[number, number, number]> = [
    [-cfg.w / 2 + 0.6, cfg.h - 0.1, -cfg.d / 2 + 0.6],
    [cfg.w / 2 - 0.6, cfg.h - 0.1, -cfg.d / 2 + 0.6],
    [-cfg.w / 2 + 0.6, cfg.h - 0.1, cfg.d / 2 - 0.6],
    [cfg.w / 2 - 0.6, cfg.h - 0.1, cfg.d / 2 - 0.6],
  ];
  alarmPositions.forEach(([x, y, z]) => {
    const alarm = new THREE.PointLight(0xff3344, 0, Math.max(cfg.w, cfg.d) * 0.9, 2.2);
    alarm.position.set(x, y, z);
    roomGroup.add(alarm);
    alarmLights.push(alarm);
  });

  // ===== DESKS & CHAIRS =====
  if (type === 'classroom') {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const dx = (col - 1.5) * 1.8;
        const dz = (row - 1) * 2 + 0.5;
        addDesk(dx, dz);
        addChair(dx, dz + 0.5);
      }
    }
    addTeacherDesk(0, -cfg.d / 2 + 1.2, true);
    labels3D.push({ name: 'Banchi studenti', position: new THREE.Vector3(0, 0.9, 0.5) });
    labels3D.push({ name: 'Cattedra', position: new THREE.Vector3(0, 0.9, -cfg.d / 2 + 1.2) });
  } else if (type === 'lab') {
    for (let i = 0; i < 5; i++) {
      const dz = -cfg.d / 2 + 1 + i * 1.3;
      addComputerDesk(-cfg.w / 2 + 1.2, dz, false);
      addComputerDesk(cfg.w / 2 - 1.2, dz, true);
    }
    addTeacherDesk(0, -cfg.d / 2 + 1.2, true);
    labels3D.push({ name: 'Postazioni PC', position: new THREE.Vector3(-cfg.w / 2 + 1.2, 1.1, 0) });
  }

  // ===== WHITEBOARD =====
  if (type !== 'gym') {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.2, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.3 })
    );
    board.position.set(0, cfg.h * 0.55, -cfg.d / 2 + 0.03);
    roomGroup.add(board);
    labels3D.push({ name: 'Lavagna', position: new THREE.Vector3(0, cfg.h * 0.55 + 0.7, -cfg.d / 2 + 0.03) });
  }

  // ===== PROJECTOR =====
  if (cfg.hasProjector) {
    projectorScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.5),
      new THREE.MeshStandardMaterial({
        color: 0x334455,
        emissive: state.projectorOn ? 0x445577 : 0x000000,
        emissiveIntensity: state.projectorOn ? 0.5 : 0,
        side: THREE.DoubleSide,
      })
    );
    projectorScreen.position.set(0, cfg.h * 0.55, -cfg.d / 2 + 0.06);
    roomGroup.add(projectorScreen);
  }

  // ===== ZEPHYRUS SENSOR BOX =====
  const sensorGroup = new THREE.Group();
  sensorBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.18, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x1a2a3e, roughness: 0.4, metalness: 0.3 })
  );
  sensorGroup.add(sensorBox);

  // LED on sensor
  ledIndicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 1.5,
    })
  );
  ledIndicator.position.set(0.08, 0.05, 0.05);
  sensorGroup.add(ledIndicator);

  // Label on sensor box
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 128;
  labelCanvas.height = 32;
  const lctx = labelCanvas.getContext('2d')!;
  lctx.fillStyle = '#00d4aa';
  lctx.font = 'bold 20px Manrope, sans-serif';
  lctx.textAlign = 'center';
  lctx.fillText('ZEPHYRUS', 64, 22);
  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, 0.035),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true })
  );
  labelMesh.position.set(0, -0.03, 0.051);
  sensorGroup.add(labelMesh);

  // SCT-013 sensor
  const sctSensor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.07, 16),
    new THREE.MeshStandardMaterial({ color: 0x00aaff, metalness: 0.2 })
  );
  sctSensor.position.set(-0.18, 0, 0);
  sctSensor.rotation.z = Math.PI / 2;
  sensorGroup.add(sctSensor);

  const sensorPos = new THREE.Vector3(-cfg.w / 2 + 0.06, cfg.h * 0.7, 0);
  sensorGroup.position.copy(sensorPos);
  sensorGroup.rotation.y = Math.PI / 2;
  roomGroup.add(sensorGroup);

  labels3D.push({ name: 'Centralina ESP32-C3', position: new THREE.Vector3(-cfg.w / 2 + 0.3, cfg.h * 0.7 + 0.2, 0) });
  labels3D.push({ name: 'SCT-013 (Corrente)', position: new THREE.Vector3(-cfg.w / 2 + 0.3, cfg.h * 0.7 - 0.1, -0.18) });
  labels3D.push({ name: 'MQ-135 (Qualità aria)', position: new THREE.Vector3(-cfg.w / 2 + 0.3, cfg.h * 0.7 + 0.05, 0.1) });

  // ===== CO₂ FOG PARTICLES =====
  createFogParticles(cfg);

  scene.add(roomGroup);
  currentRoom = type;
  state.roomType = type;

  // Apply initial window visuals
  updateWindows();

  // Create label DOM elements
  createLabelElements();
}

function updateRoomOptionsVisibility(): void {
  const caps = getRoomCapabilities(currentRoom);
  const opts = [
    { option: 'lights', cap: caps.lights, cbId: 'cb-lights', stateKey: 'lightsOn' },
    { option: 'projector', cap: caps.projector, cbId: 'cb-projector', stateKey: 'projectorOn' },
    { option: 'computers', cap: caps.computers, cbId: 'cb-computers', stateKey: 'computersOn' },
    { option: 'heating', cap: caps.heating, cbId: 'cb-heating', stateKey: 'heatingOn' },
    { option: 'windows', cap: caps.windows, cbId: 'cb-windows', stateKey: 'windowsOpen' },
  ] as const;

  opts.forEach(o => {
    const label = document.querySelector(`.checkbox-label[data-option="${o.option}"]`) as HTMLElement | null;
    if (label) label.style.display = o.cap ? 'flex' : 'none';
    if (!o.cap) {
      (state as any)[o.stateKey] = false;
      setCheckbox(o.cbId, false);
    } else {
      setCheckbox(o.cbId, (state as any)[o.stateKey]);
    }
  });

  updateLights();
  updateProjector();
  updateComputers();
  updateWindows();
}

// ===== LABEL SYSTEM =====
function createLabelElements(): void {
  if (!labelOverlay || !labelSvg) return;
  
  // Clear existing
  labelOverlay.innerHTML = '';
  while (labelSvg.firstChild) labelSvg.removeChild(labelSvg.firstChild);

  // Defs for animated dash pattern
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <style>
      .label-line {
        stroke-dasharray: 6 4;
        animation: dash-flow 1.5s linear infinite;
      }
      @keyframes dash-flow {
        to { stroke-dashoffset: -20; }
      }
    </style>
  `;
  labelSvg.appendChild(defs);

  labels3D.forEach((label, i) => {
    // HTML label element
    const el = document.createElement('div');
    el.className = 'room-label';
    el.innerHTML = `<span class="room-label-dot"></span><span class="room-label-text">${label.name}</span>`;
    el.style.cssText = 'position:absolute; display:flex; align-items:center; gap:6px; font-size:0.72rem; font-weight:600; color:hsl(206,45%,30%); white-space:nowrap; pointer-events:none; transition:opacity 0.3s;';
    labelOverlay.appendChild(el);
    label.element = el;

    // SVG line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'label-line');
    line.setAttribute('stroke', 'hsla(206,45%,45%,0.45)');
    line.setAttribute('stroke-width', '1.2');
    labelSvg.appendChild(line);
    label.lineElement = line;
  });
}

function updateLabels(): void {
  if (!camera || !renderer || labels3D.length === 0) return;

  const canvasContainer = document.getElementById('room-canvas-container');
  if (!canvasContainer) return;
  const w = canvasContainer.clientWidth;
  const h = canvasContainer.clientHeight;

  const tempVec = new THREE.Vector3();

  labels3D.forEach((label) => {
    if (!label.element || !label.lineElement) return;

    // Project 3D position to 2D screen
    tempVec.copy(label.position);
    tempVec.project(camera);

    // Convert from NDC to screen coords
    const screenX = (tempVec.x * 0.5 + 0.5) * w;
    const screenY = (-tempVec.y * 0.5 + 0.5) * h;

    // Check if behind camera
    if (tempVec.z > 1) {
      label.element.style.opacity = '0';
      label.lineElement.style.opacity = '0';
      return;
    }

    // Check if on screen
    const margin = 60;
    const onScreen = screenX > margin && screenX < w - margin && screenY > margin && screenY < h - margin;
    
    if (!onScreen) {
      label.element.style.opacity = '0';
      label.lineElement.style.opacity = '0';
      return;
    }

    label.element.style.opacity = '1';
    label.lineElement.style.opacity = '1';

    // Position label slightly offset from the 3D point
    const offsetX = 50;
    const offsetY = -30;
    const labelX = screenX + offsetX;
    const labelY = screenY + offsetY;

    label.element.style.left = `${labelX}px`;
    label.element.style.top = `${labelY}px`;

    // Update SVG line from 3D point to label
    label.lineElement.setAttribute('x1', String(screenX));
    label.lineElement.setAttribute('y1', String(screenY));
    label.lineElement.setAttribute('x2', String(labelX));
    label.lineElement.setAttribute('y2', String(labelY + 8));
  });
}

// ===== FURNITURE =====
function addDesk(x: number, z: number): void {
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.03, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x9B8365, roughness: 0.6 })
  );
  deskTop.position.set(x, 0.75, z);
  deskTop.castShadow = true;
  roomGroup.add(deskTop);

  const legMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8);
  for (let lx of [-0.35, 0.35]) {
    for (let lz of [-0.2, 0.2]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x + lx, 0.375, z + lz);
      roomGroup.add(leg);
    }
  }
}

function addChair(x: number, z: number): void {
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.03, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x4477bb, roughness: 0.7 })
  );
  seat.position.set(x, 0.45, z);
  roomGroup.add(seat);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.35, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x4477bb, roughness: 0.7 })
  );
  back.position.set(x, 0.65, z + 0.18);
  roomGroup.add(back);

  // Chair legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6 });
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.42, 8);
  const legOffsets: Array<[number, number]> = [
    [-0.18, -0.18],
    [0.18, -0.18],
    [-0.18, 0.18],
    [0.18, 0.18],
  ];
  legOffsets.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x + lx, 0.24, z + lz);
    roomGroup.add(leg);
  });
}

function addTeacherDesk(x: number, z: number, withComputer: boolean = false): void {
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.04, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x7B6B4D, roughness: 0.5 })
  );
  desk.position.set(x, 0.75, z);
  desk.castShadow = true;
  roomGroup.add(desk);

  const panelMat = new THREE.MeshStandardMaterial({ color: 0x6B5B3D });
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.75, 0.7), panelMat);
  left.position.set(x - 0.68, 0.375, z);
  roomGroup.add(left);
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.75, 0.7), panelMat);
  right.position.set(x + 0.68, 0.375, z);
  roomGroup.add(right);

  if (withComputer) {
    const monitorMat = new THREE.MeshStandardMaterial({
      color: 0x1f2328,
      emissive: state.computersOn ? 0x223344 : 0x000000,
      emissiveIntensity: state.computersOn ? 0.5 : 0,
    });
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.02), monitorMat);
    monitor.position.set(x, 1.02, z + 0.12);
    roomGroup.add(monitor);
    computerScreens.push(monitor);

    const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.5 });
    const standNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 10), standMat);
    standNeck.position.set(x, 0.86, z + 0.12);
    roomGroup.add(standNeck);
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.14), standMat);
    standBase.position.set(x, 0.78, z + 0.12);
    roomGroup.add(standBase);

    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.02, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x3b434b, roughness: 0.7 })
    );
    keyboard.position.set(x, 0.77, z - 0.08);
    roomGroup.add(keyboard);
  }
}

function addComputerDesk(x: number, z: number, flip: boolean): void {
  addDesk(x, z);
  const monitor = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.02),
    new THREE.MeshStandardMaterial({
      color: 0x222222,
      emissive: state.computersOn ? 0x334466 : 0x000000,
      emissiveIntensity: state.computersOn ? 0.6 : 0,
    })
  );
  monitor.position.set(x, 0.99, z + (flip ? 0.15 : -0.15));
  monitor.rotation.y = flip ? Math.PI : 0;
  roomGroup.add(monitor);
  computerScreens.push(monitor);

  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.5 });
  const standNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 10), standMat);
  standNeck.position.set(x, 0.845, z + (flip ? 0.15 : -0.15));
  roomGroup.add(standNeck);
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.12), standMat);
  standBase.position.set(x, 0.775, z + (flip ? 0.15 : -0.15));
  roomGroup.add(standBase);
}

// ===== FOG =====
function createFogParticles(cfg: { w: number; h: number; d: number }): void {
  const particleCount = 400;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * cfg.w;
    positions[i * 3 + 1] = Math.random() * cfg.h;
    positions[i * 3 + 2] = (Math.random() - 0.5) * cfg.d;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x99bbdd,
    size: 0.06,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  if (fogParticles) {
    scene.remove(fogParticles);
    fogParticles.geometry.dispose();
    (fogParticles.material as any).dispose();
  }
  fogParticles = new THREE.Points(geometry, material);
  scene.add(fogParticles);
}

function updateFog(): void {
  if (!fogParticles) return;
  const mat = fogParticles.material as any;
  const co2Ratio = Math.min(1, Math.max(0, (state.co2 - 400) / 1600));
  mat.opacity = co2Ratio * 0.35;
  mat.size = 0.04 + co2Ratio * 0.08;
  fogParticles.rotation.y += 0.0005;

  if (ledIndicator) {
    const combinedStatus = state.co2Status === 'danger' || state.powerStatus === 'danger'
      ? 'danger'
      : state.co2Status === 'warning' || state.powerStatus === 'warning'
        ? 'warning'
        : 'ok';
    const colors: Record<string, number> = { ok: 0x00ff88, warning: 0xffaa00, danger: 0xff3344 };
    const c = colors[combinedStatus];
    (ledIndicator.material as any).color.setHex(c);
    (ledIndicator.material as any).emissive.setHex(c);
  }
}

// ===== DASHBOARD CONTROLS =====
function bindDashboardControls(): void {
  document.querySelectorAll('.sp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = (btn as HTMLElement).dataset.target!;
      const delta = parseInt((btn as HTMLElement).dataset.delta!);
      const slider = document.getElementById(target) as HTMLInputElement;
      if (!slider) return;
      const newVal = Math.min(parseInt(slider.max), Math.max(parseInt(slider.min), parseInt(slider.value) + delta));
      slider.value = String(newVal);
      slider.dispatchEvent(new Event('input'));
    });
  });

  bindSlider('sl-co2-thresh', 'val-co2-thresh', v => { state.co2Threshold = v; });
  bindSlider('sl-power-thresh', 'val-power-thresh', v => { state.powerThreshold = v; });
  bindSlider('sl-students', 'val-students', v => { state.students = v; });

  bindCheckbox('cb-lights', v => { state.lightsOn = v; updateLights(); });
  bindCheckbox('cb-projector', v => { state.projectorOn = v; updateProjector(); });
  bindCheckbox('cb-computers', v => { state.computersOn = v; updateComputers(); });
  bindCheckbox('cb-heating', v => { state.heatingOn = v; });
  bindCheckbox('cb-windows', v => { state.windowsOpen = v; updateWindows(); });

  document.querySelectorAll('.room-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const room = (btn as HTMLElement).dataset.room as RoomType;
      document.querySelectorAll('.room-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildRoom(room);
      updateRoomOptionsVisibility();
    });
  });

  document.querySelectorAll('.scenario-mini-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt((btn as HTMLElement).dataset.scenario!);
      applyScenario(SCENARIOS[idx]);
    });
  });
}

function bindSlider(sliderId: string, valId: string, onChange: (v: number) => void): void {
  const slider = document.getElementById(sliderId) as HTMLInputElement;
  slider?.addEventListener('input', () => {
    const v = parseInt(slider.value);
    const valEl = document.getElementById(valId);
    if (valEl) valEl.textContent = String(v);
    onChange(v);
  });
}

function bindCheckbox(cbId: string, onChange: (v: boolean) => void): void {
  const cb = document.getElementById(cbId) as HTMLInputElement;
  cb?.addEventListener('change', () => onChange(cb.checked));
}

function applyScenario(s: Scenario): void {
  state.students = s.students;
  state.lightsOn = s.lightsOn;
  state.projectorOn = s.projectorOn;
  state.computersOn = s.computersOn;
  state.windowsOpen = s.windowsOpen;
  state.heatingOn = s.heatingOn;

  setSlider('sl-students', s.students);
  setCheckbox('cb-lights', s.lightsOn);
  setCheckbox('cb-projector', s.projectorOn);
  setCheckbox('cb-computers', s.computersOn);
  setCheckbox('cb-heating', s.heatingOn);
  setCheckbox('cb-windows', s.windowsOpen);

  updateRoomOptionsVisibility();
}

function setSlider(id: string, val: number): void {
  const el = document.getElementById(id) as HTMLInputElement;
  if (el) { el.value = String(val); el.dispatchEvent(new Event('input')); }
}
function setCheckbox(id: string, val: boolean): void {
  const el = document.getElementById(id) as HTMLInputElement;
  if (el) el.checked = val;
}

// ===== 3D SCENE UPDATES =====
function updateLights(): void {
  const danger = alertState === 'danger';
  const warning = alertState === 'warning';
  const lightColor = danger ? 0xff3344 : warning ? 0xffaa00 : 0xffffee;
  ceilingLights.forEach(mesh => {
    const mat = mesh.material as any;
    mat.emissive.setHex(state.lightsOn ? lightColor : 0x222222);
    mesh.userData.targetEmissive = state.lightsOn ? (danger ? 1.8 : warning ? 1.4 : 1.1) : 0.05;
  });
  lightHelpers.forEach(l => {
    l.color.setHex(state.lightsOn ? lightColor : 0x222222);
    l.userData.targetIntensity = state.lightsOn ? (danger ? 1.6 : warning ? 1.2 : 1.05) : 0.02;
  });
}

function animateLights(time: number): void {
  const smooth = 0.08;
  ceilingLights.forEach((mesh, i) => {
    const mat = mesh.material as any;
    const target = mesh.userData.targetEmissive ?? 0.1;
    const current = mat.emissiveIntensity ?? 0;
    const eased = current + (target - current) * smooth;
    const pulseBase = alertState === 'danger' ? 0.18 : alertState === 'warning' ? 0.1 : 0.08;
    const pulse = state.lightsOn ? pulseBase * Math.sin(time * 0.003 + i) : 0;
    mat.emissiveIntensity = Math.max(0, eased + pulse);
  });
  lightHelpers.forEach((l, i) => {
    const target = l.userData.targetIntensity ?? 0.04;
    const current = l.intensity ?? 0;
    const eased = current + (target - current) * smooth;
    const pulseBase = alertState === 'danger' ? 0.2 : alertState === 'warning' ? 0.12 : 0.1;
    const pulse = state.lightsOn ? pulseBase * Math.sin(time * 0.003 + i * 1.3) : 0;
    l.intensity = Math.max(0, eased + pulse);
  });
}

function animateAlarmLights(time: number): void {
  const danger = alertState === 'danger';
  const warning = alertState === 'warning';
  alarmLights.forEach((l, i) => {
    if (danger) {
      l.color.setHex(0xff3344);
      l.intensity = 1.1 + 0.6 * Math.sin(time * 0.004 + i);
    } else if (warning) {
      l.color.setHex(0xffaa00);
      l.intensity = 0.25 + 0.1 * Math.sin(time * 0.002 + i);
    } else {
      l.intensity = 0;
    }
  });
}

function updateProjector(): void {
  if (projectorScreen) {
    const mat = projectorScreen.material as any;
    mat.emissive.setHex(state.projectorOn ? 0x445577 : 0x000000);
    mat.emissiveIntensity = state.projectorOn ? 0.5 : 0;
  }
}

function updateComputers(): void {
  computerScreens.forEach(mesh => {
    const mat = mesh.material as any;
    mat.emissive.setHex(state.computersOn ? 0x334466 : 0x000000);
    mat.emissiveIntensity = state.computersOn ? 0.6 : 0;
  });
}

function updateWindows(): void {
  windowFrames.forEach(w => {
    w.frameMat.color.setHex(0x607080);
    w.barMat.color.setHex(0x6b7a88);
    w.frameMat.emissive = w.frameMat.emissive ?? new THREE.Color(0x000000);
    w.barMat.emissive = w.barMat.emissive ?? new THREE.Color(0x000000);
    w.frameMat.emissiveIntensity = 0;
    w.barMat.emissiveIntensity = 0;
  });
}

function animateWindows(time: number): void {
  if (windowFrames.length === 0) return;
  const openAngle = -0.32;
  const openOffset = 0.02;
  const smooth = 0.08;
  windowFrames.forEach(w => {
    const targetRot = state.windowsOpen ? openAngle : 0;
    const targetX = w.baseX + (state.windowsOpen ? openOffset : 0);
    w.group.rotation.z += (targetRot - w.group.rotation.z) * smooth;
    w.group.position.x += (targetX - w.group.position.x) * smooth;
  });
}

// ===== SIMULATION LOOP =====
function startSimulation(): void {
  if (intervalId) clearInterval(intervalId);
  intervalId = window.setInterval(() => {
    state = tick(state, 5);
    updateDashboardUI();
  }, 1000);
  updateDashboardUI();
}

function updateDashboardUI(): void {
  const co2Val = document.getElementById('status-co2-val');
  const powerVal = document.getElementById('status-power-val');
  if (co2Val) {
    co2Val.textContent = `${Math.round(state.co2)} ppm`;
    co2Val.className = `status-value ${state.co2Status}`;
  }
  if (powerVal) {
    powerVal.textContent = `${Math.round(state.power)} W`;
    powerVal.className = `status-value ${state.powerStatus}`;
  }

  updateLed('status-co2-led', state.co2Status);
  updateLed('status-power-led', state.powerStatus);

  const timerRow = document.getElementById('power-timer-row');
  const timerVal = document.getElementById('power-timer-val');
  if (timerRow && timerVal) {
    if (state.powerAlarmTimer > 0) {
      timerRow.style.display = 'flex';
      timerVal.textContent = `${Math.round(state.powerAlarmTimer)}s / 60s`;
      timerVal.className = `status-value ${state.powerAlarmTimer >= 60 ? 'danger' : 'warning'}`;
    } else {
      timerRow.style.display = 'none';
    }
  }

  const miniCo2 = document.getElementById('mini-gauge-co2');
  if (miniCo2) {
    miniCo2.innerHTML = createGaugeSVG({
      min: 300, max: 2500, value: state.co2, threshold: state.co2Threshold,
      unit: 'ppm', label: 'CO₂ eq',
      colorOk: 'hsl(206, 55%, 55%)', colorWarning: 'hsl(38, 92%, 55%)', colorDanger: 'hsl(0, 80%, 60%)',
    });
  }
  const miniPower = document.getElementById('mini-gauge-power');
  if (miniPower) {
    miniPower.innerHTML = createGaugeSVG({
      min: 0, max: 3000, value: state.power, threshold: state.powerThreshold,
      unit: 'W', label: 'Consumo',
      colorOk: 'hsl(210, 80%, 60%)', colorWarning: 'hsl(38, 92%, 55%)', colorDanger: 'hsl(0, 80%, 60%)',
    });
  }

  if (alertBannerEl && alertTitleEl && alertSubEl && alertNoteEl) {
    const danger = state.co2Status === 'danger' || state.powerStatus === 'danger';
    const warning = !danger && (state.co2Status === 'warning' || state.powerStatus === 'warning');
    const summary = `CO₂ eq ${Math.round(state.co2)} ppm · Consumo ${Math.round(state.power)} W`;
    const message = danger
      ? (state.co2Status === 'danger'
        ? `Qualità aria alta: ${Math.round(state.co2)} ppm — Aprire le finestre`
        : `Consumo elevato: ${Math.round(state.power)} W — Ridurre i carichi`)
      : warning
        ? (state.co2Status === 'warning'
          ? `Qualità aria in aumento: ${Math.round(state.co2)} ppm`
          : `Consumo vicino alla soglia: ${Math.round(state.power)} W`)
        : 'Sistema in equilibrio — nessuna azione richiesta';

    const bannerType = danger ? 'danger' : warning ? 'warning' : 'ok';
    const bannerIcon = danger ? 'warning' : warning ? 'report' : 'check_circle';
    const bannerTitle = danger ? 'Allarme attivo' : warning ? 'Attenzione' : 'Sistema OK';

    alertBannerEl.classList.remove('danger', 'warning', 'ok');
    alertBannerEl.classList.add(bannerType);
    const iconEl = document.getElementById('room-alert-icon');
    if (iconEl) iconEl.textContent = bannerIcon;
    alertTitleEl.textContent = bannerTitle;
    alertSubEl.textContent = summary;
    alertNoteEl.textContent = message;
  }

  const nextAlertState: AlertState = state.co2Status === 'danger' || state.powerStatus === 'danger'
    ? 'danger'
    : state.co2Status === 'warning' || state.powerStatus === 'warning'
      ? 'warning'
      : 'ok';

  if (nextAlertState !== alertState) {
    alertState = nextAlertState;
    updateLights();
  }

  if (roomAlarmOverlay) {
    roomAlarmOverlay.classList.toggle('active', alertState === 'danger');
    roomAlarmOverlay.classList.toggle('warning', alertState === 'warning');
  }
}

function updateLed(id: string, status: 'ok' | 'warning' | 'danger'): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'led';
  switch (status) {
    case 'ok': el.classList.add('led-green'); break;
    case 'warning': el.classList.add('led-yellow'); break;
    case 'danger': el.classList.add('led-red'); break;
  }
}

export function destroyRoom3D(): void {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
  if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
  if (renderer) { renderer.dispose(); renderer = null; }
  labels3D = [];
  alarmLights = [];
  alertBannerEl = null;
  alertTitleEl = null;
  alertSubEl = null;
  alertNoteEl = null;
}
