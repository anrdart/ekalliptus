export function initCategoryFilter(doc: Document = document): void {
  const buttons = doc.querySelectorAll<HTMLButtonElement>('.category-btn')
  const cards = doc.querySelectorAll<HTMLElement>('.blog-card')
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)))
    cards.forEach(card => { card.hidden = button.dataset.category !== 'all' && card.dataset.category !== button.dataset.category })
    doc.querySelectorAll<HTMLElement>('.ad-in-feed').forEach(ad => { ad.hidden = button.dataset.category !== 'all' })
  }))
}
