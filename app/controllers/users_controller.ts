import User from '#models/user';
import UsersService from '#services/users_service';
import { updateUserValidator } from '#validators/update_user';
import type { HttpContext } from '@adonisjs/core/http';
import AppError from '../helpers/app_error.js';

export default class UsersController {
  async index({ response, currentUser }: HttpContext) {
    if (!(currentUser instanceof User) || !currentUser.superUser) {
      throw AppError.E_FORBIDDEN('Acesso negado');
    }

    const users = await UsersService.list();

    return response.status(200).json(users);
  }

  async show({ response, params, currentUser }: HttpContext) {
    const isSelf = currentUser instanceof User && currentUser.uuid === params.id;
    const isAdmin = currentUser instanceof User && !!currentUser.superUser;

    if (!isSelf && !isAdmin) {
      throw AppError.E_FORBIDDEN('Acesso negado');
    }

    const user = await UsersService.getUser(params.id);
    return response.status(200).json(user);
  }

  async update({ request, response, currentUser }: HttpContext) {
    if (!(currentUser instanceof User)) {
      throw AppError.E_FORBIDDEN('Apenas adotantes podem editar este perfil');
    }

    const data = await request.validateUsing(updateUserValidator);
    const updatedUser = await UsersService.edit(data, currentUser);
    return response.status(200).json(updatedUser);
  }
}
