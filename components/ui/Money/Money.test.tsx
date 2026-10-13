import { render, screen } from '@testing-library/react'
import { Money } from './Money'

describe('Money', () => {
  it('always shows two decimals and the currency symbol', () => {
    render(<Money amount={150050} currency="NGN" />)
    expect(screen.getByText('₦1,500.50')).toBeInTheDocument()
  })

  it('pads whole amounts', () => {
    render(<Money amount={1200_00} currency="GHS" />)
    expect(screen.getByText('GH₵1,200.00')).toBeInTheDocument()
  })

  it('formats the largest fixture exactly', () => {
    render(<Money amount={249_999_999_999} currency="NGN" />)
    expect(screen.getByText('₦2,499,999,999.99')).toBeInTheDocument()
  })

  it('prefixes + for credits and the typographic minus for debits', () => {
    const { rerender } = render(<Money amount={2500000} currency="NGN" sign="credit" />)
    expect(screen.getByText('+₦25,000.00')).toBeInTheDocument()
    rerender(<Money amount={1549} currency="USD" sign="debit" />)
    expect(screen.getByText('−$15.49')).toBeInTheDocument()
  })
})
