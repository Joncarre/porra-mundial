/**
 * Catálogo de avatares premium minimalistas.
 * Cada avatar es un fondo pastel sólido + un icono de lucide-react con
 * trazo fino en una tonalidad más oscura del mismo color.
 *
 * Diseño guiado por las preferencias del usuario:
 *  - Light pastel premium.
 *  - Minimalista: nada de degradados marcados ni sombras internas.
 *  - El icono interior es la única excepción a la regla de "no iconos".
 */

export const AVATARS = [
  { id: 'royal-crown',     name: 'Corona',     icon: 'Crown',    bg: '#f4e4c1', fg: '#a37c34' },
  { id: 'champion-trophy', name: 'Trofeo',     icon: 'Trophy',   bg: '#f8d8b0', fg: '#b8753a' },
  { id: 'sapphire-diamond',name: 'Zafiro',     icon: 'Diamond',  bg: '#d6e2ee', fg: '#4d6f9c' },
  { id: 'emerald-shield',  name: 'Escudo',     icon: 'Shield',   bg: '#d4dfc8', fg: '#5d7d4f' },
  { id: 'crimson-flame',   name: 'Llama',      icon: 'Flame',    bg: '#f5d2c8', fg: '#a64a3f' },
  { id: 'violet-star',     name: 'Estrella',   icon: 'Star',     bg: '#dcd2e8', fg: '#6f50a0' },
  { id: 'electric-zap',    name: 'Rayo',       icon: 'Zap',      bg: '#c9dde0', fg: '#3e7e8e' },
  { id: 'rose-sparkle',    name: 'Rosa',       icon: 'Sparkles', bg: '#f1d2d6', fg: '#a64a60' },
  { id: 'midnight-moon',   name: 'Luna',       icon: 'Moon',     bg: '#d2d2da', fg: '#444a64' },
  { id: 'noble-lion',      name: 'Galardón',   icon: 'Award',    bg: '#f0d896', fg: '#866422' },
  { id: 'cosmic-rocket',   name: 'Cohete',     icon: 'Rocket',   bg: '#cccced', fg: '#4b50a3' },
  { id: 'jade-leaf',       name: 'Jade',       icon: 'Leaf',     bg: '#c8dccf', fg: '#3e7f63' },
];

export const DEFAULT_AVATAR_ID = 'royal-crown';

export function buscarAvatar(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS.find((a) => a.id === DEFAULT_AVATAR_ID);
}
