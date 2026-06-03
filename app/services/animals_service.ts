import Animal from '#models/animal';
import Ong from '#models/ong';
import { DateTime } from 'luxon';
import ImageUpload from '../helpers/image_upload.js';
import User from '#models/user';
import CacheManager from '../helpers/cache_manager.js';
import Especie from '#models/especie';
import Cor from '#models/cor';
import Vacina from '#models/vacina';
import Raca from '#models/raca';

export default class AnimalsService {
  static async create(data: any, ong: Ong) {
    const animal = new Animal();
    animal.nome = data.nome;
    animal.sexo = data.sexo;
    animal.porte = data.porte;
    animal.dataNascimento = data.data_nascimento;
    animal.castrado = data.castrado || null;
    animal.necessidadesEspeciais = data.necessidades_especiais || null;
    animal.historia = data.historia || null;
    animal.statusAnimal = 'Disponivel';
    animal.sociavelAnimal = data.sociavel_animal || null;
    animal.sociavelPessoa = data.sociavel_pessoa || null;

    let vacinas = [];
    const vacinasArray = data.vacinas;
    for (const vacinaId of vacinasArray) {
      const vacina = await Vacina.query().where('uuid', vacinaId).firstOrFail();
      vacinas.push(vacina.id);
    }

    if (data.images) {
      for (const image of data.images) {
        const imageName = await ImageUpload.upload(image, 'animals');

        await animal.related('fotos').create({ url: imageName });
      }
    }

    const raca = await Raca.query().where('uuid', data.raca).firstOrFail();
    const especie = await Especie.query().where('uuid', data.especie).firstOrFail();
    const cor = await Cor.query().where('uuid', data.cor).firstOrFail();

    await animal.save();
    await animal.related('cor').associate(cor);
    await animal.related('especie').associate(especie);
    await animal.related('raca').associate(raca);
    await animal.related('vacinas').attach(vacinas);
    await animal.related('ong').associate(ong);

    return animal;
  }

  static async getAnimal(animalId: string, currentUser?: any) {
    const query = Animal.query()
      .where('uuid', animalId)
      .preload('cor')
      .preload('raca')
      .preload('especie')
      .preload('fotos', (query) => {
        query.whereNull('deleted_at').select('id', 'url');
      })
      .preload('ong', (query) => {
        query.select('id', 'nome', 'email', 'telefone');
      });

    if (currentUser) {
      query.preload('likes', (likeQuery) => {
        likeQuery.where('user_id', currentUser.id);
      });
    }

    const animal = await query.firstOrFail();

    return animal;
  }

  static async list(pagination: { page: number; limit: number }, currentUser?: any) {
    const query = Animal.query()
      .select([
        'id',
        'uuid',
        'nome',
        'data_nascimento',
        'sexo',
        'ong_id',
        'raca_id',
        'especie_id',
        'cor_id',
        'porte',
        'status_animal',
      ])
      .whereNull('deleted_at')
      .preload('fotos', (query) => {
        query.whereNull('deleted_at').select('id', 'url');
      })
      .preload('raca')
      .preload('especie')
      .preload('ong', (query) => {
        query.select('id', 'nome', 'email', 'telefone', 'bairro', 'cidade', 'estado');
      });

    if (currentUser) {
      query.preload('likes', (likeQuery) => {
        likeQuery.where('user_id', currentUser.id);
      });
    }

    const result = await query.paginate(pagination.page, pagination.limit);
    return result;
  }

  static async edit(animalId: string, data: any) {
    const animal = await Animal.findByOrFail('uuid', animalId);

    if (data.images) {
      const imagePath = await ImageUpload.upload(data.images, 'animals');
      await animal.related('fotos').create({ url: imagePath, extname: '' });
    }

    animal.merge(data);
    await animal.save();

    return animal;
  }

  static async delete(animalId: string) {
    const animal = await Animal.findByOrFail('uuid', animalId);
    animal.deletedAt = DateTime.now();

    await animal.save();

    return animal;
  }

  static async fetchFavorites(user: User, pagination: { page: number; limit: number }) {
    const cacheKey = `user:${user.id}:likedAnimals`;
    const cache = await CacheManager.get(cacheKey);

    if (cache) {
      return cache;
    }

    const likedAnimals = await user
      .related('likes')
      .query()
      .preload('fotos', (q) => {
        q.whereNull('deleted_at').select('url');
      })
      .preload('ong', (q) => {
        q.select('id', 'nome', 'email', 'telefone', 'bairro');
      })
      .preload('raca')
      .preload('especie')
      .preload('cor')
      .paginate(pagination.page, pagination.limit);

    await CacheManager.create(cacheKey, JSON.stringify(likedAnimals));
    return likedAnimals;
  }

  static async fetchLike(animalId: string, userId: number) {
    const user = await User.findOrFail(userId);
    const animal = await Animal.findByOrFail('uuid', animalId);

    const pivotRow = await user
      .related('likes')
      .pivotQuery()
      .where('animal_id', animal.id)
      .first();

    if (!pivotRow) {
      throw new Error('Like not found');
    }

    return pivotRow;
  }

  static async getFiltersData(filter?: string | null) {
    const especies = await Especie.query().preload('racas');
    const cores = await Cor.all();
    const vacinas = await Vacina.all();

    if (filter === 'especies') {
      return { especies };
    }

    if (filter === 'cores') {
      return { cores };
    }

    if (filter === 'vacinas') {
      return { vacinas };
    }

    return {
      especies,
      cores,
      vacinas,
    };
  }
}
