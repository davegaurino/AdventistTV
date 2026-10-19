(() => {
  const tooltip = document.createElement('div');
  tooltip.className = 'library-tooltip';
  tooltip.id = 'library-item-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  const heading = document.createElement('strong');
  const description = document.createElement('span');
  tooltip.append(heading, description);
  document.body.append(tooltip);
  let active = null;
  let pointerCard = null;
  let dismissTimer;
  let channelIdleTimer;
  let pointer = null;
  const selector = '.ebook-grid .ebook-card, .study-guide-grid .study-guide-card, .promo-book, .channel-card';
  const cardFor = target => target instanceof Element ? target.closest(selector) : null;
  const linksFor = card => card.matches('a, .channel-card') ? [card] : card.querySelectorAll('a');
  function hide() {
    clearTimeout(dismissTimer);
    clearTimeout(channelIdleTimer);
    tooltip.hidden = true;
    if (active) linksFor(active).forEach(link => link.removeAttribute('aria-describedby'));
    active = null;
  }
  function position() {
    if (!active || tooltip.hidden) return;
    const card = active.getBoundingClientRect();
    tooltip.style.width = '';
    if (active.matches('.channel-card')) {
      const playlist = active.closest('.channel-grid')?.getBoundingClientRect() || card;
      const available = playlist.left - 28;
      if (available >= 220) {
        tooltip.style.width = `${Math.min(420, available)}px`;
        const box = tooltip.getBoundingClientRect();
        tooltip.style.left = `${playlist.left - box.width - 12}px`;
        const top = pointer ? pointer.y - box.height / 2 : card.top + card.height / 2 - box.height / 2;
        tooltip.style.top = `${Math.max(16, Math.min(top, window.innerHeight - box.height - 16))}px`;
        return;
      }
    }
    const box = tooltip.getBoundingClientRect();
    const gap = 12;
    const x = (pointer ? pointer.x : card.left + card.width / 2) - box.width / 2;
    const left = Math.min(Math.max(x, 16), window.innerWidth - box.width - 16);
    const ad = active.matches('.promo-book') ? active.closest('.ebook-promo')?.getBoundingClientRect() : null;
    const below = ad ? ad.bottom + gap : pointer ? pointer.y + 16 : card.bottom + gap;
    const above = ad ? ad.top - box.height - gap : pointer ? pointer.y - box.height - 12 : card.top - box.height - gap;
    const top = below + box.height <= window.innerHeight - 16 ? below : above;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(16, Math.min(top, window.innerHeight - box.height - 16))}px`;
  }
  function show(card) {
    clearTimeout(dismissTimer);
    if (active !== card) hide();
    const channel = card.matches('.channel-card') ? (window.ADVENTIST_DIRECTORY?.channels || []).find(item => item.id === card.dataset.channelId) : null;
    if (channel) {
      active = card;
      heading.textContent = channel.name;
      description.replaceChildren();
      const overview = document.createElement('span');
      overview.textContent = channel.description;
      const details = document.createElement('dl');
      details.className = 'channel-tooltip-details';
      for (const [label, value] of [
        ['Broadcast from', channel.broadcastFrom],
        ['Operated by', channel.operator],
        ['Programming', channel.programming],
        ['Languages', channel.languages.join(', ') || 'Not specified']
      ]) {
        const term = document.createElement('dt'); term.textContent = label;
        const definition = document.createElement('dd'); definition.textContent = value;
        details.append(term, definition);
      }
      description.append(overview, details);
      tooltip.classList.add('channel-info-tooltip');
      card.setAttribute('aria-describedby', tooltip.id);
      tooltip.hidden = false;
      position();
      return;
    }
    tooltip.classList.remove('channel-info-tooltip');
    const link = card.matches('.promo-book') ? card : card.querySelector('.ebook-download, .study-guide-content');
    const lesson = (window.LESSON_DESCRIPTIONS || {})[link.href];
    const text = lesson ? lesson.description : (window.EBOOK_DESCRIPTIONS || {})[link.href];
    if (!text) return;
    active = card;
    heading.textContent = lesson ? lesson.title : card.dataset.bookTitle || card.querySelector('.ebook-cover-link').lastElementChild.textContent.trim();
    description.textContent = text;
    linksFor(card).forEach(anchor => anchor.setAttribute('aria-describedby', tooltip.id));
    tooltip.hidden = false;
    position();
  }
  function scheduleHide() {
    clearTimeout(dismissTimer);
    dismissTimer = setTimeout(() => {
      if (!tooltip.matches(':hover') && (!active || !active.contains(document.activeElement)) && pointerCard !== active) hide();
    }, 120);
  }
  document.addEventListener('pointerover', event => {
    const card = cardFor(event.target);
    if (!card || card === cardFor(event.relatedTarget)) return;
    clearTimeout(channelIdleTimer);
    pointerCard = card;
    pointer = {x:event.clientX, y:event.clientY};
    show(card);
  });
  document.addEventListener('pointermove', event => {
    const card = cardFor(event.target);
    if (!card || card !== pointerCard) return;
    const moved = !pointer || pointer.x !== event.clientX || pointer.y !== event.clientY;
    pointer = {x:event.clientX, y:event.clientY};
    if (card.matches('.channel-card')) {
      if (!moved) return;
      hide();
      channelIdleTimer = setTimeout(() => {
        if (pointerCard === card && card.isConnected) show(card);
      }, 500);
      return;
    }
    if (card !== active) return;
    position();
  });
  document.addEventListener('pointerout', event => {
    const card = cardFor(event.target);
    if (!card || card === cardFor(event.relatedTarget)) return;
    clearTimeout(channelIdleTimer);
    pointerCard = null;
    scheduleHide();
  });
  document.addEventListener('focusin', event => {
    const card = cardFor(event.target);
    if (card) { clearTimeout(channelIdleTimer); pointer = null; show(card); }
  });
  document.addEventListener('focusout', event => {
    if (cardFor(event.target)) scheduleHide();
  });
  tooltip.addEventListener('pointerenter', () => clearTimeout(dismissTimer));
  tooltip.addEventListener('pointerleave', scheduleHide);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', () => {
    if (active && active.contains(document.activeElement)) position();
    else hide();
  }, {passive:true});
})();


