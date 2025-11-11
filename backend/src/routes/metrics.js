const express = require('express');
const router = express.Router();
const k8s = require('@kubernetes/client-node');

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

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sMetrics = kc.makeApiClient(k8s.Metrics);

// Helper function to convert CPU from nano cores
function formatCpu(cpuString) {
  if (!cpuString) return '0m';
  // Remove 'n' suffix for nanocores
  const value = parseInt(cpuString.replace('n', ''));
  const milliCores = Math.round(value / 1000000); // Convert nanocores to millicores
  return `${milliCores}m`;
}

// Helper function to convert Memory
function formatMemory(memString) {
  if (!memString) return '0Mi';
  // Parse Ki suffix
  if (memString.endsWith('Ki')) {
    const value = parseInt(memString.replace('Ki', ''));
    return `${Math.round(value / 1024)}Mi`;
  }
  return memString;
}

// Get cluster metrics
router.get('/', async (req, res, next) => {
  try {
    const [podsResponse, nodesResponse] = await Promise.all([
      k8sApi.listPodForAllNamespaces(),
      k8sApi.listNode()
    ]);

    let cpuUsage = 'N/A';
    let memoryUsage = 'N/A';

    // Try to get metrics from metrics-server
    try {
      const nodeMetrics = await k8sMetrics.getNodeMetrics();
      if (nodeMetrics && nodeMetrics.items && nodeMetrics.items.length > 0) {
        let totalCpuNano = 0;
        let totalMemoryKi = 0;

        nodeMetrics.items.forEach(node => {
          if (node.usage) {
            const cpu = parseInt(node.usage.cpu.replace('n', ''));
            const mem = parseInt(node.usage.memory.replace('Ki', ''));
            totalCpuNano += cpu;
            totalMemoryKi += mem;
          }
        });

        cpuUsage = formatCpu(`${totalCpuNano}n`);
        memoryUsage = formatMemory(`${totalMemoryKi}Ki`);
      }
    } catch (metricsError) {
      console.log('Metrics server not available:', metricsError.message);
    }

    const metrics = {
      podCount: podsResponse.body.items.length,
      nodeCount: nodesResponse.body.items.length,
      cpuUsage,
      memoryUsage
    };

    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Get node metrics
router.get('/nodes', async (req, res, next) => {
  try {
    const nodeMetrics = await k8sMetrics.getNodeMetrics();

    const metrics = nodeMetrics.items.map(node => ({
      name: node.metadata.name,
      cpuUsage: formatCpu(node.usage.cpu),
      memoryUsage: formatMemory(node.usage.memory),
      cpuPercentage: 0, // Would need node capacity to calculate
      memoryPercentage: 0 // Would need node capacity to calculate
    }));

    res.json(metrics);
  } catch (error) {
    // Metrics server might not be installed
    res.status(503).json({
      error: 'Metrics server not available',
      message: 'Please install metrics-server in your K3S cluster',
      install: 'kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml'
    });
  }
});

// Get pod metrics for a namespace
router.get('/pods/:namespace', async (req, res, next) => {
  try {
    const { namespace } = req.params;
    const podMetrics = await k8sMetrics.getPodMetrics(namespace);

    const metrics = podMetrics.items.map(pod => ({
      name: pod.metadata.name,
      namespace: pod.metadata.namespace,
      cpuUsage: pod.containers.reduce((sum, c) => sum + parseInt(c.usage.cpu.replace('n', '')), 0) + 'n',
      memoryUsage: pod.containers.reduce((sum, c) => sum + parseInt(c.usage.memory.replace('Ki', '')), 0) + 'Ki',
      containers: pod.containers.map(c => ({
        name: c.name,
        cpuUsage: formatCpu(c.usage.cpu),
        memoryUsage: formatMemory(c.usage.memory)
      }))
    }));

    // Format the aggregated values
    metrics.forEach(m => {
      m.cpuUsage = formatCpu(m.cpuUsage);
      m.memoryUsage = formatMemory(m.memoryUsage);
    });

    res.json(metrics);
  } catch (error) {
    res.status(503).json({
      error: 'Metrics server not available',
      message: 'Please install metrics-server in your K3S cluster',
      install: 'kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml'
    });
  }
});

module.exports = router;
