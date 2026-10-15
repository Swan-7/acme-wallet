import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Dropdown } from './Dropdown'

const OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'transfer_in', label: 'Transfer in' },
]

function Harness({ onChange = () => {} }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <>
      <Dropdown
        label="Type"
        options={OPTIONS}
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange(next)
        }}
      />
      <button type="button">outside</button>
    </>
  )
}

const trigger = () => screen.getByRole('combobox', { name: 'Type' })

describe('Dropdown', () => {
  it('shows the selected label and is closed initially', () => {
    render(<Harness />)
    expect(trigger()).toHaveTextContent('All types')
    expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens on click and selects an option with the mouse', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await userEvent.click(trigger())
    expect(screen.getByRole('listbox', { name: 'Type' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('option', { name: 'Deposit' }))
    expect(onChange).toHaveBeenCalledWith('deposit')
    expect(trigger()).toHaveTextContent('Deposit')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('works from the keyboard: arrows, Enter, Escape', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    trigger().focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('withdrawal')
    await userEvent.keyboard('{ArrowDown}{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger()).toHaveFocus()
  })

  it('closes when pressing outside', async () => {
    render(<Harness />)
    await userEvent.click(trigger())
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'outside' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports type-ahead', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    trigger().focus()
    await userEvent.keyboard('t')
    expect(onChange).toHaveBeenCalledWith('transfer_in')
  })

  it('marks the selected option', async () => {
    render(<Harness />)
    await userEvent.click(trigger())
    expect(screen.getByRole('option', { name: 'All types' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'Deposit' })).toHaveAttribute('aria-selected', 'false')
  })
})
