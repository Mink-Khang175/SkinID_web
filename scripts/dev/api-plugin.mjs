import worker from '../../worker/index.js';
import { loadServerEnv } from './server-env.mjs';

const MAX_BODY_BYTES = 12 * 1024 * 1024;

export async function handleNodeApi(req, res, root = process.cwd()) {
  try {
    const chunks = [];
    let length = 0;
    for await (const chunk of req) {
      length += chunk.length;
      if (length > MAX_BODY_BYTES) {
        res.writeHead(413, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ success: false, code: 'payload_too_large', message: 'Dữ liệu gửi lên quá lớn.' }));
        return;
      }
      chunks.push(chunk);
    }
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(',') : value);
    }
    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    const request = new Request(url, {
      method: req.method, headers,
      ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Buffer.concat(chunks) })
    });
    const response = await worker.fetch(request, loadServerEnv(root));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    // Do not forward SDK errors, configuration paths or credentials to browsers.
    res.writeHead(503, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify({ success: false, code: 'backend_unavailable', message: 'Backend chưa sẵn sàng. Kiểm tra cấu hình server.' }));
  }
}

export function apiDevPlugin() {
  return {
    name: 'skinid-local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        return handleNodeApi(req, res, server.config.root);
      });
    }
  };
}
