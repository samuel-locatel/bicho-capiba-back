import User from '#models/user';
import hash from '@adonisjs/core/services/hash';
import AppError from '../helpers/app_error.js';
import CacheManager from '../helpers/cache_manager.js';
import { ensureEmailIsAvailable } from '../helpers/email_availability.js';

export default class UsersService {
  static async list() {
    const users = await User.all();
    return users;
  }

  static async getUser(UserId: string) {
    const user = await User.findByOrFail('uuid', UserId);

    return user;
  }

  static async edit(data: Record<string, any>, user: User) {
    const { currentPassword, ...changes } = data;

    if (changes.email && changes.email !== user.email) {
      await ensureEmailIsAvailable(changes.email, user);
    }

    if (changes.password) {
      const isValid = currentPassword && (await hash.verify(user.password, currentPassword));
      if (!isValid) {
        throw AppError.E_UNPROCESSABLE_ENTITY('Senha atual incorreta');
      }
    }

    user.merge(changes);
    await user.save();
    await CacheManager.delete(`user:${user.uuid}`);

    return user;
  }
}
