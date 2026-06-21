import './atMenu.css';

const MENU_ITEMS = [
  { id: 'websites', label: 'WEBSITES' },
  { id: 'installations', label: 'INSTALLATIONS' },
  { id: 'xr', label: 'XR / VR / AI' },
  { id: 'multiplayer', label: 'MULTIPLAYER' },
  { id: 'games', label: 'GAMES' },
];

export function initAtMenu({ defaultId = 'xr', onSelect, onAsk } = {}) {
  const nav = document.createElement('nav');
  nav.className = 'at-menu';
  nav.innerHTML = `
    <div class="at-head">W</div>
    <ul class="at-list">
      ${MENU_ITEMS.map(({ id, label }) => `
        <li>
          <a class="at-item${id === defaultId ? ' active' : ''}" href="#" data-id="${id}">
            <span class="arr">-></span> ${label}
          </a>
        </li>
      `).join('')}
    </ul>
    <div class="at-ask">
      <input class="at-ask-input" type="text" placeholder="ASK ME ANYTHING..." autocomplete="off" spellcheck="false">
    </div>
  `;
  document.body.appendChild(nav);

  const items = nav.querySelectorAll('.at-item');
  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      items.forEach((x) => x.classList.remove('active'));
      item.classList.add('active');
      onSelect?.(item.dataset.id);
    });
  });

  const ask = nav.querySelector('.at-ask-input');
  ask.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = ask.value.trim();
    if (!q) return;
    ask.value = '';
    onAsk?.(q);
  });

  return nav;
}
