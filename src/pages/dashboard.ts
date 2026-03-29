// ===== Dashboard Page - Real-time Simulation =====
import { SimulationState, SCENARIOS, Scenario, tick, createInitialState } from '../simulation';
import { createGaugeSVG } from '../utils/gauge';
import { createLineChart, updateLineChart } from '../utils/charts';

let state: SimulationState = createInitialState();
let intervalId: number | null = null;

export function renderDashboard(container: HTMLElement): void {
  container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1><span class="material-symbols-rounded">analytics</span> Dashboard di Monitoraggio</h1>
        <p class="subtitle">Simulazione in tempo reale del sistema AURA — regola i parametri e osserva i dati</p>
      </div>

      <!-- Scenario presets -->
      <div class="card" style="margin-bottom: var(--sp-lg);">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">tune</span> Scenari Preimpostati</div>
        <div class="scenario-grid" id="scenario-grid"></div>
      </div>

      <!-- Gauges + Status -->
      <div class="grid-2" style="margin-bottom: var(--sp-lg);">
        <!-- CO₂ Gauge -->
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">air</span> Qualità Aria (CO₂ eq)</div>
          <div class="gauge-container">
            <div id="gauge-co2"></div>
            <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
              <span style="font-size:0.8rem; color:var(--text-muted);">Stato:</span>
              <span id="led-co2" class="led led-green"></span>
              <span id="status-co2" style="font-size:0.85rem; font-weight:600;">Normale</span>
            </div>
          </div>
        </div>

        <!-- Power Gauge -->
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">bolt</span> Consumo Elettrico</div>
          <div class="gauge-container">
            <div id="gauge-power"></div>
            <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
              <span style="font-size:0.8rem; color:var(--text-muted);">Stato:</span>
              <span id="led-power" class="led led-green"></span>
              <span id="status-power" style="font-size:0.85rem; font-weight:600;">Normale</span>
            </div>
            <div id="power-timer-container" style="margin-top:12px; display:none;">
              <div class="timer-label">Tempo sopra soglia</div>
              <div id="power-timer" class="timer-display" style="font-size:1.5rem;">0s</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid-2" style="margin-bottom: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">show_chart</span> Storico CO₂ eq (5 min)</div>
          <div class="chart-container">
            <canvas id="chart-co2"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">show_chart</span> Storico Consumo (5 min)</div>
          <div class="chart-container">
            <canvas id="chart-power"></canvas>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="grid-2">
        <!-- Thresholds -->
        <div class="card">
          <div class="card-title"><span class="icon">🎚️</span> Soglie di Allarme</div>
          
          <div class="slider-group">
            <div class="slider-label">
              <span>Soglia CO₂ massima</span>
              <span class="slider-value" id="val-co2-threshold">${state.co2Threshold} ppm</span>
            </div>
            <input type="range" id="slider-co2-threshold" min="400" max="2000" step="50" value="${state.co2Threshold}">
          </div>
          
          <div class="slider-group">
            <div class="slider-label">
              <span>Soglia consumo massimo</span>
              <span class="slider-value" id="val-power-threshold">${state.powerThreshold} W</span>
            </div>
            <input type="range" id="slider-power-threshold" min="100" max="3000" step="50" value="${state.powerThreshold}">
          </div>
        </div>

        <!-- Environment Controls -->
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">domain</span> Controllo Ambiente</div>
          
          <div class="slider-group">
            <div class="slider-label">
              <span>Numero studenti</span>
              <span class="slider-value" id="val-students">${state.students}</span>
            </div>
            <input type="range" id="slider-students" min="0" max="35" step="1" value="${state.students}">
          </div>

          <div class="toggle-group">
            <div class="toggle-info">
              <span class="toggle-name">Luci</span>
              <span class="toggle-detail">6 pannelli LED + 4 tubi (~280W)</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-lights" ${state.lightsOn ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-group">
            <div class="toggle-info">
              <span class="toggle-name">Proiettore</span>
              <span class="toggle-detail">Proiettore aula (~230W)</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-projector" ${state.projectorOn ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-group">
            <div class="toggle-info">
              <span class="toggle-name">PC + Monitor</span>
              <span class="toggle-detail">Postazione docente (~380W)</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-computers" ${state.computersOn ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-group">
            <div class="toggle-info">
              <span class="toggle-name">Riscaldamento</span>
              <span class="toggle-detail">Stufetta elettrica (~1500W)</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-heating" ${state.heatingOn ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="toggle-group">
            <div class="toggle-info">
              <span class="toggle-name">Finestre</span>
              <span class="toggle-detail">Ventilazione naturale</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-windows" ${state.windowsOpen ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Alert container -->
      <div class="alert-container" id="alert-container"></div>
    </div>
  `;

  // Initialize scenarios
  renderScenarios();
  
  // Initialize charts
  createLineChart({
    canvasId: 'chart-co2',
    labels: state.timeLabels,
    datasets: [{ label: 'CO₂ eq (ppm)', data: state.co2History, color: 'hsl(206, 55%, 55%)', threshold: state.co2Threshold }],
    yLabel: 'ppm',
    yMin: 300,
  });
  
  createLineChart({
    canvasId: 'chart-power',
    labels: state.timeLabels,
    datasets: [{ label: 'Consumo (W)', data: state.powerHistory, color: 'hsl(210, 80%, 60%)', threshold: state.powerThreshold }],
    yLabel: 'Watt',
    yMin: 0,
  });

  // Bind events
  bindControls();

  // Start simulation loop (update every 1 second, but simulating 5s per tick for faster demo)
  if (intervalId) clearInterval(intervalId);
  intervalId = window.setInterval(() => {
    state = tick(state, 5);
    updateUI();
  }, 1000);
  
  // Initial render
  updateUI();
}

function renderScenarios(): void {
  const grid = document.getElementById('scenario-grid');
  if (!grid) return;
  grid.innerHTML = SCENARIOS.map((s, i) => `
    <button class="scenario-btn" data-scenario="${i}">
      <span class="emoji">${s.emoji}</span>
      ${s.name}
    </button>
  `).join('');

  grid.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.scenario-btn') as HTMLElement;
    if (!btn) return;
    const idx = parseInt(btn.dataset.scenario || '0');
    applyScenario(SCENARIOS[idx]);
    
    // Update active state
    grid.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
}

function applyScenario(s: Scenario): void {
  state.students = s.students;
  state.lightsOn = s.lightsOn;
  state.projectorOn = s.projectorOn;
  state.computersOn = s.computersOn;
  state.windowsOpen = s.windowsOpen;
  state.heatingOn = s.heatingOn;
  
  // Update UI controls
  (document.getElementById('slider-students') as HTMLInputElement).value = String(s.students);
  (document.getElementById('val-students') as HTMLElement).textContent = String(s.students);
  (document.getElementById('toggle-lights') as HTMLInputElement).checked = s.lightsOn;
  (document.getElementById('toggle-projector') as HTMLInputElement).checked = s.projectorOn;
  (document.getElementById('toggle-computers') as HTMLInputElement).checked = s.computersOn;
  (document.getElementById('toggle-windows') as HTMLInputElement).checked = s.windowsOpen;
  (document.getElementById('toggle-heating') as HTMLInputElement).checked = s.heatingOn;
}

function bindControls(): void {
  // Threshold sliders
  const co2ThreshSlider = document.getElementById('slider-co2-threshold') as HTMLInputElement;
  co2ThreshSlider?.addEventListener('input', () => {
    state.co2Threshold = parseInt(co2ThreshSlider.value);
    (document.getElementById('val-co2-threshold') as HTMLElement).textContent = `${state.co2Threshold} ppm`;
  });

  const powerThreshSlider = document.getElementById('slider-power-threshold') as HTMLInputElement;
  powerThreshSlider?.addEventListener('input', () => {
    state.powerThreshold = parseInt(powerThreshSlider.value);
    (document.getElementById('val-power-threshold') as HTMLElement).textContent = `${state.powerThreshold} W`;
  });

  // Students slider
  const studentsSlider = document.getElementById('slider-students') as HTMLInputElement;
  studentsSlider?.addEventListener('input', () => {
    state.students = parseInt(studentsSlider.value);
    (document.getElementById('val-students') as HTMLElement).textContent = String(state.students);
  });

  // Toggles
  document.getElementById('toggle-lights')?.addEventListener('change', (e) => {
    state.lightsOn = (e.target as HTMLInputElement).checked;
  });
  document.getElementById('toggle-projector')?.addEventListener('change', (e) => {
    state.projectorOn = (e.target as HTMLInputElement).checked;
  });
  document.getElementById('toggle-computers')?.addEventListener('change', (e) => {
    state.computersOn = (e.target as HTMLInputElement).checked;
  });
  document.getElementById('toggle-windows')?.addEventListener('change', (e) => {
    state.windowsOpen = (e.target as HTMLInputElement).checked;
  });
  document.getElementById('toggle-heating')?.addEventListener('change', (e) => {
    state.heatingOn = (e.target as HTMLInputElement).checked;
  });
}

function updateUI(): void {
  // Update gauges
  const gaugeCo2 = document.getElementById('gauge-co2');
  if (gaugeCo2) {
    gaugeCo2.innerHTML = createGaugeSVG({
      min: 300, max: 2500, value: state.co2, threshold: state.co2Threshold,
      unit: 'ppm', label: 'CO₂ eq',
      colorOk: 'hsl(206, 55%, 55%)', colorWarning: 'hsl(38, 92%, 55%)', colorDanger: 'hsl(0, 80%, 60%)',
    });
  }

  const gaugePower = document.getElementById('gauge-power');
  if (gaugePower) {
    gaugePower.innerHTML = createGaugeSVG({
      min: 0, max: 3000, value: state.power, threshold: state.powerThreshold,
      unit: 'W', label: 'Consumo',
      colorOk: 'hsl(210, 80%, 60%)', colorWarning: 'hsl(38, 92%, 55%)', colorDanger: 'hsl(0, 80%, 60%)',
    });
  }

  // Update LEDs and status text
  updateStatusIndicator('led-co2', 'status-co2', state.co2Status);
  updateStatusIndicator('led-power', 'status-power', state.powerStatus);

  // Power timer
  const timerContainer = document.getElementById('power-timer-container');
  const timerDisplay = document.getElementById('power-timer');
  if (timerContainer && timerDisplay) {
    if (state.powerAlarmTimer > 0) {
      timerContainer.style.display = 'block';
      timerDisplay.textContent = `${Math.round(state.powerAlarmTimer)}s / 60s`;
      timerDisplay.style.color = state.powerAlarmTimer >= 60 ? 'var(--danger)' : 'var(--warning)';
    } else {
      timerContainer.style.display = 'none';
    }
  }

  // Update charts
  updateLineChart('chart-co2', state.timeLabels, [{ data: state.co2History, threshold: state.co2Threshold }]);
  updateLineChart('chart-power', state.timeLabels, [{ data: state.powerHistory, threshold: state.powerThreshold }]);

  // Alerts
  const alertContainer = document.getElementById('alert-container');
  if (alertContainer) {
    alertContainer.innerHTML = state.alerts.map(a => `
      <div class="alert alert-${a.type}">
        <span>${a.icon}</span>
        <span>${a.message}</span>
      </div>
    `).join('');
  }
}

function updateStatusIndicator(ledId: string, textId: string, status: 'ok' | 'warning' | 'danger'): void {
  const led = document.getElementById(ledId);
  const text = document.getElementById(textId);
  if (!led || !text) return;

  led.className = 'led';
  switch (status) {
    case 'ok':
      led.classList.add('led-green');
      text.textContent = 'Normale';
      text.style.color = 'var(--accent)';
      break;
    case 'warning':
      led.classList.add('led-yellow');
      text.textContent = 'Attenzione';
      text.style.color = 'var(--warning)';
      break;
    case 'danger':
      led.classList.add('led-red');
      text.textContent = 'ALLARME';
      text.style.color = 'var(--danger)';
      break;
  }
}

export function destroyDashboard(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
