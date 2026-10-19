import axios from 'axios'
import https from 'node:https'
import tls from 'node:tls'
import AppError from '../helpers/app_error.js'
import CacheManager from '../helpers/cache_manager.js'
import { globalSignAlphaSslCa2025 } from '../helpers/sahv_certificate.js'

export const CONECTA_RECIFE_CASTRAMOVEL_URL =
  'https://conecta.recife.pe.gov.br/redirecionamento/servico/34'

const CACHE_TTL_IN_SECONDS = 60 * 60

const sahvApi = axios.create({
  baseURL: 'https://sahv.recife.pe.gov.br/codigos',
  timeout: 15000,
  responseType: 'text',
  httpsAgent: new https.Agent({
    ca: [...tls.rootCertificates, globalSignAlphaSslCa2025],
  }),
})

export type EventCategory = 'castracao' | 'vacinacao' | 'adocao'

export type EventSpecies = 'dog' | 'cat'

export interface PetEvent {
  id: string
  title: string
  category: EventCategory
  date: string
  weekday: string
  neighborhood: string
  address: string
  city: string
  startTime: string | null
  bookingUrl: string
  mapsUrl: string
}

export interface EventSlot {
  time: string
  arrival: string
  audience: string
  species: EventSpecies
}

export interface EventRestriction {
  title: string
  groups: { label: string; items: string[] }[]
}

export interface CityEvents {
  events: PetEvent[]
  slots: EventSlot[]
  bookingStatus: string | null
  bookingPeriod: string | null
  notices: string[]
  restriction: EventRestriction | null
  bookingUrl: string | null
  source: { name: string; url: string } | null
  updatedAt: string | null
}

const emptyCityEvents: CityEvents = {
  events: [],
  slots: [],
  bookingStatus: null,
  bookingPeriod: null,
  notices: [],
  restriction: null,
  bookingUrl: null,
  source: null,
  updatedAt: null,
}

const decodeEntities = (value: string) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const htmlToLines = (html: string) =>
  decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(div|p|li|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

const capitalize = (value: string) => {
  const trimmed = value.trim().toLowerCase()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const formatHour = (value: string) => {
  const [hours, minutes = '00'] = value.split(/[:h]/)
  return minutes === '00' ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`
}

const buildMapsUrl = (address: string) => {
  const query = /recife/i.test(address) ? address : `${address}, Recife - PE`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

const parseEventLine = (line: string, startTime: string | null): PetEvent | null => {
  const match = line.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(.+)$/)
  if (!match) return null

  const [, day, month, year, rest] = match
  const parts = rest.split(/\s+-\s+/)
  const hasWeekday = /feira|s[áa]bado|domingo/i.test(parts[0] ?? '')
  const weekday = hasWeekday ? (parts.shift() ?? '') : ''
  const neighborhood = parts.shift() ?? ''
  const address = parts.join(' - ') || neighborhood
  const date = `${year}-${month}-${day}`

  return {
    id: `castramovel-${date}`,
    title: `Castramóvel em ${neighborhood}`,
    category: 'castracao',
    date,
    weekday,
    neighborhood,
    address,
    city: 'Recife',
    startTime,
    bookingUrl: CONECTA_RECIFE_CASTRAMOVEL_URL,
    mapsUrl: buildMapsUrl(address),
  }
}

const parseSlotLine = (line: string): EventSlot | null => {
  const match = line.match(
    /^(\d{1,2})\s*horas?\s*:\s*([^,]+),\s*chegar\s*(?:[àa]s\s*)?(\d{1,2}[:h]\d{2})/i
  )
  if (!match) return null

  const [, hour, audience, arrival] = match
  return {
    time: formatHour(hour),
    arrival: formatHour(arrival),
    audience: audience.trim(),
    species: /gat/i.test(audience) ? 'cat' : 'dog',
  }
}

const parseRestriction = (lines: string[]): EventRestriction | null => {
  const title = lines.find((line) => /braquicef/i.test(line))
  if (!title) return null

  const groups = lines
    .map((line) => line.match(/^exemplos? de ([^:]+):\s*(.+)$/i))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map(([, label, items]) => ({
      label: capitalize(label),
      items: items
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item && !/^entre outros$/i.test(item)),
    }))

  return { title, groups }
}

const refreshing = new Map<string, Promise<CityEvents>>()

export default class EventsService {
  static async listByCity(citySlug: string): Promise<CityEvents> {
    if (citySlug !== 'recife') {
      return emptyCityEvents
    }

    const cached = (await CacheManager.get(`events:${citySlug}`)) as CityEvents | false

    if (cached) {
      const age = Date.now() - Date.parse(cached.updatedAt ?? '')
      if (!(age < CACHE_TTL_IN_SECONDS * 1000)) {
        this.refresh(citySlug).catch(() => null)
      }
      return cached
    }

    try {
      return await this.refresh(citySlug)
    } catch {
      throw AppError.E_GENERIC_ERROR('Não foi possível carregar a agenda da prefeitura')
    }
  }

  private static refresh(citySlug: string) {
    const pending = refreshing.get(citySlug)
    if (pending) return pending

    const request = this.fetchCastramovelRecife()
      .then(async (events) => {
        await CacheManager.create(
          `events:${citySlug}`,
          JSON.stringify(events),
          CACHE_TTL_IN_SECONDS * 24 * 7
        )
        return events
      })
      .finally(() => refreshing.delete(citySlug))

    refreshing.set(citySlug, request)
    return request
  }

  private static async fetchCastramovelRecife(): Promise<CityEvents> {
    const response = await sahvApi.get<string>('/menu.php')
    const lines = htmlToLines(response.data)

    const slots = lines.map(parseSlotLine).filter((slot): slot is EventSlot => slot !== null)

    const startTime = slots.length
      ? slots.reduce((earliest, slot) =>
          slot.arrival.localeCompare(earliest.arrival, undefined, { numeric: true }) < 0
            ? slot
            : earliest
        ).arrival
      : null

    const events = lines
      .map((line) => parseEventLine(line, startTime))
      .filter((event): event is PetEvent => event !== null)
      .sort((a, b) => a.date.localeCompare(b.date))

    const statusMatch = lines
      .map((line) => line.match(/datas castram[óo]vel\s*([^-]*?)\s*-\s*(.+)$/i))
      .find((match): match is RegExpMatchArray => match !== null)

    const notices = lines.filter(
      (line) => /pr[óo]xima campanha/i.test(line) || /sem agendamento pr[ée]vio/i.test(line)
    )

    return {
      events,
      slots,
      bookingStatus: statusMatch ? capitalize(statusMatch[2]) : null,
      bookingPeriod: statusMatch?.[1]?.toLowerCase() || null,
      notices,
      restriction: parseRestriction(lines),
      bookingUrl: CONECTA_RECIFE_CASTRAMOVEL_URL,
      source: { name: 'Conecta Recife', url: CONECTA_RECIFE_CASTRAMOVEL_URL },
      updatedAt: new Date().toISOString(),
    }
  }
}
