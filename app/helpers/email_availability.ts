import User from '#models/user';
import Ong from '#models/ong';
import AppError from './app_error.js';

export async function ensureEmailIsAvailable(email: string, owner?: User | Ong) {
  const [user, ong] = await Promise.all([
    User.query().where('email', email).first(),
    Ong.query().where('email', email).first(),
  ]);

  const takenByOther =
    (user && !(owner instanceof User && owner.id === user.id)) ||
    (ong && !(owner instanceof Ong && owner.id === ong.id));

  if (takenByOther) {
    throw AppError.E_CONFLICT('Este e-mail já está cadastrado');
  }
}
