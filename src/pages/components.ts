// ===== Components Page (Compact) =====

interface ComponentData {
  name: string;
  model: string;
  image: string;
  role: string;
}

const COMPONENTS: ComponentData[] = [
  { name: 'ESP32-C3', model: 'Microcontrollore', image: imagePath('esp32-c3.avif'), role: 'Coordina i sensori e invia i dati.' },
  { name: 'MQ-135', model: 'Qualita aria', image: imagePath('Sensore-gas-MQ-135.avif'), role: 'Misura la qualita dell\u2019aria in aula.' },
  { name: 'SCT-013', model: 'Consumo elettrico', image: imagePath('Sensore di-corrente- SCT-013-000.avif'), role: 'Rileva il consumo senza interventi invasivi.' },
  { name: 'Display OLED', model: 'Stato immediato', image: imagePath('Display.avif'), role: 'Mostra stato e avvisi principali.' },
  { name: 'Allarme audio', model: 'Avvisi rapidi', image: imagePath('MAX98357.avif'), role: 'Notifica con suoni quando serve.' },
  { name: 'Componenti passivi', model: 'Supporto', image: imagePath('Resistenza da 33 ohm.avif'), role: 'Stabilizza e protegge il circuito.' },
];

export function renderComponents(container: HTMLElement): void {
  container.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1><span class="material-symbols-rounded">memory</span> Componenti del Sistema</h1>
        <p class="subtitle">Panoramica semplice dei moduli principali che rendono ZephyrusTech operativo.</p>
      </div>

      <div class="component-grid" id="component-grid">
        ${COMPONENTS.map((c) => renderComponentCard(c)).join('')}
      </div>

      <div class="card compact-card">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">checklist</span> In sintesi</div>
        <ul class="simple-list">
          <li>Il kit copre aria, consumi, stato e avvisi.</li>
          <li>Componenti modulari e facilmente sostituibili.</li>
          <li>Installazione rapida senza interventi invasivi.</li>
        </ul>
      </div>
    </div>
  `;
}

function renderComponentCard(comp: ComponentData): string {
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
        </div>
        <p class="comp-desc">${comp.role}</p>
      </div>
    </div>
  `;
}

function imagePath(fileName: string): string {
  return `/componenti/${encodeURIComponent(fileName)}`;
}
