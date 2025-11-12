import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  template: `
    <button class="toggle-btn" [class.menu-open]="!isCollapsed()" (click)="toggleSidebar()">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Backdrop para cerrar sidebar en móvil -->
    @if (!isCollapsed()) {
      <div class="backdrop" (click)="closeSidebar()"></div>
    }

    <aside class="sidebar" [class.collapsed]="isCollapsed()">


      <nav class="nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
            <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="nav-text">Dashboard</span>
        </a>

        <a routerLink="/pods" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
          <span class="nav-text">Pods</span>
        </a>

        <a routerLink="/deployments" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span class="nav-text">Deployments</span>
        </a>

        <a routerLink="/services" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="5" cy="19" r="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="19" cy="19" r="2" stroke="currentColor" stroke-width="2"/>
            <path d="M12 7V12M12 12L5 17M12 12L19 17" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="nav-text">Services</span>
        </a>

        <a routerLink="/ingresses" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="nav-text">Ingresses</span>
        </a>

        <a routerLink="/configmaps" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="nav-text">ConfigMaps</span>
        </a>

        <a routerLink="/secrets" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M12 15V17M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="nav-text">Secrets</span>
        </a>

        <a routerLink="/storage" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="5" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="2" y="11" width="20" height="5" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="2" y="18" width="20" height="2" rx="1" fill="currentColor"/>
            <circle cx="6" cy="6.5" r="1" fill="currentColor"/>
            <circle cx="6" cy="13.5" r="1" fill="currentColor"/>
          </svg>
          <span class="nav-text">Storage</span>
        </a>

        <a routerLink="/namespaces" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M3 9H21M9 3V21" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="nav-text">Namespaces</span>
        </a>

        <a routerLink="/nodes" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
            <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M10 7H14M10 17H14M7 10V14M17 10V14" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="nav-text">Nodes</span>
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .toggle-btn {
      display: none;
      position: fixed;
      width: 48px;
      height: 48px;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .toggle-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .toggle-btn svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .backdrop {
      display: none;
    }

    .nav {
      margin-top: 5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0 1rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      text-decoration: none;
      color: #4a5568;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }

    .nav-item:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      color: #667eea;
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
      color: #667eea;
      font-weight: 600;
    }

    .nav-item.active::before {
      transform: scaleY(1);
    }

    .nav-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      stroke-width: 2;
    }

    .nav-text {
      white-space: nowrap;
      transition: opacity 0.3s ease;
    }

    .sidebar.collapsed .nav-text {
      opacity: 0;
      width: 0;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      gap: 0;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        z-index: 1000;
        transform: translateX(-100%);
        width: 280px;
      }

      .sidebar:not(.collapsed) {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        transform: translateX(-100%);
        width: 280px;
      }

      .toggle-btn {
        display: flex;
        left: 1rem;
        top: 5.5rem;
        z-index: 1001;
      }

      .toggle-btn.menu-open {
        left: calc(280px + 1rem);
      }

      /* Backdrop cuando sidebar está abierto */
      .sidebar:not(.collapsed)::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: -1;
      }

      .nav {
        margin-top: 2rem;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  isCollapsed = signal(true);

  ngOnInit() {
    // Inicializar el estado del sidebar basado en el tamaño de pantalla
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth <= 768;
    // En móvil, el sidebar inicia collapsed (oculto)
    // En desktop, el sidebar inicia expandido (no collapsed)
    this.isCollapsed.set(isMobile);
  }

  toggleSidebar() {
    this.isCollapsed.update(value => !value);
  }

  closeSidebar() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      this.isCollapsed.set(true);
    }
  }
}
