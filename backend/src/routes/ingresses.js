const express = require('express');
const router = express.Router();
const k8s = require('@kubernetes/client-node');
const { calculateAge } = require('../controllers/kubernetes');

const kc = new k8s.KubeConfig();
try {
  kc.loadFromCluster();
} catch (e) {
  try {
    kc.loadFromDefault();
  } catch (err) {
    console.error('Failed to load Kubernetes config:', err.message);
  }
}

const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

// Get all ingresses in a namespace
router.get('/:namespace', async (req, res, next) => {
  try {
    const { namespace } = req.params;
    const response = await k8sNetworkingApi.listNamespacedIngress(namespace);

    const ingresses = response.body.items.map(ingress => ({
      name: ingress.metadata.name,
      namespace: ingress.metadata.namespace,
      className: ingress.spec.ingressClassName,
      hosts: ingress.spec.rules?.map(rule => rule.host).filter(Boolean).join(', ') || 'None',
      address: ingress.status.loadBalancer?.ingress?.[0]?.ip || ingress.status.loadBalancer?.ingress?.[0]?.hostname || 'Pending',
      ports: ingress.spec.tls ? '80, 443' : '80',
      age: calculateAge(ingress.metadata.creationTimestamp)
    }));

    res.json(ingresses);
  } catch (error) {
    next(error);
  }
});

// Delete an ingress
router.delete('/:namespace/:name', async (req, res, next) => {
  try {
    const { namespace, name } = req.params;
    await k8sNetworkingApi.deleteNamespacedIngress(name, namespace);
    res.json({ message: 'Ingress deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
