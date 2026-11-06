import { createApp } from './app.js';

const PORT = process.env.BACKEND_API_PORT ? parseInt(process.env.BACKEND_API_PORT, 10) : 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`[backend-api] Microservice running on http://localhost:${PORT}`);
  console.log(`[backend-api] OpenAPI 3.1 live JSON: http://localhost:${PORT}/openapi.json`);
  console.log(`[backend-api] Interactive Docs: http://localhost:${PORT}/docs`);
});

