import app from '@adonisjs/core/services/app';
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http';
import { errors } from '@vinejs/vine';
import { errors as httpErrors } from '@adonisjs/core/http';

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction;

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Erros de validação do VineJS
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).json({
        status: 'ERROR',
        message: 'Erro de validação',
        errors: error.messages,
      });
    }

    if (error instanceof httpErrors.E_HTTP_EXCEPTION) {
      return ctx.response.status(error.status).json({
        status: 'ERROR',
        message: error.message,
      });
    }

    const status = (error as { status?: unknown })?.status;
    if (error instanceof Error && typeof status === 'number' && status >= 400 && status < 500) {
      const isNotFound = (error as { code?: string }).code === 'E_ROW_NOT_FOUND';

      return ctx.response.status(status).json({
        status: 'ERROR',
        message: isNotFound ? 'Registro não encontrado' : error.message,
      });
    }

    if (error instanceof Error) {
      // Em produção, não expor detalhes do erro
      if (app.inProduction) {
        return ctx.response.status(500).json({
          status: 'ERROR',
          message: 'Erro interno do servidor',
        });
      }

      return ctx.response.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    }

    return super.handle(error, ctx);
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx);
  }
}
