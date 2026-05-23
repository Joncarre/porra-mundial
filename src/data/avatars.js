/**
 * Catálogo de avatares premium predefinidos.
 * Cada avatar se compone de un gradiente y un icono central de lucide-react.
 * El propio componente <Avatar /> es quien interpreta estos descriptores.
 */

export const AVATARS = [
  {
    id: 'royal-crown',
    name: 'Corona Real',
    icon: 'Crown',
    gradient: 'linear-gradient(135deg, #f0c956 0%, #d4af37 50%, #8c6f1f 100%)',
    pattern: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 50%)',
    accent: '#fdf7e3',
  },
  {
    id: 'champion-trophy',
    name: 'Trofeo Campeón',
    icon: 'Trophy',
    gradient: 'linear-gradient(135deg, #ecd47a 0%, #b8932a 100%)',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.20) 0%, transparent 60%)',
    accent: '#1a1407',
  },
  {
    id: 'sapphire-diamond',
    name: 'Zafiro',
    icon: 'Diamond',
    gradient: 'linear-gradient(135deg, #4f8eff 0%, #2c5cb8 50%, #0f2666 100%)',
    pattern: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.28) 0%, transparent 50%)',
    accent: '#e2ecff',
  },
  {
    id: 'emerald-shield',
    name: 'Escudo Esmeralda',
    icon: 'Shield',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #16a34a 50%, #14532d 100%)',
    pattern: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.22) 0%, transparent 55%)',
    accent: '#ecfdf5',
  },
  {
    id: 'crimson-flame',
    name: 'Llama Carmesí',
    icon: 'Flame',
    gradient: 'linear-gradient(135deg, #ff7849 0%, #dc2626 50%, #7f1d1d 100%)',
    pattern: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.22) 0%, transparent 55%)',
    accent: '#fff7ed',
  },
  {
    id: 'violet-star',
    name: 'Estrella Violeta',
    icon: 'Star',
    gradient: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 50%, #4c1d95 100%)',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.22) 0%, transparent 60%)',
    accent: '#f5f3ff',
  },
  {
    id: 'electric-zap',
    name: 'Rayo Eléctrico',
    icon: 'Zap',
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 50%, #0e4a5e 100%)',
    pattern: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25) 0%, transparent 55%)',
    accent: '#ecfeff',
  },
  {
    id: 'rose-sparkle',
    name: 'Rosa Brillante',
    icon: 'Sparkles',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #881337 100%)',
    pattern: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.22) 0%, transparent 60%)',
    accent: '#fff1f2',
  },
  {
    id: 'midnight-moon',
    name: 'Luna de Medianoche',
    icon: 'Moon',
    gradient: 'linear-gradient(135deg, #475569 0%, #1e293b 50%, #020617 100%)',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(232, 196, 104, 0.30) 0%, transparent 50%)',
    accent: '#e8c468',
  },
  {
    id: 'noble-lion',
    name: 'León Noble',
    icon: 'Award',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
    pattern: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.22) 0%, transparent 55%)',
    accent: '#fffbeb',
  },
  {
    id: 'cosmic-rocket',
    name: 'Cohete Cósmico',
    icon: 'Rocket',
    gradient: 'linear-gradient(135deg, #818cf8 0%, #4338ca 50%, #1e1b4b 100%)',
    pattern: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.22) 0%, transparent 60%)',
    accent: '#eef2ff',
  },
  {
    id: 'jade-leaf',
    name: 'Jade Antiguo',
    icon: 'Leaf',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 50%, #134e4a 100%)',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.22) 0%, transparent 55%)',
    accent: '#f0fdfa',
  },
];

export const DEFAULT_AVATAR_ID = 'royal-crown';

/** Devuelve el descriptor del avatar por id, con fallback al default. */
export function buscarAvatar(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS.find((a) => a.id === DEFAULT_AVATAR_ID);
}
