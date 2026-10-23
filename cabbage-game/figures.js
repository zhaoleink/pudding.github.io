/**
 * 迷宫角色 SVG（非 emoji）
 */
const FIG_SVG = {
  player: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#4A90E2"/><circle cx="12" cy="12" r="9" fill="none" stroke="#2563EB" stroke-width="1.5"/><circle cx="9.5" cy="10" r="1.8" fill="#fff" opacity="0.85"/></svg>`,

  cabbage: `<svg viewBox="0 0 24 28" aria-hidden="true"><ellipse cx="8.5" cy="13" rx="5" ry="9.5" fill="#689F38" transform="rotate(-18 8.5 13)"/><ellipse cx="15.5" cy="13" rx="5" ry="9.5" fill="#7CB342" transform="rotate(18 15.5 13)"/><ellipse cx="12" cy="14" rx="4.2" ry="8" fill="#9CCC65"/><path d="M8.5 19.5 Q12 22.5 15.5 19.5" fill="none" stroke="#33691E" stroke-width="1.4" stroke-linecap="round"/></svg>`,

  exit: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5" fill="#FFCA28" stroke="#F9A825" stroke-width="1.2"/><rect x="7.5" y="5.5" width="9" height="13" rx="0.5" fill="#FFF8E1"/><circle cx="14.5" cy="12" r="1.2" fill="#F9A825"/></svg>`,

  caught: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#EF5350"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,

  brand: `<svg viewBox="0 0 24 28" aria-hidden="true"><ellipse cx="8.5" cy="13" rx="5" ry="9.5" fill="#689F38" transform="rotate(-18 8.5 13)"/><ellipse cx="15.5" cy="13" rx="5" ry="9.5" fill="#7CB342" transform="rotate(18 15.5 13)"/><ellipse cx="12" cy="14" rx="4.2" ry="8" fill="#9CCC65"/></svg>`,

  garlic: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="14" rx="6" ry="7" fill="#F5F0E6" stroke="#D4C4A8" stroke-width="1.2"/><path d="M9 8 Q12 4 15 8" fill="none" stroke="#8BC34A" stroke-width="1.6" stroke-linecap="round"/><path d="M10.5 7 Q12 5.5 13.5 7" fill="none" stroke="#689F38" stroke-width="1.2" stroke-linecap="round"/></svg>`,

  chili: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 C12 4 10 7 11 9" fill="none" stroke="#558B2F" stroke-width="1.4" stroke-linecap="round"/><path d="M12 9 C9 10 8 18 12 21 C16 18 15 10 12 9 Z" fill="#E53935" stroke="#C62828" stroke-width="1.2"/><ellipse cx="12" cy="14" rx="2.2" ry="3.5" fill="#FF7043" opacity="0.55"/></svg>`,

  soap: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="9" width="14" height="9" rx="3" fill="#B3E5FC" stroke="#0288D1" stroke-width="1.2"/><circle cx="9" cy="13" r="1.3" fill="#fff" opacity="0.85"/><circle cx="14" cy="15" r="1" fill="#fff" opacity="0.7"/><circle cx="12" cy="11.5" r="0.8" fill="#fff" opacity="0.65"/></svg>`,

  mint: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20 C8 16 6 12 8 8 C10 6 12 7 12 10 C12 7 14 6 16 8 C18 12 16 16 12 20 Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.1"/><path d="M12 10 L12 20" fill="none" stroke="#1B5E20" stroke-width="1" opacity="0.5"/></svg>`,

  mushroom: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="15" rx="4.5" ry="5" fill="#FFF8E1" stroke="#D7CCC8" stroke-width="1"/><path d="M6 14 C6 9 18 9 18 14 Z" fill="#EF5350" stroke="#C62828" stroke-width="1.1"/><circle cx="9" cy="12" r="1.1" fill="#FFEBEE"/><circle cx="14" cy="11.5" r="0.9" fill="#FFEBEE"/><circle cx="12" cy="13" r="0.8" fill="#FFEBEE"/></svg>`,

  paddle: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="14" height="5" rx="2" fill="#8D6E63" stroke="#5D4037" stroke-width="1.1"/><rect x="6" y="12" width="10" height="3" rx="1" fill="#A1887F" opacity="0.55"/><rect x="17" y="9" width="3" height="9" rx="1.2" fill="#6D4C41" stroke="#4E342E" stroke-width="1"/><circle cx="18.5" cy="13.5" r="1.2" fill="#FF7043"/></svg>`,
};

function fig(name, extraClass) {
  const raw = FIG_SVG[name];
  if (!raw) return '';
  const cls = extraClass ? ` class="${extraClass}"` : '';
  return raw.replace('<svg ', `<svg${cls} `);
}

window.fig = fig;
