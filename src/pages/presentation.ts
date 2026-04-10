// ===== Presentation Page =====
import { createBarChart, createDoughnutChart, createLineChart, updateBarChart, updateDoughnutChart, updateLineChart } from '../utils/charts';
import { globalState, subscribeToSimulation } from '../simulation';

let presentationInterval: number | null = null;
let unsubscribe: (() => void) | null = null;

export function renderPresentation(container: HTMLElement): void {
  if (presentationInterval) {
    clearInterval(presentationInterval);
    presentationInterval = null;
  }
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  container.innerHTML = `
    <div class="container landing">
      <section class="hero reveal warp-item">
        <div class="hero-content">
          <div class="hero-badge">ZephyrusTech · Benessere e risparmio per le scuole</div>
          <h1 class="hero-title">Aria più sana e consumi sotto controllo, in un'unica piattaforma.</h1>
          <p class="hero-subtitle">
            Un prodotto semplice da usare che aiuta scuole e docenti a capire subito
            se l'aula è in equilibrio e dove intervenire.
          </p>
          <div class="hero-actions">
            <a class="btn primary" href="#simulation">Avvia demo live</a>
            <a class="btn ghost" href="#components">Vedi il kit</a>
          </div>
          <div class="hero-proof">
            <div class="proof-item"><span class="proof-label">Aggiornamento</span><span class="proof-value">Ogni pochi secondi</span></div>
            <div class="proof-item"><span class="proof-label">Installazione</span><span class="proof-value">Rapida</span></div>
            <div class="proof-item"><span class="proof-label">Costo kit</span><span class="proof-value">Accessibile</span></div>
          </div>
        </div>
        <div class="hero-card">
          <div class="hero-card-top">
            <img src="/Logo.png" alt="ZephyrusTech logo">
            <div>
              <div class="hero-card-title">Dashboard Operativa</div>
              <div class="hero-card-sub">Stato aula in tempo reale</div>
            </div>
          </div>
          <div class="hero-metrics">
            <div class="metric">
              <div class="metric-label">Qualità aria</div>
              <div class="metric-value">Ottima</div>
              <div class="metric-note ok">Stabile</div>
            </div>
            <div class="metric">
              <div class="metric-label">Consumo</div>
              <div class="metric-value">In linea</div>
              <div class="metric-note ok">Stabile</div>
            </div>
            <div class="metric">
              <div class="metric-label">Allarmi attivi</div>
              <div class="metric-value">0</div>
              <div class="metric-note muted">Ultimi 60 min</div>
            </div>
          </div>
          <div class="hero-card-footer">
            Sistema scalabile per aule, laboratori e palestre.
          </div>
        </div>
      </section>

      <section class="value-grid reveal delay-1 warp-item">
        <div class="value-card">
          <div class="value-title">Riduzione rischi</div>
          <div class="value-text">Avvisi chiari quando serve intervenire, senza tecnicismi.</div>
        </div>
        <div class="value-card">
          <div class="value-title">Decisioni rapide</div>
          <div class="value-text">Grafici semplici e leggibili anche in pochi minuti.</div>
        </div>
        <div class="value-card">
          <div class="value-title">Costi controllati</div>
          <div class="value-text">Installazione veloce e manutenzione leggera.</div>
        </div>
      </section>

      <section class="section-split reveal delay-2 warp-item">
        <div class="section-copy">
          <div class="section-label">Come funziona</div>
          <h2 class="section-title">Misura, capisci, agisci.</h2>
          <p class="section-text">
            Piccoli sensori raccolgono le informazioni dell'aula, il sistema le riassume
            in indicatori chiari e ti guida nelle azioni.
          </p>
          <div class="step-list">
            <div class="step-item"><span class="step-num">01</span> Rilevazione qualità aria e consumi</div>
            <div class="step-item"><span class="step-num">02</span> Valutazione automatica</div>
            <div class="step-item"><span class="step-num">03</span> Dashboard con alert chiari</div>
          </div>
        </div>
        <div class="section-media">
          <div class="panel-mock">
            <div class="panel-row">
              <span>Stato aula</span><strong>Ottimo</strong>
            </div>
            <div class="panel-row">
              <span>Qualità aria</span><strong>In equilibrio</strong>
            </div>
            <div class="panel-row">
              <span>Consumo</span><strong>Sotto controllo</strong>
            </div>
            <div class="panel-row subtle">
              <span>Ultimo intervento</span><strong>—</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="section-split reverse reveal delay-3 warp-item">
        <div class="section-copy">
          <div class="section-label">Valore per la scuola</div>
          <h2 class="section-title">Una piattaforma pronta per crescere.</h2>
          <p class="section-text">
            Accesso da browser, ruoli chiari e possibilità di aggiungere nuove aule nel tempo.
          </p>
          <div class="feature-grid">
            <div class="feature">Dashboard con indicatori chiari</div>
            <div class="feature">Simulazione 3D per demo</div>
            <div class="feature">Storico dati per confronti</div>
            <div class="feature">Aggiornamenti semplici</div>
          </div>
        </div>
        <div class="section-media">
          <div class="panel-mock">
            <div class="panel-row">
              <span>Qualità aria</span><strong id="pres-mock-air">OK</strong>
            </div>
            <div class="panel-row">
              <span>Consumo</span><strong id="pres-mock-power">495 W</strong>
            </div>
            <div class="panel-row">
              <span>Stato sistema</span><strong id="pres-mock-status">Stabile</strong>
            </div>
            <div class="panel-row subtle">
              <span>Ultimo alert</span><strong>—</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="section-data reveal delay-4 warp-item">
        <div class="section-label">Dati in tempo reale</div>
        <h2 class="section-title">Trend chiari e facili da leggere.</h2>
        <div class="grid-2">
          <div class="card">
            <div class="card-title"><span class="material-symbols-rounded icon-sm">show_chart</span> Qualità Aria</div>
            <div class="chart-container">
              <canvas id="chart-air"></canvas>
            </div>
            <div class="section-note">Indicatore sintetico con andamento naturale.</div>
          </div>
          <div class="card">
            <div class="card-title"><span class="material-symbols-rounded icon-sm">insights</span> Consumo Energetico</div>
            <div class="chart-container">
              <canvas id="chart-energy"></canvas>
            </div>
            <div class="section-note">Andamento giornaliero semplificato.</div>
          </div>
        </div>
      </section>

      <section class="section-split compact reveal delay-5 warp-item">
        <div class="section-copy">
          <div class="section-label">Costo e implementazione</div>
          <h2 class="section-title">Tempo e budget sotto controllo.</h2>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-title">Installazione</div>
              <div class="timeline-date">1–1,5 ore / aula</div>
              <div class="timeline-desc">Montaggio sensori e cablaggio.</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-title">Calibrazione</div>
              <div class="timeline-date">30–45 minuti</div>
              <div class="timeline-desc">Verifica letture e stabilizzazione.</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-title">Formazione</div>
              <div class="timeline-date">45–60 minuti</div>
              <div class="timeline-desc">Uso dashboard e gestione alert.</div>
            </div>
          </div>
        </div>
        <div class="section-media">
          <div class="card">
            <div class="card-title"><span class="material-symbols-rounded icon-sm">donut_large</span> Ripartizione Costi BOM</div>
            <div class="chart-container">
              <canvas id="chart-costs"></canvas>
            </div>
            <div class="section-note">Costi indicativi con kit completo.</div>
          </div>
        </div>
      </section>

      <section class="cta reveal delay-5 warp-item">
        <div>
          <h2 class="cta-title">Pronti a portare ZephyrusTech nella vostra scuola?</h2>
          <p class="cta-text">Demo live e dettagli chiari per una valutazione immediata.</p>
        </div>
        <div class="cta-actions">
          <a class="btn primary" href="#simulation">Apri demo</a>
          <a class="btn ghost" href="#arduino">Confronto tecnico</a>
        </div>
      </section>
    </div>
  `;

  const buildTimeLabels = (count: number): string[] => {
    const labels: string[] = [];
    const now = Date.now();
    for (let i = count - 1; i >= 0; i--) {
      const t = new Date(now - i * 1000); // 1 tick = 1 secondo
      labels.push(t.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
    return labels;
  };

  const getAirRange = (history: number[]) => {
    const min = Math.min(...history, 400);
    const max = Math.max(...history, 500);
    const pad = Math.max(50, (max - min) * 0.2);
    return { yMin: Math.max(0, min - pad), yMax: max + pad };
  };

  createLineChart({
    canvasId: 'chart-air',
    labels: buildTimeLabels(globalState.co2History.length),
    datasets: [{
      label: 'Qualità aria (CO2 ppm)',
      data: globalState.co2History,
      color: 'hsl(24, 55%, 42%)',
      threshold: globalState.co2Threshold,
      tension: 0.2,
      pointRadius: 0,
      fill: true,
      gradient: { from: 'rgba(222, 148, 82, 0.35)', to: 'rgba(222, 148, 82, 0.02)' },
      cubicInterpolationMode: 'monotone',
    }],
    legend: { position: 'top', align: 'start', padding: 10, fontSize: 10, boxWidth: 8 },
    yLabel: 'ppm',
    yMin: getAirRange(globalState.co2History).yMin,
    yMax: getAirRange(globalState.co2History).yMax,
  });
  
  // Downsample power history for bar chart (last 12 items)
  const powerDownsampled = globalState.powerHistory.slice(-12);
  createBarChart(
    'chart-energy',
    buildTimeLabels(powerDownsampled.length),
    [powerDownsampled],
    ['Consumo (W)'],
    ['hsl(30, 45%, 38%)']
  );

  let costValues = [32, 24, 18, 16, 10];
  createDoughnutChart(
    'chart-costs',
    ['Sensori', 'Controller', 'Display', 'Rete', 'Altro'],
    costValues,
    ['hsl(24,55%,42%)', 'hsl(30,45%,38%)', 'hsl(38,70%,50%)', 'hsl(20,30%,45%)', 'hsl(25,10%,55%)']
  );

  const updatePresentationUI = () => {
    // Aggiorna Air
    const airLabels = buildTimeLabels(globalState.co2History.length);
    const nextAirRange = getAirRange(globalState.co2History);
    updateLineChart('chart-air', airLabels, [{ data: globalState.co2History, threshold: globalState.co2Threshold }], { yMin: nextAirRange.yMin, yMax: nextAirRange.yMax });

    // Aggiorna Power
    const powerSlice = globalState.powerHistory.slice(-12);
    const powerLabels = buildTimeLabels(powerSlice.length);
    updateBarChart('chart-energy', [powerSlice], powerLabels);

    // Update testuale nel mockup
    const powerMockVal = document.getElementById('pres-mock-power');
    if (powerMockVal) powerMockVal.textContent = Math.round(globalState.power) + ' W';
    
    const airMockVal = document.getElementById('pres-mock-air');
    if (airMockVal) airMockVal.textContent = globalState.co2Status === 'ok' ? 'OK' : globalState.co2Status === 'warning' ? 'Attenzione' : 'Critica';
    
    const statusMockVal = document.getElementById('pres-mock-status');
    if (statusMockVal) statusMockVal.textContent = globalState.co2Status === 'ok' && globalState.powerStatus === 'ok' ? 'Stabile' : 'Alert Attivi';
  };

  unsubscribe = subscribeToSimulation(() => {
    updatePresentationUI();
  });
}

export function destroyPresentation(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
