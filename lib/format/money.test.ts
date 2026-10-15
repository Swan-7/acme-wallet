import { formatMoney, parseMoney } from './money'

describe('formatMoney', () => {
  it('formats minor units with two decimals', () => {
    expect(formatMoney(150050, 'NGN')).toBe('₦1,500.50')
    expect(formatMoney(85020, 'GHS')).toBe('GH₵850.20')
    expect(formatMoney(4599, 'USD')).toBe('$45.99')
  })

  it('can always show the sign', () => {
    expect(formatMoney(-4599, 'USD', { signDisplay: 'always' })).toBe('-$45.99')
    expect(formatMoney(2500000, 'NGN', { signDisplay: 'always' })).toBe('+₦25,000.00')
  })
})

describe('formatMoney exactness', () => {
  it('is exact at the top of the safe range, where minor / 100 is not', () => {
    expect(formatMoney(9_007_199_254_740_991, 'NGN')).toBe('₦90,071,992,547,409.91')
    expect(formatMoney(249_999_999_999, 'NGN')).toBe('₦2,499,999,999.99')
  })

  it('formats zero, single digits, and negatives', () => {
    expect(formatMoney(0, 'USD')).toBe('$0.00')
    expect(formatMoney(5, 'USD')).toBe('$0.05')
    expect(formatMoney(-5, 'USD', { signDisplay: 'always' })).toBe('-$0.05')
  })

  it('refuses values that are not safe integers instead of printing a guess', () => {
    expect(() => formatMoney(1.5, 'NGN')).toThrow(RangeError)
    expect(() => formatMoney(Number.MAX_SAFE_INTEGER + 2, 'NGN')).toThrow(RangeError)
  })
})

describe('parseMoney limits', () => {
  it('rejects amounts too large to hold exactly', () => {
    expect(parseMoney('90071992547409.92', 'NGN')).toBeNull()
  })
})

describe('parseMoney', () => {
  it('parses decimal input into minor units without float error', () => {
    expect(parseMoney('19.99', 'USD')).toBe(1999)
    expect(parseMoney('1,500.5', 'NGN')).toBe(150050)
    expect(parseMoney('7', 'GHS')).toBe(700)
  })

  it('rejects invalid input', () => {
    expect(parseMoney('', 'NGN')).toBeNull()
    expect(parseMoney('1.234', 'NGN')).toBeNull()
    expect(parseMoney('abc', 'NGN')).toBeNull()
  })
})
