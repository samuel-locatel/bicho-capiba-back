import User from '#models/user';
import JwtService from '#services/jwt_service';
import type { HttpContext } from '@adonisjs/core/http';
import { registerUserValidator } from '#validators/register_user';
import { loginValidator } from '#validators/login';
import CacheManager from '../helpers/cache_manager.js';
import { ensureEmailIsAvailable } from '../helpers/email_availability.js';
import Ong from '#models/ong';
export default class AuthController {
  async register({ request, response }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(registerUserValidator);
    await ensureEmailIsAvailable(email);

    const user = new User();
    user.fullName = fullName;
    user.email = email;
    user.password = password;

    await user.save();

    const token = JwtService.generateToken(user);
    JwtService.setAuthCoookie({ response } as HttpContext, token);

    return response.status(201).json({ user });
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator);

    const results = await Promise.allSettled([
      User.verifyCredentials(email, password),
      Ong.verifyCredentials(email, password),
    ]);
    const user = results[0].status === 'fulfilled' ? results[0].value : null;
    const ong = results[1].status === 'fulfilled' ? results[1].value : null;

    if (!user && !ong) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    const authUser = user! || ong!;
    const token = JwtService.generateToken(authUser);
    JwtService.setAuthCoookie({ response } as HttpContext, token);

    return response.status(200).json({ authUser });
  }

  async logout({ response }: HttpContext) {
    JwtService.clearTokenCookie({ response } as HttpContext);

    return response.status(200).json({ message: 'Logged out successfully' });
  }

  async me({ response, currentUser }: HttpContext) {
    const cacheKey = `user:${currentUser?.uuid}`;
    const cachedUser = await CacheManager.get(cacheKey);

    if (cachedUser) {
      return response.status(200).json(cachedUser);
    }

    if (currentUser instanceof Ong) {
      await currentUser.load('images');
    }

    const data = currentUser!.toJSON();
    await CacheManager.create(cacheKey, JSON.stringify(data), 3600);

    return response.status(200).json(data);
  }
}
