import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { K8sApiService } from '../../services/k8s-api.service';
import { Ingress, Namespace } from '../../models/kubernetes.models';

@Component({
  selector: 'app-ingresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Ingresses</h2>
        <div class="header-actions">
          <select [(ngModel)]="selectedNamespace" (change)="onNamespaceChange()" class="select">
            @for (ns of namespaces(); track ns.name) {
              <option [value]="ns.name">{{ ns.name }}</option>
            }
          </select>
          <button (click)="loadIngresses()" class="btn primary">Refresh</button>
        </div>
      </div>

      <div class="grid">
        @for (ingress of ingresses(); track ingress.name) {
          <div class="card">
            <div class="card-header">
              <h3>{{ ingress.name }}</h3>
              <span class="badge">{{ ingress.namespace }}</span>
            </div>
            <div class="card-body">
              <div class="detail-row"><span>Class:</span><span>{{ ingress.className || 'default' }}</span></div>
              <div class="detail-row"><span>Hosts:</span><span>{{ ingress.hosts }}</span></div>
              <div class="detail-row"><span>Address:</span><span>{{ ingress.address || 'Pending' }}</span></div>
              <div class="detail-row"><span>Ports:</span><span>{{ ingress.ports }}</span></div>
              <div class="detail-row"><span>Age:</span><span>{{ ingress.age }}</span></div>
            </div>
            <div class="card-actions">
              <button (click)="deleteIngress(ingress)" class="btn small danger">Delete</button>
            </div>
          </div>
        }
        @if (ingresses().length === 0) {
          <div class="no-data">No ingresses found</div>
        }
      </div>
    </div>
  `,
  styleUrls: ['../shared-styles.css']
})
export class IngressesComponent implements OnInit {
  private k8sService = inject(K8sApiService);
  ingresses = signal<Ingress[]>([]);
  namespaces = signal<Namespace[]>([]);
  selectedNamespace = 'default';

  ngOnInit() {
    this.k8sService.getNamespaces().subscribe({
      next: (data) => this.namespaces.set(data),
      error: (err) => console.error(err)
    });
    this.loadIngresses();
  }

  loadIngresses() {
    this.k8sService.getIngresses(this.selectedNamespace).subscribe({
      next: (data) => this.ingresses.set(data),
      error: (err) => console.error(err)
    });
  }

  onNamespaceChange() {
    this.loadIngresses();
  }

  deleteIngress(ingress: Ingress) {
    if (confirm(`Delete ingress "${ingress.name}"?`)) {
      this.k8sService.deleteIngress(ingress.namespace, ingress.name).subscribe({
        next: () => this.loadIngresses(),
        error: (err) => console.error(err)
      });
    }
  }
}
