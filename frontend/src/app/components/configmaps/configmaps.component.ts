import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { K8sApiService } from '../../services/k8s-api.service';
import { ConfigMap, Namespace } from '../../models/kubernetes.models';

@Component({
  selector: 'app-configmaps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">ConfigMaps</h2>
        <div class="header-actions">
          <select [(ngModel)]="selectedNamespace" (change)="onNamespaceChange()" class="select">
            @for (ns of namespaces(); track ns.name) {
              <option [value]="ns.name">{{ ns.name }}</option>
            }
          </select>
          <button (click)="loadConfigMaps()" class="btn primary">Refresh</button>
        </div>
      </div>

      <div class="grid">
        @for (configMap of configMaps(); track configMap.name) {
          <div class="card">
            <div class="card-header">
              <h3>{{ configMap.name }}</h3>
              <span class="badge">{{ configMap.namespace }}</span>
            </div>
            <div class="card-body">
              <div class="detail-row">
                <span>Data Keys:</span>
                <span class="badge badge-info">{{ configMap.data }}</span>
              </div>
              <div class="detail-row"><span>Age:</span><span>{{ configMap.age }}</span></div>
            </div>
            <div class="card-actions">
              <button (click)="deleteConfigMap(configMap)" class="btn small danger">Delete</button>
            </div>
          </div>
        }
        @if (configMaps().length === 0) {
          <div class="no-data">No ConfigMaps found</div>
        }
      </div>
    </div>
  `,
  styleUrls: ['../shared-styles.css']
})
export class ConfigMapsComponent implements OnInit {
  private k8sService = inject(K8sApiService);
  configMaps = signal<ConfigMap[]>([]);
  namespaces = signal<Namespace[]>([]);
  selectedNamespace = 'default';

  ngOnInit() {
    this.k8sService.getNamespaces().subscribe({
      next: (data) => this.namespaces.set(data),
      error: (err) => console.error(err)
    });
    this.loadConfigMaps();
  }

  loadConfigMaps() {
    this.k8sService.getConfigMaps(this.selectedNamespace).subscribe({
      next: (data) => this.configMaps.set(data),
      error: (err) => console.error(err)
    });
  }

  onNamespaceChange() {
    this.loadConfigMaps();
  }

  deleteConfigMap(configMap: ConfigMap) {
    if (confirm(`Delete ConfigMap "${configMap.name}"?`)) {
      this.k8sService.deleteConfigMap(configMap.namespace, configMap.name).subscribe({
        next: () => this.loadConfigMaps(),
        error: (err) => console.error(err)
      });
    }
  }
}
