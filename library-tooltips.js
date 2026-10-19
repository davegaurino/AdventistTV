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
  let scrolling = false;
  let scrollIdleTimer;
  const selector = '.ebook-grid .ebook-card, .study-guide-grid .study-guide-card, .promo-book, .channel-card';
  const cardFor = target => target instanceof Element ? target.closest(selector) : null;
  const buttonFor = target => {
    if (!(target instanceof Element)) return null;
    // The ad's Download overlay is part of the ebook preview hover area.
    if (target.closest('.promo-book')) return null;
    return target.closest('button, .ebook-download, .lesson-button, .promo-download');
  };
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
    tooltip.style.maxHeight = '';
    if (active.matches('.promo-book')) {
      const ad = active.closest('.ebook-promo').getBoundingClientRect();
      let box = tooltip.getBoundingClientRect();
      const top = ad.bottom + 20;
      const room = window.innerHeight - top - 16;
      if (room < 60) { hide(); return; }
      tooltip.style.maxHeight = `${room}px`;
      box = tooltip.getBoundingClientRect();
      const centerX = pointer ? pointer.x : card.left + card.width / 2;
      const left = Math.max(16, Math.min(centerX - box.width / 2, window.innerWidth - box.width - 16));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      return;
    }
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
    let box = tooltip.getBoundingClientRect();
    // Use the visible row so responsive grids follow the same left-to-right rule.
    const siblings = [...(active.parentElement?.children || [active])].filter(item => item.matches('.ebook-card, .study-guide-card, .promo-book'));
    const row = siblings.filter(item => Math.abs(item.getBoundingClientRect().top - card.top) <= 12)
      .sort((a,b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    const column = row.indexOf(active);
    const rightSideColumns = active.matches('.study-guide-card') ? 2 : 3;
    let toRight = column < rightSideColumns;
    const pointerX = pointer ? pointer.x : toRight ? card.left + card.width : card.left;
    const pointerGap = 24;
    const rightEdge = Math.max(pointerX + pointerGap, card.left + card.width + 16);
    const leftEdge = Math.min(pointerX - pointerGap, card.left - 16);
    let available = toRight ? window.innerWidth - rightEdge - 16 : leftEdge - 16;
    if (available < 220) {
      toRight = !toRight;
      available = toRight ? window.innerWidth - rightEdge - 16 : leftEdge - 16;
    }
    if (available < 220) {
      // On narrow screens, use free vertical space rather than obscure the image.
      const below = window.innerHeight - card.bottom - 32;
      const above = card.top - 32;
      const useBelow = below >= above;
      const room = useBelow ? below : above;
      if (room < 80) { hide(); return; }
      tooltip.style.maxHeight = `${room}px`;
      box = tooltip.getBoundingClientRect();
      tooltip.style.left = `${Math.max(16, Math.min(card.left, window.innerWidth - box.width - 16))}px`;
      tooltip.style.top = `${useBelow ? card.bottom + 16 : card.top - box.height - 16}px`;
      return;
    }
    if (available >= 220 && available < box.width) {
      tooltip.style.width = `${available}px`;
      box = tooltip.getBoundingClientRect();
    }
    const x = toRight ? rightEdge : leftEdge - box.width;
    const left = Math.min(Math.max(x, 16), window.innerWidth - box.width - 16);
    const centerY = pointer ? pointer.y : card.top + card.height / 2;
    const top = centerY - box.height / 2;
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
    if (buttonFor(event.target)) { pointerCard = null; hide(); return; }
    const card = cardFor(event.target);
    if (!card || (card === cardFor(event.relatedTarget) && !buttonFor(event.relatedTarget))) return;
    clearTimeout(channelIdleTimer);
    pointerCard = card;
    pointer = {x:event.clientX, y:event.clientY};
    if (scrolling) { hide(); return; }
    show(card);
  });
  document.addEventListener('pointermove', event => {
    if (buttonFor(event.target)) { pointerCard = null; hide(); return; }
    const card = cardFor(event.target);
    if (!card || card !== pointerCard) return;
    const moved = !pointer || pointer.x !== event.clientX || pointer.y !== event.clientY;
    pointer = {x:event.clientX, y:event.clientY};
    if (scrolling) { hide(); return; }
    if (moved) {
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
    if (buttonFor(event.target)) { hide(); return; }
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
  function suppressWhileScrolling() {
    scrolling = true;
    hide();
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = setTimeout(() => {
      scrolling = false;
      if (!pointer) return;
      const target = document.elementFromPoint(pointer.x, pointer.y);
      const card = cardFor(target);
      if (card && !buttonFor(target)) { pointerCard = card; show(card); }
    }, 500);
  }
  document.addEventListener('scroll', suppressWhileScrolling, {passive:true, capture:true});
  document.addEventListener('wheel', suppressWhileScrolling, {passive:true});
})();


