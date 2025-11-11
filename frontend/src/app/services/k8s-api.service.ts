import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  Pod, Deployment, Service, Namespace, Node, ResourceMetrics, LogEntry,
  Ingress, ConfigMap, Secret, PersistentVolume, PersistentVolumeClaim,
  StorageClass, NodeMetrics, PodMetrics
} from '../models/kubernetes.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class K8sApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Pods
  getPods(namespace: string = 'default'): Observable<Pod[]> {
    return this.http.get<Pod[]>(`${this.apiUrl}/pods/${namespace}`)
      .pipe(catchError(this.handleError));
  }

  deletePod(namespace: string, name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pods/${namespace}/${name}`)
      .pipe(catchError(this.handleError));
  }

  getPodLogs(namespace: string, name: string, lines: number = 100): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.apiUrl}/pods/${namespace}/${name}/logs?lines=${lines}`)
      .pipe(catchError(this.handleError));
  }

  // Deployments
  getDeployments(namespace: string = 'default'): Observable<Deployment[]> {
    return this.http.get<Deployment[]>(`${this.apiUrl}/deployments/${namespace}`)
      .pipe(catchError(this.handleError));
  }

  scaleDeployment(namespace: string, name: string, replicas: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deployments/${namespace}/${name}/scale`, { replicas })
      .pipe(catchError(this.handleError));
  }

  deleteDeployment(namespace: string, name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deployments/${namespace}/${name}`)
      .pipe(catchError(this.handleError));
  }

  restartDeployment(namespace: string, name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/deployments/${namespace}/${name}/restart`, {})
      .pipe(catchError(this.handleError));
  }

  // Services
  getServices(namespace: string = 'default'): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services/${namespace}`)
      .pipe(catchError(this.handleError));
  }

  deleteService(namespace: string, name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/${namespace}/${name}`)
      .pipe(catchError(this.handleError));
  }

  // Namespaces
  getNamespaces(): Observable<Namespace[]> {
    return this.http.get<Namespace[]>(`${this.apiUrl}/namespaces`)
      .pipe(catchError(this.handleError));
  }

  createNamespace(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/namespaces`, { name })
      .pipe(catchError(this.handleError));
  }

  deleteNamespace(name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/namespaces/${name}`)
      .pipe(catchError(this.handleError));
  }

  // Nodes
  getNodes(): Observable<Node[]> {
    return this.http.get<Node[]>(`${this.apiUrl}/nodes`)
      .pipe(catchError(this.handleError));
  }

  // Metrics
  getMetrics(): Observable<ResourceMetrics> {
    return this.http.get<ResourceMetrics>(`${this.apiUrl}/metrics`)
      .pipe(catchError(this.handleError));
  }

  getNodeMetrics(): Observable<NodeMetrics[]> {
    return this.http.get<NodeMetrics[]>(`${this.apiUrl}/metrics/nodes`)
      .pipe(catchError(this.handleError));
  }

  getPodMetrics(namespace: string = 'default'): Observable<PodMetrics[]> {
    return this.http.get<PodMetrics[]>(`${this.apiUrl}/metrics/pods/${namespace}`)
      .pipe(catchError(this.handleError));
  }

  // Ingress
  getIngresses(namespace: string = 'default'): Observable<Ingress[]> {
    return this.http.get<Ingress[]>(`${this.apiUrl}/ingresses/${namespace}`)
      .pipe(catchError(this.handleError));
  }

  deleteIngress(namespace: string, name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ingresses/${namespace}/${name}`)
      .pipe(catchError(this.handleError));
  }

  // ConfigMaps
  getConfigMaps(namespace: string = 'default'): Observable<ConfigMap[]> {
    return this.http.get<ConfigMap[]>(`${this.apiUrl}/configmaps/${namespace}`)
      .pipe(catchError(this.handleError));
  }

  deleteConfigMap(namespace: string, name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/configmaps/${namespace}/${name}`)
      .pipe(catchError(this.handleError));
  }

  // Secrets
  getSecrets(namespace: string = 'default'): Observable<Secret[]> {
    return this.http.get<Secret[]>(`${this.apiUrl}/secrets/${namespace}`)
      .pipe(catchError(this.handleError));
  }

  deleteSecret(namespace: string, name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/secrets/${namespace}/${name}`)
      .pipe(catchError(this.handleError));
  }

  // Storage - PersistentVolumes
  getPersistentVolumes(): Observable<PersistentVolume[]> {
    return this.http.get<PersistentVolume[]>(`${this.apiUrl}/storage/persistentvolumes`)
      .pipe(catchError(this.handleError));
  }

  deletePersistentVolume(name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/storage/persistentvolumes/${name}`)
      .pipe(catchError(this.handleError));
  }

  // Storage - PersistentVolumeClaims
  getPersistentVolumeClaims(namespace: string = 'default'): Observable<PersistentVolumeClaim[]> {
    return this.http.get<PersistentVolumeClaim[]>(`${this.apiUrl}/storage/persistentvolumeclaims/${namespace}`)
      .pipe(catchError(this.handleError));
  }

  deletePersistentVolumeClaim(namespace: string, name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/storage/persistentvolumeclaims/${namespace}/${name}`)
      .pipe(catchError(this.handleError));
  }

  // Storage - StorageClasses
  getStorageClasses(): Observable<StorageClass[]> {
    return this.http.get<StorageClass[]>(`${this.apiUrl}/storage/storageclasses`)
      .pipe(catchError(this.handleError));
  }

  deleteStorageClass(name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/storage/storageclasses/${name}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
