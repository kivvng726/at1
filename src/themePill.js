import './themePill.css';
import { applyTheme } from './themes.js';

export function reflectTheme(name) {
  document.body.dataset.theme = name;
  document.querySelectorAll('.theme-pill .tp-seg').forEach((seg) => {
    seg.classList.toggle('active', seg.dataset.name === name);
  });
}

export function initThemePill(themeCtx) {
  const pill = document.createElement('div');
  pill.className = 'theme-pill';
  pill.innerHTML = `
    <button type="button" class="tp-seg" data-name="glass">GLASS</button>
    <span class="tp-divider" aria-hidden="true"></span>
    <button type="button" class="tp-seg" data-name="mono">MONO</button>
  `;
  document.body.appendChild(pill);

  pill.querySelectorAll('.tp-seg').forEach((seg) => {
    seg.addEventListener('click', () => {
      applyTheme(themeCtx, seg.dataset.name);
      reflectTheme(seg.dataset.name);
    });
  });

  themeCtx.onThemeApplied = (theme) => reflectTheme(theme.id);

  return pill;
}
