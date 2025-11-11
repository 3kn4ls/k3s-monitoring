export interface Pod {
  name: string;
  namespace: string;
  status: string;
  ready: string;
  restarts: number;
  age: string;
  ip?: string;
  node?: string;
}

export interface Deployment {
  name: string;
  namespace: string;
  ready: string;
  upToDate: number;
  available: number;
  age: string;
  replicas: number;
}

export interface Service {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalIP: string;
  ports: string;
  age: string;
}

export interface Namespace {
  name: string;
  status: string;
  age: string;
}

export interface Node {
  name: string;
  status: string;
  roles: string;
  age: string;
  version: string;
}

export interface ResourceMetrics {
  cpuUsage: string;
  memoryUsage: string;
  podCount: number;
  nodeCount: number;
}

export interface LogEntry {
  timestamp: string;
  message: string;
}

export interface Ingress {
  name: string;
  namespace: string;
  className?: string;
  hosts: string;
  address: string;
  ports: string;
  age: string;
}

export interface ConfigMap {
  name: string;
  namespace: string;
  data: number;
  age: string;
}

export interface Secret {
  name: string;
  namespace: string;
  type: string;
  data: number;
  age: string;
}

export interface PersistentVolume {
  name: string;
  capacity: string;
  accessModes: string;
  reclaimPolicy: string;
  status: string;
  claim: string;
  storageClass: string;
  age: string;
}

export interface PersistentVolumeClaim {
  name: string;
  namespace: string;
  status: string;
  volume: string;
  capacity: string;
  accessModes: string;
  storageClass: string;
  age: string;
}

export interface StorageClass {
  name: string;
  provisioner: string;
  reclaimPolicy: string;
  volumeBindingMode: string;
  allowVolumeExpansion: boolean;
  age: string;
}

export interface NodeMetrics {
  name: string;
  cpuUsage: string;
  memoryUsage: string;
  cpuPercentage: number;
  memoryPercentage: number;
}

export interface PodMetrics {
  name: string;
  namespace: string;
  cpuUsage: string;
  memoryUsage: string;
  containers: ContainerMetrics[];
}

export interface ContainerMetrics {
  name: string;
  cpuUsage: string;
  memoryUsage: string;
}
