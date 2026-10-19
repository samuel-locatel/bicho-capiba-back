import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

export default function authRoutes() {
  const AuthController = () => import('#controllers/auth_controller');

  router
    .group(() => {
      router
        .post('/login', [AuthController, 'login'])
        .use(middleware.rateLimit({ max: 10, windowInSeconds: 15 * 60 }));
      router
        .post('/register', [AuthController, 'register'])
        .use(middleware.rateLimit({ max: 10, windowInSeconds: 60 * 60 }));
      router.post('/logout', [AuthController, 'logout']);

      router
        .group(() => {
          router.get('/me', [AuthController, 'me']);
        })
        .use(middleware.jwt());
    })
    .prefix('/auth');
}
