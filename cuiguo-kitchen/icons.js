/** 脆果厨房 — SVG 食材图标（非表情、非单字） */
const KitchenIcon = {
  create(id, size) {
    const ing = Kitchen.ING[id];
    const wrap = document.createElement('span');
    wrap.className = size === 'lg' ? 'k-ing-icon-wrap k-ing-icon-wrap-lg' : 'k-ing-icon-wrap';
    if (ing) {
      wrap.title = ing.name;
      wrap.setAttribute('aria-label', ing.name);
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'k-ing-icon');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#kitchen-${id}`);
    svg.appendChild(use);
    wrap.appendChild(svg);
    return wrap;
  },

  logo() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'k-logo-icon');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#kitchen-logo');
    svg.appendChild(use);
    return svg;
  },
};
