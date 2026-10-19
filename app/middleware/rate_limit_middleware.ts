import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

type Bucket = { hits: number; resetAt: number };

type RateLimitOptions = {
  max: number;
  windowInSeconds: number;
};

const buckets = new Map<string, Bucket>();

function pruneExpired(now: number) {
  if (buckets.size < 5000) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function hit(key: string, options: RateLimitOptions, now: number) {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const fresh = { hits: 1, resetAt: now + options.windowInSeconds * 1000 };
    buckets.set(key, fresh);
    return fresh;
  }

  bucket.hits++;
  return bucket;
}

export default class RateLimitMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: RateLimitOptions) {
    const now = Date.now();
    pruneExpired(now);

    const route = ctx.route?.pattern ?? ctx.request.url();
    const keys = [`ip:${route}:${ctx.request.ip()}`];

    const email = ctx.request.input('email');
    if (typeof email === 'string' && email.trim()) {
      keys.push(`email:${route}:${email.trim().toLowerCase()}`);
    }

    const blocked = keys
      .map((key) => hit(key, options, now))
      .find((bucket) => bucket.hits > options.max);

    if (blocked) {
      const retryAfter = Math.ceil((blocked.resetAt - now) / 1000);
      ctx.response.header('Retry-After', retryAfter);

      return ctx.response.status(429).json({
        status: 'ERROR',
        message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
      });
    }

    return next();
  }
}
