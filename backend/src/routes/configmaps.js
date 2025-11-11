const express = require('express');
const router = express.Router();
const { k8sApi, calculateAge } = require('../controllers/kubernetes');

// Get all configmaps in a namespace
router.get('/:namespace', async (req, res, next) => {
  try {
    const { namespace } = req.params;
    const response = await k8sApi.listNamespacedConfigMap(namespace);

    const configMaps = response.body.items.map(cm => ({
      name: cm.metadata.name,
      namespace: cm.metadata.namespace,
      data: Object.keys(cm.data || {}).length,
      age: calculateAge(cm.metadata.creationTimestamp)
    }));

    res.json(configMaps);
  } catch (error) {
    next(error);
  }
});

// Delete a configmap
router.delete('/:namespace/:name', async (req, res, next) => {
  try {
    const { namespace, name } = req.params;
    await k8sApi.deleteNamespacedConfigMap(name, namespace);
    res.json({ message: 'ConfigMap deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
