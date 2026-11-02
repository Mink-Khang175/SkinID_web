import { createServer } from 'node:http';
import { handleNodeApi } from './api-plugin.mjs';

const port = Number(process.env.PORT || 8787);
createServer((req, res) => {
  if (req.url?.startsWith('/api/')) return handleNodeApi(req, res);
  res.writeHead(404); res.end('Not found');
}).listen(port, '127.0.0.1', () => console.log(`SkinID API: http://127.0.0.1:${port}/api/health`));
