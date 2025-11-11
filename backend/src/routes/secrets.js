const express = require('express');
const router = express.Router();
const { k8sApi, calculateAge } = require('../controllers/kubernetes');

// Get all secrets in a namespace
router.get('/:namespace', async (req, res, next) => {
  try {
    const { namespace } = req.params;
    const response = await k8sApi.listNamespacedSecret(namespace);

    const secrets = response.body.items.map(secret => ({
      name: secret.metadata.name,
      namespace: secret.metadata.namespace,
      type: secret.type,
      data: Object.keys(secret.data || {}).length,
      age: calculateAge(secret.metadata.creationTimestamp)
    }));

    res.json(secrets);
  } catch (error) {
    next(error);
  }
});

// Delete a secret
router.delete('/:namespace/:name', async (req, res, next) => {
  try {
    const { namespace, name } = req.params;
    await k8sApi.deleteNamespacedSecret(name, namespace);
    res.json({ message: 'Secret deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
