import { Router } from 'itty-router';
import { parse } from 'cookie';

const router = Router();
declare global {
  // env variables / kv namespaces
  const ADMIN_PASSWORD: string;
}

const requireUser = async (request: any) => {
  const cookie = parse(request.headers.get('Cookie') || '');
  const password = cookie['password'];
  if(!password || password !== ADMIN_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }
}

import { router as apiRouter } from './routes/api';
import { router as authRouter } from './routes/auth';
import { router as configRouter } from './routes/config';
router.all('/api/*', requireUser, apiRouter.handle);
router.all('/auth/*', requireUser, authRouter.handle);
router.all('/config/*', requireUser, configRouter.handle);

router.get('/', async () => {
  return new Response('OK');
});

router.all('*', () => new Response('404, not found!', { status: 404 }));