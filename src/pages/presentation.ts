// ===== Presentation Page =====
import { createBarChart, createDoughnutChart, createLineChart } from '../utils/charts';

export function renderPresentation(container: HTMLElement): void {
  container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1><span class="material-symbols-rounded">campaign</span> Presentazione Progetto</h1>
        <p class="subtitle">Panoramica professionale del sistema di monitoraggio energetico e qualità dell'aria per ambienti scolastici.</p>
        <p class="intro-note">Zephyrus è il nome del vento di ponente nella mitologia greca: una brezza leggera e pulita. Il progetto adotta questo simbolo per rappresentare aria sana, monitoraggio costante e benessere negli ambienti scolastici.</p>
      </div>

      <section class="hero-grid">
        <div class="hero-card">
          <div class="eyebrow">ZephyrusTech</div>
          <h2>Monitoraggio intelligente, decisioni rapide.</h2>
          <p>
            Raccogliamo dati ambientali e di consumo in aula, li analizziamo su un server centrale e li trasformiamo
            in grafici chiari per preside, responsabili e docenti. Il risultato è una gestione più efficiente,
            trasparente e pronta alla crescita.
          </p>
          <div class="hero-actions">
            <a class="btn primary" href="#simulation">Apri la simulazione</a>
            <a class="btn" href="#schematic">Vedi lo schema</a>
          </div>
          <div class="hero-footnote">Dati e grafici mostrati a scopo dimostrativo.</div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Campionamento</div>
            <div class="kpi-value">ogni 5 s</div>
            <div class="kpi-desc">Dati aggiornati in tempo quasi reale.</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Setup per aula</div>
            <div class="kpi-value">2–3 ore</div>
            <div class="kpi-desc">Installazione, calibrazione e test.</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Costo BOM</div>
            <div class="kpi-value">€28,42</div>
            <div class="kpi-desc">Kit completo con componenti online.</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Stima per classe</div>
            <div class="kpi-value">€16,37</div>
            <div class="kpi-desc">Acquisto in lotto e ottimizzazione.</div>
          </div>
        </div>
      </section>

      <section class="card" style="margin-top: var(--sp-xl);">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">hub</span> Flusso Dati</div>
        <div class="flow-grid">
          <div class="flow-step">
            <span class="material-symbols-rounded icon-lg">sensors</span>
            <h3>Rilevazione</h3>
            <p>MQ-135 e SCT-013 misurano qualità aria e consumo senza interventi invasivi.</p>
          </div>
          <div class="flow-step">
            <span class="material-symbols-rounded icon-lg">memory</span>
            <h3>Elaborazione</h3>
            <p>ESP32-C3 filtra i dati, applica soglie e prepara i pacchetti per l'invio.</p>
          </div>
          <div class="flow-step">
            <span class="material-symbols-rounded icon-lg">dns</span>
            <h3>Server Centrale</h3>
            <p>Validazione, storicizzazione e trasformazione in grafici e report.</p>
          </div>
          <div class="flow-step">
            <span class="material-symbols-rounded icon-lg">monitoring</span>
            <h3>Dashboard</h3>
            <p>Accesso differenziato: amministratore e utenti con sola visualizzazione.</p>
          </div>
        </div>
      </section>

      <section class="grid-2" style="margin-top: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">shield_person</span> Gestione e Ruoli</div>
          <div class="role-grid">
            <div class="role-card">
              <div class="role-title">Amministratore</div>
              <ul class="simple-list">
                <li>Aggiunge o rimuove centraline e stanze.</li>
                <li>Imposta soglie, scenari e profili di aula.</li>
                <li>Gestisce report, esportazioni e storico.</li>
              </ul>
            </div>
            <div class="role-card">
              <div class="role-title">Utenti (docenti/studenti)</div>
              <ul class="simple-list">
                <li>Accesso in sola visualizzazione.</li>
                <li>Grafici, stato aula e alert in tempo reale.</li>
                <li>Confronto tra aule e periodi.</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">workspaces</span> Esempi di Applicazione</div>
          <ul class="simple-list">
            <li>Aule standard e laboratori informatici.</li>
            <li>Biblioteche, sale studio e auditorium.</li>
            <li>Palestre e spazi polifunzionali con alta variabilità.</li>
            <li>Controllo consumi in periodi di chiusura.</li>
          </ul>
          <div class="section-note">Compatibile con espansioni future (sensori aggiuntivi e nuove stanze).</div>
        </div>
      </section>

      <section class="grid-2" style="margin-top: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">show_chart</span> Qualità Aria (CO₂ eq · lezione tipo)</div>
          <div class="chart-container">
            <canvas id="chart-air"></canvas>
          </div>
          <div class="section-note">Valori simulati con andamento realistico (CO₂ equivalente da MQ-135).</div>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">insights</span> Consumo per Fascia Oraria</div>
          <div class="chart-container">
            <canvas id="chart-energy"></canvas>
          </div>
          <div class="section-note">Esempio di carico medio giornaliero per aula.</div>
        </div>
      </section>

      <section class="grid-2" style="margin-top: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">donut_large</span> Ripartizione Costi BOM</div>
          <div class="chart-container">
            <canvas id="chart-costs"></canvas>
          </div>
          <div class="section-note">Costi indicativi con kit completo e prototipazione inclusa.</div>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">schedule</span> Tempi e Prezzi di Setup</div>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-title">Sopralluogo e pianificazione</div>
              <div class="timeline-date">0,5 giornata</div>
              <div class="timeline-desc">Raccolta requisiti, mappa stanze, definizione soglie.</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-title">Installazione e cablaggio</div>
              <div class="timeline-date">1–1,5 ore / aula</div>
              <div class="timeline-desc">Montaggio sensori, fissaggi e collegamenti.</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-title">Calibrazione e test</div>
              <div class="timeline-date">30–45 minuti / aula</div>
              <div class="timeline-desc">Verifica letture e stabilizzazione sensori.</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-title">Formazione rapida</div>
              <div class="timeline-date">45–60 minuti</div>
              <div class="timeline-desc">Uso dashboard e gestione alert.</div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid-2" style="margin-top: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">build</span> Manutenzione & Ricambi</div>
          <ul class="simple-list">
            <li>Ricalibrazione MQ-135: ogni 6–12 mesi.</li>
            <li>Sostituzione sensore MQ-135: 12–24 mesi (stima).</li>
            <li>Controllo cablaggi e fissaggi: 1 volta/anno.</li>
            <li>Budget ricambi: 5–8% del BOM/anno (uso scolastico).</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">receipt_long</span> Costi Operativi (stima)</div>
          <ul class="simple-list">
            <li>Setup iniziale: 2–3 ore per aula, 1 tecnico.</li>
            <li>Formazione: 45–60 minuti per personale.</li>
            <li>Supporto annuale: 1–2 interventi brevi.</li>
          </ul>
          <div class="section-note">Valori indicativi, variabili per numero di aule e configurazione.</div>
        </div>
      </section>

      <section class="grid-2" style="margin-top: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">verified</span> Trasparenza e Strumenti</div>
          <ul class="simple-list">
            <li>Frontend prototipo: Vite, TypeScript, Three.js, Chart.js.</li>
            <li>Rendering dati: simulazione real-time con soglie e alert.</li>
            <li>Server dati (proposto): API REST/MQTT, database storico e dashboard web.</li>
            <li>Firmware: Arduino IDE / PlatformIO con ESP32-C3.</li>
            <li>Sensore MQ-135: misura qualità aria e CO₂ equivalente (non NDIR).</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">public</span> Mobilità e Compatibilità</div>
          <ul class="simple-list">
            <li>Accesso via browser su PC, tablet e smartphone.</li>
            <li>Hardware modulare con I2C, analogico e I2S.</li>
            <li>Espansione rapida con nuove centraline e sensori.</li>
            <li>Compatibile con aggiornamenti futuri via WiFi.</li>
          </ul>
        </div>
      </section>
    </div>
  `;

  const airLabels = ['08:00', '08:20', '08:40', '09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00'];
  const airValues = [450, 520, 640, 780, 980, 1180, 1320, 1100, 860, 600];

  createLineChart({
    canvasId: 'chart-air',
    labels: airLabels,
    datasets: [{
      label: 'CO₂ equivalente (ppm)',
      data: airValues,
      color: 'hsl(210, 45%, 45%)',
      threshold: 1000,
    }],
    yLabel: 'ppm',
    yMin: 350,
    yMax: 1600,
  });

  createBarChart(
    'chart-energy',
    ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
    [[160, 520, 780, 620, 320, 190]],
    ['Consumo medio (W)'],
    ['hsl(206, 45%, 45%)']
  );

  createDoughnutChart(
    'chart-costs',
    ['Controller', 'Sensori', 'Display', 'Audio', 'Passivi/PCB'],
    [1.65, 5.59, 3.53, 1.29, 8.2],
    ['hsl(210,45%,45%)', 'hsl(38,70%,50%)', 'hsl(200,55%,55%)', 'hsl(0,60%,55%)', 'hsl(210,10%,60%)']
  );
}

