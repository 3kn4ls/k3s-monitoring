# Metrics Server Setup for K3S Admin

La aplicación K3S Admin soporta métricas de CPU y memoria a través del Kubernetes Metrics Server. Si no tienes el Metrics Server instalado, las métricas mostrarán "N/A".

## ¿Qué es Metrics Server?

Metrics Server es un agregador de métricas de recursos del cluster. Recopila métricas de CPU y memoria de los Kubelets y las expone a través de la Metrics API para ser consumidas por componentes como kubectl top, Horizontal Pod Autoscaler, etc.

## Instalación en K3S

### Opción 1: Instalación Estándar

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Opción 2: Instalación para K3S (Recomendada)

K3S a veces requiere configuración adicional para que Metrics Server funcione correctamente. Usa este manifiesto modificado:

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
    rbac.authorization.k8s.io/aggregate-to-admin: "true"
    rbac.authorization.k8s.io/aggregate-to-edit: "true"
    rbac.authorization.k8s.io/aggregate-to-view: "true"
  name: system:aggregated-metrics-reader
rules:
- apiGroups:
  - metrics.k8s.io
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
rules:
- apiGroups:
  - ""
  resources:
  - nodes/metrics
  verbs:
  - get
- apiGroups:
  - ""
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server-auth-reader
  namespace: kube-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: extension-apiserver-authentication-reader
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server:system:auth-delegator
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:auth-delegator
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:metrics-server
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: v1
kind: Service
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
spec:
  ports:
  - name: https
    port: 443
    protocol: TCP
    targetPort: https
  selector:
    k8s-app: metrics-server
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
spec:
  selector:
    matchLabels:
      k8s-app: metrics-server
  strategy:
    rollingUpdate:
      maxUnavailable: 0
  template:
    metadata:
      labels:
        k8s-app: metrics-server
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=4443
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
        - --kubelet-insecure-tls
        image: registry.k8s.io/metrics-server/metrics-server:v0.7.0
        imagePullPolicy: IfNotPresent
        livenessProbe:
          failureThreshold: 3
          httpGet:
            path: /livez
            port: https
            scheme: HTTPS
          periodSeconds: 10
        name: metrics-server
        ports:
        - containerPort: 4443
          name: https
          protocol: TCP
        readinessProbe:
          failureThreshold: 3
          httpGet:
            path: /readyz
            port: https
            scheme: HTTPS
          initialDelaySeconds: 20
          periodSeconds: 10
        resources:
          requests:
            cpu: 100m
            memory: 200Mi
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1000
          seccompProfile:
            type: RuntimeDefault
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - mountPath: /tmp
          name: tmp-dir
      nodeSelector:
        kubernetes.io/os: linux
      priorityClassName: system-cluster-critical
      serviceAccountName: metrics-server
      volumes:
      - emptyDir: {}
        name: tmp-dir
---
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  labels:
    k8s-app: metrics-server
  name: v1beta1.metrics.k8s.io
spec:
  group: metrics.k8s.io
  groupPriorityMinimum: 100
  insecureSkipTLSVerify: true
  service:
    name: metrics-server
    namespace: kube-system
  version: v1beta1
  versionPriority: 100
EOF
```

**Nota importante**: Este manifiesto incluye `--kubelet-insecure-tls` e `insecureSkipTLSVerify: true` que son necesarios para K3S pero no se recomiendan para producción. Para producción, configura certificados TLS apropiados.

## Verificar la Instalación

### 1. Comprobar que el Pod está corriendo

```bash
kubectl get pods -n kube-system | grep metrics-server
```

Deberías ver algo como:
```
metrics-server-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
```

### 2. Esperar a que se recopilen métricas

El Metrics Server necesita unos minutos para empezar a recopilar datos. Espera 1-2 minutos.

### 3. Probar con kubectl top

```bash
# Ver métricas de nodos
kubectl top nodes

# Ver métricas de pods
kubectl top pods -A
```

Si ves las métricas de CPU y memoria, ¡está funcionando!

### 4. Verificar en K3S Admin

Una vez que Metrics Server esté funcionando:

1. Recarga la aplicación K3S Admin
2. El header debería mostrar métricas reales de CPU y memoria en lugar de "N/A"
3. Los endpoints `/api/metrics`, `/api/metrics/nodes` y `/api/metrics/pods/:namespace` deberían devolver datos

## Solución de Problemas

### Metrics Server no inicia

```bash
# Ver logs del pod
kubectl logs -n kube-system -l k8s-app=metrics-server

# Verificar eventos
kubectl get events -n kube-system --sort-by='.lastTimestamp'
```

### Error "unable to fetch metrics"

Si ves este error, probablemente necesitas el flag `--kubelet-insecure-tls`:

```bash
kubectl edit deployment metrics-server -n kube-system
```

Agrega en `.spec.template.spec.containers[0].args`:
```yaml
- --kubelet-insecure-tls
```

### Métricas aún no disponibles en K3S Admin

1. Verifica que Metrics Server está corriendo: `kubectl get pods -n kube-system`
2. Verifica que los RBAC están actualizados: `kubectl apply -f k8s/rbac.yaml`
3. Reinicia el pod de K3S Admin: `kubectl rollout restart deployment/k3s-admin -n k3s-admin`
4. Espera 1-2 minutos para que se recopilen datos

### Logs de K3S Admin

Para ver si K3S Admin puede acceder a las métricas:

```bash
kubectl logs -f deployment/k3s-admin -n k3s-admin
```

Busca mensajes como:
- `Metrics server not available` - Metrics Server no está instalado o no está corriendo
- `403` errors - Problema de RBAC, aplica `k8s/rbac.yaml` actualizado

## Desinstalar Metrics Server

Si necesitas desinstalar Metrics Server:

```bash
kubectl delete -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

O si usaste el manifiesto personalizado, elimina los recursos:

```bash
kubectl delete deployment metrics-server -n kube-system
kubectl delete service metrics-server -n kube-system
kubectl delete serviceaccount metrics-server -n kube-system
kubectl delete clusterrole system:metrics-server system:aggregated-metrics-reader
kubectl delete clusterrolebinding system:metrics-server metrics-server:system:auth-delegator
kubectl delete rolebinding metrics-server-auth-reader -n kube-system
kubectl delete apiservice v1beta1.metrics.k8s.io
```

## Recursos Adicionales

- [Metrics Server GitHub](https://github.com/kubernetes-sigs/metrics-server)
- [K3S Documentation](https://docs.k3s.io/)
- [Kubernetes Metrics API](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-metrics-pipeline/)
