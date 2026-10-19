import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

export default function ongsRoutes() {
  const OngController = () => import('#controllers/ongs_controller');

  router
    .group(() => {
      router.get('/', [OngController, 'index']);
      router
        .post('/', [OngController, 'store'])
        .use(middleware.rateLimit({ max: 10, windowInSeconds: 60 * 60 }));
      router.put('/', [OngController, 'update']).use(middleware.jwt());
      router.get('/animals', [OngController, 'listOngAnimals']).use(middleware.jwt());
      router.get('/:id', [OngController, 'show']);
      router.delete('/:id', [OngController, 'delete']).use(middleware.jwt());
    })
    .prefix('/ongs');
}
