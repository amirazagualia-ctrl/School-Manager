module.exports = {
  apps: [
    {
      name: 'madrasa-tn',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=DB --local --ip 0.0.0.0 --port 3000 --compatibility-date 2024-12-01',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PATH: process.env.PATH
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
};
