/**
 * Cálculo automático de la clasificación de un grupo a partir de los
 * resultados de sus 6 partidos.
 *
 * Un resultado es un objeto { golesLocal: number, golesVisitante: number }.
 * Un partido sin resultado se ignora (todavía no jugado).
 *
 * Criterio de desempate (oficial de la porra):
 *   puntos → diferencia de goles → partidos ganados → partidos perdidos
 *   → goles a favor → goles en contra → nombre (estable).
 */

import { GRUPOS, partidosDelGrupo } from '../data/grupos.js';

const VICTORIA_PTS = 3;
const EMPATE_PTS = 1;

function tieneResultado(r) {
  return (
    r &&
    typeof r.golesLocal === 'number' &&
    typeof r.golesVisitante === 'number' &&
    r.golesLocal >= 0 &&
    r.golesVisitante >= 0
  );
}

/**
 * Devuelve la clasificación ordenada del grupo dado.
 * @param {string} letra - 'A' ... 'L'
 * @param {Object} partidosResultados - map de partidoId → { golesLocal, golesVisitante }
 * @returns {Array<Object>} cada equipo con sus stats y campo `posicion`
 */
export function clasificacionDelGrupo(letra, partidosResultados = {}) {
  const equipos = GRUPOS[letra];
  const stats = {};
  for (const e of equipos) {
    stats[e.code] = {
      ...e,
      grupo: letra,
      pj: 0, g: 0, em: 0, p: 0,
      gf: 0, gc: 0, dg: 0, pts: 0,
    };
  }

  const partidos = partidosDelGrupo(letra);
  for (const partido of partidos) {
    const r = partidosResultados[partido.id];
    if (!tieneResultado(r)) continue;

    const local = stats[partido.local.code];
    const visitante = stats[partido.visitante.code];
    const gl = r.golesLocal;
    const gv = r.golesVisitante;

    local.pj += 1; visitante.pj += 1;
    local.gf += gl; local.gc += gv;
    visitante.gf += gv; visitante.gc += gl;

    if (gl > gv) {
      local.g += 1; local.pts += VICTORIA_PTS;
      visitante.p += 1;
    } else if (gl < gv) {
      visitante.g += 1; visitante.pts += VICTORIA_PTS;
      local.p += 1;
    } else {
      local.em += 1; local.pts += EMPATE_PTS;
      visitante.em += 1; visitante.pts += EMPATE_PTS;
    }
  }

  for (const code in stats) {
    stats[code].dg = stats[code].gf - stats[code].gc;
  }

  const orden = Object.values(stats).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;   // más puntos
    if (b.dg !== a.dg) return b.dg - a.dg;       // mejor diferencia de goles
    if (b.g !== a.g) return b.g - a.g;           // más partidos ganados
    if (a.p !== b.p) return a.p - b.p;           // menos partidos perdidos
    if (b.gf !== a.gf) return b.gf - a.gf;       // más goles a favor
    if (a.gc !== b.gc) return a.gc - b.gc;       // menos goles en contra
    return a.name.localeCompare(b.name);          // estable
  });
  return orden.map((eq, idx) => ({ ...eq, posicion: idx + 1 }));
}

/** Devuelve los partidos del grupo con su resultado adjunto (o null). */
export function partidosConResultado(letra, partidosResultados = {}) {
  return partidosDelGrupo(letra).map((p) => ({
    ...p,
    resultado: partidosResultados[p.id] || null,
  }));
}
