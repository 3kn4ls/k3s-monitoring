const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const podsRouter = require('./routes/pods');
const deploymentsRouter = require('./routes/deployments');
const servicesRouter = require('./routes/services');
const namespacesRouter = require('./routes/namespaces');
const nodesRouter = require('./routes/nodes');
const metricsRouter = require('./routes/metrics');
const ingressesRouter = require('./routes/ingresses');
const configmapsRouter = require('./routes/configmaps');
const secretsRouter = require('./routes/secrets');
const storageRouter = require('./routes/storage');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/pods', podsRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/ingresses', ingressesRouter);
app.use('/api/configmaps', configmapsRouter);
app.use('/api/secrets', secretsRouter);
app.use('/api/storage', storageRouter);
app.use('/api/namespaces', namespacesRouter);
app.use('/api/nodes', nodesRouter);
app.use('/api/metrics', metricsRouter);

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, '../../frontend/dist/k3s-admin-frontend/browser')));

// All other routes should redirect to the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/k3s-admin-frontend/browser/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`K3S Admin API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
