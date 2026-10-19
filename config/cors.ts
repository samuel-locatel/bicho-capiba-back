import { defineConfig } from '@adonisjs/cors'

const allowedOrigins = ['https://bichocapiba.trackr.fm']
const localhostOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: (requestOrigin) =>
    allowedOrigins.includes(requestOrigin) || localhostOrigin.test(requestOrigin),
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
