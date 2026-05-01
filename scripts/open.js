const { exec } = require('child_process');

const url = process.env.KANGBA_URL || 'http://localhost:8787';
const platform = process.platform;

let cmd;
if (platform === 'darwin') cmd = `open "${url}"`;
else if (platform === 'win32') cmd = `start "" "${url}"`;
else cmd = `xdg-open "${url}"`;

exec(cmd, (err) => {
  if (err) {
    console.error(`无法自动打开浏览器，请手动访问: ${url}`);
    process.exit(1);
  }
  console.log(`已打开浏览器: ${url}`);
});
