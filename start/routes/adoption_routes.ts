import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

export default function adoptionRoutes() {
  const AdoptionsController = () => import('#controllers/adoptions_controller');

  router
    .group(() => {
      router.get('/', [AdoptionsController, 'index']);
      router.post('/', [AdoptionsController, 'store']);
      router.get('/:id', [AdoptionsController, 'show']);
      router.put('/:id', [AdoptionsController, 'update']);
    })
    .prefix('/adoptions')
    .use(middleware.jwt());
}
