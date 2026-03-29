// ===== Chart.js Wrapper =====
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Set global defaults for dark theme
Chart.defaults.color = 'hsl(215, 20%, 55%)';
Chart.defaults.borderColor = 'hsla(220, 20%, 25%, 0.3)';
Chart.defaults.font.family = "'Manrope', sans-serif";
Chart.defaults.font.size = 11;

export interface LineChartConfig {
  canvasId: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    threshold?: number;
  }[];
  yLabel?: string;
  yMin?: number;
  yMax?: number;
}

const chartInstances = new Map<string, Chart>();

export function createLineChart(config: LineChartConfig): Chart {
  // Destroy existing chart if any
  const existing = chartInstances.get(config.canvasId);
  if (existing) {
    existing.destroy();
  }

  const canvas = document.getElementById(config.canvasId) as HTMLCanvasElement;
  if (!canvas) {
    throw new Error(`Canvas ${config.canvasId} not found`);
  }

  const datasets = config.datasets.map(ds => {
    const result: any = {
      label: ds.label,
      data: [...ds.data],
      borderColor: ds.color,
      backgroundColor: ds.color + '15',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: ds.color,
    };
    return result;
  });

  // Add threshold lines
  config.datasets.forEach(ds => {
    if (ds.threshold !== undefined) {
      datasets.push({
        label: `Soglia ${ds.label}`,
        data: new Array(config.labels.length).fill(ds.threshold),
        borderColor: 'hsl(0, 80%, 60%)',
        borderWidth: 1.5,
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      });
    }
  });

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [...config.labels],
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300,
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 15,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: 'hsl(220, 20%, 14%)',
          titleColor: 'hsl(210, 40%, 96%)',
          bodyColor: 'hsl(215, 20%, 65%)',
          borderColor: 'hsla(220, 20%, 30%, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 10,
            font: { size: 10 },
          },
        },
        y: {
          min: config.yMin,
          max: config.yMax,
          grid: {
            color: 'hsla(220, 20%, 25%, 0.2)',
          },
          title: config.yLabel ? {
            display: true,
            text: config.yLabel,
            font: { size: 11, weight: '500' as any },
          } : undefined,
          ticks: {
            font: { size: 10 },
          },
        },
      },
    },
  });

  chartInstances.set(config.canvasId, chart);
  return chart;
}

export function updateLineChart(canvasId: string, labels: string[], datasets: { data: number[]; threshold?: number }[]): void {
  const chart = chartInstances.get(canvasId);
  if (!chart) return;

  chart.data.labels = [...labels];
  
  let dsIdx = 0;
  datasets.forEach(ds => {
    if (chart.data.datasets[dsIdx]) {
      chart.data.datasets[dsIdx].data = [...ds.data];
    }
    dsIdx++;
    // Update threshold line
    if (ds.threshold !== undefined && chart.data.datasets[dsIdx]) {
      chart.data.datasets[dsIdx].data = new Array(labels.length).fill(ds.threshold);
      dsIdx++;
    }
  });

  chart.update('none');
}

export function createBarChart(canvasId: string, labels: string[], data: number[][], seriesLabels: string[], colors: string[]): Chart {
  const existing = chartInstances.get(canvasId);
  if (existing) existing.destroy();

  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) throw new Error(`Canvas ${canvasId} not found`);

  const datasets = data.map((d, i) => ({
    label: seriesLabels[i],
    data: d,
    backgroundColor: colors[i] + '80',
    borderColor: colors[i],
    borderWidth: 1,
    borderRadius: 6,
  }));

  const chart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, pointStyle: 'circle', padding: 15 },
        },
        tooltip: {
          backgroundColor: 'hsl(220, 20%, 14%)',
          titleColor: 'hsl(210, 40%, 96%)',
          bodyColor: 'hsl(215, 20%, 65%)',
          borderColor: 'hsla(220, 20%, 30%, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'hsla(220, 20%, 25%, 0.2)' }, beginAtZero: true },
      },
    },
  });

  chartInstances.set(canvasId, chart);
  return chart;
}

export function createDoughnutChart(canvasId: string, labels: string[], data: number[], colors: string[]): Chart {
  const existing = chartInstances.get(canvasId);
  if (existing) existing.destroy();

  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) throw new Error(`Canvas ${canvasId} not found`);

  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map(c => c + '80'),
        borderColor: colors,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: 'hsl(220, 20%, 14%)',
          titleColor: 'hsl(210, 40%, 96%)',
          bodyColor: 'hsl(215, 20%, 65%)',
          borderColor: 'hsla(220, 20%, 30%, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
        },
      },
    },
  });

  chartInstances.set(canvasId, chart);
  return chart;
}
