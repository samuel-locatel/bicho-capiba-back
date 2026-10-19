import Adoption from '#models/adoption';
import Animal from '#models/animal';
import Ong from '#models/ong';
import User from '#models/user';
import db from '@adonisjs/lucid/services/db';
import type { RelationQueryBuilderContract } from '@adonisjs/lucid/types/relations';
import AppError from '../helpers/app_error.js';
import CacheManager from '../helpers/cache_manager.js';

export type AdoptionStatus = 'pendente' | 'aprovado' | 'rejeitado';

type UpdateAdoption = {
  status: 'aprovado' | 'rejeitado';
  motivo?: string;
};

type ListOptions = {
  page: number;
  limit: number;
  status?: AdoptionStatus;
};

const ADOPTER_COLUMNS = [
  'id',
  'uuid',
  'full_name',
  'email',
  'telefone',
  'data_nascimento',
  'bairro',
  'cidade',
  'estado',
  'tipo_residencia',
  'area_externa',
  'tela_protetora',
  'composicao_familiar',
  'quantidade_moradores',
  'possui_criancas',
  'quantidade_criancas',
  'faixa_etaria_criancas',
  'crianca_necessidade_especial',
  'tipo_necessidade_criancas',
  'familiar_necessidade_especial',
  'tipo_necessidade_especial_familiar',
  'possui_animais',
  'quantidade_animais',
  'idade_animais',
  'sexo_animais',
  'experiencia_com_animais',
  'comportamento_animais',
  'conhecimento_despesas_animais',
  'tempo_disponivel',
];

const ADOPTED_BY_OTHER_REASON = 'Este animal foi adotado por outra família.';

export default class AdoptionsService {
  static async create(data: any, adopter: User) {
    const animal = await Animal.query().where('uuid', data.animal_id).first();

    if (!animal) {
      throw AppError.E_NOT_FOUND('Animal não encontrado');
    }

    if (animal.statusAnimal === 'Adotado') {
      throw AppError.E_CONFLICT('Este animal já foi adotado');
    }

    const existingAdoption = await Adoption.query()
      .where('user_id', adopter.id)
      .where('animal_id', animal.id)
      .first();

    if (existingAdoption) {
      throw AppError.E_CONFLICT('Você já enviou uma solicitação para este animal');
    }

    const adoption = await db.transaction(async (trx) => {
      adopter.useTransaction(trx);
      adopter.tipoResidencia = data.tipo_residencia;
      adopter.areaExterna = data.area_externa;
      adopter.telaProtetora = data.tela_protetora;
      adopter.composicaoFamiliar = data.composicao_familiar;
      adopter.quantidadeMoradores = Number.parseInt(data.quantidade_moradores);
      adopter.possuiCriancas = data.possui_criancas;
      adopter.quantidadeCriancas = data.quantidade_criancas
        ? Number.parseInt(data.quantidade_criancas)
        : null;
      adopter.faixaEtariaCriancas = data.faixa_etaria_criancas || null;
      adopter.criancaNecessidadeEspecial = data.crianca_necessidade_especial;
      adopter.tipoNecessidadeCriancas = data.tipo_necessidade_criancas || null;
      adopter.familiarNecessidadeEspecial = data.familiar_necessidade_especial;
      adopter.tipoNecessidadeEspecialFamiliar = data.tipo_necessidade_especial_familiar || null;
      adopter.possuiAnimais = data.possui_animais;
      adopter.quantidadeAnimais = data.quantidade_animais
        ? Number.parseInt(data.quantidade_animais)
        : null;
      adopter.idadeAnimais = data.idade_animais || null;
      adopter.sexoAnimais = data.sexo_animais || null;
      adopter.experienciaComAnimais = data.experiencia_com_animais;
      adopter.comportamentoAnimais = data.comportamento_animais;
      adopter.conhecimentoDespesasAnimais = data.conhecimento_despesas_animais;
      adopter.tempoDisponivel = data.tempo_disponivel;
      await adopter.save();

      const newAdoption = new Adoption();
      newAdoption.useTransaction(trx);
      newAdoption.status = 'pendente';
      newAdoption.animalId = animal.id;
      newAdoption.ongId = animal.ongId;
      newAdoption.userId = adopter.id;
      await newAdoption.save();

      if (animal.statusAnimal === 'Disponivel') {
        animal.useTransaction(trx);
        animal.statusAnimal = 'Pendente';
        await animal.save();
      }

      return newAdoption;
    });

    await CacheManager.delete(`user:${adopter.uuid}`);

    return adoption;
  }

  static async listByOng(ong: Ong, options: ListOptions) {
    const query = Adoption.query()
      .where('ong_id', ong.id)
      .preload('animal', (animalQuery) => this.preloadAnimal(animalQuery))
      .preload('usuario', (userQuery) => userQuery.select(ADOPTER_COLUMNS))
      .orderBy('created_at', 'desc');

    if (options.status) {
      query.where('status', options.status);
    }

    return query.paginate(options.page, options.limit);
  }

  static async countByStatus(ong: Ong) {
    const rows = await db
      .from('adoptions')
      .where('ong_id', ong.id)
      .whereNull('deleted_at')
      .select('status')
      .count('* as total')
      .groupBy('status');

    const counts: Record<AdoptionStatus, number> = { pendente: 0, aprovado: 0, rejeitado: 0 };
    for (const row of rows) {
      counts[row.status as AdoptionStatus] = Number(row.total);
    }

    return counts;
  }

  static async listByUser(user: User, options: ListOptions) {
    return Adoption.query()
      .where('user_id', user.id)
      .preload('animal', (animalQuery) => this.preloadAnimal(animalQuery))
      .orderBy('created_at', 'desc')
      .paginate(options.page, options.limit);
  }

  static async getAdoption(adoptionId: string, currentUser: User | Ong) {
    const query = Adoption.query()
      .where('uuid', adoptionId)
      .preload('animal', (animalQuery) => this.preloadAnimal(animalQuery));

    if (currentUser instanceof Ong) {
      query
        .where('ong_id', currentUser.id)
        .preload('usuario', (userQuery) => userQuery.select(ADOPTER_COLUMNS));
    } else {
      query.where('user_id', currentUser.id);
    }

    return query.firstOrFail();
  }

  static async updateStatus(adoptionId: string, data: UpdateAdoption, ong: Ong) {
    const adoption = await db.transaction(async (trx) => {
      const current = await Adoption.query({ client: trx })
        .where('uuid', adoptionId)
        .where('ong_id', ong.id)
        .forUpdate()
        .firstOrFail();

      if (current.status !== 'pendente') {
        throw AppError.E_CONFLICT('Esta solicitação já foi respondida');
      }

      const animal = await Animal.query({ client: trx })
        .where('id', current.animalId)
        .forUpdate()
        .firstOrFail();

      if (data.status === 'aprovado') {
        if (animal.statusAnimal === 'Adotado') {
          throw AppError.E_CONFLICT('Este animal já foi adotado');
        }

        animal.statusAnimal = 'Adotado';

        await Adoption.query({ client: trx })
          .where('animal_id', animal.id)
          .where('status', 'pendente')
          .whereNot('id', current.id)
          .update({ status: 'rejeitado', motivo: ADOPTED_BY_OTHER_REASON, updated_at: new Date() });
      } else {
        const otherPending = await Adoption.query({ client: trx })
          .where('animal_id', animal.id)
          .where('status', 'pendente')
          .whereNot('id', current.id)
          .first();

        if (!otherPending && animal.statusAnimal === 'Pendente') {
          animal.statusAnimal = 'Disponivel';
        }
      }

      current.status = data.status;
      current.motivo = data.motivo || null;

      await animal.save();
      await current.save();

      return current;
    });

    return this.getAdoption(adoption.uuid, ong);
  }

  private static preloadAnimal(animalQuery: RelationQueryBuilderContract<typeof Animal, any>) {
    animalQuery
      .select(
        'id',
        'nome',
        'uuid',
        'raca_id',
        'especie_id',
        'cor_id',
        'ong_id',
        'data_nascimento',
        'sexo',
        'porte',
        'status_animal'
      )
      .preload('fotos', (fotoQuery) => {
        fotoQuery.select('id', 'url');
      })
      .preload('raca')
      .preload('especie')
      .preload('cor')
      .preload('ong', (ongQuery) => {
        ongQuery.select('id', 'nome', 'email', 'telefone');
      });
  }
}
