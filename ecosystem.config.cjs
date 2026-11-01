// pm2 config for production, see "Deploys" in docs/development.md.
module.exports = {
  apps: [
    {
      name: "wishlist",
      // A symlink to the latest release. A new process resolves it when it
      // starts, so a reload runs the release the deploy just switched to.
      cwd: "/var/www/wishlist.ru-coding.nl/current",
      script: "server.js",
      // In cluster mode `pm2 reload` starts the new process and only stops the
      // old one once the new one listens, so nginx never finds the port
      // closed. One instance: the server has a single CPU and little memory.
      exec_mode: "cluster",
      instances: 1,
      listen_timeout: 10000,
      env: {
        PORT: 3001,
      },
    },
  ],
}
