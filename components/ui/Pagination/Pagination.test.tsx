import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('marks the current page and shows the design shape on page 1', () => {
    render(<Pagination page={1} totalPages={12} onChange={() => {}} />)
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(
      within(nav)
        .getAllByRole('button', { name: /^Page \d+$/ })
        .map((b) => b.textContent)
    ).toEqual(['1', '2', '3', '12'])
  })

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
    rerender(<Pagination page={3} totalPages={3} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('reports the requested page, and does nothing for the current one', async () => {
    const onChange = vi.fn()
    render(<Pagination page={2} totalPages={5} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onChange).toHaveBeenCalledWith(4)
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })
})
