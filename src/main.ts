// ===== ZephyrusTech — Main Entry Point =====
import './style.css';
import { renderPresentation } from './pages/presentation';
import { renderRoom3D, destroyRoom3D } from './pages/room3d';
import { renderComponents } from './pages/components';
import { renderSchematic } from './pages/schematic';
import { renderArduino } from './pages/arduino';

type Page = 'presentation' | 'simulation' | 'components' | 'schematic' | 'arduino';

interface NavItem {
  id: Page;
  label: string;
  icon: string; // Material Symbols name
}

const NAV_ITEMS: NavItem[] = [
  { id: 'presentation', label: 'Presentazione', icon: 'campaign' },
  { id: 'simulation', label: 'Simulazione', icon: 'view_in_ar' },
  { id: 'components', label: 'Componenti', icon: 'memory' },
  { id: 'schematic', label: 'Schema', icon: 'electrical_services' },
  { id: 'arduino', label: 'Arduino vs Custom', icon: 'compare' },
];

let currentPage: Page = 'presentation';

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
    case 'schematic':
      renderSchematic(content);
      break;
    case 'arduino':
      renderArduino(content);
      break;
  }
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
