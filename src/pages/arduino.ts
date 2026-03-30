// ===== Arduino vs Custom Page =====

interface CostItem {
  name: string;
  price: number;
}

const ESP32_BOM: CostItem[] = [
  { name: 'ESP32-C3 Super Mini', price: 1.65 },
  { name: 'Breadboard 830 pin', price: 3.47 },
  { name: 'Display OLED 1.3" (SH1106)', price: 3.53 },
  { name: 'Sensore gas MQ-135', price: 2.5 },
  { name: 'Sensore corrente SCT-013-000', price: 3.09 },
  { name: 'MAX98357 I2S Audio Amplifier', price: 1.29 },
  { name: 'Cavi jumper', price: 2.29 },
  { name: 'Resistenza 33 Ω', price: 1.4 },
  { name: 'Resistenze 10 kΩ (x2)', price: 1.86 },
  { name: 'Resistenza 1 kΩ', price: 1.86 },
  { name: 'Condensatore elettrolitico 10 µF', price: 1.47 },
  { name: 'Transistor NPN', price: 0.73 },
  { name: 'Diodo 1N4148', price: 3.28 },
];

const ARDUINO_BOM: CostItem[] = [
  { name: 'Arduino Uno R3', price: 24.0 },
  { name: 'Breadboard 830 pin', price: 3.47 },
  { name: 'Display OLED 1.3" (SH1106)', price: 3.53 },
  { name: 'Sensore gas MQ-135', price: 2.5 },
  { name: 'Sensore corrente SCT-013-000', price: 3.09 },
  { name: 'MAX98357 (opzionale)', price: 1.29 },
  { name: 'Cavi jumper', price: 2.29 },
  { name: 'Resistenza 33 Ω', price: 1.4 },
  { name: 'Resistenze 10 kΩ (x2)', price: 1.86 },
  { name: 'Resistenza 1 kΩ', price: 1.86 },
  { name: 'Condensatore elettrolitico 10 µF', price: 1.47 },
  { name: 'Transistor NPN', price: 0.73 },
  { name: 'Diodo 1N4148', price: 3.28 },
];

const PRODUCTION_EXCLUDE = ['Breadboard 830 pin', 'Cavi jumper'];

export function renderArduino(container: HTMLElement): void {
  const esp32Total = ESP32_BOM.reduce((acc, i) => acc + i.price, 0);
  const arduinoTotal = ARDUINO_BOM.reduce((acc, i) => acc + i.price, 0);
  const esp32Prod = ESP32_BOM.filter(i => !PRODUCTION_EXCLUDE.includes(i.name));
  const arduinoProd = ARDUINO_BOM.filter(i => !PRODUCTION_EXCLUDE.includes(i.name));
  const esp32ProdTotal = esp32Prod.reduce((acc, i) => acc + i.price, 0);
  const arduinoProdTotal = arduinoProd.reduce((acc, i) => acc + i.price, 0);
  const savingsProto = arduinoTotal - esp32Total;
  const savingsProd = arduinoProdTotal - esp32ProdTotal;

  container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1><span class="material-symbols-rounded">compare</span> Arduino vs ESP32-C3</h1>
        <p class="subtitle">Confronto tra prototipo didattico Arduino e soluzione custom efficiente con ESP32-C3.</p>
      </div>

      <div class="compare-grid" style="margin-bottom: var(--sp-xl);">
        <div class="card compare-card">
          <div class="compare-header">
            <div style="font-size:2.5rem; margin-bottom:8px;"><span class="material-symbols-rounded" style="font-size:2.5rem; color:var(--info);">developer_board</span></div>
            <h3>Arduino Uno R3</h3>
            <div class="compare-price">€${arduinoTotal.toFixed(2).replace('.', ',')} <small>/ centralina (stima)</small></div>
          </div>
          <ul class="pro-con-list">
            <li>Ideale per didattica e prototipazione rapida</li>
            <li>Setup semplice e documentazione accessibile</li>
            <li>Compatibile con molte librerie legacy</li>
            <li class="con">Nessuna connettività wireless nativa</li>
            <li class="con">Prestazioni limitate (CPU e RAM)</li>
            <li class="con">Scalabilità ridotta senza moduli extra</li>
          </ul>
        </div>

        <div class="card compare-card recommended">
          <div class="compare-header">
            <div style="font-size:2.5rem; margin-bottom:8px;"><span class="material-symbols-rounded" style="font-size:2.5rem; color:var(--accent);">memory</span></div>
            <h3>ESP32-C3 Custom</h3>
            <div class="compare-price">€${esp32Total.toFixed(2).replace('.', ',')} <small>/ centralina</small></div>
          </div>
          <ul class="pro-con-list">
            <li>WiFi + BLE integrati</li>
            <li>Dashboard web e dati centralizzati</li>
            <li>Prestazioni superiori per analisi realtime</li>
            <li>Costo più basso con BOM ottimizzata</li>
            <li>OTA updates e gestione remota</li>
            <li class="con">Configurazione iniziale più tecnica</li>
            <li class="con">Richiede definizione pin e profili</li>
          </ul>
        </div>
      </div>

      <div class="card" style="margin-bottom: var(--sp-lg);">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">analytics</span> Confronto Tecnico</div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Caratteristica</th>
                <th>Arduino Uno</th>
                <th>ESP32-C3</th>
                <th>Vincitore</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Processore</strong></td><td>ATmega328P 16MHz</td><td>RISC-V 160MHz</td><td><span class="badge badge-green">ESP32</span></td></tr>
              <tr><td><strong>RAM</strong></td><td>2 KB</td><td>~400 KB</td><td><span class="badge badge-green">ESP32</span></td></tr>
              <tr><td><strong>Flash</strong></td><td>32 KB</td><td>4 MB</td><td><span class="badge badge-green">ESP32</span></td></tr>
              <tr><td><strong>WiFi</strong></td><td>—</td><td>Integrato</td><td><span class="badge badge-green">ESP32</span></td></tr>
              <tr><td><strong>Bluetooth</strong></td><td>—</td><td>BLE</td><td><span class="badge badge-green">ESP32</span></td></tr>
              <tr><td><strong>GPIO</strong></td><td>14D + 6A</td><td>Configurabili</td><td><span class="badge badge-green">ESP32</span></td></tr>
              <tr><td><strong>ADC</strong></td><td>10 bit</td><td>12 bit</td><td><span class="badge badge-green">ESP32</span></td></tr>
              <tr><td><strong>Consumo</strong></td><td>Più basso</td><td>Variabile (WiFi)</td><td><span class="badge badge-blue">Arduino</span></td></tr>
              <tr><td><strong>Scalabilità</strong></td><td>Limitata</td><td>Alta</td><td><span class="badge badge-green">ESP32</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">receipt_long</span> Costi Arduino (stima)</div>
          <div class="spec-row"><span class="spec-key">Prototipo</span><span class="spec-val">€${arduinoTotal.toFixed(2).replace('.', ',')}</span></div>
          <div class="spec-row"><span class="spec-key">Produzione</span><span class="spec-val">€${arduinoProdTotal.toFixed(2).replace('.', ',')}</span></div>
          <div class="section-note">Valori indicativi con componenti equivalenti.</div>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">receipt_long</span> Costi ESP32-C3 (stima)</div>
          <div class="spec-row"><span class="spec-key">Prototipo</span><span class="spec-val">€${esp32Total.toFixed(2).replace('.', ',')}</span></div>
          <div class="spec-row"><span class="spec-key">Produzione</span><span class="spec-val">€${esp32ProdTotal.toFixed(2).replace('.', ',')}</span></div>
          <div class="section-note">BOM ottimizzata per efficienza.</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">trending_down</span> Risparmio stimato</div>
        <div class="spec-row"><span class="spec-key">Risparmio prototipo</span><span class="spec-val">€${savingsProto.toFixed(2).replace('.', ',')}</span></div>
        <div class="spec-row"><span class="spec-key">Risparmio produzione</span><span class="spec-val">€${savingsProd.toFixed(2).replace('.', ',')}</span></div>
        <div class="section-note">ESP32-C3 riduce costi e migliora scalabilita.</div>
      </div>
    </div>
  `;
}
