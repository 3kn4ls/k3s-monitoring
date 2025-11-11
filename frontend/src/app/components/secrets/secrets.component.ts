import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { K8sApiService } from '../../services/k8s-api.service';
import { Secret, Namespace } from '../../models/kubernetes.models';

@Component({
  selector: 'app-secrets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Secrets</h2>
        <div class="header-actions">
          <select [(ngModel)]="selectedNamespace" (change)="onNamespaceChange()" class="select">
            @for (ns of namespaces(); track ns.name) {
              <option [value]="ns.name">{{ ns.name }}</option>
            }
          </select>
          <button (click)="loadSecrets()" class="btn primary">Refresh</button>
        </div>
      </div>

      <div class="grid">
        @for (secret of secrets(); track secret.name) {
          <div class="card">
            <div class="card-header">
              <h3>{{ secret.name }}</h3>
              <span class="badge">{{ secret.namespace }}</span>
            </div>
            <div class="card-body">
              <div class="detail-row"><span>Type:</span><span>{{ secret.type }}</span></div>
              <div class="detail-row">
                <span>Data Keys:</span>
                <span class="badge badge-warning">{{ secret.data }}</span>
              </div>
              <div class="detail-row"><span>Age:</span><span>{{ secret.age }}</span></div>
            </div>
            <div class="card-actions">
              <button (click)="deleteSecret(secret)" class="btn small danger"
                [disabled]="secret.type.includes('service-account-token')">
                Delete
              </button>
            </div>
          </div>
        }
        @if (secrets().length === 0) {
          <div class="no-data">No Secrets found</div>
        }
      </div>
    </div>
  `,
  styleUrls: ['../shared-styles.css']
})
export class SecretsComponent implements OnInit {
  private k8sService = inject(K8sApiService);
  secrets = signal<Secret[]>([]);
  namespaces = signal<Namespace[]>([]);
  selectedNamespace = 'default';

  ngOnInit() {
    this.k8sService.getNamespaces().subscribe({
      next: (data) => this.namespaces.set(data),
      error: (err) => console.error(err)
    });
    this.loadSecrets();
  }

  loadSecrets() {
    this.k8sService.getSecrets(this.selectedNamespace).subscribe({
      next: (data) => this.secrets.set(data),
      error: (err) => console.error(err)
    });
  }

  onNamespaceChange() {
    this.loadSecrets();
  }

  deleteSecret(secret: Secret) {
    if (secret.type.includes('service-account-token')) {
      alert('Cannot delete service account tokens');
      return;
    }
    if (confirm(`Delete Secret "${secret.name}"?`)) {
      this.k8sService.deleteSecret(secret.namespace, secret.name).subscribe({
        next: () => this.loadSecrets(),
        error: (err) => console.error(err)
      });
    }
  }
}
