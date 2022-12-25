import { Router } from 'itty-router';
const router = Router({ base: '/config' });

router.get('/', async (req) => {
  return new Response('Config Route');
});

export { router };