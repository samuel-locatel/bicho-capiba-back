import axios from 'axios';
import AppError from './app_error.js';

export default class brazilFinder {
  static async cepFinder(cep: string) {
    //add timout of 10 seconds
    const { data } = await axios.get(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
      timeout: 10000,
    });

    return {
      street: data.street,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      cep: data.cep,
    };
  }

  static async geocode(address: {
    rua?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
  }) {
    const search = async (params: Record<string, string>) => {
      const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { ...params, countrycodes: 'br', format: 'json', limit: 1 },
        headers: { 'User-Agent': 'bicho-capiba/1.0' },
        timeout: 10000,
      });

      if (!Array.isArray(data) || data.length === 0) return null;

      return { latitude: data[0].lat as string, longitude: data[0].lon as string };
    };

    try {
      const street = [address.numero, address.rua].filter(Boolean).join(' ');
      const fullMatch =
        street && address.cidade
          ? await search({
              street,
              city: address.cidade,
              state: address.estado ?? '',
            })
          : null;

      if (fullMatch) return fullMatch;

      const fallbackQuery = [address.bairro, address.cidade, address.estado]
        .filter(Boolean)
        .join(', ');

      if (fallbackQuery) {
        const fallbackMatch = await search({ q: fallbackQuery });
        if (fallbackMatch) return fallbackMatch;
      }

      const cep = address.cep?.replace(/\D/g, '');
      return cep ? await search({ postalcode: cep }) : null;
    } catch {
      return null;
    }
  }

  static async cnpjFinder(cnpj: string) {
    try {
      const { data } = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
        timeout: 10000,
      });

      if (!data) {
        return false;
      }

      return true;
    } catch (error) {
      throw AppError.E_UNPROCESSABLE_ENTITY('Invalid CNPJ');
    }
  }
}
