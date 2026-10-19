import { BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import Ong from '#models/ong';
import brazilFinder from '../app/helpers/brazil_finder.js';

export default class GeocodeOngs extends BaseCommand {
  static commandName = 'geocode:ongs';
  static description = 'Atualiza latitude e longitude das ONGs a partir do endereço';

  static options: CommandOptions = {
    startApp: true,
  };

  @flags.boolean({ description: 'Recalcula inclusive ONGs que já possuem coordenadas' })
  declare all: boolean;

  async run() {
    const query = Ong.query().whereNull('deleted_at');

    if (!this.all) {
      query.where((q) => q.whereNull('latitude').orWhereNull('longitude'));
    }

    const ongs = await query;

    for (const ong of ongs) {
      const coordinates = await brazilFinder.geocode(ong);

      if (coordinates) {
        ong.latitude = coordinates.latitude;
        ong.longitude = coordinates.longitude;
        await ong.save();
        this.logger.success(`${ong.nome}: ${coordinates.latitude}, ${coordinates.longitude}`);
      } else {
        this.logger.warning(`${ong.nome}: endereço não encontrado`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }
}
