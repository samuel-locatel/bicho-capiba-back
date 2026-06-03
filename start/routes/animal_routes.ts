import { middleware } from '#start/kernel';
import router from '@adonisjs/core/services/router';

export default function animalsRoutes() {
  const AnimalsController = () => import('#controllers/animals_controller');

  router
    .group(() => {
      router.get('/', [AnimalsController, 'index']).use(middleware.optionalAuth());
      router.get('/filters', [AnimalsController, 'getFiltersData']);
      router.post('/', [AnimalsController, 'store']).use(middleware.jwt());
      router.get('/:id', [AnimalsController, 'show']).use(middleware.optionalAuth());
      router.put('/:id', [AnimalsController, 'update']).use(middleware.jwt());
      router.delete('/:id', [AnimalsController, 'destroy']).use(middleware.jwt());
    })
    .prefix('/animals');
}
