module.exports = {
  apps: [
    {
      name: 'ewallet-go',
      script: 'node_modules/.bin/tsx',
      args: 'server.ts',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
