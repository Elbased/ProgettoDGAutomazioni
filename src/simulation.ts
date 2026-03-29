// ===== ZephyrusTech Simulation Engine =====
// Realistic models for CO₂ and electrical consumption in classrooms

export type RoomType = 'classroom' | 'lab' | 'gym';

export interface RoomProfile {
  label: string;
  volume: number; // m³
  ventilationBoost: number;
  lightsFactor: number;
  projectorFactor: number;
  computersFactor: number;
  heatingFactor: number;
  baseLoadFactor: number;
}

export const ROOM_PROFILES: Record<RoomType, RoomProfile> = {
  classroom: {
    label: 'Aula',
    volume: 180,
    ventilationBoost: 1.0,
    lightsFactor: 1.0,
    projectorFactor: 1.0,
    computersFactor: 1.0,
    heatingFactor: 1.0,
    baseLoadFactor: 1.0,
  },
  lab: {
    label: 'Laboratorio',
    volume: 220,
    ventilationBoost: 1.1,
    lightsFactor: 1.05,
    projectorFactor: 1.0,
    computersFactor: 1.4,
    heatingFactor: 1.0,
    baseLoadFactor: 1.1,
  },
  gym: {
    label: 'Palestra',
    volume: 450,
    ventilationBoost: 1.3,
    lightsFactor: 1.6,
    projectorFactor: 0.6,
    computersFactor: 0.0,
    heatingFactor: 1.2,
    baseLoadFactor: 1.1,
  },
};

export interface SimulationState {
  roomType: RoomType;
  // CO₂
  co2: number;            // ppm
  co2Threshold: number;   // ppm
  co2Status: 'ok' | 'warning' | 'danger';
  
  // Electrical
  power: number;          // Watts
  powerThreshold: number; // Watts
  powerStatus: 'ok' | 'warning' | 'danger';
  powerAlarmTimer: number; // seconds above threshold
  
  // Controls
  students: number;
  lightsOn: boolean;
  projectorOn: boolean;
  computersOn: boolean;
  windowsOpen: boolean;
  heatingOn: boolean;
  
  // History
  co2History: number[];
  powerHistory: number[];
  timeLabels: string[];
  
  // Alerts
  alerts: Alert[];
}

export interface Alert {
  id: number;
  type: 'warning' | 'danger' | 'success';
  message: string;
  icon: string;
  timestamp: number;
}

// Realistic constants (tunable)
const CO2_OUTDOOR = 420;               // ppm baseline
const CO2_EMISSION_LPS = 0.005;        // L/s per person (sedentary)
const CO2_EMISSION_M3PS = CO2_EMISSION_LPS * 0.001;
const ACH_CLOSED = 0.5;                // air changes/hour (infiltration)
const ACH_OPEN = 3.0;                  // air changes/hour (windows open)
const SENSOR_NOISE_BASE = 1.2;         // ppm

const POWER_LIGHTS = 280;           // W (lighting)
const POWER_PROJECTOR = 230;        // W
const POWER_COMPUTERS = 220;        // W (teacher station base)
const POWER_STUDENT_DEVICE = 12;    // W per student device (lab/tablets)
const POWER_HEATING = 1500;         // W (electric heater)
const POWER_STANDBY = 35;           // W (router, clock, standby devices)

const HISTORY_LENGTH = 60;          // points (~5 min at 5s interval)

let alertIdCounter = 0;
let lastAlertCo2 = 0;
let lastAlertPower = 0;

function getProfile(type: RoomType): RoomProfile {
  return ROOM_PROFILES[type] ?? ROOM_PROFILES.classroom;
}

function computeAirChangeRate(profile: RoomProfile, windowsOpen: boolean): number {
  const base = windowsOpen ? ACH_OPEN : ACH_CLOSED;
  return base * profile.ventilationBoost;
}

function computeBasePower(s: SimulationState, timeSec: number): number {
  const profile = getProfile(s.roomType);
  const lightFlicker = s.lightsOn ? 1 + 0.03 * Math.sin(timeSec * 1.7) + 0.015 * Math.sin(timeSec * 0.23) : 0;
  const lightLoad = s.lightsOn ? POWER_LIGHTS * profile.lightsFactor * lightFlicker : 0;
  const projectorLoad = s.projectorOn
    ? POWER_PROJECTOR * profile.projectorFactor * (0.88 + 0.12 * (0.5 + 0.5 * Math.sin(timeSec * 0.5)))
    : 0;
  const studentLoad = s.computersOn ? s.students * POWER_STUDENT_DEVICE * profile.computersFactor : 0;
  const computerLoad = s.computersOn ? (POWER_COMPUTERS * profile.computersFactor + studentLoad) : 0;
  const heatingDuty = s.heatingOn ? (0.6 + 0.4 * (0.5 + 0.5 * Math.sin(timeSec * 0.07))) : 0;
  const heatingLoad = s.heatingOn ? POWER_HEATING * profile.heatingFactor * heatingDuty : 0;

  return POWER_STANDBY * profile.baseLoadFactor + lightLoad + projectorLoad + computerLoad + heatingLoad;
}

export function createInitialState(): SimulationState {
  const initial: SimulationState = {
    roomType: 'classroom',
    co2: CO2_OUTDOOR + 80,
    co2Threshold: 1000,
    co2Status: 'ok',
    power: POWER_STANDBY,
    powerThreshold: 1500,
    powerStatus: 'ok',
    powerAlarmTimer: 0,
    students: 22,
    lightsOn: true,
    projectorOn: false,
    computersOn: false,
    windowsOpen: false,
    heatingOn: false,
    co2History: Array(HISTORY_LENGTH).fill(CO2_OUTDOOR + 80),
    powerHistory: Array(HISTORY_LENGTH).fill(POWER_STANDBY + POWER_LIGHTS),
    timeLabels: generateTimeLabels(),
    alerts: [],
  };

  const nowSec = Date.now() / 1000;
  const basePower = computeBasePower(initial, nowSec);
  initial.power = Math.max(0, basePower + gaussianNoise(6));
  initial.powerHistory = Array(HISTORY_LENGTH).fill(basePower);

  return initial;
}

function generateTimeLabels(): string[] {
  const labels: string[] = [];
  const now = Date.now();
  for (let i = HISTORY_LENGTH - 1; i >= 0; i--) {
    const t = new Date(now - i * 5000);
    labels.push(t.toLocaleTimeString('it-IT', { minute: '2-digit', second: '2-digit' }));
  }
  return labels;
}

function gaussianNoise(stddev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stddev;
}

export function tick(state: SimulationState, dtSeconds: number): SimulationState {
  const s = { ...state };
  const profile = getProfile(s.roomType);
  const nowSec = Date.now() / 1000;

  // ===== CO₂ Model =====
  // Mass balance model with air changes/hour
  const activityFactor = s.roomType === 'gym' ? 1.6 : s.roomType === 'lab' ? 1.15 : 1.0;
  const co2Generation = s.students * CO2_EMISSION_M3PS * activityFactor; // m³/s
  const ach = computeAirChangeRate(profile, s.windowsOpen);
  const ventTerm = ((CO2_OUTDOOR - s.co2) * ach) / 3600; // ppm/s
  const prodTerm = (co2Generation / profile.volume) * 1_000_000; // ppm/s
  const co2Next = s.co2 + (ventTerm + prodTerm) * dtSeconds;
  const co2Noise = gaussianNoise(SENSOR_NOISE_BASE + Math.min(4, s.students * 0.08));
  s.co2 = Math.max(CO2_OUTDOOR, co2Next + co2Noise);
  
  // ===== Power Model =====
  const basePower = computeBasePower(s, nowSec);
  const powerNoise = gaussianNoise(5 + basePower * 0.01);
  s.power = Math.max(0, basePower + powerNoise);

  // ===== Status evaluation =====
  // CO₂
  const co2Ratio = s.co2 / s.co2Threshold;
  if (co2Ratio >= 1.0) {
    s.co2Status = 'danger';
  } else if (co2Ratio >= 0.8) {
    s.co2Status = 'warning';
  } else {
    s.co2Status = 'ok';
  }
  
  // Power
  const powerRatio = s.power / s.powerThreshold;
  if (powerRatio >= 1.0) {
    s.powerAlarmTimer += dtSeconds;
    if (s.powerAlarmTimer >= 60) {
      s.powerStatus = 'danger';
    } else {
      s.powerStatus = 'warning';
    }
  } else {
    s.powerAlarmTimer = Math.max(0, s.powerAlarmTimer - dtSeconds * 2);
    if (powerRatio >= 0.8) {
      s.powerStatus = 'warning';
    } else {
      s.powerStatus = 'ok';
    }
  }

  // ===== Alerts =====
  const now = Date.now();
  s.alerts = s.alerts.filter(a => now - a.timestamp < 5000);
  
  if (s.co2Status === 'danger' && now - lastAlertCo2 > 10000) {
    s.alerts.push({
      id: ++alertIdCounter,
      type: 'danger',
      message: `Qualità aria a ${Math.round(s.co2)} ppm — Aprire le finestre`,
      icon: 'air',
      timestamp: now,
    });
    lastAlertCo2 = now;
  } else if (s.co2Status === 'warning' && now - lastAlertCo2 > 15000) {
    s.alerts.push({
      id: ++alertIdCounter,
      type: 'warning',
      message: `Qualità aria in aumento: ${Math.round(s.co2)} ppm`,
      icon: 'cloud',
      timestamp: now,
    });
    lastAlertCo2 = now;
  }

  if (s.powerStatus === 'danger' && now - lastAlertPower > 10000) {
    s.alerts.push({
      id: ++alertIdCounter,
      type: 'danger',
      message: `Consumo elevato da ${Math.round(s.powerAlarmTimer)}s — Spegnere dispositivi`,
      icon: 'power',
      timestamp: now,
    });
    lastAlertPower = now;
  } else if (s.powerStatus === 'warning' && now - lastAlertPower > 15000) {
    s.alerts.push({
      id: ++alertIdCounter,
      type: 'warning',
      message: `Consumo vicino alla soglia: ${Math.round(s.power)}W`,
      icon: 'bolt',
      timestamp: now,
    });
    lastAlertPower = now;
  }

  // ===== History update =====
  s.co2History = [...s.co2History.slice(1), s.co2];
  s.powerHistory = [...s.powerHistory.slice(1), s.power];
  
  const newLabel = new Date().toLocaleTimeString('it-IT', { minute: '2-digit', second: '2-digit' });
  s.timeLabels = [...s.timeLabels.slice(1), newLabel];

  return s;
}

// Preset scenarios
export interface Scenario {
  name: string;
  icon: string; // Material Symbols icon name
  students: number;
  lightsOn: boolean;
  projectorOn: boolean;
  computersOn: boolean;
  windowsOpen: boolean;
  heatingOn: boolean;
}

export const SCENARIOS: Scenario[] = [
  {
    name: 'Aula chiusa',
    icon: 'meeting_room',
    students: 0,
    lightsOn: false,
    projectorOn: false,
    computersOn: false,
    windowsOpen: false,
    heatingOn: false,
  },
  {
    name: 'Lezione',
    icon: 'school',
    students: 25,
    lightsOn: true,
    projectorOn: true,
    computersOn: true,
    windowsOpen: false,
    heatingOn: false,
  },
  {
    name: 'Laboratorio',
    icon: 'computer',
    students: 20,
    lightsOn: true,
    projectorOn: true,
    computersOn: true,
    windowsOpen: false,
    heatingOn: false,
  },
  {
    name: 'Ventilazione attiva',
    icon: 'window',
    students: 25,
    lightsOn: true,
    projectorOn: false,
    computersOn: false,
    windowsOpen: true,
    heatingOn: false,
  },
  {
    name: 'Riscaldamento attivo',
    icon: 'ac_unit',
    students: 28,
    lightsOn: true,
    projectorOn: true,
    computersOn: true,
    windowsOpen: false,
    heatingOn: true,
  },
  {
    name: 'Intervallo',
    icon: 'coffee',
    students: 0,
    lightsOn: true,
    projectorOn: false,
    computersOn: false,
    windowsOpen: true,
    heatingOn: false,
  },
];
