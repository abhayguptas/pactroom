module.exports = {
  apps: [
    {
      name: 'pactroom-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: './apps/pactroom-web',
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
      script: './dist/index.js',
      cwd: './workspaces/backend-api',
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
      script: './dist/index.js',
      cwd: './apps/pactroom-server',
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

