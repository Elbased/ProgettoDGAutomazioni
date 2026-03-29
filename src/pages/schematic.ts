// ===== Schematic Page - Block Diagram =====

export function renderSchematic(container: HTMLElement): void {
  container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1><span class="material-symbols-rounded">electrical_services</span> Schema Elettrico</h1>
        <p class="subtitle">Schema semplificato del progetto con componenti reali e collegamenti principali.</p>
      </div>

      <div class="card" style="margin-bottom: var(--sp-lg);">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">palette</span> Legenda Colori</div>
        <div style="display:flex; gap: var(--sp-xl); flex-wrap: wrap; font-size: 0.85rem;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:30px; height:4px; background:#ef4444; border-radius:2px;"></div>
            <span style="color:var(--text-secondary);">5V / VCC</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:30px; height:4px; background:#1f2937; border-radius:2px;"></div>
            <span style="color:var(--text-secondary);">GND</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:30px; height:4px; background:#4aa3c7; border-radius:2px;"></div>
            <span style="color:var(--text-secondary);">Segnale Dati</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:30px; height:4px; background:#3b82f6; border-radius:2px;"></div>
            <span style="color:var(--text-secondary);">I2C</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:30px; height:4px; background:#f59e0b; border-radius:2px;"></div>
            <span style="color:var(--text-secondary);">Analogico</span>
          </div>
        </div>
      </div>

      <div class="card schematic-card" style="margin-bottom: var(--sp-lg); position: relative;">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">architecture</span> Schema — Prototipo Arduino</div>
        <div class="schematic-stage">
          <div class="schematic-scroll">
            ${renderArduinoSchematicSVG()}
          </div>
        </div>
        <div id="schematic-tooltip" class="schematic-tooltip" style="display:none;"></div>
      </div>

      <div class="card schematic-card" style="margin-bottom: var(--sp-lg); position: relative;">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">architecture</span> Schema — ESP32-C3 (Custom)</div>
        <div class="schematic-stage">
          <div class="schematic-scroll">
            ${renderESP32SchematicSVG()}
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: var(--sp-lg);">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">image</span> Schemi Elettrici Reali</div>
        <div class="schematic-gallery">
          <figure class="schematic-figure">
            <img class="schematic-image" src="/schemi/schema_elettrico.png" alt="Schema elettrico sintetico ESP32-C3" loading="lazy">
            <figcaption class="figure-caption">Schema elettrico sintetico (ESP32-C3 + sensori).</figcaption>
          </figure>
          <figure class="schematic-figure">
            <img class="schematic-image" src="/schemi/schema_elettricoIntegrale.png" alt="Schema elettrico integrale ESP32-C3" loading="lazy">
            <figcaption class="figure-caption">Schema elettrico integrale con cablaggio completo.</figcaption>
          </figure>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">pin_drop</span> Mappa Pin — Arduino Uno</div>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Pin Arduino</th><th>Collegamento</th><th>Tipo</th></tr>
              </thead>
              <tbody>
                <tr><td>A0</td><td>MQ-135 (qualità aria)</td><td style="color:var(--warning);">Analogico</td></tr>
                <tr><td>A1</td><td>SCT-013 (corrente)</td><td style="color:var(--warning);">Analogico</td></tr>
                <tr><td>A4 (SDA)</td><td>OLED SH1106 SDA</td><td style="color:var(--info);">I2C</td></tr>
                <tr><td>A5 (SCL)</td><td>OLED SH1106 SCL</td><td style="color:var(--info);">I2C</td></tr>
                <tr><td>D5</td><td>LED Verde</td><td style="color:var(--accent);">Digitale</td></tr>
                <tr><td>D6</td><td>LED Giallo</td><td style="color:var(--accent);">Digitale</td></tr>
                <tr><td>D7</td><td>LED Rosso</td><td style="color:var(--accent);">Digitale</td></tr>
                <tr><td>D8</td><td>Buzzer / uscita audio</td><td style="color:var(--accent);">Digitale</td></tr>
                <tr><td>5V</td><td>VCC sensori + display</td><td style="color:var(--danger);">Alimentazione</td></tr>
                <tr><td>GND</td><td>GND comune</td><td>Massa</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">pin_drop</span> Mappa Pin — ESP32-C3</div>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Pin ESP32-C3</th><th>Collegamento</th><th>Tipo</th></tr>
              </thead>
              <tbody>
                <tr><td>GPIO0 (ADC)</td><td>MQ-135 (qualità aria)</td><td style="color:var(--warning);">Analogico</td></tr>
                <tr><td>GPIO1 (ADC)</td><td>SCT-013 (corrente)</td><td style="color:var(--warning);">Analogico</td></tr>
                <tr><td>GPIO4 (SDA)</td><td>OLED SH1106 SDA</td><td style="color:var(--info);">I2C</td></tr>
                <tr><td>GPIO5 (SCL)</td><td>OLED SH1106 SCL</td><td style="color:var(--info);">I2C</td></tr>
                <tr><td>GPIO6/7/8</td><td>MAX98357 (I2S)</td><td style="color:var(--accent);">Digitale</td></tr>
                <tr><td>GPIO9</td><td>LED/Buzzer (opz.)</td><td style="color:var(--accent);">Digitale</td></tr>
                <tr><td>3.3V</td><td>VCC sensori + display</td><td style="color:var(--danger);">Alimentazione</td></tr>
                <tr><td>GND</td><td>GND comune</td><td>Massa</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  setupTooltips();
}

function renderArduinoSchematicSVG(): string {
  return `
  <svg viewBox="0 0 900 480" class="schematic-svg" xmlns="http://www.w3.org/2000/svg" style="font-family: Manrope, sans-serif;">
    <defs>
      <pattern id="grid-arduino" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsla(210,20%,70%,0.15)" stroke-width="0.6"/>
      </pattern>
    </defs>
    <rect width="900" height="480" fill="transparent" rx="12"/>
    <rect width="900" height="480" fill="url(#grid-arduino)" opacity="0.4" rx="12"/>

    <g class="component" data-tooltip="Arduino Uno R3|ATmega328P 16MHz|Prototipo didattico|Costo indicativo €24,00">
      <rect x="360" y="160" width="180" height="160" rx="10" fill="hsl(220,20%,14%)" stroke="hsl(210,40%,50%)" stroke-width="2"/>
      <rect x="360" y="160" width="180" height="30" rx="10" fill="hsl(210,40%,50%)" fill-opacity="0.15"/>
      <text x="450" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="hsl(210,40%,70%)">ARDUINO UNO</text>
      <text x="450" y="205" text-anchor="middle" font-size="9" fill="hsl(215,20%,55%)">ATmega328P</text>
    </g>

    <g class="component" data-tooltip="MQ-135|Sensore qualità aria|Uscita analogica|€2,50">
      <rect x="60" y="140" width="160" height="70" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(38,92%,55%)" stroke-width="1.5"/>
      <text x="140" y="170" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(38,92%,70%)">MQ-135</text>
      <text x="140" y="190" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">Qualità aria</text>
    </g>

    <g class="component" data-tooltip="SCT-013-000|Sensore di corrente|Non invasivo|€3,09">
      <rect x="60" y="245" width="160" height="70" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(205,55%,55%)" stroke-width="1.5"/>
      <text x="140" y="275" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(205,55%,70%)">SCT-013</text>
      <text x="140" y="295" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">Corrente</text>
    </g>

    <g class="component" data-tooltip="OLED SH1106|128x64 I2C|Display stato|€3,53">
      <rect x="60" y="350" width="160" height="70" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(210,80%,60%)" stroke-width="1.5"/>
      <text x="140" y="380" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(210,80%,70%)">OLED 1.3"</text>
      <text x="140" y="400" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">I2C SH1106</text>
    </g>

    <g class="component" data-tooltip="Buzzer/LED|Allarme locale|Digitale">
      <rect x="660" y="200" width="170" height="90" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(0,70%,55%)" stroke-width="1.5"/>
      <text x="745" y="230" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(0,70%,70%)">Output locali</text>
      <text x="745" y="252" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">LED + buzzer</text>
    </g>

    <g class="component" data-tooltip="Alimentazione 5V|USB-C/USB|Stabilizzata">
      <rect x="370" y="60" width="160" height="55" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(0,70%,55%)" stroke-width="1.5"/>
      <text x="450" y="85" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(0,70%,70%)">5V USB</text>
      <text x="450" y="102" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">Alimentazione</text>
    </g>

    <line x1="220" y1="170" x2="360" y2="210" stroke="#f59e0b" stroke-width="1.6"/>
    <text x="270" y="185" font-size="8" fill="#f59e0b">A0</text>

    <line x1="220" y1="280" x2="360" y2="230" stroke="#f59e0b" stroke-width="1.6"/>
    <text x="270" y="260" font-size="8" fill="#f59e0b">A1</text>

    <line x1="220" y1="385" x2="360" y2="250" stroke="#3b82f6" stroke-width="1.6"/>
    <text x="265" y="335" font-size="8" fill="#3b82f6">I2C</text>

    <line x1="540" y1="240" x2="660" y2="240" stroke="#4aa3c7" stroke-width="1.6"/>
    <text x="595" y="230" font-size="8" fill="#4aa3c7">D5–D8</text>

    <line x1="450" y1="115" x2="450" y2="160" stroke="#ef4444" stroke-width="2"/>
    <text x="458" y="140" font-size="8" fill="#ef4444">5V</text>

    <text x="450" y="460" text-anchor="middle" font-size="11" fill="hsl(215,15%,40%)" font-style="italic">Schema semplificato — Prototipo Arduino Uno</text>
  </svg>`;
}

function renderESP32SchematicSVG(): string {
  return `
  <svg viewBox="0 0 900 480" class="schematic-svg" xmlns="http://www.w3.org/2000/svg" style="font-family: Manrope, sans-serif;">
    <defs>
      <pattern id="grid-esp" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsla(210,20%,70%,0.15)" stroke-width="0.6"/>
      </pattern>
    </defs>
    <rect width="900" height="480" fill="transparent" rx="12"/>
    <rect width="900" height="480" fill="url(#grid-esp)" opacity="0.4" rx="12"/>

    <g class="component" data-tooltip="ESP32-C3 Super Mini|RISC-V 160MHz|WiFi + BLE|€1,65">
      <rect x="360" y="150" width="180" height="180" rx="10" fill="hsl(220,20%,14%)" stroke="hsl(205,55%,55%)" stroke-width="2"/>
      <rect x="360" y="150" width="180" height="30" rx="10" fill="hsl(205,55%,55%)" fill-opacity="0.15"/>
      <text x="450" y="170" text-anchor="middle" font-size="13" font-weight="700" fill="hsl(205,55%,70%)">ESP32-C3</text>
      <text x="450" y="195" text-anchor="middle" font-size="9" fill="hsl(215,20%,55%)">WiFi + BLE</text>
    </g>

    <g class="component" data-tooltip="MQ-135|Sensore qualità aria|Uscita analogica|€2,50">
      <rect x="60" y="140" width="160" height="70" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(38,92%,55%)" stroke-width="1.5"/>
      <text x="140" y="170" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(38,92%,70%)">MQ-135</text>
      <text x="140" y="190" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">Qualità aria</text>
    </g>

    <g class="component" data-tooltip="SCT-013-000|Sensore di corrente|Non invasivo|€3,09">
      <rect x="60" y="245" width="160" height="70" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(205,55%,55%)" stroke-width="1.5"/>
      <text x="140" y="275" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(205,55%,70%)">SCT-013</text>
      <text x="140" y="295" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">Corrente</text>
    </g>

    <g class="component" data-tooltip="OLED SH1106|128x64 I2C|Display stato|€3,53">
      <rect x="60" y="350" width="160" height="70" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(210,80%,60%)" stroke-width="1.5"/>
      <text x="140" y="380" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(210,80%,70%)">OLED 1.3"</text>
      <text x="140" y="400" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">I2C SH1106</text>
    </g>

    <g class="component" data-tooltip="MAX98357|Amplificatore audio I2S|Allarme sonoro|€1,29">
      <rect x="660" y="200" width="170" height="90" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(0,70%,55%)" stroke-width="1.5"/>
      <text x="745" y="230" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(0,70%,70%)">Audio</text>
      <text x="745" y="252" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">MAX98357 I2S</text>
    </g>

    <g class="component" data-tooltip="Server centrale|Validazione dati|Dashboard web">
      <rect x="660" y="330" width="170" height="70" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(205,45%,40%)" stroke-width="1.5" stroke-dasharray="4"/>
      <text x="745" y="360" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(205,55%,70%)">Server dati</text>
      <text x="745" y="380" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">API + Dashboard</text>
    </g>

    <g class="component" data-tooltip="Alimentazione 5V|USB-C|Regolatore 3.3V interno">
      <rect x="370" y="60" width="160" height="55" rx="8" fill="hsl(220,20%,14%)" stroke="hsl(0,70%,55%)" stroke-width="1.5"/>
      <text x="450" y="85" text-anchor="middle" font-size="11" font-weight="600" fill="hsl(0,70%,70%)">5V USB-C</text>
      <text x="450" y="102" text-anchor="middle" font-size="8" fill="hsl(215,20%,55%)">? 3.3V</text>
    </g>

    <line x1="220" y1="170" x2="360" y2="205" stroke="#f59e0b" stroke-width="1.6"/>
    <text x="270" y="185" font-size="8" fill="#f59e0b">ADC</text>

    <line x1="220" y1="280" x2="360" y2="225" stroke="#f59e0b" stroke-width="1.6"/>
    <text x="270" y="260" font-size="8" fill="#f59e0b">ADC</text>

    <line x1="220" y1="385" x2="360" y2="245" stroke="#3b82f6" stroke-width="1.6"/>
    <text x="265" y="335" font-size="8" fill="#3b82f6">I2C</text>

    <line x1="540" y1="245" x2="660" y2="245" stroke="#4aa3c7" stroke-width="1.6"/>
    <text x="595" y="235" font-size="8" fill="#4aa3c7">I2S</text>

    <path d="M 540 310 Q 600 325 660 350" stroke="hsl(205,45%,40%)" stroke-width="1.6" fill="none" stroke-dasharray="5"/>
    <text x="600" y="335" font-size="8" fill="hsl(205,45%,45%)" text-anchor="middle">WiFi</text>

    <line x1="450" y1="115" x2="450" y2="150" stroke="#ef4444" stroke-width="2"/>
    <text x="458" y="140" font-size="8" fill="#ef4444">5V</text>

    <text x="450" y="460" text-anchor="middle" font-size="11" fill="hsl(215,15%,40%)" font-style="italic">Schema semplificato — ESP32-C3 con server centrale</text>
  </svg>`;
}

function setupTooltips(): void {
  const tooltip = document.getElementById('schematic-tooltip');
  if (!tooltip) return;

  document.querySelectorAll('.component[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const data = (el as HTMLElement).dataset.tooltip || '';
      const parts = data.split('|');
      tooltip.innerHTML = `
        <div style="font-weight:700; margin-bottom:4px; color:var(--accent);">${parts[0]}</div>
        ${parts.slice(1).map(p => `<div style="color:var(--text-secondary); font-size:0.78rem;">${p}</div>`).join('')}
      `;
      tooltip.style.display = 'block';
      const rect = (el as HTMLElement).getBoundingClientRect();
      const parentRect = tooltip.parentElement!.getBoundingClientRect();
      tooltip.style.left = `${rect.right - parentRect.left + 10}px`;
      tooltip.style.top = `${rect.top - parentRect.top}px`;
    });

    el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });
}

