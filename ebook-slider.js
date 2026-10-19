(() => {
  const promo = document.querySelector('.ebook-promo');
  const shelf = promo.querySelector('.promo-shelf');
  const books = [...document.querySelectorAll('.ebook-grid .ebook-card')];
  if (!books.length) { promo.hidden = true; return; }
  let start = 0;
  let paused = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function render() {
    shelf.replaceChildren(...Array.from({length: 7}, (_, offset) => {
      const book = books[(start + offset) % books.length];
      const link = book.querySelector('.ebook-download').cloneNode(true);
      link.className = 'promo-book';
      const title = book.querySelector('.ebook-cover-link').lastElementChild.textContent.trim();
      link.setAttribute('aria-label', `Download ${title} PDF`);
      link.dataset.bookTitle = title;
      link.removeAttribute('title');
      const frame = book.querySelector('.ebook-frame').cloneNode(true);
      frame.querySelector('img').loading = 'eager';
      const action = document.createElement('span');
      action.className = 'promo-download';
      action.textContent = 'Download ↓';
      link.replaceChildren(frame, action);
      return link;
    }));
    promo.querySelector('.promo-count').textContent = `${start + 1}–${Math.min(start + 7, books.length)} / ${books.length}`;
  }
  function move(direction) {
    const pages = Math.ceil(books.length / 7);
    start = ((Math.floor(start / 7) + direction + pages) % pages) * 7;
    render();
  }
  promo.querySelector('.promo-prev').addEventListener('click', () => move(-1));
  promo.querySelector('.promo-next').addEventListener('click', () => move(1));
  promo.querySelector('.promo-pause').addEventListener('click', event => {
    paused = !paused;
    event.currentTarget.setAttribute('aria-pressed', String(paused));
    event.currentTarget.textContent = paused ? '▶' : 'Ⅱ';
    event.currentTarget.setAttribute('aria-label', paused ? 'Resume ebook rotation' : 'Pause ebook rotation');
  });
  setInterval(() => {
    if (!paused && !reducedMotion.matches && !document.hidden && !promo.matches(':hover') && !promo.contains(document.activeElement)) move(1);
  }, 7000);
  render();
})();

