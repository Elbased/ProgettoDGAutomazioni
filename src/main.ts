// ===== ZephyrusTech — Main Entry Point =====
import './style.css';
import { renderPresentation } from './pages/presentation';
import { renderRoom3D, destroyRoom3D } from './pages/room3d';
import { renderComponents } from './pages/components';
import { renderArduino } from './pages/arduino';

type Page = 'presentation' | 'simulation' | 'components' | 'arduino';

interface NavItem {
  id: Page;
  label: string;
  icon: string; // Material Symbols name
}

const NAV_ITEMS: NavItem[] = [
  { id: 'presentation', label: 'Presentazione', icon: 'campaign' },
  { id: 'simulation', label: 'Simulazione', icon: 'view_in_ar' },
  { id: 'components', label: 'Componenti', icon: 'memory' },
  { id: 'arduino', label: 'Arduino vs Custom', icon: 'compare' },
];

let currentPage: Page = 'presentation';
let warpRaf = 0;
let warpReady = false;

function updateWarpEffect(): void {
  warpRaf = 0;
  const items = document.querySelectorAll<HTMLElement>('.warp-item');
  if (items.length === 0) return;
  const vh = window.innerHeight || 800;
  const center = vh / 2;

  items.forEach(el => {
    const rect = el.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const dist = Math.abs(itemCenter - center);
    const norm = Math.min(1, dist / (vh * 0.8));
    const scale = 1 - norm * 0.08;
    const offset = (itemCenter > center ? 1 : -1) * norm * 8;
    const opacity = 1 - norm * 0.35;
    el.style.setProperty('--warp-scale', scale.toFixed(3));
    el.style.setProperty('--warp-y', `${offset.toFixed(2)}px`);
    el.style.setProperty('--warp-opacity', opacity.toFixed(3));
  });
}

function requestWarpEffect(): void {
  if (warpRaf) return;
  warpRaf = window.requestAnimationFrame(updateWarpEffect);
}

function ensureWarpEffect(): void {
  if (warpReady) return;
  warpReady = true;
  window.addEventListener('scroll', requestWarpEffect, { passive: true });
  window.addEventListener('resize', requestWarpEffect);
}

function createApp(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <nav class="nav">
      <a href="#" class="nav-brand" id="nav-brand">
        <div class="nav-logo">
          <img src="/Logo.png" alt="ZephyrusTech logo">
        </div>
        <span class="nav-title">ZephyrusTech</span>
      </a>
      <ul class="nav-links" id="nav-links">
        ${NAV_ITEMS.map(item => `
          <li>
            <a href="#${item.id}" class="nav-link ${item.id === currentPage ? 'active' : ''}" data-page="${item.id}" id="nav-${item.id}">
              <span class="material-symbols-rounded icon-sm">${item.icon}</span>
              <span class="label">${item.label}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
    <main class="main-content" id="main-content"></main>
  `;

  // Bind navigation
  const navLinks = document.getElementById('nav-links');
  navLinks?.addEventListener('click', (e) => {
    e.preventDefault();
    const link = (e.target as HTMLElement).closest('.nav-link') as HTMLElement;
    if (!link) return;
    const page = link.dataset.page as Page;
    if (page) navigateTo(page);
  });

  // Brand click = back to presentation
  document.getElementById('nav-brand')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('presentation');
  });

  // Handle hash navigation
  const hash = window.location.hash.slice(1) as Page;
  if (hash && NAV_ITEMS.some(n => n.id === hash)) {
    currentPage = hash;
  }

  renderCurrentPage();
  ensureWarpEffect();
}

function navigateTo(page: Page): void {
  if (page === currentPage) return;

  // Cleanup current page
  if (currentPage === 'simulation') {
    destroyRoom3D();
  }

  currentPage = page;
  window.location.hash = page;

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', (link as HTMLElement).dataset.page === page);
  });

  renderCurrentPage();
}

function renderCurrentPage(): void {
  const content = document.getElementById('main-content');
  if (!content) return;

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (currentPage) {
    case 'presentation':
      renderPresentation(content);
      break;
    case 'simulation':
      renderRoom3D(content);
      break;
    case 'components':
      renderComponents(content);
      break;
    case 'arduino':
      renderArduino(content);
      break;
  }

  requestWarpEffect();
}

// Handle browser back/forward
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1) as Page;
  if (hash && NAV_ITEMS.some(n => n.id === hash) && hash !== currentPage) {
    if (currentPage === 'simulation') destroyRoom3D();
    currentPage = hash;
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', (link as HTMLElement).dataset.page === hash);
    });
    renderCurrentPage();
  }
});

// Initialize
createApp();
