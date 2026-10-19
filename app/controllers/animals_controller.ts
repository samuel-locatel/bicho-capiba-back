import type { HttpContext } from '@adonisjs/core/http';
import { responseWithPagination, responseWithSuccess } from '../helpers/api_response.js';
import AnimalsService from '#services/animals_service';
import { RegisterAnimalValidator } from '#validators/register_animal';
import Ong from '#models/ong';
import AppError from '../helpers/app_error.js';
import { UpdateAnimalValidator } from '#validators/update_animal';
import User from '#models/user';
import Animal from '#models/animal';

export default class AnimalsController {
  async index({ request, response, currentUser }: HttpContext) {
    try {
      const page = request.input('page', 1);
      const limit = request.input('limit', 10);
      const data = await AnimalsService.list({ page, limit }, currentUser);

      return responseWithPagination(response, data);
    } catch (error) {
      return response
        .status(400)
        .json({ message: 'Error fetching animals', error: error.message });
    }
  }

  async store({ request, response, currentUser }: HttpContext) {
    const ong = this.requireOng(currentUser);
    const data = await request.validateUsing(RegisterAnimalValidator);
    const animal = await AnimalsService.create(data, ong);

    return responseWithSuccess(response, animal);
  }

  async show({ response, params, currentUser }: HttpContext) {
    try {
      const { id } = params;
      const data = await AnimalsService.getAnimal(id, currentUser);

      return responseWithSuccess(response, data);
    } catch (error) {
      return response
        .status(400)
        .json({ message: 'Error fetching animal', error: error.message });
    }
  }

  async update({ request, response, params, currentUser }: HttpContext) {
    const ong = this.requireOng(currentUser);
    const data = await request.validateUsing(UpdateAnimalValidator);
    const animal = await AnimalsService.edit(params.id, data, ong);

    return responseWithSuccess(response, animal);
  }

  async destroy({ response, params, currentUser }: HttpContext) {
    const ong = this.requireOng(currentUser);
    const data = await AnimalsService.delete(params.id, ong);

    return responseWithSuccess(response, data);
  }

  async addLike({ response, params, currentUser }: HttpContext) {
    const user = this.requireAdopter(currentUser);

    try {
      const { animalId } = params;

      const animal = await Animal.findByOrFail('uuid', animalId);
      await user.related('likes').attach([animal.id]);

      return responseWithSuccess(response, {
        message: 'Animal adicionado aos favoritos com sucesso',
      });
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao adicionar animal aos favoritos',
        error: error.message,
      });
    }
  }

  async removeLike({ response, params, currentUser }: HttpContext) {
    const user = this.requireAdopter(currentUser);

    try {
      const { animalId } = params;
      const animal = await Animal.findByOrFail('uuid', animalId);

      await user.related('likes').detach([animal.id]);

      return responseWithSuccess(response, {
        message: 'Animal removido dos favoritos com sucesso',
      });
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao remover animal dos favoritos',
        error: error.message,
      });
    }
  }

  async getFavorites({ response, currentUser, request }: HttpContext) {
    const user = this.requireAdopter(currentUser);

    try {
      const page = request.input('page', 1);
      const limit = request.input('limit', 10);

      const animals = await AnimalsService.fetchFavorites(user, { page, limit });
      return responseWithPagination(response, animals);
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao buscar animais favoritos',
        error: error.message,
      });
    }
  }

  async checkLike({ response, params, currentUser }: HttpContext) {
    const user = this.requireAdopter(currentUser);

    try {
      const { animalId } = params;

      const animal = await AnimalsService.fetchLike(animalId, user.id);

      return responseWithSuccess(response, animal);
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao verificar like',
        error: error.message,
      });
    }
  }

  async getFiltersData({ request, response }: HttpContext) {
    try {
      const filter = request.input('filter', null);
      const data = await AnimalsService.getFiltersData(filter);

      return responseWithSuccess(response, data);
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao buscar dados para filtros',
        error: error.message,
      });
    }
  }

  private requireOng(currentUser: HttpContext['currentUser']) {
    if (!(currentUser instanceof Ong)) {
      throw AppError.E_FORBIDDEN('Apenas ONGs podem gerenciar animais');
    }

    return currentUser;
  }

  private requireAdopter(currentUser: HttpContext['currentUser']) {
    if (!(currentUser instanceof User)) {
      throw AppError.E_FORBIDDEN('Apenas adotantes podem favoritar animais');
    }

    return currentUser;
  }
}
