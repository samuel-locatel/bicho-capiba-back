import router from '@adonisjs/core/services/router';

const EventsController = () => import('#controllers/events_controller');

export default function eventRoutes() {
  router
    .group(() => {
      router.get('/:city', [EventsController, 'index']);
    })
    .prefix('/events');
}
