import type { HttpContext } from '@adonisjs/core/http';
import EventsService from '#services/events_service';
import { responseWithSuccess } from '../helpers/api_response.js';

export default class EventsController {
  async index({ params, response }: HttpContext) {
    const events = await EventsService.listByCity(params.city);

    return responseWithSuccess(response, events);
  }
}
