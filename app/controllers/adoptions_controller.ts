import Ong from '#models/ong';
import type { HttpContext } from '@adonisjs/core/http';
import { responseWithPagination, responseWithSuccess } from '../helpers/api_response.js';
import User from '#models/user';
import AdoptionsService, { AdoptionStatus } from '#services/adoptions_service';
import { updateAdoptionValidator } from '#validators/update_adoption';
import { CreateAdoptionValidator } from '#validators/create_adoption';
import AppError from '../helpers/app_error.js';

const STATUSES: AdoptionStatus[] = ['pendente', 'aprovado', 'rejeitado'];

export default class AdoptionsController {
  async index({ request, response, currentUser }: HttpContext) {
    const page = Math.max(1, Number(request.input('page', 1)) || 1);
    const limit = Math.min(50, Math.max(1, Number(request.input('limit', 10)) || 10));
    const statusInput = request.input('status');
    const status = STATUSES.includes(statusInput) ? statusInput : undefined;

    if (currentUser instanceof Ong) {
      const [adoptions, counts] = await Promise.all([
        AdoptionsService.listByOng(currentUser, { page, limit, status }),
        AdoptionsService.countByStatus(currentUser),
      ]);

      return responseWithPagination(response, adoptions, { counts });
    }

    const adoptions = await AdoptionsService.listByUser(currentUser as User, { page, limit });

    return responseWithPagination(response, adoptions);
  }

  async store({ request, response, currentUser }: HttpContext) {
    if (!(currentUser instanceof User)) {
      throw AppError.E_FORBIDDEN('Apenas adotantes podem solicitar adoções');
    }

    const data = await request.validateUsing(CreateAdoptionValidator);
    const adoption = await AdoptionsService.create(data, currentUser);

    return response.status(201).json({ status: 'OK', result: adoption, error: null });
  }

  async show({ params, response, currentUser }: HttpContext) {
    const adoption = await AdoptionsService.getAdoption(params.id, currentUser!);

    return responseWithSuccess(response, adoption);
  }

  async update({ params, request, response, currentUser }: HttpContext) {
    if (!(currentUser instanceof Ong)) {
      throw AppError.E_FORBIDDEN('Apenas a ONG responsável pode responder esta solicitação');
    }

    const data = await request.validateUsing(updateAdoptionValidator);
    const adoption = await AdoptionsService.updateStatus(params.id, data, currentUser);

    return responseWithSuccess(response, adoption);
  }
}
