const path = require('path');

module.exports = {
  apps: [
    {
      name: 'pactroom-web',
      script: path.resolve(__dirname, 'apps/pactroom-web/node_modules/next/dist/bin/next'),
      args: 'start -p 3000',
      cwd: path.resolve(__dirname, 'apps/pactroom-web'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_SERVER_PORT: '3002'
      }
    },
    {
      name: 'backend-api',
      script: path.resolve(__dirname, 'workspaces/backend-api/dist/index.js'),
      cwd: path.resolve(__dirname, 'workspaces/backend-api'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        BACKEND_API_PORT: 3001
      }
    },
    {
      name: 'pactroom-server',
      script: path.resolve(__dirname, 'apps/pactroom-server/dist/index.js'),
      cwd: path.resolve(__dirname, 'apps/pactroom-server'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PACTROOM_SERVER_PORT: 3002,
        BACKEND_API_URL: 'http://127.0.0.1:3001'
      }
    }
  ]
};
