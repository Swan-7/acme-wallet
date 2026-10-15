import type {
  Conversion,
  Currency,
  Rate,
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
} from '@/types/api'
import { api } from './client'

export interface TransactionQuery {
  page?: number
  limit?: number
  type?: TransactionType
  status?: TransactionStatus
  currency?: Currency
  q?: string
  /** YYYY-MM-DD, inclusive, UTC */
  from?: string
  /** YYYY-MM-DD, inclusive, UTC */
  to?: string
}

function toSearchParams(query: object): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const getMe = (init?: RequestInit) => api.get<User>('/me', init)

export const getTransactions = (query: TransactionQuery = {}, init?: RequestInit) =>
  api.get<Transaction[]>(`/transactions${toSearchParams(query)}`, init)

export const getTransaction = (id: string, init?: RequestInit) =>
  api.get<Transaction>(`/transactions/${encodeURIComponent(id)}`, init)

export const getRate = (from: Currency, to: Currency, init?: RequestInit) =>
  api.get<Rate>(`/rates${toSearchParams({ from, to })}`, init)

export const convert = (body: { from: Currency; to: Currency; amount: number }, init?: RequestInit) =>
  api.post<Conversion>('/convert', body, init)
