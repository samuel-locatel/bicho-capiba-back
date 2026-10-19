import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

export default function UserRoutes() {
  const UserController = () => import('#controllers/users_controller');

  router
    .group(() => {
      router.get('/', [UserController, 'index']);
      router.put('/', [UserController, 'update']);
      router.get('/:id', [UserController, 'show']);
    })
    .prefix('/users')
    .use(middleware.jwt());
}
