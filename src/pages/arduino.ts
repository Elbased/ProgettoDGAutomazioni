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
          <div class="card-title"><span class="material-symbols-rounded icon-sm">receipt_long</span> BOM Arduino (stima)</div>
          <div class="table-container">
            <table>
              <thead><tr><th>Componente</th><th>Prezzo</th></tr></thead>
              <tbody>
                ${ARDUINO_BOM.map(item => `
                  <tr><td>${item.name}</td><td class="price">€${item.price.toFixed(2).replace('.', ',')}</td></tr>
                `).join('')}
                <tr style="border-top:2px solid var(--accent);">
                  <td><strong>TOTALE</strong></td>
                  <td class="price" style="font-size:1.1rem;"><strong>€${arduinoTotal.toFixed(2).replace('.', ',')}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="section-note">Valore indicativo con componenti equivalenti.</div>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">receipt_long</span> BOM ESP32-C3</div>
          <div class="table-container">
            <table>
              <thead><tr><th>Componente</th><th>Prezzo</th></tr></thead>
              <tbody>
                ${ESP32_BOM.map(item => `
                  <tr><td>${item.name}</td><td class="price">€${item.price.toFixed(2).replace('.', ',')}</td></tr>
                `).join('')}
                <tr style="border-top:2px solid var(--accent);">
                  <td><strong>TOTALE</strong></td>
                  <td class="price" style="font-size:1.1rem;"><strong>€${esp32Total.toFixed(2).replace('.', ',')}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="section-note">BOM completo con componenti online.</div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: var(--sp-lg);">
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">factory</span> BOM Produzione Arduino (senza prototipo)</div>
          <div class="table-container">
            <table>
              <thead><tr><th>Componente</th><th>Prezzo</th></tr></thead>
              <tbody>
                ${arduinoProd.map(item => `
                  <tr><td>${item.name}</td><td class="price">€${item.price.toFixed(2).replace('.', ',')}</td></tr>
                `).join('')}
                <tr style="border-top:2px solid var(--accent);">
                  <td><strong>TOTALE</strong></td>
                  <td class="price" style="font-size:1.1rem;"><strong>€${arduinoProdTotal.toFixed(2).replace('.', ',')}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="section-note">In produzione, breadboard e jumper vengono sostituiti da PCB.</div>
        </div>
        <div class="card">
          <div class="card-title"><span class="material-symbols-rounded icon-sm">factory</span> BOM Produzione ESP32-C3 (ottimizzata)</div>
          <div class="table-container">
            <table>
              <thead><tr><th>Componente</th><th>Prezzo</th></tr></thead>
              <tbody>
                ${esp32Prod.map(item => `
                  <tr><td>${item.name}</td><td class="price">€${item.price.toFixed(2).replace('.', ',')}</td></tr>
                `).join('')}
                <tr style="border-top:2px solid var(--accent);">
                  <td><strong>TOTALE</strong></td>
                  <td class="price" style="font-size:1.1rem;"><strong>€${esp32ProdTotal.toFixed(2).replace('.', ',')}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="section-note">BOM più efficiente, solo componenti necessari.</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="material-symbols-rounded icon-sm">code</span> Firmware ESP32-C3 (NTP + soglie)</div>
        <pre class="code-block code-pre"><span class="macro">#include</span> <span class="string">&lt;WiFi.h&gt;</span>
<span class="macro">#include</span> <span class="string">&lt;NTPClient.h&gt;</span>
<span class="macro">#include</span> <span class="string">&lt;WiFiUdp.h&gt;</span>
<span class="macro">#include</span> <span class="string">&lt;U8g2lib.h&gt;</span>

<span class="comment">// --- CONFIGURAZIONE ---</span>
<span class="keyword">const</span> <span class="type">char</span>* SSID = <span class="string">&quot;NOME_WIFI&quot;</span>;
<span class="keyword">const</span> <span class="type">char</span>* PASS = <span class="string">&quot;PASSWORD_WIFI&quot;</span>;

<span class="comment">// PINOUT (Ottimizzato per ESP32 DevKit V1)</span>
<span class="macro">#define</span> <span class="constant">PIN_CO2</span>      <span class="number">34</span>  <span class="comment">// Analogico</span>
<span class="macro">#define</span> <span class="constant">PIN_CORRENTE</span> <span class="number">35</span>  <span class="comment">// Analogico</span>
<span class="macro">#define</span> <span class="constant">PIN_LED</span>      <span class="number">13</span>  <span class="comment">// Digitale</span>
<span class="macro">#define</span> <span class="constant">PIN_SPEAKER</span>  <span class="number">18</span>  <span class="comment">// PWM</span>

<span class="comment">// PARAMETRI SOGLIA</span>
<span class="keyword">const</span> <span class="type">int</span> <span class="constant">LIMITE_CO2</span>   = <span class="number">1100</span>;    <span class="comment">// ppm</span>
<span class="keyword">const</span> <span class="type">int</span> <span class="constant">LIMITE_WATT</span>  = <span class="number">150</span>;     <span class="comment">// Watt</span>
<span class="keyword">const</span> <span class="type">int</span> <span class="constant">SEC_OVERLOAD</span> = <span class="number">60</span>;      <span class="comment">// Tempo tolleranza sovraccarico</span>

<span class="comment">// GESTIONE TEMPO</span>
<span class="type">WiFiUDP</span> ntpUDP;
<span class="type">NTPClient</span> timeClient(ntpUDP, <span class="string">&quot;europe.pool.ntp.org&quot;</span>, <span class="number">3600</span>, <span class="number">60000</span>);
<span class="keyword">const</span> <span class="type">int</span> <span class="constant">ORA_APERTURA</span> = <span class="number">8</span>;
<span class="keyword">const</span> <span class="type">int</span> <span class="constant">ORA_CHIUSURA</span> = <span class="number">14</span>;

<span class="comment">// DISPLAY (SH1106 128x64 I2C)</span>
<span class="type">U8G2_SH1106_128X64_NONAME_F_HW_I2C</span> u8g2(U8G2_R0, U8X8_PIN_NONE);

<span class="comment">// VARIABILI DI STATO</span>
<span class="type">unsigned long</span> timerInvio = <span class="number">0</span>;
<span class="type">unsigned long</span> inizioSogliaWatt = <span class="number">0</span>;
<span class="type">bool</span> allarmeAttivo = <span class="constant">false</span>;

<span class="type">void</span> <span class="function">setup</span>() {
  Serial.<span class="function">begin</span>(<span class="number">115200</span>);
  u8g2.<span class="function">begin</span>();
  <span class="function">pinMode</span>(<span class="constant">PIN_LED</span>, OUTPUT);
  <span class="function">pinMode</span>(<span class="constant">PIN_SPEAKER</span>, OUTPUT);

  <span class="function">connettiWiFi</span>();
  timeClient.<span class="function">begin</span>();
}

<span class="type">void</span> <span class="function">loop</span>() {
  timeClient.<span class="function">update</span>();
  <span class="type">int</span> oraAttuale = timeClient.<span class="function">getHours</span>();

  <span class="comment">// CONTROLLO ORARIO SCOLASTICO</span>
  <span class="keyword">if</span> (oraAttuale &gt;= <span class="constant">ORA_APERTURA</span> &amp;&amp; oraAttuale &lt; <span class="constant">ORA_CHIUSURA</span>) {
    <span class="function">cicloLavoro</span>();
  } <span class="keyword">else</span> {
    <span class="function">gestisciRiposo</span>();
  }
}

<span class="comment">// --- LOGICA PRINCIPALE ---</span>
<span class="type">void</span> <span class="function">cicloLavoro</span>() {
  <span class="comment">// Lettura e normalizzazione (es. media di 10 campionamenti)</span>
  <span class="type">int</span> co2 = <span class="function">analogRead</span>(<span class="constant">PIN_CO2</span>);
  <span class="type">float</span> watt = <span class="function">leggiConsumo</span>();

  <span class="type">bool</span> alertCO2 = (co2 &gt; <span class="constant">LIMITE_CO2</span>);
  <span class="type">bool</span> alertWatt = <span class="function">falsoAllarmeWatt</span>(watt);

  <span class="comment">// GESTIONE OUTPUT</span>
  <span class="keyword">if</span> (alertCO2 || alertWatt) {
    <span class="function">attivaSicurezza</span>(alertCO2, alertWatt, co2, watt);
  } <span class="keyword">else</span> {
    <span class="function">disattivaSicurezza</span>();
    <span class="function">aggiornaDisplay</span>(<span class="string">&quot;SISTEMA OK&quot;</span>, co2, watt);
  }

  <span class="comment">// INVIO DATI (Ogni 10 secondi)</span>
  <span class="keyword">if</span> (millis() - timerInvio &gt; <span class="number">10000</span>) {
    Serial.<span class="function">printf</span>(<span class="string">&quot;LOG: CO2 %d ppm - Consumo %.1f W\\n&quot;</span>, co2, watt);
    <span class="comment">// Qui andrà la chiamata HTTP verso Abdel</span>
    timerInvio = <span class="function">millis</span>();
  }
}

<span class="comment">// --- FUNZIONI DI SUPPORTO ---</span>
<span class="type">float</span> <span class="function">leggiConsumo</span>() {
  <span class="comment">// Simulazione calcolo da analogico a Watt</span>
  <span class="keyword">return</span> (<span class="function">analogRead</span>(<span class="constant">PIN_CORRENTE</span>) * (<span class="number">3.3</span> / <span class="number">4095.0</span>)) * <span class="number">100</span>;
}

<span class="type">bool</span> <span class="function">falsoAllarmeWatt</span>(<span class="type">float</span> attuale) {
  <span class="keyword">if</span> (attuale &gt; <span class="constant">LIMITE_WATT</span>) {
    <span class="keyword">if</span> (inizioSogliaWatt == <span class="number">0</span>) inizioSogliaWatt = <span class="function">millis</span>();
    <span class="keyword">if</span> ((<span class="function">millis</span>() - inizioSogliaWatt) / <span class="number">1000</span> &gt; <span class="constant">SEC_OVERLOAD</span>) <span class="keyword">return</span> <span class="constant">true</span>;
  } <span class="keyword">else</span> {
    inizioSogliaWatt = <span class="number">0</span>;
  }
  <span class="keyword">return</span> <span class="constant">false</span>;
}

<span class="type">void</span> <span class="function">attivaSicurezza</span>(<span class="type">bool</span> co2Critica, <span class="type">bool</span> wattCritico, <span class="type">int</span> v1, <span class="type">float</span> v2) {
  <span class="function">digitalWrite</span>(<span class="constant">PIN_LED</span>, HIGH);
  u8g2.<span class="function">clearBuffer</span>();
  u8g2.<span class="function">setFont</span>(u8g2_font_haxrcorp408_tr);

  <span class="keyword">if</span> (co2Critica) {
    u8g2.<span class="function">drawStr</span>(<span class="number">0</span>, <span class="number">20</span>, <span class="string">&quot;!!! CO2 ALTA !!!&quot;</span>);
    u8g2.<span class="function">drawStr</span>(<span class="number">0</span>, <span class="number">40</span>, <span class="string">&quot;APRIRE FINESTRE&quot;</span>);
    <span class="function">tone</span>(<span class="constant">PIN_SPEAKER</span>, <span class="number">1200</span>); <span class="comment">// Suono acuto fisso</span>
  } <span class="keyword">else if</span> (wattCritico) {
    u8g2.<span class="function">drawStr</span>(<span class="number">0</span>, <span class="number">20</span>, <span class="string">&quot;!!! OVERLOAD !!!&quot;</span>);
    u8g2.<span class="function">drawStr</span>(<span class="number">0</span>, <span class="number">40</span>, <span class="string">&quot;STACCARE CARICHI&quot;</span>);
    <span class="function">tone</span>(<span class="constant">PIN_SPEAKER</span>, <span class="number">800</span>, <span class="number">500</span>); <span class="comment">// Beep intermittente</span>
  }

  u8g2.<span class="function">sendBuffer</span>();
}

<span class="type">void</span> <span class="function">disattivaSicurezza</span>() {
  <span class="function">digitalWrite</span>(<span class="constant">PIN_LED</span>, LOW);
  <span class="function">noTone</span>(<span class="constant">PIN_SPEAKER</span>);
}

<span class="type">void</span> <span class="function">aggiornaDisplay</span>(<span class="keyword">const</span> <span class="type">char</span>* stato, <span class="type">int</span> c, <span class="type">float</span> w) {
  u8g2.<span class="function">clearBuffer</span>();
  u8g2.<span class="function">setFont</span>(u8g2_font_6x10_tf);
  u8g2.<span class="function">drawStr</span>(<span class="number">0</span>, <span class="number">10</span>, <span class="string">&quot;ZEPHYRUS MONITOR&quot;</span>);
  u8g2.<span class="function">drawLine</span>(<span class="number">0</span>, <span class="number">12</span>, <span class="number">128</span>, <span class="number">12</span>);
  u8g2.<span class="function">setCursor</span>(<span class="number">0</span>, <span class="number">30</span>);
  u8g2.<span class="function">printf</span>(<span class="string">&quot;Stato: %s&quot;</span>, stato);
  u8g2.<span class="function">setCursor</span>(<span class="number">0</span>, <span class="number">45</span>);
  u8g2.<span class="function">printf</span>(<span class="string">&quot;CO2: %d ppm&quot;</span>, c);
  u8g2.<span class="function">setCursor</span>(<span class="number">0</span>, <span class="number">60</span>);
  u8g2.<span class="function">printf</span>(<span class="string">&quot;PWR: %.1f W&quot;</span>, w);
  u8g2.<span class="function">sendBuffer</span>();
}

<span class="type">void</span> <span class="function">gestisciRiposo</span>() {
  <span class="function">disattivaSicurezza</span>();
  u8g2.<span class="function">clearBuffer</span>();
  u8g2.<span class="function">setFont</span>(u8g2_font_6x12_tf);
  u8g2.<span class="function">drawStr</span>(<span class="number">20</span>, <span class="number">35</span>, <span class="string">&quot;SLEEP - FUORI ORARIO&quot;</span>);
  u8g2.<span class="function">sendBuffer</span>();

  <span class="comment">// Opzionale: spegne il modulo WiFi per risparmiare</span>
  WiFi.<span class="function">disconnect</span>();
  <span class="function">delay</span>(<span class="number">60000</span>); <span class="comment">// Controlla l'ora ogni minuto</span>
}

<span class="type">void</span> <span class="function">connettiWiFi</span>() {
  WiFi.<span class="function">begin</span>(SSID, PASS);
  <span class="type">int</span> tentativi = <span class="number">0</span>;
  <span class="keyword">while</span> (WiFi.<span class="function">status</span>() != WL_CONNECTED &amp;&amp; tentativi &lt; <span class="number">20</span>) {
    <span class="function">delay</span>(<span class="number">500</span>);
    tentativi++;
  }
}</pre>
      </div>
    </div>
  `;
}
