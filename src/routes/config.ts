import { Router } from 'itty-router';
const router = Router({ base: '/' });

router.get('/', async (req) => {
  return new Response('Config Route');
});

export { router };