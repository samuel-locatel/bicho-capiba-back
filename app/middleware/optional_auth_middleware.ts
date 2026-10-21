import Ong from '#models/ong';
import User from '#models/user';
import JwtService from '#services/jwt_service';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

export default class OptionalAuthMiddleware {
  async handle(ctx: HttpContext, next: () => NextFn) {
    const token = JwtService.getTokenFromCookie(ctx);
    if (!token) {
      ctx.currentUser = undefined;
      return next();
    }
    const decoded = JwtService.verifyToken(token);
    if (!decoded?.userId) {
      ctx.currentUser = undefined;
      return next();
    }

    const user = await User.findBy('uuid', decoded.userId);
    const ong = await Ong.findBy('uuid', decoded.userId);

    ctx.currentUser = user || ong || undefined;
    return next();
  }
}
