export const CATEGORIES = [
  { id: 'trabalho', label: 'Trabalho', hue: 255 },
  { id: 'estudos', label: 'Estudos', hue: 305 },
  { id: 'pessoal', label: 'Pessoal', hue: 165 },
  { id: 'saude', label: 'Saúde', hue: 25 },
  { id: 'casa', label: 'Casa', hue: 85 },
  { id: 'rotina', label: 'Rotina', hue: 240, muted: true }, // sono, deslocamento, refeições
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export const PRIORITIES = [
  { id: 'alta', label: 'Alta', rank: 0 },
  { id: 'media', label: 'Média', rank: 1 },
  { id: 'baixa', label: 'Baixa', rank: 2 },
]

export const PRIORITY_RANK = Object.fromEntries(PRIORITIES.map((p) => [p.id, p.rank]))

export const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180]

/** Estilo inline que alimenta as variáveis CSS da classe .cat */
export function catStyle(categoryId) {
  const c = CATEGORY_BY_ID[categoryId] ?? CATEGORY_BY_ID.pessoal
  return { '--h': c.hue, '--k': c.muted ? 0.12 : 1 }
}
