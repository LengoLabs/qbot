import { Router } from 'itty-router';
import { parse } from 'cookie';

const router = Router();
declare global {
  // env variables / kv namespaces
  const CONFIG: KVNamespace;
  const ADMIN_PASSWORD: string;
}

const requireUser = async (request: any) => {
  const cookie = parse(request.headers.get('Cookie') || '');
  const password = cookie['password'];
  if(!password || password !== ADMIN_PASSWORD) {
    const url = new URL(request.url);
    url.pathname = '/auth/login';
    return new Response('', {
      status: 302,
      headers: {
        'Location': url.toString(),
      }
    });
  }
}

import { router as apiRouter } from './routes/api';
import { router as authRouter } from './routes/auth';
import { router as configRouter } from './routes/config';
import handleInteraction from './lib/interactions';
router.all('/api/*', apiRouter.handle);
router.all('/auth/*', authRouter.handle);
router.all('/config/*', requireUser, configRouter.handle);

router.get('/interaction', async (req) => {
  const publicKey = await CONFIG.get('DISCORD_PUBLIC_KEY');
  if(!publicKey) return new Response('Unable to verify interactions from Discord; public key is not configured.', { status: 401 });
  return handleInteraction(req, publicKey as string);
});

router.get('/', async (req) => {
  const url = new URL(req.url);
  url.pathname = '/config';
  return new Response('', {
    status: 302,
    headers: { 'Location': url.toString() },
  });
});

router.all('*', () => new Response('404, not found!', { status: 404 }));

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request));
});