import '@testing-library/jest-dom/vitest'

// jsdom does not implement the modal <dialog> API. Minimal stand-in: enough for open/close state and the
// `close` event. It does not model the top layer, focus trapping or Escape -> `cancel`.
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
