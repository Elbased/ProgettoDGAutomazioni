// ===== Components Page =====
// Foto reali dei componenti (una per componente) + costi e approvvigionamento

interface ComponentData {
  name: string;
  model: string;
  price: number;
  bulkPrice: number;
  description: string;
  image: string;
  interface: string;
  efficiency: string;
  maintenance: string;
  maintenanceCost: string;
  lifetime: string;
  spares: string;
  availability: string;
}

interface CostItem {
  name: string;
  price?: number;
  note?: string;
  link?: string;
}

const BULK_DISCOUNT = 0.88;
const PER_CLASS_ESTIMATE = 16.37;

const BASE_COSTS: CostItem[] = [
  { name: 'ESP32-C3 Super Mini', price: 2.63 },
  { name: 'Breadboard', price: 2.0 },
  { name: 'Display', price: 2.3 },
  { name: 'Sensore gas MQ-135', price: 2.0 },
  { name: 'Altoparlante 3W', price: 2.0 },
  { name: 'Sensore corrente', price: 3.0 },
  { name: 'Resistenze varie', price: 1.0 },
];

const ONLINE_COSTS: CostItem[] = [
  { name: 'ESP32-C3 Super Mini', price: 1.65, link: 'https://it.aliexpress.com/item/1005007723970275.html' },
  { name: 'Breadboard 830 pin', price: 3.47, link: 'https://it.aliexpress.com/item/1005007113555303.html' },
  { name: 'Display OLED 1.3" (SH1106, I2C)', price: 3.53, link: 'https://it.aliexpress.com/item/1005007551771400.html' },
  { name: 'Sensore gas MQ-135', price: 2.5, link: 'https://it.aliexpress.com/item/1005009467470672.html' },
  { name: 'Sensore di corrente SCT-013-000', price: 3.09, link: 'https://it.aliexpress.com/item/1005006080045813.html' },
  { name: 'MAX98357 I2S Audio Amplifier', price: 1.29, link: 'https://it.aliexpress.com/item/1005008978691693.html' },
  { name: 'Cavi jumper', price: 2.29, link: 'https://it.aliexpress.com/item/1005008194967488.html' },
  { name: 'Resistenza 33 Ω', price: 1.4, link: 'https://it.aliexpress.com/item/1005007982822787.html' },
  { name: 'Resistenze 10 kΩ (x2)', price: 1.86, link: 'https://it.aliexpress.com/item/1005007010335100.html' },
  { name: 'Resistenza 1 kΩ', price: 1.86, link: 'https://it.aliexpress.com/item/1005007010335100.html' },
  { name: 'Condensatore elettrolitico 10 µF', price: 1.47, link: 'https://it.aliexpress.com/item/1005007623472633.html' },
  { name: 'Transistor NPN (2N2222/BC547)', price: 0.73, link: 'https://it.aliexpress.com/item/1005005248260051.html' },
  { name: 'Diodo (1N4148)', price: 3.28, link: 'https://it.aliexpress.com/item/1005006374599568.html' },
];

const COMPONENTS: ComponentData[] = [
  {
    name: 'ESP32-C3 Super Mini',
    model: 'RISC-V 160 MHz · WiFi/BLE',
    price: 1.65,
    bulkPrice: calcBulk(1.65),
    description: 'Microcontrollore compatto per raccolta dati, filtraggio e invio al server centrale.',
    image: imagePath('esp32-c3.avif'),
    interface: 'WiFi/BLE · UART/I2C',
    efficiency: 'Alta (low-power)',
    maintenance: 'Nessuna manutenzione',
    maintenanceCost: '€0/anno',
    lifetime: '5+ anni',
    spares: 'Modulo sostituibile',
    availability: 'Alta',
  },
  {
    name: 'Breadboard 830 pin',
    model: 'Prototipazione rapida',
    price: 3.47,
    bulkPrice: calcBulk(3.47),
    description: 'Base di prototipazione per test e validazione rapida (non usata in produzione).',
    image: imagePath('Breadboard-830-pin.avif'),
    interface: 'Prototipazione',
    efficiency: '—',
    maintenance: 'Sostituire se usurata',
    maintenanceCost: '€1–3/anno (solo prototipo)',
    lifetime: '1–2 anni',
    spares: 'Sostituibile',
    availability: 'Alta',
  },
  {
    name: 'Display OLED 1.3"',
    model: 'SH1106 · 128×64 · I2C',
    price: 3.53,
    bulkPrice: calcBulk(3.53),
    description: 'Display compatto per visualizzare stato, alert e valori principali.',
    image: imagePath('Display.avif'),
    interface: 'I2C',
    efficiency: 'Alta (basso consumo)',
    maintenance: 'Solo in caso di guasto',
    maintenanceCost: '€0–3/anno (raro)',
    lifetime: '3–5 anni',
    spares: 'Modulo sostituibile',
    availability: 'Alta',
  },
  {
    name: 'Sensore gas MQ-135',
    model: 'Qualità aria · analogico',
    price: 2.5,
    bulkPrice: calcBulk(2.5),
    description: 'Sensore per qualità aria con uscita analogica (CO₂ equivalente), richiede calibrazione.',
    image: imagePath('Sensore-gas-MQ-135.avif'),
    interface: 'Analogico',
    efficiency: 'Media (riscaldamento interno)',
    maintenance: 'Calibrazione ogni 6–12 mesi',
    maintenanceCost: '€2–3/anno',
    lifetime: '12–24 mesi',
    spares: 'Modulo sensore',
    availability: 'Alta',
  },
  {
    name: 'Sensore di corrente SCT-013-000',
    model: 'Pinza non invasiva',
    price: 3.09,
    bulkPrice: calcBulk(3.09),
    description: 'Misurazione corrente senza taglio del cavo, ideale per retrofit.',
    image: imagePath('Sensore di-corrente- SCT-013-000.avif'),
    interface: 'Analogico',
    efficiency: 'Alta',
    maintenance: 'Minimo (controllo cablaggi)',
    maintenanceCost: '€0–1/anno',
    lifetime: '5+ anni',
    spares: 'Pinza sostituibile',
    availability: 'Alta',
  },
  {
    name: 'MAX98357 Audio Amplifier',
    model: 'Class-D · I2S',
    price: 1.29,
    bulkPrice: calcBulk(1.29),
    description: 'Amplificatore compatto per notifiche sonore e allarmi in aula.',
    image: imagePath('MAX98357.avif'),
    interface: 'I2S',
    efficiency: 'Alta',
    maintenance: 'Nessuna manutenzione',
    maintenanceCost: '€0/anno',
    lifetime: '5+ anni',
    spares: 'Modulo sostituibile',
    availability: 'Media',
  },
  {
    name: 'Cavi jumper',
    model: 'Kit M-M assortiti',
    price: 2.29,
    bulkPrice: calcBulk(2.29),
    description: 'Cablaggio rapido in fase di prototipo e collaudo.',
    image: imagePath('cavi jumper.avif'),
    interface: 'Connessioni',
    efficiency: '—',
    maintenance: 'Sostituzione se usura',
    maintenanceCost: '€1–2/anno (solo prototipo)',
    lifetime: '1–2 anni',
    spares: 'Kit ricambi',
    availability: 'Alta',
  },
  {
    name: 'Resistenza 33 Ω',
    model: 'Passivo',
    price: 1.4,
    bulkPrice: calcBulk(1.4),
    description: 'Limitazione corrente e protezione circuiti.',
    image: imagePath('Resistenza da 33 ohm.avif'),
    interface: 'Passivo',
    efficiency: '—',
    maintenance: 'Nessuna manutenzione',
    maintenanceCost: '€0/anno',
    lifetime: '10+ anni',
    spares: 'Standard',
    availability: 'Alta',
  },
  {
    name: 'Resistenze 10 kΩ',
    model: 'Passivo (x2)',
    price: 1.86,
    bulkPrice: calcBulk(1.86),
    description: 'Partitori di tensione e pull-up per sensori.',
    image: imagePath('Resistenze da 10 kohm.avif'),
    interface: 'Passivo',
    efficiency: '—',
    maintenance: 'Nessuna manutenzione',
    maintenanceCost: '€0/anno',
    lifetime: '10+ anni',
    spares: 'Standard',
    availability: 'Alta',
  },
  {
    name: 'Resistenza 1 kΩ',
    model: 'Passivo',
    price: 1.86,
    bulkPrice: calcBulk(1.86),
    description: 'Limitazione e protezione segnale.',
    image: imagePath('Resistenza da 1 kohm.avif'),
    interface: 'Passivo',
    efficiency: '—',
    maintenance: 'Nessuna manutenzione',
    maintenanceCost: '€0/anno',
    lifetime: '10+ anni',
    spares: 'Standard',
    availability: 'Alta',
  },
  {
    name: 'Condensatore 10 µF',
    model: 'Elettrolitico',
    price: 1.47,
    bulkPrice: calcBulk(1.47),
    description: 'Stabilizzazione linea di alimentazione.',
    image: imagePath('Condensatore elettrolitico da 10 uF.avif'),
    interface: 'Passivo',
    efficiency: '—',
    maintenance: 'Nessuna manutenzione',
    maintenanceCost: '€0/anno',
    lifetime: '5–10 anni',
    spares: 'Standard',
    availability: 'Alta',
  },
  {
    name: 'Transistor NPN',
    model: '2N2222 / BC547',
    price: 0.73,
    bulkPrice: calcBulk(0.73),
    description: 'Pilotaggio carichi e buzzer con isolamento.',
    image: imagePath('Transistor NPN.avif'),
    interface: 'Passivo',
    efficiency: '—',
    maintenance: 'Nessuna manutenzione',
    maintenanceCost: '€0/anno',
    lifetime: '10+ anni',
    spares: 'Standard',
    availability: 'Alta',
  },
  {
    name: 'Diodo 1N4148',
    model: 'Protezione',
    price: 3.28,
    bulkPrice: calcBulk(3.28),
    description: 'Protezione da sovratensioni e picchi di ritorno.',
    image: imagePath('Diodo.avif'),
    interface: 'Passivo',
    efficiency: '—',
    maintenance: 'Nessuna manutenzione',
    maintenanceCost: '€0/anno',
    lifetime: '10+ anni',
    spares: 'Standard',
    availability: 'Alta',
  },
];

export function renderComponents(container: HTMLElement): void {
  const baseTotal = BASE_COSTS.reduce((acc, item) => acc + (item.price ?? 0), 0);
  const onlineTotal = ONLINE_COSTS.reduce((acc, item) => acc + (item.price ?? 0), 0);

  container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1><span class="material-symbols-rounded">memory</span> Componenti del Sistema</h1>
        <p class="subtitle">Catalogo componenti con foto reali, specifiche essenziali e dati di approvvigionamento.</p>
      </div>

      <div class="component-grid" id="component-grid">
        ${COMPONENTS.map((c) => renderComponentCard(c)).join('')}
      </div>

      <div class="page-header" style="margin-top: var(--sp-2xl);">
        <h2 class="section-title">Costi e Approvvigionamento</h2>
        <p class="subtitle">Confronto tra kit essenziale e BOM completo con fornitori online.</p>
      </div>

      <div class="grid-2" style="margin-bottom: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">receipt_long</span> Kit essenziale (base)</div>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Componente</th><th>Prezzo</th></tr>
              </thead>
              <tbody>
                ${BASE_COSTS.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="price">${formatEuro(item.price)}</td>
                  </tr>
                `).join('')}
                <tr style="border-top:2px solid var(--accent);">
                  <td><strong>Totale</strong></td>
                  <td class="price"><strong>${formatEuro(baseTotal)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="section-note">Kit per prototipazione rapida e validazione iniziale.</div>
        </div>

        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">link</span> BOM completo (fornitori online)</div>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Componente</th><th>Prezzo</th><th>Fonte</th></tr>
              </thead>
              <tbody>
                ${ONLINE_COSTS.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="price">${item.price ? formatEuro(item.price) : '—'}</td>
                    <td>${item.link ? `<a href="${item.link}" target="_blank" rel="noreferrer">link</a>` : (item.note ?? '')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="section-note">Prezzi indicativi: spedizione e fluttuazioni non incluse.</div>
        </div>
      </div>

      <div class="card summary-card" style="margin-bottom: var(--sp-lg);">
        <div class="summary-grid">
          <div>
            <div class="summary-label">Totale BOM online</div>
            <div class="summary-value">${formatEuro(onlineTotal)}</div>
          </div>
          <div>
            <div class="summary-label">Prezzo per classe (stima)</div>
            <div class="summary-value">€${PER_CLASS_ESTIMATE.toFixed(2).replace('.', ',')}</div>
          </div>
          <div>
            <div class="summary-label">Note</div>
            <div class="summary-value">Valori indicativi</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: var(--sp-lg);">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">checklist</span> Matrice Componenti</div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Componente</th>
                <th>Prezzo singolo</th>
                <th>Prezzo bulk (10+)</th>
                <th>Ricambi</th>
                <th>Efficienza</th>
                <th>Mantenimento</th>
                <th>Costo manut. annuo</th>
                <th>Vita utile</th>
                <th>Disponibilità</th>
              </tr>
            </thead>
            <tbody>
              ${COMPONENTS.map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td class="price">${formatEuro(c.price)}</td>
                  <td>${formatEuro(c.bulkPrice)} <span class="text-muted">(stima)</span></td>
                  <td>${c.spares}</td>
                  <td>${c.efficiency}</td>
                  <td>${c.maintenance}</td>
                  <td>${c.maintenanceCost}</td>
                  <td>${c.lifetime}</td>
                  <td>${c.availability}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="section-note">Prezzo bulk: stima con sconto ~12% su lotto 10+. Manutenzione indicativa su uso scolastico.</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">build</span> Manutenzione & Ricambi (stima)</div>
        <ul class="simple-list">
          <li>Sensore MQ-135: ricalibrazione ogni 6–12 mesi, sostituzione 12–24 mesi.</li>
          <li>Controllo cablaggi e fissaggi: 1 volta/anno.</li>
          <li>Budget ricambi tipico: 5–8% del BOM/anno (dipende dall’uso).</li>
          <li>In produzione: PCB sostituisce breadboard e jumper, riducendo guasti.</li>
        </ul>
      </div>
    </div>
  `;
}

function renderComponentCard(comp: ComponentData): string {
  const specs = [
    { key: 'Interfaccia', value: comp.interface },
    { key: 'Prezzo bulk (10+)', value: `${formatEuro(comp.bulkPrice)} (stima)` },
    { key: 'Efficienza', value: comp.efficiency },
    { key: 'Mantenimento', value: comp.maintenance },
    { key: 'Costo manut. annuo', value: comp.maintenanceCost },
    { key: 'Vita utile', value: comp.lifetime },
    { key: 'Ricambi', value: comp.spares },
    { key: 'Disponibilità', value: comp.availability },
  ];

  return `
    <div class="component-card">
      <div class="comp-visual">
        <div class="comp-photo">
          <img src="${comp.image}" alt="${comp.name}" loading="lazy">
        </div>
      </div>
      <div class="comp-info">
        <div class="comp-header">
          <div>
            <h3 class="comp-name">${comp.name}</h3>
            <span class="comp-model">${comp.model}</span>
          </div>
          <span class="comp-price">${formatEuro(comp.price)}</span>
        </div>
        <p class="comp-desc">${comp.description}</p>
        <div class="comp-specs">
          ${specs.map(s => `
            <div class="spec-row">
              <span class="spec-key">${s.key}</span>
              <span class="spec-val">${s.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function formatEuro(value?: number): string {
  if (value === undefined) return '—';
  return `€${value.toFixed(2).replace('.', ',')}`;
}

function calcBulk(value: number): number {
  return Math.round(value * BULK_DISCOUNT * 100) / 100;
}

function imagePath(fileName: string): string {
  return `/componenti/${encodeURIComponent(fileName)}`;
}

