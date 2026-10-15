import { convertMinor, convertMinorFloor, portionOfMinor, totalInBase } from './convert'

describe('convertMinorFloor / portionOfMinor (parity with the convert endpoint)', () => {
  it('floors what you receive', () => {
    expect(convertMinorFloor(1999, 1530.25)).toBe(3_058_969) // API.md example
    expect(convertMinorFloor(1, 0.5)).toBe(0)
  })

  it('charges 1.5% rounded half up', () => {
    expect(portionOfMinor(1999, 15, 1000)).toBe(30) // API.md example: fee 30
    expect(portionOfMinor(100, 15, 1000)).toBe(2) // 1.5 -> 2
    expect(portionOfMinor(0, 15, 1000)).toBe(0)
  })

  it('matches the endpoint formulas Math.floor(a * r) and Math.round(a * 0.015) across a wide range', () => {
    for (const rate of [1530.25, 98.4, 0.000653, 0.0102, 0.653456]) {
      for (let amount = 1; amount <= 20_000; amount += 7) {
        expect(convertMinorFloor(amount, rate)).toBe(Math.floor(amount * rate))
      }
    }
    for (let amount = 1; amount <= 50_000; amount++) {
      expect(portionOfMinor(amount, 15, 1000)).toBe(Math.round(amount * 0.015))
    }
  })
})

describe('convertMinor', () => {
  it('converts exactly', () => {
    expect(convertMinor(100, 1530.25)).toBe(153_025)
    // 234,075 x 1,530.25 = 358,193,268.75 -> rounds half up
    expect(convertMinor(234_075, 1530.25)).toBe(358_193_269)
    expect(convertMinor(85_020, 98.4)).toBe(8_365_968)
  })

  it('rounds half up to the nearest minor unit', () => {
    expect(convertMinor(1, 0.5)).toBe(1)
    expect(convertMinor(3, 0.5)).toBe(2)
    expect(convertMinor(1, 0.4999)).toBe(0)
    expect(convertMinor(0, 1530.25)).toBe(0)
  })

  it('handles small rates with six significant figures', () => {
    expect(convertMinor(1_000_000, 0.000653)).toBe(653)
    expect(convertMinor(2_340_075, 0.000653456)).toBe(1529) // 1529.1 ...
  })

  it('stays exact at the largest amount in the data set', () => {
    expect(convertMinor(249_999_999_999, 1)).toBe(249_999_999_999)
    expect(convertMinor(249_999_999_999, 2)).toBe(499_999_999_998)
  })

  it('rejects values that would silently corrupt money', () => {
    expect(() => convertMinor(1.5, 2)).toThrow(RangeError)
    expect(() => convertMinor(Number.MAX_SAFE_INTEGER + 2, 2)).toThrow(RangeError)
    expect(() => convertMinor(100, Number.NaN)).toThrow(RangeError)
    expect(() => convertMinor(100, -1)).toThrow(RangeError)
  })
})

describe('totalInBase', () => {
  const wallets = [
    { currency: 'NGN' as const, balance: 124_583_050 },
    { currency: 'USD' as const, balance: 234_075 },
    { currency: 'GHS' as const, balance: 85_020 },
  ]

  it('sums every wallet in the base currency', () => {
    // 124,583,050 + 358,193,269 + 8,365,968
    expect(totalInBase(wallets, 'NGN', { USD: 1530.25, GHS: 98.4 })).toBe(491_142_287)
  })

  it('does not need rates when everything is already in the base currency', () => {
    expect(totalInBase([wallets[0]], 'NGN', {})).toBe(124_583_050)
  })

  it('returns null rather than a partial sum when a rate is missing', () => {
    expect(totalInBase(wallets, 'NGN', { USD: 1530.25 })).toBeNull()
  })

  it('is not the naive minor-unit sum the starter computed', () => {
    const naive = wallets.reduce((sum, w) => sum + w.balance, 0)
    expect(totalInBase(wallets, 'NGN', { USD: 1530.25, GHS: 98.4 })).not.toBe(naive)
  })
})
