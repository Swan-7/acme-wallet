import { render, screen } from '@testing-library/react'
import { Input } from '../Input'
import { Select } from '../Select'

describe('Field wiring', () => {
  it('associates the label with the input and describes it with the hint', () => {
    render(<Input label="Amount" hint="Balance: $10.00" />)
    const input = screen.getByLabelText('Amount')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAccessibleDescription('Balance: $10.00')
  })

  it('marks the input invalid and describes it with the error', () => {
    render(<Input label="Amount" error="Too small" />)
    const input = screen.getByLabelText('Amount')
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription('Too small')
  })

  it('associates the label with the select', () => {
    render(<Select label="Type" options={[{ value: 'a', label: 'A' }]} />)
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
  })
})
