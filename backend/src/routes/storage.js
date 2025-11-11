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

const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sStorageApi = kc.makeApiClient(k8s.StorageV1Api);

// Get all PersistentVolumes
router.get('/persistentvolumes', async (req, res, next) => {
  try {
    const response = await k8sCoreApi.listPersistentVolume();

    const pvs = response.body.items.map(pv => ({
      name: pv.metadata.name,
      capacity: pv.spec.capacity?.storage || 'Unknown',
      accessModes: pv.spec.accessModes?.join(', ') || 'None',
      reclaimPolicy: pv.spec.persistentVolumeReclaimPolicy || 'Retain',
      status: pv.status.phase,
      claim: pv.spec.claimRef ? `${pv.spec.claimRef.namespace}/${pv.spec.claimRef.name}` : 'None',
      storageClass: pv.spec.storageClassName || 'None',
      age: calculateAge(pv.metadata.creationTimestamp)
    }));

    res.json(pvs);
  } catch (error) {
    next(error);
  }
});

// Delete a PersistentVolume
router.delete('/persistentvolumes/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    await k8sCoreApi.deletePersistentVolume(name);
    res.json({ message: 'PersistentVolume deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all PersistentVolumeClaims in a namespace
router.get('/persistentvolumeclaims/:namespace', async (req, res, next) => {
  try {
    const { namespace } = req.params;
    const response = await k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace);

    const pvcs = response.body.items.map(pvc => ({
      name: pvc.metadata.name,
      namespace: pvc.metadata.namespace,
      status: pvc.status.phase,
      volume: pvc.spec.volumeName || 'Pending',
      capacity: pvc.status.capacity?.storage || 'Pending',
      accessModes: pvc.spec.accessModes?.join(', ') || 'None',
      storageClass: pvc.spec.storageClassName || 'Default',
      age: calculateAge(pvc.metadata.creationTimestamp)
    }));

    res.json(pvcs);
  } catch (error) {
    next(error);
  }
});

// Delete a PersistentVolumeClaim
router.delete('/persistentvolumeclaims/:namespace/:name', async (req, res, next) => {
  try {
    const { namespace, name } = req.params;
    await k8sCoreApi.deleteNamespacedPersistentVolumeClaim(name, namespace);
    res.json({ message: 'PersistentVolumeClaim deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all StorageClasses
router.get('/storageclasses', async (req, res, next) => {
  try {
    const response = await k8sStorageApi.listStorageClass();

    const storageClasses = response.body.items.map(sc => ({
      name: sc.metadata.name,
      provisioner: sc.provisioner,
      reclaimPolicy: sc.reclaimPolicy || 'Delete',
      volumeBindingMode: sc.volumeBindingMode || 'Immediate',
      allowVolumeExpansion: sc.allowVolumeExpansion || false,
      age: calculateAge(sc.metadata.creationTimestamp)
    }));

    res.json(storageClasses);
  } catch (error) {
    next(error);
  }
});

// Delete a StorageClass
router.delete('/storageclasses/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    await k8sStorageApi.deleteStorageClass(name);
    res.json({ message: 'StorageClass deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
