import { ARDUINO_BOM, ESP32_BOM, PRODUCTION_EXCLUDE } from './arduino';

function formatEuro(value: number): string {
  return `EUR ${value.toFixed(2).replace('.', ',')}`;
}

function renderTechRow(label: string, arduino: string, esp32: string, winner: string): string {
  return `
    <div class="spec-compare-row">
      <span class="spec-key">${label}</span>
      <span class="spec-val">${arduino}</span>
      <span class="spec-val">${esp32}</span>
      <span class="badge ${winner === 'ESP32' ? 'badge-green' : 'badge-blue'}">${winner}</span>
    </div>
  `;
}

export function renderPresentation(container: HTMLElement): void {
  const esp32Total = ESP32_BOM.reduce((acc, item) => acc + item.price, 0);
  const arduinoTotal = ARDUINO_BOM.reduce((acc, item) => acc + item.price, 0);
  const esp32ProdTotal = ESP32_BOM
    .filter(item => !PRODUCTION_EXCLUDE.includes(item.name))
    .reduce((acc, item) => acc + item.price, 0);
  const arduinoProdTotal = ARDUINO_BOM
    .filter(item => !PRODUCTION_EXCLUDE.includes(item.name))
    .reduce((acc, item) => acc + item.price, 0);
  const savingsProto = arduinoTotal - esp32Total;
  const savingsProd = arduinoProdTotal - esp32ProdTotal;

  container.innerHTML = `
    <div class="container landing">
      <section class="hero reveal warp-item">
        <div class="hero-content">
          <div class="hero-badge">ZephyrusTech · Benessere e risparmio per le scuole</div>
          <h1 class="hero-title">Aria piu sana e consumi sotto controllo, in un'unica piattaforma.</h1>
          <p class="hero-subtitle">
            Un prodotto semplice da usare che aiuta scuole e docenti a capire subito
            se l'aula e in equilibrio e perche la soluzione custom e piu sostenibile.
          </p>
          <div class="hero-actions">
            <a class="btn primary" href="#simulation">Avvia demo live</a>
            <a class="btn ghost" href="#technical-compare">Scelta hardware</a>
          </div>
          <div class="hero-proof">
            <div class="proof-item"><span class="proof-label">Aggiornamento</span><span class="proof-value">Ogni pochi secondi</span></div>
            <div class="proof-item"><span class="proof-label">Installazione</span><span class="proof-value">Rapida</span></div>
            <div class="proof-item"><span class="proof-label">Kit ESP32</span><span class="proof-value">${formatEuro(esp32Total)}</span></div>
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
              <div class="metric-label">Qualita aria</div>
              <div class="metric-value">Ottima</div>
              <div class="metric-note ok">Stabile</div>
            </div>
            <div class="metric">
              <div class="metric-label">Consumo</div>
              <div class="metric-value">In linea</div>
              <div class="metric-note ok">Stabile</div>
            </div>
            <div class="metric">
              <div class="metric-label">Scelta hardware</div>
              <div class="metric-value">ESP32-C3</div>
              <div class="metric-note muted">Piu compatta</div>
            </div>
          </div>
          <div class="hero-card-footer">
            Una pagina sola per raccontare valore e vantaggio tecnico.
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
          <div class="value-text">Una lettura immediata per capire lo stato dell'aula.</div>
        </div>
        <div class="value-card">
          <div class="value-title">Costi controllati</div>
          <div class="value-text">Una soluzione piu leggera da estendere nel tempo.</div>
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
            <div class="step-item"><span class="step-num">01</span> Rilevazione qualita aria e consumi</div>
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
              <span>Qualita aria</span><strong>In equilibrio</strong>
            </div>
            <div class="panel-row">
              <span>Consumo</span><strong>Sotto controllo</strong>
            </div>
            <div class="panel-row subtle">
              <span>Ultimo intervento</span><strong>-</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="section-split reverse reveal delay-3 warp-item">
        <div class="section-copy">
          <div class="section-label">Valore per la scuola</div>
          <h2 class="section-title">Una piattaforma pronta per crescere.</h2>
          <p class="section-text">
            Accesso da browser, ruoli chiari e possibilita di aggiungere nuove aule nel tempo.
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
              <span>Qualita aria</span><strong>OK</strong>
            </div>
            <div class="panel-row">
              <span>Consumo</span><strong>495 W</strong>
            </div>
            <div class="panel-row">
              <span>Stato sistema</span><strong>Stabile</strong>
            </div>
            <div class="panel-row subtle">
              <span>Ultimo alert</span><strong>-</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="section-compact reveal delay-4 warp-item" id="technical-compare">
        <div class="section-shell">
          <div class="section-head">
            <div class="section-head-copy">
              <div class="section-label">Scelta tecnologica</div>
              <h2 class="section-title">Perche la soluzione custom con ESP32-C3 e piu adatta al progetto.</h2>
              <p class="section-text">
                Il confronto resta qui in forma compatta, con focus su prestazioni, connettivita e sostenibilita del sistema.
              </p>
            </div>
          </div>

          <div class="compare-grid compare-grid-compact">
            <div class="card compare-card">
              <div class="compare-header">
                <div style="font-size:2.5rem; margin-bottom:8px;"><span class="material-symbols-rounded" style="font-size:2.5rem; color:var(--info);">developer_board</span></div>
                <h3>Arduino Uno R3</h3>
                <div class="compare-price">${formatEuro(arduinoTotal)} <small>/ centralina</small></div>
              </div>
              <ul class="pro-con-list">
                <li>Molto adatto alla prototipazione didattica</li>
                <li>Setup semplice e librerie diffuse</li>
                <li class="con">Nessuna connettivita wireless nativa</li>
                <li class="con">Margine ridotto per dashboard e scalabilita</li>
              </ul>
            </div>

            <div class="card compare-card recommended">
              <div class="compare-header">
                <div style="font-size:2.5rem; margin-bottom:8px;"><span class="material-symbols-rounded" style="font-size:2.5rem; color:var(--accent);">memory</span></div>
                <h3>ESP32-C3 Custom</h3>
                <div class="compare-price">${formatEuro(esp32Total)} <small>/ centralina</small></div>
              </div>
              <ul class="pro-con-list">
                <li>WiFi + BLE gia integrati</li>
                <li>Piu margine per dati, OTA e dashboard web</li>
                <li>Costo migliore gia dal prototipo</li>
                <li class="con">Configurazione iniziale un po piu tecnica</li>
              </ul>
            </div>
          </div>

          <div class="grid-2 compact-info-grid">
            <div class="card">
              <div class="card-title"><span class="material-symbols-rounded icon-sm">analytics</span> Confronto tecnico rapido</div>
              <div class="spec-compare-table">
                <div class="spec-compare-head">
                  <span>Caratteristica</span>
                  <span>Arduino</span>
                  <span>ESP32</span>
                  <span>Esito</span>
                </div>
                ${renderTechRow('Processore', 'ATmega328P 16MHz', 'RISC-V 160MHz', 'ESP32')}
                ${renderTechRow('Memoria', '32 KB Flash', '4 MB Flash', 'ESP32')}
                ${renderTechRow('Connettivita', 'Moduli extra', 'WiFi + BLE', 'ESP32')}
                ${renderTechRow('Aggiornabilita', 'Manuale', 'OTA possibile', 'ESP32')}
                ${renderTechRow('Consumo base', 'Piu basso', 'Variabile con WiFi', 'Arduino')}
              </div>
            </div>

            <div class="card">
              <div class="card-title"><span class="material-symbols-rounded icon-sm">payments</span> Impatto economico</div>
              <div class="mini-stat-grid">
                <div class="mini-stat">
                  <span class="mini-stat-label">Risparmio prototipo</span>
                  <strong class="mini-stat-value">${formatEuro(savingsProto)}</strong>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-label">Risparmio produzione</span>
                  <strong class="mini-stat-value">${formatEuro(savingsProd)}</strong>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-label">Produzione Arduino</span>
                  <strong class="mini-stat-value">${formatEuro(arduinoProdTotal)}</strong>
                </div>
                <div class="mini-stat">
                  <span class="mini-stat-label">Produzione ESP32</span>
                  <strong class="mini-stat-value">${formatEuro(esp32ProdTotal)}</strong>
                </div>
              </div>
              <ul class="simple-list compact-list">
                <li>ESP32-C3 migliora scalabilita e centralizzazione senza aumentare la BOM.</li>
                <li>Arduino resta ottimo per demo base, ma meno adatto come piattaforma finale.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="cta reveal delay-5 warp-item">
        <div>
          <h2 class="cta-title">Pronti a portare ZephyrusTech nella vostra scuola?</h2>
          <p class="cta-text">Demo live e confronto tecnico in un'unica esperienza.</p>
        </div>
        <div class="cta-actions">
          <a class="btn primary" href="#simulation">Apri demo</a>
          <a class="btn ghost" href="#technical-compare">Scelta hardware</a>
        </div>
      </section>
    </div>
  `;
}
