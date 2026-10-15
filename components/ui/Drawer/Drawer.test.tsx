import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('is an accessible, labelled modal dialog when open', () => {
    render(
      <Drawer open title="Transaction details" onClose={() => {}}>
        <p>Body</p>
      </Drawer>
    )
    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('renders nothing accessible while closed', () => {
    render(
      <Drawer open={false} title="Transaction details" onClose={() => {}}>
        <p>Body</p>
      </Drawer>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Body')).not.toBeInTheDocument()
  })

  it('closes from the close button but not from clicks inside the panel', async () => {
    const onClose = vi.fn()
    render(
      <Drawer open title="Details" onClose={onClose}>
        <p>Body</p>
      </Drawer>
    )
    await userEvent.click(screen.getByText('Body'))
    expect(onClose).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('asks the parent to close on Escape (cancel) without closing itself', () => {
    const onClose = vi.fn()
    render(
      <Drawer open title="Details" onClose={onClose}>
        <p>Body</p>
      </Drawer>
    )
    const dialog = screen.getByRole('dialog')
    const cancel = new Event('cancel', { cancelable: true })
    fireEvent(dialog, cancel)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(cancel.defaultPrevented).toBe(true)
    expect(dialog).toHaveAttribute('open')
  })

  it('closes when the backdrop (the dialog element itself) is clicked', () => {
    const onClose = vi.fn()
    render(
      <Drawer open title="Details" onClose={onClose}>
        <p>Body</p>
      </Drawer>
    )
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
