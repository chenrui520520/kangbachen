const { spawn } = require('child_process');

const p = spawn('node', ['services/api/server.js'], { stdio: 'inherit' });
p.on('exit', (code) => process.exit(code ?? 0));
