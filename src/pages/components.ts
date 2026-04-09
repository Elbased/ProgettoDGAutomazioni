export interface ComponentData {
  name: string;
  model: string;
  image: string;
  role: string;
}

export const COMPONENTS: ComponentData[] = [
  { name: 'ESP32-C3', model: 'Microcontrollore', image: imagePath('esp32-c3.avif'), role: 'Coordina i sensori e invia i dati.' },
  { name: 'MQ-135', model: 'Qualita aria', image: imagePath('Sensore-gas-MQ-135.avif'), role: 'Misura la qualita dell’aria in aula.' },
  { name: 'SCT-013', model: 'Consumo elettrico', image: imagePath('Sensore di-corrente- SCT-013-000.avif'), role: 'Rileva il consumo senza interventi invasivi.' },
  { name: 'Display OLED', model: 'Stato immediato', image: imagePath('Display.avif'), role: 'Mostra stato e avvisi principali.' },
  { name: 'Allarme audio', model: 'Avvisi rapidi', image: imagePath('MAX98357.avif'), role: 'Notifica con suoni quando serve.' },
  { name: 'Componenti passivi', model: 'Supporto', image: imagePath('Resistenza da 33 ohm.avif'), role: 'Stabilizza e protegge il circuito.' },
];

function imagePath(fileName: string): string {
  return `/componenti/${encodeURIComponent(fileName)}`;
}
