// ===== SVG Gauge Component =====

export interface GaugeConfig {
  min: number;
  max: number;
  value: number;
  threshold: number;
  unit: string;
  label: string;
  colorOk: string;
  colorWarning: string;
  colorDanger: string;
}

export function createGaugeSVG(config: GaugeConfig): string {
  const { min, max, value, threshold, unit, label, colorOk, colorWarning, colorDanger } = config;
  const clampedValue = Math.min(max, Math.max(min, value));
  const ratio = (clampedValue - min) / (max - min);
  const thresholdRatio = (threshold - min) / (max - min);

  // Arc geometry
  const cx = 100, cy = 100, r = 80;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  const valueAngle = startAngle + ratio * totalAngle;
  const thresholdAngle = startAngle + thresholdRatio * totalAngle;

  function polarToCartesian(angle: number): { x: number; y: number } {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(start: number, end: number): string {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = (end - start) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  // Determine color
  let color = colorOk;
  const warningThreshold = threshold * 0.8;
  if (clampedValue >= threshold) {
    color = colorDanger;
  } else if (clampedValue >= warningThreshold) {
    color = colorWarning;
  }

  // Threshold marker
  const thresholdPos = polarToCartesian(thresholdAngle);
  const innerR = r - 12;
  const thresholdRad = (thresholdAngle - 90) * Math.PI / 180;
  const thresholdInner = {
    x: cx + innerR * Math.cos(thresholdRad),
    y: cy + innerR * Math.sin(thresholdRad),
  };

  const displayValue = Math.round(clampedValue);

  return `
    <svg viewBox="0 0 200 200" class="gauge-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Background track -->
      <path d="${describeArc(startAngle, endAngle)}"
            fill="none" stroke="hsl(220, 20%, 18%)" stroke-width="14"
            stroke-linecap="round"/>
      
      <!-- Value arc -->
      <path d="${describeArc(startAngle, Math.max(startAngle + 1, valueAngle))}"
            fill="none" stroke="${color}" stroke-width="14"
            stroke-linecap="round"
            style="filter: drop-shadow(0 0 6px ${color}40); transition: all 0.3s ease;"/>
      
      <!-- Threshold marker -->
      <line x1="${thresholdPos.x}" y1="${thresholdPos.y}"
            x2="${thresholdInner.x}" y2="${thresholdInner.y}"
            stroke="hsl(0, 0%, 50%)" stroke-width="2" stroke-linecap="round"
            opacity="0.6"/>
      
      <!-- Value text -->
      <text x="${cx}" y="${cy - 5}" text-anchor="middle"
            font-family="Manrope, sans-serif" font-weight="800"
            font-size="32" fill="${color}"
            style="transition: fill 0.3s ease;">
        ${displayValue}
      </text>
      
      <!-- Unit -->
      <text x="${cx}" y="${cy + 18}" text-anchor="middle"
            font-family="Manrope, sans-serif" font-weight="500"
            font-size="13" fill="hsl(215, 20%, 55%)">
        ${unit}
      </text>
      
      <!-- Label -->
      <text x="${cx}" y="${cy + 50}" text-anchor="middle"
            font-family="Manrope, sans-serif" font-weight="600"
            font-size="11" fill="hsl(215, 15%, 40%)"
            text-transform="uppercase" letter-spacing="1">
        ${label}
      </text>
      
      <!-- Min/Max labels -->
      <text x="32" y="170" text-anchor="middle"
            font-family="Manrope, sans-serif" font-size="9"
            fill="hsl(215, 15%, 35%)">${min}</text>
      <text x="168" y="170" text-anchor="middle"
            font-family="Manrope, sans-serif" font-size="9"
            fill="hsl(215, 15%, 35%)">${max}</text>
    </svg>
  `;
}
