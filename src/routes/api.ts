import { Router } from 'itty-router';
const router = Router({ base: '/api' });

router.get('/', async (req) => {
  return new Response('API Route');
});

export { router };