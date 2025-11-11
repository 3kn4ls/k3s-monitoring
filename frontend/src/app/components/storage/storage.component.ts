import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { K8sApiService } from '../../services/k8s-api.service';
import { PersistentVolume, PersistentVolumeClaim, StorageClass, Namespace } from '../../models/kubernetes.models';

@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Storage</h2>
        <button (click)="loadAll()" class="btn primary">Refresh All</button>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'pvs'" (click)="activeTab.set('pvs')">
          Persistent Volumes
          <span class="badge badge-light">{{ pvs().length }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'pvcs'" (click)="activeTab.set('pvcs')">
          Volume Claims
          <span class="badge badge-light">{{ pvcs().length }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'sc'" (click)="activeTab.set('sc')">
          Storage Classes
          <span class="badge badge-light">{{ storageClasses().length }}</span>
        </button>
      </div>

      <!-- Namespace selector for PVCs -->
      @if (activeTab() === 'pvcs') {
        <div class="namespace-selector">
          <label class="label">Namespace:</label>
          <select [(ngModel)]="selectedNamespace" (change)="loadPVCs()" class="select">
            @for (ns of namespaces(); track ns.name) {
              <option [value]="ns.name">{{ ns.name }}</option>
            }
          </select>
        </div>
      }

      <!-- Persistent Volumes -->
      @if (activeTab() === 'pvs') {
        <div class="grid">
          @for (pv of pvs(); track pv.name) {
            <div class="card">
              <div class="card-header">
                <h3>{{ pv.name }}</h3>
                <span class="badge" [class.badge-success]="pv.status === 'Bound'" [class.badge-warning]="pv.status === 'Available'">
                  {{ pv.status }}
                </span>
              </div>
              <div class="card-body">
                <div class="detail-row"><span>Capacity:</span><span>{{ pv.capacity }}</span></div>
                <div class="detail-row"><span>Access Modes:</span><span>{{ pv.accessModes }}</span></div>
                <div class="detail-row"><span>Reclaim Policy:</span><span>{{ pv.reclaimPolicy }}</span></div>
                <div class="detail-row"><span>Storage Class:</span><span>{{ pv.storageClass || 'None' }}</span></div>
                <div class="detail-row"><span>Claim:</span><span>{{ pv.claim || 'None' }}</span></div>
                <div class="detail-row"><span>Age:</span><span>{{ pv.age }}</span></div>
              </div>
              <div class="card-actions">
                <button (click)="deletePV(pv)" class="btn small danger" [disabled]="pv.status === 'Bound'">
                  Delete
                </button>
              </div>
            </div>
          }
          @if (pvs().length === 0) {
            <div class="no-data">No Persistent Volumes found</div>
          }
        </div>
      }

      <!-- Persistent Volume Claims -->
      @if (activeTab() === 'pvcs') {
        <div class="grid">
          @for (pvc of pvcs(); track pvc.name) {
            <div class="card">
              <div class="card-header">
                <h3>{{ pvc.name }}</h3>
                <span class="badge" [class.badge-success]="pvc.status === 'Bound'" [class.badge-warning]="pvc.status === 'Pending'">
                  {{ pvc.status }}
                </span>
              </div>
              <div class="card-body">
                <div class="detail-row"><span>Namespace:</span><span>{{ pvc.namespace }}</span></div>
                <div class="detail-row"><span>Volume:</span><span>{{ pvc.volume || 'Pending' }}</span></div>
                <div class="detail-row"><span>Capacity:</span><span>{{ pvc.capacity || 'Pending' }}</span></div>
                <div class="detail-row"><span>Access Modes:</span><span>{{ pvc.accessModes }}</span></div>
                <div class="detail-row"><span>Storage Class:</span><span>{{ pvc.storageClass || 'Default' }}</span></div>
                <div class="detail-row"><span>Age:</span><span>{{ pvc.age }}</span></div>
              </div>
              <div class="card-actions">
                <button (click)="deletePVC(pvc)" class="btn small danger">Delete</button>
              </div>
            </div>
          }
          @if (pvcs().length === 0) {
            <div class="no-data">No Persistent Volume Claims found</div>
          }
        </div>
      }

      <!-- Storage Classes -->
      @if (activeTab() === 'sc') {
        <div class="grid">
          @for (sc of storageClasses(); track sc.name) {
            <div class="card">
              <div class="card-header">
                <h3>{{ sc.name }}</h3>
              </div>
              <div class="card-body">
                <div class="detail-row"><span>Provisioner:</span><span>{{ sc.provisioner }}</span></div>
                <div class="detail-row"><span>Reclaim Policy:</span><span>{{ sc.reclaimPolicy }}</span></div>
                <div class="detail-row"><span>Volume Binding:</span><span>{{ sc.volumeBindingMode }}</span></div>
                <div class="detail-row">
                  <span>Allow Expansion:</span>
                  <span class="badge" [class.badge-success]="sc.allowVolumeExpansion" [class.badge-light]="!sc.allowVolumeExpansion">
                    {{ sc.allowVolumeExpansion ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="detail-row"><span>Age:</span><span>{{ sc.age }}</span></div>
              </div>
              <div class="card-actions">
                <button (click)="deleteStorageClass(sc)" class="btn small danger">Delete</button>
              </div>
            </div>
          }
          @if (storageClasses().length === 0) {
            <div class="no-data">No Storage Classes found</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @import '../shared-styles.css';

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .tab {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-weight: 500;
      color: #718096;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tab:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
      font-weight: 600;
    }

    .namespace-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 10px;
    }

    .label {
      font-weight: 500;
      color: #4a5568;
    }

    @media (max-width: 768px) {
      .tabs {
        flex-direction: column;
        border-bottom: none;
      }

      .tab {
        border-bottom: 1px solid #e2e8f0;
        border-left: 3px solid transparent;
      }

      .tab.active {
        border-left-color: #667eea;
        border-bottom-color: transparent;
      }

      .namespace-selector {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class StorageComponent implements OnInit {
  private k8sService = inject(K8sApiService);

  activeTab = signal<'pvs' | 'pvcs' | 'sc'>('pvs');
  pvs = signal<PersistentVolume[]>([]);
  pvcs = signal<PersistentVolumeClaim[]>([]);
  storageClasses = signal<StorageClass[]>([]);
  namespaces = signal<Namespace[]>([]);
  selectedNamespace = 'default';

  ngOnInit() {
    this.k8sService.getNamespaces().subscribe({
      next: (data) => this.namespaces.set(data),
      error: (err) => console.error(err)
    });
    this.loadAll();
  }

  loadAll() {
    this.loadPVs();
    this.loadPVCs();
    this.loadStorageClasses();
  }

  loadPVs() {
    this.k8sService.getPersistentVolumes().subscribe({
      next: (data) => this.pvs.set(data),
      error: (err) => console.error(err)
    });
  }

  loadPVCs() {
    this.k8sService.getPersistentVolumeClaims(this.selectedNamespace).subscribe({
      next: (data) => this.pvcs.set(data),
      error: (err) => console.error(err)
    });
  }

  loadStorageClasses() {
    this.k8sService.getStorageClasses().subscribe({
      next: (data) => this.storageClasses.set(data),
      error: (err) => console.error(err)
    });
  }

  deletePV(pv: PersistentVolume) {
    if (pv.status === 'Bound') {
      alert('Cannot delete a bound Persistent Volume');
      return;
    }
    if (confirm(`Delete Persistent Volume "${pv.name}"?`)) {
      this.k8sService.deletePersistentVolume(pv.name).subscribe({
        next: () => this.loadPVs(),
        error: (err) => console.error(err)
      });
    }
  }

  deletePVC(pvc: PersistentVolumeClaim) {
    if (confirm(`Delete Persistent Volume Claim "${pvc.name}"?`)) {
      this.k8sService.deletePersistentVolumeClaim(pvc.namespace, pvc.name).subscribe({
        next: () => this.loadPVCs(),
        error: (err) => console.error(err)
      });
    }
  }

  deleteStorageClass(sc: StorageClass) {
    if (confirm(`Delete Storage Class "${sc.name}"?`)) {
      this.k8sService.deleteStorageClass(sc.name).subscribe({
        next: () => this.loadStorageClasses(),
        error: (err) => console.error(err)
      });
    }
  }
}
