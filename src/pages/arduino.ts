export interface CostItem {
  name: string;
  price: number;
}

export const ESP32_BOM: CostItem[] = [
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

export const ARDUINO_BOM: CostItem[] = [
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

export const PRODUCTION_EXCLUDE = ['Breadboard 830 pin', 'Cavi jumper'];
