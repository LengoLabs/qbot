import { Router } from 'itty-router';
const router = Router({ base: '/auth' });

router.get('/', async (req) => {
  return new Response('Auth Route');
});

export { router };