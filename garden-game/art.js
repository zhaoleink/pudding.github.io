/** 花鱼小院 — SVG 场景绘制（不用 emoji） */
const GardenArt = {
  emptyPlot() {
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <ellipse cx="32" cy="52" rx="26" ry="8" fill="#8d6e63" opacity="0.35"/>
      <path d="M8 48 Q32 38 56 48 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M10 50 Q32 42 54 50" fill="none" stroke="#6d4c41" stroke-width="1" opacity="0.5"/>
      <circle cx="22" cy="50" r="1.2" fill="#5d4037" opacity="0.4"/>
      <circle cx="38" cy="52" r="1" fill="#5d4037" opacity="0.35"/>
      <circle cx="46" cy="49" r="0.8" fill="#5d4037" opacity="0.3"/>
    </svg>`;
  },

  flower(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage === 1) {
      return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
        <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
        <path d="M31 50 L32 28" stroke="#558b2f" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M32 36 Q26 34 24 30 Q28 32 32 36" fill="#81c784"/>
        <path d="M32 40 Q38 38 40 34 Q36 36 32 40" fill="#66bb6a"/>
        <ellipse cx="32" cy="26" rx="4" ry="5" fill="#aed581"/>
      </svg>`;
    }
    if (stage === 2) {
      return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
        <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
        <path d="M32 50 L32 22" stroke="#33691e" stroke-width="3" stroke-linecap="round"/>
        <path d="M32 38 Q22 36 18 28 Q26 32 32 38" fill="#43a047"/>
        <path d="M32 42 Q42 40 46 32 Q38 36 32 42" fill="#2e7d32"/>
        <circle cx="32" cy="18" r="7" fill="#f48fb1" opacity="0.85"/>
        <circle cx="26" cy="20" r="5" fill="#f06292" opacity="0.7"/>
        <circle cx="38" cy="20" r="5" fill="#ec407a" opacity="0.7"/>
        <circle cx="32" cy="14" r="4" fill="#fce4ec"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 18" stroke="#2e7d32" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M32 40 Q20 38 14 30 Q24 34 32 40" fill="#388e3c"/>
      <path d="M32 44 Q44 42 50 32 Q40 38 32 44" fill="#2e7d32"/>
      <circle cx="32" cy="12" r="10" fill="#f8bbd0"/>
      <circle cx="22" cy="14" r="7" fill="#f48fb1"/>
      <circle cx="42" cy="14" r="7" fill="#f48fb1"/>
      <circle cx="26" cy="8" r="6" fill="#fce4ec"/>
      <circle cx="38" cy="8" r="6" fill="#fce4ec"/>
      <circle cx="32" cy="6" r="5" fill="#fff"/>
      <circle cx="32" cy="10" r="3" fill="#ffeb3b"/>
    </svg>`;
  },

  tree(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage === 1) {
      return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
        <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
        <path d="M32 50 L32 30" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="32" cy="26" rx="5" ry="7" fill="#aed581"/>
      </svg>`;
    }
    if (stage === 2) {
      return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
        <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
        <path d="M32 50 L32 28" stroke="#4e342e" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="32" cy="22" rx="12" ry="14" fill="#66bb6a"/>
        <ellipse cx="26" cy="24" rx="8" ry="10" fill="#81c784" opacity="0.8"/>
        <ellipse cx="38" cy="24" rx="8" ry="10" fill="#43a047" opacity="0.75"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 24" stroke="#3e2723" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="32" cy="16" rx="18" ry="20" fill="#388e3c"/>
      <ellipse cx="22" cy="18" rx="12" ry="14" fill="#43a047" opacity="0.85"/>
      <ellipse cx="42" cy="18" rx="12" ry="14" fill="#2e7d32" opacity="0.8"/>
      <ellipse cx="32" cy="10" rx="10" ry="11" fill="#66bb6a" opacity="0.9"/>
      <circle cx="24" cy="12" r="2" fill="#81c784" opacity="0.6"/>
      <circle cx="40" cy="14" r="1.5" fill="#a5d6a7" opacity="0.5"/>
    </svg>`;
  },

  plotSvg(plot) {
    if (!plot.plant || plot.stage <= 0) return GardenArt.emptyPlot();
    if (plot.plant === 'tree' || plot.plant === 'pine') return GardenArt.tree(plot.stage);
    if (plot.plant === 'spruce') return GardenArt.spruce(plot.stage);
    if (plot.plant === 'bamboo') return GardenArt.bamboo(plot.stage);
    if (plot.plant === 'cherry') return GardenArt.cherry(plot.stage);
    if (plot.plant === 'sunflower') return GardenArt.sunflower(plot.stage);
    if (plot.plant === 'tulip') return GardenArt.tulip(plot.stage);
    if (plot.plant === 'pothos') return GardenArt.pothos(plot.stage);
    if (plot.plant === 'succulent') return GardenArt.succulent(plot.stage);
    if (plot.plant === 'lavender') return GardenArt.lavender(plot.stage);
    if (plot.plant === 'rose') return GardenArt.rose(plot.stage);
    if (plot.plant === 'blueberry') return GardenArt.blueberry(plot.stage);
    if (plot.plant === 'strawberry') return GardenArt.strawberry(plot.stage);
    if (plot.plant === 'tomato') return GardenArt.tomato(plot.stage);
    if (plot.plant === 'apple') return GardenArt.apple(plot.stage);
    return GardenArt.flower(plot.stage);
  },

  sunflower(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.flower(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 20" stroke="#33691e" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="16" r="9" fill="#5d4037"/>
      <circle cx="22" cy="12" r="6" fill="#ffeb3b"/>
      <circle cx="42" cy="12" r="6" fill="#ffeb3b"/>
      <circle cx="32" cy="6" r="6" fill="#fff176"/>
      <circle cx="18" cy="20" r="6" fill="#ffeb3b"/>
      <circle cx="46" cy="20" r="6" fill="#ffeb3b"/>
    </svg>`;
  },

  tulip(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.flower(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 22" stroke="#558b2f" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 18 Q26 8 32 4 Q38 8 32 18" fill="#ec407a"/>
      <path d="M32 18 Q28 10 32 6 Q36 10 32 18" fill="#f48fb1"/>
    </svg>`;
  },

  lavender(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.flower(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M28 50 L28 24" stroke="#558b2f" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M36 50 L36 26" stroke="#558b2f" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="26" y="14" width="4" height="12" rx="2" fill="#7e57c2"/>
      <rect x="34" y="16" width="4" height="12" rx="2" fill="#9575cd"/>
      <circle cx="28" cy="12" r="3" fill="#b39ddb"/>
      <circle cx="36" cy="14" r="3" fill="#9575cd"/>
    </svg>`;
  },

  rose(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.flower(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 24" stroke="#33691e" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 40 Q26 38 24 34" fill="none" stroke="#558b2f" stroke-width="2"/>
      <circle cx="32" cy="16" r="10" fill="#c62828"/>
      <circle cx="26" cy="18" r="6" fill="#e53935"/>
      <circle cx="38" cy="18" r="6" fill="#d32f2f"/>
      <circle cx="32" cy="12" r="5" fill="#ef5350"/>
      <circle cx="32" cy="14" r="2.5" fill="#ffcdd2"/>
    </svg>`;
  },

  bamboo(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.tree(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 26" stroke="#6d4c41" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M32 24 Q18 18 14 10 Q24 16 32 20 Q40 16 50 10 Q46 18 32 24" fill="#43a047"/>
      <path d="M32 18 Q20 14 16 6 Q26 12 32 14 Q38 12 48 6 Q44 14 32 18" fill="#66bb6a"/>
      <path d="M32 12 Q22 8 20 2 Q28 8 32 10 Q36 8 44 2 Q42 8 32 12" fill="#81c784"/>
    </svg>`;
  },

  pothos(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage === 1) {
      return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
        <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
        <path d="M32 48 L32 32" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="32" cy="28" rx="5" ry="7" fill="#aed581"/>
      </svg>`;
    }
    if (stage === 2) {
      return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
        <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
        <path d="M34 48 L34 24" stroke="#558b2f" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M34 30 Q28 28 26 22 Q30 26 34 30" fill="#66bb6a"/>
        <path d="M34 36 Q40 34 42 28 Q38 32 34 36" fill="#43a047"/>
        <ellipse cx="34" cy="20" rx="6" ry="8" fill="#81c784"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M36 48 L36 18" stroke="#558b2f" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M36 26 Q28 24 22 18 Q30 22 36 26" fill="#43a047"/>
      <path d="M36 32 Q44 30 48 24 Q42 28 36 32" fill="#66bb6a"/>
      <path d="M36 38 Q26 36 18 30 Q28 34 36 38" fill="#2e7d32"/>
      <ellipse cx="36" cy="14" rx="7" ry="9" fill="#81c784"/>
      <ellipse cx="24" cy="22" rx="5" ry="7" fill="#aed581"/>
      <ellipse cx="46" cy="28" rx="5" ry="7" fill="#66bb6a"/>
    </svg>`;
  },

  succulent(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage === 1) {
      return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
        <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
        <ellipse cx="32" cy="38" rx="6" ry="5" fill="#a5d6a7"/>
      </svg>`;
    }
    if (stage === 2) {
      return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
        <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
        <ellipse cx="32" cy="34" rx="10" ry="8" fill="#81c784"/>
        <ellipse cx="26" cy="36" rx="5" ry="6" fill="#a5d6a7"/>
        <ellipse cx="38" cy="36" rx="5" ry="6" fill="#66bb6a"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <ellipse cx="32" cy="30" rx="14" ry="11" fill="#66bb6a"/>
      <ellipse cx="22" cy="32" rx="7" ry="8" fill="#81c784"/>
      <ellipse cx="42" cy="32" rx="7" ry="8" fill="#43a047"/>
      <ellipse cx="32" cy="24" rx="8" ry="7" fill="#a5d6a7"/>
      <ellipse cx="26" cy="26" rx="4" ry="5" fill="#c8e6c9"/>
      <ellipse cx="38" cy="26" rx="4" ry="5" fill="#aed581"/>
      <circle cx="32" cy="28" r="3" fill="#e8f5e9"/>
    </svg>`;
  },

  cherry(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.tree(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 28" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>
      <circle cx="22" cy="20" r="7" fill="#f48fb1"/>
      <circle cx="32" cy="14" r="8" fill="#f06292"/>
      <circle cx="42" cy="20" r="7" fill="#ec407a"/>
      <circle cx="26" cy="26" r="6" fill="#f8bbd0"/>
      <circle cx="38" cy="26" r="6" fill="#f48fb1"/>
      <circle cx="32" cy="22" r="5" fill="#fce4ec"/>
    </svg>`;
  },

  spruce(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.tree(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 30" stroke="#4e342e" stroke-width="4" stroke-linecap="round"/>
      <path d="M32 8 L14 28 L50 28 Z" fill="#00695c"/>
      <path d="M32 16 L10 38 L54 38 Z" fill="#00897b"/>
      <path d="M32 24 L6 48 L58 48 Z" fill="#26a69a"/>
      <path d="M32 32 L12 52 L52 52 Z" fill="#4db6ac" opacity="0.85"/>
    </svg>`;
  },

  blueberry(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.tree(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 30" stroke="#5d4037" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="32" cy="22" rx="14" ry="12" fill="#388e3c"/>
      <circle cx="22" cy="20" r="3" fill="#3949ab"/>
      <circle cx="30" cy="16" r="3" fill="#5c6bc0"/>
      <circle cx="38" cy="20" r="3" fill="#283593"/>
      <circle cx="26" cy="26" r="2.5" fill="#3949ab"/>
      <circle cx="36" cy="26" r="2.5" fill="#5c6bc0"/>
    </svg>`;
  },

  strawberry(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.flower(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 32" stroke="#558b2f" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M32 30 Q26 28 24 24 Q28 26 32 28 Q36 26 40 24 Q38 28 32 30" fill="#43a047"/>
      <ellipse cx="28" cy="34" rx="5" ry="6" fill="#e53935"/>
      <ellipse cx="36" cy="34" rx="5" ry="6" fill="#c62828"/>
      <ellipse cx="32" cy="38" rx="5" ry="6" fill="#ef5350"/>
      <circle cx="27" cy="33" r="0.8" fill="#ffcdd2"/>
      <circle cx="35" cy="35" r="0.8" fill="#ffcdd2"/>
    </svg>`;
  },

  tomato(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.flower(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 28" stroke="#33691e" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 36 Q24 34 20 28 Q26 32 32 36" fill="#43a047"/>
      <path d="M32 40 Q40 38 44 32 Q38 36 32 40" fill="#2e7d32"/>
      <circle cx="26" cy="32" r="6" fill="#e53935"/>
      <circle cx="38" cy="34" r="5" fill="#c62828"/>
      <circle cx="32" cy="24" r="4" fill="#ef5350"/>
      <path d="M32 20 Q28 16 32 14 Q36 16 32 20" fill="#66bb6a"/>
    </svg>`;
  },

  apple(stage) {
    if (stage <= 0) return GardenArt.emptyPlot();
    if (stage < 3) return GardenArt.tree(stage);
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <path d="M8 50 Q32 42 56 50 L56 56 Q32 62 8 56 Z" fill="#a1887f"/>
      <path d="M32 50 L32 26" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="32" cy="18" rx="16" ry="14" fill="#43a047"/>
      <circle cx="22" cy="22" r="5" fill="#e53935"/>
      <circle cx="34" cy="16" r="5" fill="#c62835"/>
      <circle cx="42" cy="24" r="4.5" fill="#ef5350"/>
      <path d="M34 12 Q36 8 34 6" fill="none" stroke="#558b2f" stroke-width="2"/>
    </svg>`;
  },

  seedIcon(type) {
    if (type === 'tree') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 18" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="20" cy="14" rx="9" ry="10" fill="#43a047"/>
      </svg>`;
    }
    if (type === 'pine') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 18" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="20" cy="14" rx="9" ry="10" fill="#2e7d32"/>
      </svg>`;
    }
    if (type === 'spruce') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 20" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M20 8 L12 18 L28 18 Z" fill="#00695c"/>
        <path d="M20 14 L8 26 L32 26 Z" fill="#00897b"/>
        <path d="M20 20 L6 32 L34 32 Z" fill="#26a69a"/>
      </svg>`;
    }
    if (type === 'bamboo') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 18" stroke="#6d4c41" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M20 16 Q12 14 10 8 Q16 12 20 14 Q24 12 30 8 Q28 14 20 16" fill="#66bb6a"/>
        <path d="M20 10 Q14 8 12 4 Q17 8 20 9 Q23 8 28 4 Q26 8 20 10" fill="#81c784"/>
      </svg>`;
    }
    if (type === 'pothos') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M22 32 L22 20" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 24 Q16 22 14 16 Q18 20 22 24" fill="#43a047"/>
        <ellipse cx="22" cy="12" rx="6" ry="8" fill="#81c784"/>
        <ellipse cx="14" cy="18" rx="4" ry="6" fill="#aed581"/>
      </svg>`;
    }
    if (type === 'succulent') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <ellipse cx="20" cy="18" rx="9" ry="7" fill="#81c784"/>
        <ellipse cx="14" cy="20" rx="4" ry="5" fill="#a5d6a7"/>
        <ellipse cx="26" cy="20" rx="4" ry="5" fill="#66bb6a"/>
        <ellipse cx="20" cy="14" rx="5" ry="4" fill="#c8e6c9"/>
      </svg>`;
    }
    if (type === 'cherry') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 20" stroke="#6d4c41" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="14" cy="14" r="5" fill="#f48fb1"/>
        <circle cx="26" cy="14" r="5" fill="#f06292"/>
        <circle cx="20" cy="10" r="5" fill="#ec407a"/>
      </svg>`;
    }
    if (type === 'sunflower') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 22" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
        <circle cx="20" cy="14" r="8" fill="#ffeb3b"/>
        <circle cx="20" cy="12" r="3" fill="#5d4037"/>
      </svg>`;
    }
    if (type === 'tulip') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 22" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
        <path d="M20 20 Q16 12 20 8 Q24 12 20 20" fill="#ec407a"/>
      </svg>`;
    }
    if (type === 'lavender') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 22" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
        <rect x="17" y="10" width="3" height="14" rx="1.5" fill="#7e57c2"/>
        <rect x="21" y="12" width="3" height="12" rx="1.5" fill="#9575cd"/>
      </svg>`;
    }
    if (type === 'rose') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 22" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
        <circle cx="20" cy="12" r="7" fill="#c62828"/>
        <circle cx="20" cy="11" r="3" fill="#ef5350"/>
      </svg>`;
    }
    if (type === 'blueberry') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 20" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="20" cy="14" rx="8" ry="7" fill="#388e3c"/>
        <circle cx="16" cy="14" r="2" fill="#3949ab"/>
        <circle cx="22" cy="12" r="2" fill="#5c6bc0"/>
        <circle cx="24" cy="16" r="2" fill="#283593"/>
      </svg>`;
    }
    if (type === 'strawberry') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 22" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="20" cy="14" rx="7" ry="8" fill="#e53935"/>
        <circle cx="17" cy="13" r="1" fill="#ffcdd2"/>
        <circle cx="22" cy="15" r="1" fill="#ffcdd2"/>
      </svg>`;
    }
    if (type === 'tomato') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 22" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
        <circle cx="20" cy="14" r="7" fill="#e53935"/>
        <path d="M20 10 Q18 8 20 7 Q22 8 20 10" fill="#66bb6a"/>
      </svg>`;
    }
    if (type === 'apple') {
      return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
        <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
        <path d="M20 32 L20 18" stroke="#6d4c41" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="16" cy="14" r="5" fill="#e53935"/>
        <circle cx="24" cy="14" r="5" fill="#c62828"/>
        <ellipse cx="20" cy="12" rx="6" ry="5" fill="#43a047"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 40 40" class="art-seed-icon" aria-hidden="true">
      <ellipse cx="20" cy="34" rx="8" ry="3" fill="#8d6e63" opacity="0.5"/>
      <path d="M20 32 L20 20" stroke="#558b2f" stroke-width="2" stroke-linecap="round"/>
      <circle cx="20" cy="14" r="7" fill="#f48fb1"/>
      <circle cx="20" cy="12" r="2.5" fill="#ffeb3b"/>
    </svg>`;
  },

  goldfish(flip) {
    const tr = flip ? 'scale(-1,1) translate(-52,0)' : '';
    return `<svg viewBox="0 0 52 28" class="art-fish-svg" style="transform:${tr}" aria-hidden="true">
      <ellipse cx="22" cy="14" rx="16" ry="9" fill="#ff8f00"/>
      <ellipse cx="14" cy="14" rx="10" ry="7" fill="#ffb300"/>
      <path d="M38 14 L50 6 L50 22 Z" fill="#ff8f00"/>
      <path d="M42 10 L46 4 L44 12 Z" fill="#ffa726"/>
      <path d="M42 18 L46 24 L44 16 Z" fill="#ffa726"/>
      <circle cx="12" cy="12" r="2" fill="#fff"/>
      <circle cx="12" cy="12" r="1" fill="#3e2723"/>
      <path d="M8 14 Q4 10 6 6" fill="none" stroke="#ef6c00" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  },

  koi(flip) {
    const tr = flip ? 'scale(-1,1) translate(-56,0)' : '';
    return `<svg viewBox="0 0 56 30" class="art-fish-svg" style="transform:${tr}" aria-hidden="true">
      <ellipse cx="24" cy="15" rx="18" ry="10" fill="#fff"/>
      <ellipse cx="24" cy="15" rx="18" ry="10" fill="none" stroke="#d32f2f" stroke-width="0"/>
      <path d="M10 15 Q24 4 38 15 Q24 26 10 15" fill="#fff"/>
      <path d="M14 12 Q24 8 34 14 Q24 20 14 16" fill="#ef5350"/>
      <path d="M18 14 Q24 11 30 15 Q24 19 18 15" fill="#ffcdd2" opacity="0.8"/>
      <path d="M42 15 L54 7 L54 23 Z" fill="#ef5350"/>
      <circle cx="14" cy="13" r="2" fill="#fff"/>
      <circle cx="14" cy="13" r="1" fill="#212121"/>
      <ellipse cx="28" cy="15" rx="3" ry="5" fill="#c62828" opacity="0.35"/>
    </svg>`;
  },

  fishSvg(species, flip) {
    return species === 'koi' ? GardenArt.koi(flip) : GardenArt.goldfish(flip);
  },

  pondLotus() {
    return `<svg viewBox="0 0 48 32" class="art-pond-deco" aria-hidden="true">
      <ellipse cx="24" cy="28" rx="20" ry="4" fill="#2e7d32" opacity="0.5"/>
      <path d="M24 28 Q18 18 24 10 Q30 18 24 28" fill="#66bb6a"/>
      <circle cx="24" cy="10" r="5" fill="#f48fb1"/>
      <circle cx="24" cy="10" r="2" fill="#fff176"/>
    </svg>`;
  },

  pondReed() {
    return `<svg viewBox="0 0 24 48" class="art-pond-deco" aria-hidden="true">
      <path d="M12 48 L12 8" stroke="#558b2f" stroke-width="2"/>
      <path d="M12 20 Q6 16 8 10" fill="none" stroke="#689f38" stroke-width="1.5"/>
      <path d="M12 28 Q18 24 16 18" fill="none" stroke="#7cb342" stroke-width="1.5"/>
      <ellipse cx="12" cy="6" rx="3" ry="6" fill="#aed581"/>
    </svg>`;
  },

  waterDrop() {
    return `<svg viewBox="0 0 16 20" class="art-drop" aria-hidden="true">
      <path d="M8 1 C8 1 14 9 14 13 C14 16.3 11.3 19 8 19 C4.7 19 2 16.3 2 13 C2 9 8 1 8 1" fill="#4fc3f7" stroke="#0288d1" stroke-width="0.8"/>
      <ellipse cx="6" cy="12" rx="2" ry="3" fill="#fff" opacity="0.45"/>
    </svg>`;
  },

  coinIcon() {
    return `<svg viewBox="0 0 18 18" class="art-coin-icon" aria-hidden="true">
      <circle cx="9" cy="9" r="8" fill="#ffd54f" stroke="#f9a825" stroke-width="1.2"/>
      <text x="9" y="12" text-anchor="middle" font-size="8" font-weight="800" fill="#e65100">$</text>
    </svg>`;
  },

  dewIcon() {
    return `<svg viewBox="0 0 14 18" class="art-dew-icon" aria-hidden="true">
      <path d="M7 1 C7 1 12 8 12 11 C12 13.8 9.8 16 7 16 C4.2 16 2 13.8 2 11 C2 8 7 1 7 1" fill="#81d4fa" stroke="#039be4" stroke-width="0.6"/>
    </svg>`;
  },

  tabDewIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <ellipse cx="20" cy="28" rx="16" ry="9" fill="#4fc3f7" opacity="0.35"/>
      <path d="M8 26 Q20 14 32 26 Q20 34 8 26" fill="#81d4fa" stroke="#039be4" stroke-width="0.8"/>
      <path d="M20 24 C20 24 24 16 20 8 C16 16 20 24 20 24" fill="#b3e5fc" stroke="#0288d1" stroke-width="0.7"/>
      <ellipse cx="20" cy="8" rx="3" ry="4" fill="#e1f5fe" opacity="0.9"/>
    </svg>`;
  },

  tabShopIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <path d="M6 16 L20 8 L34 16 L32 34 L8 34 Z" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/>
      <path d="M8 16 L20 10 L32 16" fill="none" stroke="#ffb74d" stroke-width="1"/>
      <rect x="12" y="20" width="16" height="12" rx="1" fill="#c8e6c9" stroke="#66bb6a" stroke-width="0.8"/>
      <circle cx="16" cy="24" r="3" fill="#f48fb1"/>
      <circle cx="24" cy="24" r="3" fill="#f06292"/>
      <circle cx="20" cy="28" r="2.5" fill="#fff176"/>
      <path d="M14 34 L26 34" stroke="#8d6e63" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  },

  shopGuest(guest = 'cat') {
    if (guest === 'bunny') {
      return `<svg viewBox="0 0 72 88" class="art-shop-guest" aria-hidden="true">
        <ellipse cx="36" cy="84" rx="18" ry="4" fill="#000" opacity="0.08"/>
        <ellipse cx="40" cy="58" rx="16" ry="18" fill="#fff8e1"/>
        <circle cx="48" cy="42" r="14" fill="#fff8e1"/>
        <ellipse cx="42" cy="18" rx="5" ry="14" fill="#fff8e1" transform="rotate(-8 42 18)"/>
        <ellipse cx="54" cy="18" rx="5" ry="14" fill="#fff8e1" transform="rotate(8 54 18)"/>
        <ellipse cx="42" cy="18" rx="2.5" ry="9" fill="#f8bbd0" transform="rotate(-8 42 18)"/>
        <ellipse cx="54" cy="18" rx="2.5" ry="9" fill="#f8bbd0" transform="rotate(8 54 18)"/>
        <circle cx="44" cy="41" r="3.2" fill="#fff"/>
        <circle cx="52" cy="41" r="3.2" fill="#fff"/>
        <circle cx="44" cy="41.5" r="1.8" fill="#3e2723"/>
        <circle cx="52" cy="41.5" r="1.8" fill="#3e2723"/>
        <circle cx="45" cy="40.2" r="0.9" fill="#fff"/>
        <circle cx="53" cy="40.2" r="0.9" fill="#fff"/>
        <ellipse cx="48" cy="46" rx="2.4" ry="1.8" fill="#f48fb1"/>
        <circle cx="66" cy="62" r="5" fill="#fff" opacity="0.95"/>
        <ellipse cx="20" cy="48" rx="4" ry="7" fill="#fff8e1" transform="rotate(-28 20 48)"/>
      </svg>`;
    }
    if (guest === 'bird') {
      return `<svg viewBox="0 0 72 88" class="art-shop-guest" aria-hidden="true">
        <ellipse cx="36" cy="84" rx="16" ry="4" fill="#000" opacity="0.08"/>
        <ellipse cx="38" cy="52" rx="15" ry="17" fill="#4fc3f7"/>
        <ellipse cx="38" cy="54" rx="10" ry="12" fill="#81d4fa"/>
        <circle cx="48" cy="44" r="11" fill="#4fc3f7"/>
        <circle cx="52" cy="43" r="3.6" fill="#fff"/>
        <circle cx="52.5" cy="43.5" r="2" fill="#212121"/>
        <circle cx="53.2" cy="42.2" r="0.9" fill="#fff"/>
        <path d="M58 44 L66 42 L58 48 Z" fill="#ffb74d"/>
        <ellipse cx="26" cy="54" rx="7" ry="4.5" fill="#29b6f6" transform="rotate(-22 26 54)"/>
        <path d="M34 68 L34 78 M42 68 L42 78" stroke="#ffb74d" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 72 88" class="art-shop-guest" aria-hidden="true">
      <ellipse cx="36" cy="84" rx="18" ry="4" fill="#000" opacity="0.08"/>
      <path d="M22 58 C12 50 6 36 12 24 C18 20 22 36 23 50 C23 55 22 58 22 58 Z" fill="#ffb74d"/>
      <path d="M22 58 C12 50 6 36 12 24" fill="none" stroke="#f9a825" stroke-width="0.8" opacity="0.35"/>
      <path d="M22 62 Q34 48 48 58 Q52 72 40 78 Q28 76 22 62" fill="#ffb74d"/>
      <path d="M26 64 Q34 56 44 62" fill="#ffe082" opacity="0.55"/>
      <circle cx="46" cy="46" r="13" fill="#ffb74d"/>
      <path d="M38 36 L34 26 L40 34 Z" fill="#ffb74d"/>
      <path d="M52 36 L56 26 L50 34 Z" fill="#ffb74d"/>
      <circle cx="47" cy="44" r="3.4" fill="#fff"/>
      <circle cx="53" cy="44" r="3" fill="#fff"/>
      <circle cx="47" cy="44.5" r="1.9" fill="#3e2723"/>
      <circle cx="53" cy="44.5" r="1.7" fill="#3e2723"/>
      <circle cx="48" cy="43" r="1" fill="#fff"/>
      <circle cx="53.8" cy="43" r="0.8" fill="#fff"/>
      <path d="M56 44 L60 43" stroke="#6d4c41" stroke-width="0.8" stroke-linecap="round"/>
      <path d="M56 47 L60 48" stroke="#6d4c41" stroke-width="0.8" stroke-linecap="round"/>
      <ellipse cx="54" cy="49" rx="1.8" ry="1.2" fill="#f48fb1"/>
      <ellipse cx="29" cy="80" rx="3" ry="2" fill="#ffe082"/>
      <ellipse cx="41" cy="80" rx="3" ry="2" fill="#ffe082"/>
    </svg>`;
  },

  shopScene(stock) {
    const flower = stock?.flower || 0;
    const tree = stock?.tree || 0;
    const shelfFlowers = Math.min(5, flower);
    const shelfTrees = Math.min(3, tree);
    let flowers = '';
    for (let i = 0; i < shelfFlowers; i += 1) {
      const x = 88 + i * 34;
      flowers += `<circle cx="${x}" cy="118" r="8" fill="#f48fb1"/><circle cx="${x}" cy="115" r="3" fill="#fff176"/>`;
    }
    let trees = '';
    for (let i = 0; i < shelfTrees; i += 1) {
      const x = 250 + i * 42;
      trees += `<path d="M${x} 132 L${x} 108" stroke="#5d4037" stroke-width="3" stroke-linecap="round"/><ellipse cx="${x}" cy="100" rx="14" ry="12" fill="#66bb6a"/>`;
    }
    return `<svg viewBox="0 0 400 180" class="art-shop-scene" aria-hidden="true">
      <rect x="0" y="0" width="400" height="180" fill="#fff8e1"/>
      <path d="M0 140 L400 140" stroke="#d7ccc8" stroke-width="2"/>
      <rect x="24" y="36" width="352" height="104" rx="8" fill="#fffde7" stroke="#ffe082" stroke-width="2"/>
      <rect x="40" y="92" width="320" height="12" rx="2" fill="#8d6e63"/>
      <rect x="40" y="104" width="320" height="28" rx="2" fill="#a1887f"/>
      ${flowers}
      ${trees}
      <rect x="48" y="138" width="304" height="18" rx="4" fill="#ffcc80" stroke="#ffb74d" stroke-width="1"/>
      <text x="200" y="151" text-anchor="middle" font-size="11" font-weight="700" fill="#6d4c41">花房柜台</text>
      <path d="M20 36 L200 12 L380 36" fill="none" stroke="#f9a825" stroke-width="2"/>
    </svg>`;
  },

  dewPoolScene(level) {
    const ripples = level >= 1 ? '<ellipse cx="200" cy="130" rx="90" ry="22" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.35" class="dew-ripple dew-ripple-1"/><ellipse cx="200" cy="130" rx="60" ry="14" fill="none" stroke="#fff" stroke-width="1" opacity="0.45" class="dew-ripple dew-ripple-2"/>' : '';
    const drops = level >= 2 ? '<circle cx="120" cy="40" r="3" fill="#b3e5fc" class="dew-float"/><circle cx="280" cy="55" r="2.5" fill="#81d4fa" class="dew-float dew-float-delay"/>' : '';
    const glow = level >= 3 ? '<circle cx="200" cy="125" r="70" fill="#4fc3f7" opacity="0.08"/>' : '';
    return `<svg viewBox="0 0 400 200" class="art-dew-pool" aria-hidden="true">
      ${glow}
      <ellipse cx="200" cy="168" rx="170" ry="28" fill="#8d6e63" opacity="0.35"/>
      <path d="M40 155 Q200 95 360 155 L360 175 Q200 195 40 175 Z" fill="#0288d1"/>
      <path d="M50 158 Q200 105 350 158 L350 168 Q200 182 50 168 Z" fill="#039be5" opacity="0.85"/>
      <path d="M70 160 Q200 118 330 160" fill="none" stroke="#4fc3f7" stroke-width="2" opacity="0.5"/>
      ${ripples}
      ${drops}
      <path d="M200 118 C200 118 212 88 200 52 C188 88 200 118 200 118" fill="#81d4fa" opacity="0.75"/>
      <path d="M200 116 C200 116 208 92 200 64 C192 92 200 116 200 116" fill="#b3e5fc"/>
    </svg>`;
  },

  courtyardIcon() {
    return `<svg viewBox="0 0 40 40" class="art-brand-icon" aria-hidden="true">
      <rect x="6" y="18" width="28" height="18" rx="2" fill="#ffcc80" stroke="#8d6e63" stroke-width="1"/>
      <path d="M4 18 L20 6 L36 18" fill="#ef5350" stroke="#c62828" stroke-width="1"/>
      <rect x="16" y="26" width="8" height="10" fill="#6d4c41"/>
      <rect x="10" y="22" width="6" height="5" fill="#81d4fa" opacity="0.8"/>
      <rect x="24" y="22" width="6" height="5" fill="#81d4fa" opacity="0.8"/>
      <circle cx="32" cy="12" r="4" fill="#fff176" opacity="0.9"/>
    </svg>`;
  },

  tabInsectIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <path d="M6 30 Q20 10 34 30 Q20 38 6 30" fill="#aed581" stroke="#689f38" stroke-width="0.8"/>
      <path d="M20 30 L20 14" stroke="#558b2f" stroke-width="1.2" stroke-linecap="round"/>
      <ellipse cx="20" cy="22" rx="10" ry="7.5" fill="#ef5350"/>
      <path d="M20 16 L20 28" stroke="#b71c1c" stroke-width="0.9" opacity="0.55"/>
      <circle cx="15.5" cy="20" r="2" fill="#212121" opacity="0.75"/>
      <circle cx="24.5" cy="20" r="2" fill="#212121" opacity="0.75"/>
      <circle cx="17.5" cy="24.5" r="1.3" fill="#212121" opacity="0.65"/>
      <circle cx="22.5" cy="24.5" r="1.3" fill="#212121" opacity="0.65"/>
      <circle cx="20" cy="13" r="4.5" fill="#212121"/>
      <circle cx="18.2" cy="12.2" r="0.9" fill="#fff" opacity="0.35"/>
      <path d="M17 10.5 Q14 5.5 11.5 3" fill="none" stroke="#212121" stroke-width="0.9" stroke-linecap="round"/>
      <path d="M23 10.5 Q26 5.5 28.5 3" fill="none" stroke="#212121" stroke-width="0.9" stroke-linecap="round"/>
      <circle cx="11.5" cy="3" r="1.1" fill="#212121"/>
      <circle cx="28.5" cy="3" r="1.1" fill="#212121"/>
    </svg>`;
  },

  insectSign() {
    return `<svg viewBox="0 0 120 120" class="art-insect-sign" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="#f1f8e9" stroke="#aed581" stroke-width="3"/>
      <circle cx="60" cy="60" r="46" fill="none" stroke="#c5e1a5" stroke-width="1.5" stroke-dasharray="4 5"/>
      <path d="M22 78 Q60 38 98 78 Q60 92 22 78" fill="#81c784" opacity="0.85"/>
      <path d="M60 78 L60 42" stroke="#388e3c" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="60" cy="58" rx="22" ry="16" fill="#ef5350"/>
      <path d="M60 44 L60 72" stroke="#c62828" stroke-width="1.5" opacity="0.5"/>
      <circle cx="48" cy="54" r="4" fill="#212121" opacity="0.7"/>
      <circle cx="72" cy="54" r="4" fill="#212121" opacity="0.7"/>
      <circle cx="52" cy="62" r="2.8" fill="#212121" opacity="0.6"/>
      <circle cx="68" cy="62" r="2.8" fill="#212121" opacity="0.6"/>
      <circle cx="60" cy="38" r="10" fill="#212121"/>
      <path d="M52 34 Q44 22 38 14" fill="none" stroke="#212121" stroke-width="2" stroke-linecap="round"/>
      <path d="M68 34 Q76 22 82 14" fill="none" stroke="#212121" stroke-width="2" stroke-linecap="round"/>
      <circle cx="38" cy="14" r="3" fill="#212121"/>
      <circle cx="82" cy="14" r="3" fill="#212121"/>
      <ellipse cx="34" cy="58" rx="10" ry="6" fill="#ffcdd2" opacity="0.55" transform="rotate(-18 34 58)"/>
      <ellipse cx="86" cy="58" rx="10" ry="6" fill="#ffcdd2" opacity="0.55" transform="rotate(18 86 58)"/>
    </svg>`;
  },

  emptyHabitatSlot() {
    return `<svg viewBox="0 0 64 64" class="art-svg" aria-hidden="true">
      <ellipse cx="32" cy="54" rx="24" ry="6" fill="#8d6e63" opacity="0.25"/>
      <rect x="14" y="48" width="36" height="8" rx="3" fill="#a1887f" opacity="0.45"/>
      <path d="M20 52 L44 52" stroke="#6d4c41" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>
    </svg>`;
  },

  habitatLeaf() {
    return GardenArt.branchSprig('left', 'leaf');
  },

  habitatBranch() {
    return GardenArt.branchSprig('left', 'branch');
  },

  branchSprig(edge, habitat, insect) {
    const twig = habitat === 'branch';
    const stemW = twig ? 3.2 : 4.5;
    const leaves = twig
      ? `<path d="M26 34 Q20 26 24 22 Q32 30 26 34" fill="#aed581"/>
         <path d="M44 26 Q38 18 44 14 Q52 22 44 26" fill="#81c784"/>
         <path d="M62 18 Q56 10 62 7 Q70 14 62 18" fill="#c5e1a5"/>
         <path d="M78 12 Q72 6 78 4 Q86 10 78 12" fill="#aed581"/>`
      : `<path d="M22 36 Q10 24 16 14 Q30 30 22 36" fill="#43a047"/>
         <path d="M34 30 Q20 16 28 8 Q44 26 34 30" fill="#66bb6a"/>
         <path d="M48 24 Q36 10 46 4 Q60 20 48 24" fill="#2e7d32"/>
         <path d="M62 18 Q52 6 60 2 Q74 14 62 18" fill="#81c784"/>
         <path d="M76 12 Q68 4 74 2 Q84 8 76 12" fill="#aed581"/>`;
    const bug = insect ? GardenArt.insectOnBranch(insect, edge) : '';

    if (edge === 'bottom') {
      return `<svg viewBox="0 0 72 100" class="art-branch-svg" aria-hidden="true">
        <path d="M36 100 Q38 78 34 56 Q28 34 24 16 Q22 8 26 2" stroke="#5d4037" stroke-width="${stemW}" fill="none" stroke-linecap="round"/>
        ${twig
          ? `<path d="M32 72 Q26 66 30 62 Q38 68 32 72" fill="#aed581"/>
             <path d="M28 48 Q22 42 26 38 Q34 44 28 48" fill="#81c784"/>
             <path d="M26 28 Q20 22 24 18 Q32 24 26 28" fill="#c5e1a5"/>`
          : `<path d="M34 70 Q24 58 30 50 Q42 64 34 70" fill="#66bb6a"/>
             <path d="M30 50 Q18 36 26 28 Q40 44 30 50" fill="#43a047"/>
             <path d="M27 30 Q16 18 24 12 Q36 26 27 30" fill="#2e7d32"/>`}
        ${bug}
      </svg>`;
    }

    const flip = edge === 'right' ? ' transform="scale(-1,1) translate(-108,0)"' : '';
    return `<svg viewBox="0 0 108 72" class="art-branch-svg"${flip} aria-hidden="true">
      <path d="M0 36 Q18 35 32 30 Q52 22 72 14 Q88 8 104 4" stroke="#6d4c41" stroke-width="${stemW + 0.5}" fill="none" stroke-linecap="round" opacity="0.35"/>
      <path d="M0 36 Q20 34 36 28 Q56 20 76 12 Q92 7 106 2" stroke="#5d4037" stroke-width="${stemW}" fill="none" stroke-linecap="round"/>
      ${leaves}
      ${bug}
    </svg>`;
  },

  habitatIcon(type) {
    return GardenArt.branchSprig('left', type === 'branch' ? 'branch' : 'leaf');
  },

  insectLadybug() {
    return `<svg viewBox="0 0 32 32" class="art-insect-mini anim-ladybug" aria-hidden="true">
      <ellipse cx="16" cy="18" rx="9" ry="6.5" fill="#e53935"/>
      <path d="M16 12 L16 24" stroke="#b71c1c" stroke-width="0.8" opacity="0.5"/>
      <circle cx="12.5" cy="17" r="1.5" fill="#212121" opacity="0.7"/>
      <circle cx="19.5" cy="17" r="1.5" fill="#212121" opacity="0.7"/>
      <circle cx="16" cy="11" r="3.5" fill="#212121"/>
    </svg>`;
  },

  insectButterfly() {
    return `<svg viewBox="0 0 32 32" class="art-insect-mini anim-butterfly" aria-hidden="true">
      <ellipse class="bf-wing bf-wing-l" cx="10" cy="16" rx="8" ry="10" fill="#ce93d8" opacity="0.9"/>
      <ellipse class="bf-wing bf-wing-r" cx="22" cy="16" rx="8" ry="10" fill="#ba68c8" opacity="0.9"/>
      <ellipse cx="16" cy="18" rx="2" ry="7" fill="#4a148c"/>
      <circle cx="16" cy="10" r="2" fill="#212121"/>
      <path d="M15 8 Q13 4 11 3" fill="none" stroke="#212121" stroke-width="0.8"/>
      <path d="M17 8 Q19 4 21 3" fill="none" stroke="#212121" stroke-width="0.8"/>
    </svg>`;
  },

  insectCaterpillar() {
    return `<svg viewBox="0 0 32 32" class="art-insect-mini anim-caterpillar" aria-hidden="true">
      <circle cx="8" cy="18" r="4" fill="#7cb342"/>
      <circle cx="14" cy="19" r="4.5" fill="#8bc34a"/>
      <circle cx="20" cy="18" r="4.5" fill="#9ccc65"/>
      <circle cx="26" cy="17" r="4" fill="#aed581"/>
      <circle cx="27" cy="14" r="2.5" fill="#33691e"/>
      <circle cx="26.5" cy="13.5" r="0.8" fill="#fff"/>
    </svg>`;
  },

  insectBee() {
    return `<svg viewBox="0 0 32 32" class="art-insect-mini anim-bee" aria-hidden="true">
      <ellipse class="bee-wing bee-wing-l" cx="8" cy="16" rx="5" ry="3" fill="#fff" opacity="0.7"/>
      <ellipse class="bee-wing bee-wing-r" cx="24" cy="16" rx="5" ry="3" fill="#fff" opacity="0.7"/>
      <ellipse cx="16" cy="18" rx="10" ry="6" fill="#ffca28"/>
      <path d="M8 18 H24" stroke="#212121" stroke-width="2"/>
      <path d="M11 15 H21" stroke="#212121" stroke-width="1.5"/>
      <path d="M11 21 H21" stroke="#212121" stroke-width="1.5"/>
      <circle cx="16" cy="11" r="3" fill="#212121"/>
    </svg>`;
  },

  insectOnBranch(species, edge) {
    const body = species === 'butterfly' ? `
      <g class="anim-butterfly">
        <ellipse class="bf-wing bf-wing-l" cx="10" cy="16" rx="8" ry="10" fill="#ce93d8" opacity="0.92"/>
        <ellipse class="bf-wing bf-wing-r" cx="22" cy="16" rx="8" ry="10" fill="#ba68c8" opacity="0.92"/>
        <ellipse cx="16" cy="18" rx="2" ry="7" fill="#4a148c"/>
        <circle cx="16" cy="10" r="2" fill="#212121"/>
      </g>`
      : species === 'bee' ? `
      <g class="anim-bee">
        <ellipse class="bee-wing bee-wing-l" cx="8" cy="16" rx="5" ry="3" fill="#fff" opacity="0.75"/>
        <ellipse class="bee-wing bee-wing-r" cx="24" cy="16" rx="5" ry="3" fill="#fff" opacity="0.75"/>
        <ellipse cx="16" cy="18" rx="10" ry="6" fill="#ffca28"/>
        <path d="M8 18 H24" stroke="#212121" stroke-width="2"/>
        <path d="M11 15 H21" stroke="#212121" stroke-width="1.5"/>
        <path d="M11 21 H21" stroke="#212121" stroke-width="1.5"/>
        <circle cx="16" cy="11" r="3" fill="#212121"/>
      </g>`
      : species === 'caterpillar' ? `
      <g class="anim-caterpillar">
        <circle cx="8" cy="18" r="4" fill="#7cb342"/>
        <circle cx="14" cy="19" r="4.5" fill="#8bc34a"/>
        <circle cx="20" cy="18" r="4.5" fill="#9ccc65"/>
        <circle cx="26" cy="17" r="4" fill="#aed581"/>
        <circle cx="27" cy="14" r="2.5" fill="#33691e"/>
      </g>`
      : `<g class="anim-ladybug">
        <ellipse cx="16" cy="18" rx="9" ry="6.5" fill="#e53935"/>
        <circle cx="12.5" cy="17" r="1.5" fill="#212121" opacity="0.7"/>
        <circle cx="19.5" cy="17" r="1.5" fill="#212121" opacity="0.7"/>
        <circle cx="16" cy="11" r="3.5" fill="#212121"/>
      </g>`;
    const pos = edge === 'bottom' ? 'translate(12, -2)' : 'translate(72, -6)';
    return `<g class="insect-on-branch insect-${species}" transform="${pos}">${body}</g>`;
  },

  insectSvg(species) {
    if (species === 'butterfly') return GardenArt.insectButterfly();
    if (species === 'caterpillar') return GardenArt.insectCaterpillar();
    if (species === 'bee') return GardenArt.insectBee();
    return GardenArt.insectLadybug();
  },

  insectPatchBg() {
    return `<svg viewBox="0 0 400 240" class="art-patch-bg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="240" fill="url(#patchGrad)"/>
      <defs>
        <linearGradient id="patchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e8f5e9"/>
          <stop offset="55%" stop-color="#c5e1a5"/>
          <stop offset="100%" stop-color="#aed581"/>
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="200" rx="90" ry="28" fill="#8bc34a" opacity="0.25"/>
      <ellipse cx="320" cy="210" rx="100" ry="30" fill="#7cb342" opacity="0.22"/>
      <g opacity="0.18">
        <path d="M30 180 Q50 140 70 175 Q50 190 30 180" fill="#66bb6a"/>
        <path d="M100 190 Q120 150 140 185 Q120 200 100 190" fill="#81c784"/>
        <path d="M170 185 Q195 145 220 180 Q195 198 170 185" fill="#4caf50"/>
        <path d="M250 188 Q275 148 300 183 Q275 200 250 188" fill="#66bb6a"/>
        <path d="M330 182 Q355 142 380 178 Q355 195 330 182" fill="#81c784"/>
        <path d="M55 120 Q75 90 95 125 Q75 138 55 120" fill="#aed581"/>
        <path d="M300 115 Q320 85 340 120 Q320 133 300 115" fill="#aed581"/>
      </g>
    </svg>`;
  },

  tabBugcatchIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <ellipse cx="20" cy="24" rx="12" ry="8" fill="#e53935"/>
      <circle cx="20" cy="16" r="6" fill="#212121"/>
      <circle cx="17" cy="23" r="1.5" fill="#212121" opacity="0.6"/>
      <circle cx="23" cy="23" r="1.5" fill="#212121" opacity="0.6"/>
      <path d="M8 18 L14 20" stroke="#689f38" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M32 18 L26 20" stroke="#689f38" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  },

  bugcatchFieldScene() {
    const grass = [];
    const shades = ['#33691e', '#558b2f', '#689f38', '#7cb342', '#8bc34a', '#9ccc65'];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 16; col++) {
        const x = col * 25 + 6 + (row % 2) * 12;
        const baseY = 168 + row * 7 + (col % 4);
        const h = 10 + ((row * 13 + col * 9) % 18);
        const c = shades[(row + col) % shades.length];
        const tilt = ((row * 3 + col * 5) % 9) - 4;
        grass.push(`<line x1="${x}" y1="${baseY}" x2="${x + tilt}" y2="${baseY - h}" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`);
        grass.push(`<line x1="${x + 2.5}" y1="${baseY}" x2="${x + 2.5 + tilt * 0.7}" y2="${baseY - h * 0.9}" stroke="${c}" stroke-width="1.4" stroke-linecap="round" opacity="0.82"/>`);
        if (col % 3 === 0) {
          grass.push(`<line x1="${x - 1.5}" y1="${baseY}" x2="${x - 1.5 + tilt * 0.5}" y2="${baseY - h * 0.75}" stroke="${c}" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/>`);
        }
      }
    }
    return `<svg viewBox="0 0 400 220" class="art-bugcatch-field" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bugcatchSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e1f5fe"/>
          <stop offset="100%" stop-color="#e8f5e9"/>
        </linearGradient>
        <linearGradient id="bugcatchSoil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dcedc8"/>
          <stop offset="100%" stop-color="#aed581"/>
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#bugcatchSky)"/>
      <rect y="112" width="400" height="108" fill="url(#bugcatchSoil)"/>
      <ellipse cx="200" cy="118" rx="220" ry="18" fill="#c5e1a5" opacity="0.55"/>
      ${grass.join('')}
    </svg>`;
  },

  tabSeedshopIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <path d="M8 28 L20 12 L32 28 Z" fill="#fff8e1" stroke="#f9a825" stroke-width="1"/>
      <rect x="12" y="28" width="16" height="8" rx="1" fill="#8d6e63"/>
      <circle cx="16" cy="22" r="3" fill="#ec407a"/>
      <circle cx="24" cy="22" r="3" fill="#ffeb3b"/>
    </svg>`;
  },

  tabBirdIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <path d="M8 30 L20 10 L32 30" fill="none" stroke="#8d6e63" stroke-width="2"/>
      <circle cx="20" cy="12" r="2" fill="#8d6e63"/>
      <ellipse cx="26" cy="22" rx="7" ry="5" fill="#29b6f6"/>
      <circle cx="29" cy="21" r="1.2" fill="#212121"/>
      <path d="M33 21 L37 20 L33 23 Z" fill="#ffb74d"/>
    </svg>`;
  },

  tabRainIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <path d="M6 22 Q20 10 34 22" fill="none" stroke="#78909c" stroke-width="2"/>
      <path d="M8 26 L10 32 M16 26 L18 32 M24 26 L26 32 M30 26 L32 32" stroke="#4fc3f7" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="10" y="24" width="20" height="3" rx="1" fill="#90a4ae"/>
    </svg>`;
  },

  tabFruitshopIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <rect x="8" y="14" width="24" height="18" rx="4" fill="#ffccbc" stroke="#ff8a65" stroke-width="1.5"/>
      <circle cx="16" cy="22" r="4" fill="#e53935"/>
      <circle cx="24" cy="20" r="3.5" fill="#3949ab"/>
      <ellipse cx="20" cy="26" rx="3" ry="3.5" fill="#ef5350"/>
    </svg>`;
  },

  tabCompostIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <rect x="10" y="18" width="20" height="14" rx="3" fill="#6d4c41"/>
      <ellipse cx="20" cy="18" rx="12" ry="5" fill="#8d6e63"/>
      <path d="M14 14 Q20 8 26 14" fill="none" stroke="#558b2f" stroke-width="2"/>
    </svg>`;
  },

  tabMushroomIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <ellipse cx="20" cy="22" rx="11" ry="7" fill="#e53935"/>
      <rect x="17" y="22" width="6" height="10" rx="2" fill="#efebe9"/>
      <circle cx="16" cy="20" r="1.5" fill="#ffcdd2"/>
      <circle cx="22" cy="21" r="1.2" fill="#ffcdd2"/>
    </svg>`;
  },

  tabWellIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <rect x="14" y="16" width="12" height="16" rx="2" fill="#90a4ae"/>
      <path d="M12 16 H28" stroke="#607d8b" stroke-width="2"/>
      <path d="M20 22 C16 26 16 30 20 32 C24 30 24 26 20 22" fill="#4fc3f7"/>
    </svg>`;
  },

  tabManorIcon() {
    return `<svg viewBox="0 0 40 40" class="art-tab-icon" aria-hidden="true">
      <path d="M8 22 L20 10 L32 22" fill="#8d6e63"/>
      <rect x="11" y="22" width="18" height="12" rx="1" fill="#efebe9" stroke="#6d4c41" stroke-width="1.2"/>
      <rect x="17" y="26" width="6" height="8" fill="#5d4037"/>
      <rect x="13" y="24" width="4" height="4" fill="#81d4fa"/>
      <rect x="23" y="24" width="4" height="4" fill="#81d4fa"/>
      <rect x="6" y="34" width="28" height="2" fill="#558b2f"/>
    </svg>`;
  },

  compostScene(points) {
    const h = Math.min(48, 12 + points * 0.34);
    return `<svg viewBox="0 0 400 120" class="art-compost-scene" aria-hidden="true">
      <rect width="400" height="120" fill="#efebe9"/>
      <rect x="120" y="${72 - h}" width="160" height="${h + 20}" rx="8" fill="#6d4c41"/>
      <ellipse cx="200" cy="${72 - h}" rx="88" ry="18" fill="#8d6e63"/>
      <text x="200" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="#5d4037">堆肥角</text>
    </svg>`;
  },

  mushroomScene() {
    return `<svg viewBox="0 0 400 120" class="art-mushroom-scene" aria-hidden="true">
      <rect width="400" height="120" fill="#3e2723"/>
      <rect x="0" y="80" width="400" height="40" fill="#5d4037"/>
      <ellipse cx="100" cy="70" rx="22" ry="14" fill="#8d6e63" opacity="0.5"/>
      <ellipse cx="300" cy="75" rx="18" ry="12" fill="#6d4c41" opacity="0.45"/>
      <text x="200" y="32" text-anchor="middle" font-size="14" font-weight="700" fill="#efebe9">蘑菇角 · 阴凉</text>
    </svg>`;
  },

  mushroomPlotSvg(plot) {
    if (!plot.type || plot.stage <= 0) {
      return `<svg viewBox="0 0 48 48" class="art-mushroom-plot"><circle cx="24" cy="28" r="6" fill="none" stroke="#bcaaa4" stroke-width="2" stroke-dasharray="3 2"/></svg>`;
    }
    const cap = plot.stage >= 3 ? '#e53935' : plot.stage >= 2 ? '#ef5350' : '#ff8a65';
    const h = 8 + plot.stage * 4;
    return `<svg viewBox="0 0 48 48" class="art-mushroom-plot">
      <ellipse cx="24" cy="${30 - h * 0.3}" rx="${10 + plot.stage * 2}" ry="${6 + plot.stage}" fill="${cap}"/>
      <rect x="21" y="${30 - h * 0.2}" width="6" height="${10 + plot.stage * 2}" rx="2" fill="#efebe9"/>
    </svg>`;
  },

  wellScene(level) {
    const stones = level >= 1 ? 1 : 0;
    const roof = level >= 2;
    return `<svg viewBox="0 0 400 120" class="art-well-scene" aria-hidden="true">
      <rect width="400" height="120" fill="#e1f5fe"/>
      <rect x="165" y="45" width="70" height="55" rx="4" fill="#90a4ae"/>
      <rect x="155" y="40" width="90" height="8" rx="2" fill="#78909c"/>
      ${roof ? '<path d="M150 40 L200 18 L250 40" fill="#607d8b"/>' : ''}
      ${stones ? '<circle cx="140" cy="95" r="8" fill="#b0bec5"/><circle cx="260" cy="92" r="6" fill="#b0bec5"/>' : ''}
      <ellipse cx="200" cy="72" rx="18" ry="10" fill="#4fc3f7"/>
      <text x="200" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="#0277bd">小井</text>
    </svg>`;
  },

  manorButtonPreview(level = 0) {
    const lv = Math.max(0, Math.min(4, level | 0));
    const roof = lv >= 2;
    return `<svg viewBox="0 0 36 38" class="art-manor-btn-preview" aria-hidden="true">
      <rect width="36" height="38" fill="#c8e6c9"/>
      <rect x="0" y="28" width="36" height="10" fill="#a5d6a7"/>
      <rect x="11" y="16" width="14" height="12" fill="#efebe9" stroke="#6d4c41" stroke-width="1"/>
      <path d="M9 16 L18 8 L27 16" fill="#8d6e63"/>
      ${roof ? '<rect x="24" y="10" width="5" height="8" fill="#bcaaa4"/>' : ''}
      <ellipse cx="10" cy="30" rx="4" ry="2.5" fill="#66bb6a"/>
      <ellipse cx="26" cy="31" rx="5" ry="3" fill="#4fc3f7"/>
    </svg>`;
  },

  manorScene(flags = {}, level = 0) {
    const lv = Math.max(0, Math.min(4, level | 0));
    const houseW = 88 + lv * 12;
    const houseH = 52 + lv * 8;
    const hx = 200 - houseW / 2;
    const groundY = 210;
    const hy = groundY - houseH;
    const fence = lv >= 1;
    const gate = lv >= 2;
    const tower = lv >= 3;
    const banner = lv >= 4;
    return `<svg viewBox="0 0 400 320" class="art-manor-scene" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="manorSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e1f5fe"/>
          <stop offset="100%" stop-color="#c8e6c9"/>
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill="url(#manorSky)"/>
      <ellipse cx="340" cy="52" rx="28" ry="28" fill="#fff9c4" opacity="0.85"/>
      <ellipse cx="60" cy="70" rx="36" ry="14" fill="#fff" opacity="0.55"/>
      <ellipse cx="120" cy="58" rx="28" ry="11" fill="#fff" opacity="0.45"/>
      <rect x="0" y="208" width="400" height="112" fill="#a5d6a7"/>
      <path d="M0 208 Q100 188 200 208 T400 208 L400 320 L0 320 Z" fill="#81c784"/>
      ${fence ? '<rect x="20" y="206" width="360" height="5" rx="2" fill="#8d6e63"/>' : ''}
      ${gate ? '<path d="M184 206 L200 188 L216 206" fill="#6d4c41"/>' : ''}
      ${tower ? '<rect x="268" y="78" width="22" height="42" fill="#bcaaa4"/><path d="M262 78 L279 52 L296 78" fill="#8d6e63"/>' : ''}
      ${banner ? '<rect x="158" y="42" width="84" height="16" rx="3" fill="#ef5350"/><text x="200" y="54" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">花鱼天庄</text>' : ''}
      <ellipse cx="200" cy="${groundY + 2}" rx="${houseW / 2 + 10}" ry="7" fill="#689f38" opacity="0.45"/>
      <rect x="${hx}" y="${hy}" width="${houseW}" height="${houseH}" rx="4" fill="#efebe9" stroke="#6d4c41" stroke-width="2"/>
      <path d="M${hx - 10} ${hy} L${200} ${hy - 28 - lv * 3} L${hx + houseW + 10} ${hy}" fill="#8d6e63"/>
      <rect x="${200 - 10}" y="${groundY - 22}" width="20" height="22" fill="#5d4037"/>
      <ellipse cx="200" cy="248" rx="56" ry="16" fill="#4fc3f7" opacity="0.75"/>
    </svg>`;
  },

  fruitIcon(type) {
    if (type === 'blueberry') {
      return `<svg viewBox="0 0 36 36" class="art-fruit-icon" aria-hidden="true"><circle cx="18" cy="18" r="10" fill="#3949ab"/><circle cx="14" cy="16" r="3" fill="#5c6bc0"/><circle cx="22" cy="17" r="2.5" fill="#283593"/></svg>`;
    }
    if (type === 'strawberry') {
      return `<svg viewBox="0 0 36 36" class="art-fruit-icon" aria-hidden="true"><path d="M18 6 Q14 10 12 16 Q18 14 24 16 Q22 10 18 6" fill="#43a047"/><ellipse cx="18" cy="22" rx="9" ry="10" fill="#e53935"/><circle cx="14" cy="20" r="1" fill="#ffcdd2"/></svg>`;
    }
    if (type === 'tomato') {
      return `<svg viewBox="0 0 36 36" class="art-fruit-icon" aria-hidden="true"><circle cx="18" cy="20" r="11" fill="#e53935"/><path d="M18 10 Q16 8 18 6 Q20 8 18 10" fill="#66bb6a"/></svg>`;
    }
    if (type === 'apple') {
      return `<svg viewBox="0 0 36 36" class="art-fruit-icon" aria-hidden="true"><circle cx="18" cy="20" r="11" fill="#e53935"/><path d="M18 10 L18 6" stroke="#5d4037" stroke-width="2"/><path d="M18 8 Q21 6 22 8" fill="none" stroke="#558b2f" stroke-width="1.5"/></svg>`;
    }
    return `<svg viewBox="0 0 36 36" class="art-fruit-icon" aria-hidden="true"><circle cx="18" cy="18" r="10" fill="#ffb74d"/></svg>`;
  },

  fruitshopScene() {
    return `<svg viewBox="0 0 400 160" class="art-fruitshop-scene" aria-hidden="true">
      <rect width="400" height="160" fill="#fff3e0"/>
      <rect x="50" y="50" width="300" height="70" rx="8" fill="#ffe0b2" stroke="#ff9800" stroke-width="2"/>
      <rect x="70" y="92" width="260" height="16" rx="3" fill="#8d6e63"/>
      <circle cx="110" cy="72" r="10" fill="#3949ab"/>
      <ellipse cx="160" cy="74" rx="9" ry="10" fill="#e53935"/>
      <circle cx="210" cy="72" r="10" fill="#ef5350"/>
      <circle cx="260" cy="74" r="10" fill="#c62828"/>
      <text x="200" y="38" text-anchor="middle" font-size="14" font-weight="700" fill="#e65100">水果铺</text>
    </svg>`;
  },

  seedshopScene() {
    return `<svg viewBox="0 0 400 160" class="art-seedshop-scene" aria-hidden="true">
      <rect width="400" height="160" fill="#fff8e1"/>
      <rect x="30" y="48" width="340" height="78" rx="8" fill="#fffde7" stroke="#ffe082" stroke-width="2"/>
      <rect x="50" y="98" width="300" height="14" rx="2" fill="#a1887f"/>
      <circle cx="70" cy="72" r="8" fill="#9575cd"/>
      <circle cx="110" cy="72" r="8" fill="#ec407a"/>
      <circle cx="150" cy="72" r="8" fill="#c62828"/>
      <circle cx="190" cy="72" r="8" fill="#ffeb3b"/>
      <ellipse cx="220" cy="72" rx="8" ry="9" fill="#2e7d32"/>
      <path d="M248 56 L242 68 L254 68 Z" fill="#00695c"/>
      <path d="M248 62 L236 76 L260 76 Z" fill="#00897b"/>
      <rect x="262" y="64" width="5" height="16" rx="2" fill="#689f38"/>
      <rect x="270" y="62" width="5" height="18" rx="2" fill="#558b2f"/>
      <circle cx="310" cy="70" r="9" fill="#f48fb1"/>
      <circle cx="350" cy="72" r="8" fill="#f06292"/>
      <text x="200" y="36" text-anchor="middle" font-size="14" font-weight="700" fill="#6d4c41">种子铺</text>
    </svg>`;
  },

  birdPerchScene(hasGift) {
    return `<svg viewBox="0 0 400 160" class="art-bird-scene" aria-hidden="true">
      <rect width="400" height="160" fill="#e3f2fd"/>
      <path d="M8 120 Q200 90 392 120" fill="#81c784" opacity="0.35"/>
      <path d="M120 120 L120 60" stroke="#8d6e63" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 70 L160 70" stroke="#6d4c41" stroke-width="4" stroke-linecap="round"/>
      <circle cx="120" cy="56" r="4" fill="#6d4c41"/>
      ${hasGift ? '<circle cx="200" cy="100" r="10" fill="#ffd54f" opacity="0.9"/>' : ''}
    </svg>`;
  },

  birdGuest() {
    return `<svg viewBox="0 0 56 48" class="art-bird-guest" aria-hidden="true">
      <ellipse cx="28" cy="28" rx="14" ry="11" fill="#29b6f6"/>
      <circle cx="36" cy="22" r="9" fill="#4fc3f7"/>
      <circle cx="39" cy="21" r="2" fill="#fff"/>
      <circle cx="40" cy="20" r="0.8" fill="#fff"/>
      <circle cx="39" cy="21" r="1.1" fill="#212121"/>
      <path d="M44 21 L50 19 L44 24 Z" fill="#ffb74d"/>
      <ellipse cx="18" cy="26" rx="7" ry="4" fill="#0288d1" transform="rotate(-20 18 26)"/>
    </svg>`;
  },

  rainShelterScene(level, raining) {
    const lv = Math.min(6, Math.max(0, level | 0));
    const sky = raining ? '#b3e5fc' : '#e1f5fe';
    const drops = raining
      ? '<path d="M40 70 L42 82 M80 65 L82 77 M120 72 L122 84 M160 68 L162 80 M200 74 L202 86 M240 66 L242 78 M280 72 L282 84 M320 68 L322 80 M360 74 L362 86" stroke="#4fc3f7" stroke-width="1.5" stroke-linecap="round" opacity="0.75"/>'
      : '';
    let shelter = '';
    if (lv >= 1) {
      shelter += '<path d="M110 130 L110 78 M290 130 L290 78" stroke="#8d6e63" stroke-width="3.5" stroke-linecap="round"/>';
      shelter += '<path d="M95 82 L305 82 L290 98 L110 98 Z" fill="#90a4ae" opacity="0.9"/>';
    }
    if (lv >= 2) {
      shelter += '<path d="M88 98 L88 118 L312 118 L312 98" fill="none" stroke="#78909c" stroke-width="2"/>';
    }
    if (lv >= 3) {
      shelter += '<path d="M70 130 L70 92 M330 130 L330 92" stroke="#6d4c41" stroke-width="3" stroke-linecap="round"/>';
      shelter += '<path d="M60 94 L340 94 L325 108 L75 108 Z" fill="#78909c" opacity="0.55"/>';
    }
    if (lv >= 4) {
      shelter += '<path d="M55 108 L55 128 M345 128 L345 108" stroke="#5d4037" stroke-width="2.5"/>';
      shelter += '<rect x="170" y="108" width="60" height="22" rx="3" fill="#8d6e63" opacity="0.35"/>';
    }
    if (lv >= 5) {
      shelter += '<path d="M50 130 L50 86 M350 130 L350 86" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>';
      shelter += '<path d="M42 88 L358 88 L340 72 L60 72 Z" fill="#607d8b" opacity="0.85"/>';
      shelter += '<path d="M60 72 L200 58 L340 72" fill="none" stroke="#cfd8dc" stroke-width="2"/>';
    }
    if (lv >= 6) {
      shelter += '<circle cx="200" cy="52" r="8" fill="#ffd54f" opacity="0.85"/>';
      shelter += '<path d="M130 130 Q200 118 270 130" fill="none" stroke="#66bb6a" stroke-width="2"/>';
      shelter += '<circle cx="150" cy="124" r="4" fill="#81c784"/><circle cx="200" cy="120" r="4" fill="#aed581"/><circle cx="250" cy="124" r="4" fill="#81c784"/>';
    }
    const badge = lv > 0
      ? `<text x="200" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="#455a64">${lv >= 6 ? '花鱼雨苑' : `雨棚 Lv.${lv}`}</text>`
      : '';
    return `<svg viewBox="0 0 400 160" class="art-rain-scene" aria-hidden="true">
      <rect width="400" height="160" fill="${sky}"/>
      ${badge}
      ${shelter}
      ${drops}
      <rect x="0" y="130" width="400" height="30" fill="#81c784"/>
    </svg>`;
  },
};
