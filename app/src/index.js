import express from 'express';
import client from 'prom-client';

const app = express();
const port = process.env.PORT || 8080;

// Métricas Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'code'],
});
register.registerMetric(httpRequests);

app.get('/health', (req, res) => {
  httpRequests.inc({ method: 'GET', route: '/health', code: 200 });
  res.status(200).send('ok');
});

app.get('/ready', (req, res) => {
  httpRequests.inc({ method: 'GET', route: '/ready', code: 200 });
  res.status(200).send('ready');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/', (req, res) => {
  httpRequests.inc({ method: 'GET', route: '/', code: 200 });
  res.send('Hello from myapp!');
});

app.listen(port, () => {
  console.log(`myapp listening on ${port}`);
});
