require('dotenv').config();

module.exports = {
  apps: [{
    name: process.env.STORE_APP_NAME,
    script: './dist/src/index.js',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    instances: "1",
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: process.env.ENV
    }
  }],

  deploy: {
    test: {
      key: '~/testing-server.pem',
      user: 'ubuntu',
      host: '150.0.1.64',
      ref: 'origin/dev',
      repo: `https://${process.env.GIT_USER}:${process.env.GIT_PASS}@github.com/${process.env.REPO_NAME}.git`,
      path: '/disk2/pm2/api', // your path to deploy
      'post-deploy': 'npm install  --only=prod && npm run start',
      'pre-deploy': 'git checkout package-lock.json'
    }
  }
};
