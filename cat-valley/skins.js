/**
 * 妙脆角猫 — 扭蛋皮肤 + 谷季 S 级皮肤
 */
const GACHA_SKIN_IDS = ['mitang', 'yuesha', 'tuanzi', 'hugu', 'qinggua', 'mowen'];

function _gachaSkin(id, name, palette, kind = 'classic', extra = {}) {
  return { id, name, kind, ...palette, ...extra };
}

const SEASON_SKIN_IDS = [
  'yinjiao', 'naiwa', 'daodun', 'feidudu',
  'xiguang', 'songwu', 'luojin', 'yunzhao', 'shuanger', 'hupo',
  'xingzhui', 'zhuying', 'wanxia', 'liuli', 'chenlu', 'muxue',
  'yanbo', 'huateng', 'liegu', 'hongqiao', 'jingquan', 'cuijiao', 'shenlin', 'yuanqiu',
];

function _seasonSkin(id, name, palette, kind = 'classic', extra = {}) {
  return {
    id,
    name,
    tier: 'S',
    seasonOnly: true,
    kind,
    ...palette,
    ...extra,
  };
}

const CatSkins = {
  defs: {
    default: {
      id: 'default',
      name: '原色',
      bodyHi: '#ffffff',
      bodyMid: '#f7f7f7',
      bodyLo: '#ececec',
      capHi: '#8a8a8a',
      capLo: '#b0b0b0',
      stripe: '#6a6a6a',
      ear: '#f0a020',
      blush: '#f0a0a0',
      eye: '#111',
      kind: 'classic',
    },
    naiwa: _seasonSkin('naiwa', '奶蛙', {
      bodyHi: '#ffe880', bodyMid: '#f0c830', bodyLo: '#d8a818',
      capHi: '#c89008', capLo: '#e0b028', stripe: '#a87808',
      ear: '#f0a820', blush: '#ffb890', eye: '#3a2808',
    }, 'frog'),
    yinjiao: _seasonSkin('yinjiao', '银角', {
      bodyHi: '#ffffff', bodyMid: '#f2f4f8', bodyLo: '#e0e4ea',
      capHi: '#a8b0ba', capLo: '#c8d0d8', stripe: '#889098',
      ear: '#d0d8e0', earHi: '#f8fafc', earLo: '#98a4b0',
      blush: '#e8c0d0', eye: '#223040',
    }, 'silver'),
    daodun: _seasonSkin('daodun', '刀盾', {
      bodyHi: '#ffffff', bodyMid: '#f8f4f0', bodyLo: '#ece4dc',
      capHi: '#8a6848', capLo: '#a88058', stripe: '#6a5038',
      ear: '#c89858', blush: '#e8c0a8', eye: '#3a2818',
    }, 'shield'),
    feidudu: _seasonSkin('feidudu', '肥嘟嘟', {
      bodyHi: '#fffce8', bodyMid: '#fff4c8', bodyLo: '#ffeaa0',
      capHi: '#f5e090', capLo: '#ffe8b0', stripe: '#d8c878',
      ear: '#f0c848', blush: '#ffd898', eye: '#403818',
    }, 'chubby', { rxMul: 1.14, ryMul: 1.22 }),
    xiguang: _seasonSkin('xiguang', '溪光', {
      bodyHi: '#e8f8ff', bodyMid: '#b8e8f8', bodyLo: '#88cce8',
      capHi: '#5098b8', capLo: '#78b8d8', stripe: '#4080a0',
      ear: '#70c8e8', blush: '#a8d8f0', eye: '#184858',
    }, 'classic'),
    songwu: _seasonSkin('songwu', '松雾', {
      bodyHi: '#eef4ea', bodyMid: '#c8dcc0', bodyLo: '#a0c098',
      capHi: '#587848', capLo: '#789868', stripe: '#486838',
      ear: '#98b888', blush: '#c0d8b0', eye: '#283820',
    }, 'classic'),
    luojin: _seasonSkin('luojin', '落金', {
      bodyHi: '#fff8e0', bodyMid: '#f0d878', bodyLo: '#d8b040',
      capHi: '#b88820', capLo: '#d8a838', stripe: '#987018',
      ear: '#e8b830', blush: '#f0c878', eye: '#403008',
    }, 'classic'),
    yunzhao: _seasonSkin('yunzhao', '云爪', {
      bodyHi: '#f4f6fa', bodyMid: '#dce4f0', bodyLo: '#c0cce0',
      capHi: '#98a8c0', capLo: '#b8c4d8', stripe: '#7888a0',
      ear: '#c8d4e8', blush: '#dce8f4', eye: '#304058',
    }, 'silver'),
    shuanger: _seasonSkin('shuanger', '霜耳', {
      bodyHi: '#f0f8ff', bodyMid: '#d0e8f8', bodyLo: '#b0d0e8',
      capHi: '#7098b8', capLo: '#90b8d0', stripe: '#5880a0',
      ear: '#a8d0f0', blush: '#c8e0f8', eye: '#204060',
    }, 'silver'),
    hupo: _seasonSkin('hupo', '琥珀', {
      bodyHi: '#fff0d8', bodyMid: '#f0c080', bodyLo: '#d89848',
      capHi: '#b87028', capLo: '#d89048', stripe: '#985818',
      ear: '#e8a848', blush: '#f0c090', eye: '#482808',
    }, 'classic'),
    xingzhui: _seasonSkin('xingzhui', '星坠', {
      bodyHi: '#ece8ff', bodyMid: '#c8c0f0', bodyLo: '#a098d8',
      capHi: '#6860a8', capLo: '#8880c0', stripe: '#504878',
      ear: '#9890e0', blush: '#c0b8f0', eye: '#201840',
    }, 'frog'),
    zhuying: _seasonSkin('zhuying', '竹影', {
      bodyHi: '#ecf4e4', bodyMid: '#c0d8a8', bodyLo: '#98c080',
      capHi: '#508040', capLo: '#70a058', stripe: '#386030',
      ear: '#88b868', blush: '#b0d898', eye: '#203018',
    }, 'classic'),
    wanxia: _seasonSkin('wanxia', '晚霞', {
      bodyHi: '#ffe8e0', bodyMid: '#f0a898', bodyLo: '#d87868',
      capHi: '#b85040', capLo: '#d87060', stripe: '#984030',
      ear: '#e89080', blush: '#f0b0a8', eye: '#401810',
    }, 'classic'),
    liuli: _seasonSkin('liuli', '琉璃', {
      bodyHi: '#e8fff8', bodyMid: '#a8e8d8', bodyLo: '#78d0b8',
      capHi: '#40a088', capLo: '#60c0a0', stripe: '#288870',
      ear: '#80e0c8', blush: '#a8f0d8', eye: '#184838',
    }, 'classic'),
    chenlu: _seasonSkin('chenlu', '晨露', {
      bodyHi: '#f0fff4', bodyMid: '#c0ecd0', bodyLo: '#98d8b0',
      capHi: '#58a870', capLo: '#78c890', stripe: '#408858',
      ear: '#90e0a8', blush: '#b8f0c8', eye: '#204830',
    }, 'classic'),
    muxue: _seasonSkin('muxue', '暮雪', {
      bodyHi: '#f0f0f8', bodyMid: '#d0d0e8', bodyLo: '#b0b0d0',
      capHi: '#7070a0', capLo: '#9090b8', stripe: '#585880',
      ear: '#b0b0d8', blush: '#d0d0e8', eye: '#282840',
    }, 'silver'),
    yanbo: _seasonSkin('yanbo', '烟波', {
      bodyHi: '#eef0f4', bodyMid: '#c8d0dc', bodyLo: '#a8b4c4',
      capHi: '#687888', capLo: '#8898a8', stripe: '#506070',
      ear: '#a8b8c8', blush: '#c8d4e0', eye: '#283038',
    }, 'classic'),
    huateng: _seasonSkin('huateng', '花藤', {
      bodyHi: '#fff0f4', bodyMid: '#f0c0d0', bodyLo: '#d898b0',
      capHi: '#b86888', capLo: '#d888a0', stripe: '#985068',
      ear: '#e8a0b8', blush: '#f0c0d0', eye: '#401828',
    }, 'classic'),
    liegu: _seasonSkin('liegu', '裂谷', {
      bodyHi: '#f4ece4', bodyMid: '#d0b8a0', bodyLo: '#b09878',
      capHi: '#806848', capLo: '#a08868', stripe: '#685038',
      ear: '#c0a080', blush: '#d8c0a8', eye: '#382818',
    }, 'shield'),
    hongqiao: _seasonSkin('hongqiao', '虹桥', {
      bodyHi: '#fff0ff', bodyMid: '#f0c0f0', bodyLo: '#d898e0',
      capHi: '#b868c0', capLo: '#d888e0', stripe: '#9848a8',
      ear: '#e8a0f0', blush: '#f0c0f8', eye: '#401848',
    }, 'chubby', { rxMul: 1.08, ryMul: 1.12 }),
    jingquan: _seasonSkin('jingquan', '静泉', {
      bodyHi: '#e8f4ff', bodyMid: '#b0d4f0', bodyLo: '#88b8e0',
      capHi: '#4888c0', capLo: '#68a8d8', stripe: '#3070a0',
      ear: '#88c8f0', blush: '#b0dcf8', eye: '#183858',
    }, 'silver'),
    cuijiao: _seasonSkin('cuijiao', '脆角王', {
      bodyHi: '#fffce0', bodyMid: '#ffe878', bodyLo: '#f0c830',
      capHi: '#d8a010', capLo: '#f0c028', stripe: '#b88008',
      ear: '#f0a820', blush: '#ffe0a0', eye: '#403008',
    }, 'chubby', { rxMul: 1.1, ryMul: 1.15 }),
    shenlin: _seasonSkin('shenlin', '深林客', {
      bodyHi: '#e8f0e4', bodyMid: '#a8c098', bodyLo: '#789868',
      capHi: '#406030', capLo: '#588048', stripe: '#304820',
      ear: '#88a878', blush: '#b0c8a0', eye: '#182810',
    }, 'shield'),
    yuanqiu: _seasonSkin('yuanqiu', '远丘行', {
      bodyHi: '#f4f0ec', bodyMid: '#d8c8b8', bodyLo: '#b8a898',
      capHi: '#887868', capLo: '#a89888', stripe: '#685848',
      ear: '#c8b8a8', blush: '#e0d0c0', eye: '#383028',
    }, 'classic'),
    mitang: _gachaSkin('mitang', '蜜糖', {
      bodyHi: '#fff4e8', bodyMid: '#f0c8a0', bodyLo: '#d8a070',
      capHi: '#c87840', capLo: '#e09858', stripe: '#a86030',
      ear: '#f0a050', blush: '#f0b898', eye: '#402818',
    }, 'classic'),
    yuesha: _gachaSkin('yuesha', '月纱', {
      bodyHi: '#f8fafc', bodyMid: '#e0e8f4', bodyLo: '#c8d4e4',
      capHi: '#98a8c0', capLo: '#b8c8dc', stripe: '#7888a0',
      ear: '#d0dce8', earHi: '#ffffff', earLo: '#a0b0c0',
      blush: '#d8c8e8', eye: '#283848',
    }, 'silver'),
    tuanzi: _gachaSkin('tuanzi', '团子', {
      bodyHi: '#fffef0', bodyMid: '#fff0a8', bodyLo: '#f0d868',
      capHi: '#e8c840', capLo: '#ffe878', stripe: '#c8a820',
      ear: '#f0c830', blush: '#ffe8a0', eye: '#484018',
    }, 'chubby', { rxMul: 1.12, ryMul: 1.18 }),
    hugu: _gachaSkin('hugu', '护谷', {
      bodyHi: '#faf6f0', bodyMid: '#e8d8c0', bodyLo: '#d0b898',
      capHi: '#806040', capLo: '#a08058', stripe: '#604830',
      ear: '#c0a070', blush: '#e8d0b0', eye: '#382818',
    }, 'shield'),
    qinggua: _gachaSkin('qinggua', '青呱', {
      bodyHi: '#e8ffe0', bodyMid: '#a8e890', bodyLo: '#78c868',
      capHi: '#48a038', capLo: '#68c050', stripe: '#388028',
      ear: '#90e070', blush: '#b8f0a8', eye: '#204818',
    }, 'frog'),
    mowen: _gachaSkin('mowen', '墨纹', {
      bodyHi: '#ececec', bodyMid: '#b8b8b8', bodyLo: '#909090',
      capHi: '#585858', capLo: '#787878', stripe: '#404040',
      ear: '#a0a0a0', blush: '#c8a8a8', eye: '#181818',
    }, 'classic'),
  },

  get(id) {
    return this.defs[id] || this.defs.default;
  },

  isSeasonSkin(id) {
    return SEASON_SKIN_IDS.includes(id);
  },

  rollGacha() {
    return GACHA_SKIN_IDS[Math.floor(Math.random() * GACHA_SKIN_IDS.length)];
  },
};
