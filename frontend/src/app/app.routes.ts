import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PodsComponent } from './components/pods/pods.component';
import { DeploymentsComponent } from './components/deployments/deployments.component';
import { ServicesComponent } from './components/services/services.component';
import { NamespacesComponent } from './components/namespaces/namespaces.component';
import { NodesComponent } from './components/nodes/nodes.component';
import { IngressesComponent } from './components/ingresses/ingresses.component';
import { ConfigMapsComponent } from './components/configmaps/configmaps.component';
import { SecretsComponent } from './components/secrets/secrets.component';
import { StorageComponent } from './components/storage/storage.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pods', component: PodsComponent },
  { path: 'deployments', component: DeploymentsComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'ingresses', component: IngressesComponent },
  { path: 'configmaps', component: ConfigMapsComponent },
  { path: 'secrets', component: SecretsComponent },
  { path: 'storage', component: StorageComponent },
  { path: 'namespaces', component: NamespacesComponent },
  { path: 'nodes', component: NodesComponent },
  { path: '**', redirectTo: '/dashboard' }
];
