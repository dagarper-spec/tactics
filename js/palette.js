// Paleta aprobada. Solo datos; sin dependencias.
window.TT = window.TT || {};
TT.PAL = {
  ui: { bg: '#14121F', panel: '#1E1A2E', panel2: '#2D2742', gold: '#C9A24B', text: '#F2E9D8', dim: '#9A92A8' },
  terrain: [
    { top: '#5B8C3E', side: '#3F5F2A' },
    { top: '#8AA84F', side: '#62773A' },
    { top: '#B8C46A', side: '#8C9650' }
  ],
  dirt: '#6B4A2F', stone: { top: '#8A8478', side: '#5E5A55' },
  side: { hero: '#4A90E2', enemy: '#D9473F', select: '#F5D060' },
  cls: { warrior: '#D9A441', archer: '#4FB286', mage: '#9B6BE0', cleric: '#F0EAD6' },
  tile: { move: '#4FA3FF', attack: '#FF5A4F', area: '#FFA63D', heal: '#5BE08A' },
  dmg: { slash: '#C8CED6', blunt: '#B08A5A', pierce: '#7FD1AE', fire: '#FF7A2F', ice: '#7FD6FF', light: '#FFF0A0' },
  state: { shield: '#6FD3FF', broken: '#FF3B6B', boost: '#FFC247', hp: '#5BD16F', hpLow: '#E5534B', crit: '#FFE066' },
  water: { deep: '#2F5D8C', ford: '#4F8FB8', foam: '#DDEFF5' },
  light: { sun: '#FFD9A0', ambient: '#4A5A8C', fog: '#1B1A2E', skyTop: '#2A2748', skyLow: '#F2A65A' },
  wood: { dark: '#4A3322', mid: '#7A5634', light: '#A67B4B' },
  leaf: { dark: '#2F5A2E', mid: '#4C8A3A', light: '#7DB356' },
  flame: { core: '#FFF0A0', mid: '#FFB23D', edge: '#FF7A2F' }
};
TT.hex = function (s) { return parseInt(s.slice(1), 16); };
// FIN DE ARCHIVO
