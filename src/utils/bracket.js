/**
 * Construcción del bracket eliminatorio a partir de unos resultados/
 * pronósticos de fase de grupos.
 *
 * El bracket tiene la misma forma para el admin (con los resultados
 * oficiales) y para cada usuario (con sus propios pronósticos): por
 * eso vive aquí como utilidad pura sin acoplarse a ninguno.
 *
 * Funciones principales:
 *   - construirDieciseisavos(grupoStandings)  → 16 partidos con equipos asignados
 *   - siguienteRonda(matchups, ganadores, ronda) → 8/4/2/1 partidos
 *   - bracketCompleto(grupoStandings, ganadores) → todas las rondas resueltas
 */

import { GRUPO_LETRAS, buscarEquipo } from '../data/grupos.js';
import {
  DIECISEISAVOS,
  OCTAVOS,
  CUARTOS,
  SEMIS,
  TERCER_PUESTO,
  FINAL,
} from '../data/bracketStructure.js';
import { clasificacionDelGrupo } from './standings.js';

/* ============================================================
   Clasificación → 32 clasificados
   ============================================================ */

/** Devuelve la clasificación ordenada de cada grupo a partir del map de partidos. */
export function clasificacionTodosLosGrupos(partidos = {}) {
  const out = {};
  for (const letra of GRUPO_LETRAS) {
    out[letra] = clasificacionDelGrupo(letra, partidos);
  }
  return out;
}

/**
 * A partir de la clasificación de los 12 grupos, devuelve los 32
 * equipos que pasan a dieciseisavos:
 *  - los 12 primeros y los 12 segundos
 *  - los 8 mejores terceros. Criterio oficial:
 *    puntos → diferencia de goles → goles a favor → goles en contra.
 *    (los 4 peores terceros quedan eliminados)
 */
export function clasificados(grupoStandings) {
  const primeros = {};
  const segundos = {};
  const terceros = [];

  // Los 32 clasificados solo existen cuando TODA la fase de grupos está
  // jugada (las 6 jornadas de los 12 grupos). Cada grupo suma 12 PJ
  // (6 partidos × 2 equipos). Hasta entonces el bracket queda vacío:
  // ni se coloca a nadie ni se reparten puntos por clasificarse.
  const todasCompletas = GRUPO_LETRAS.every((letra) => {
    const tabla = grupoStandings[letra] || [];
    const pjTotal = tabla.reduce((s, t) => s + (t.pj || 0), 0);
    return tabla.length === 4 && pjTotal === 12;
  });

  if (!todasCompletas) {
    for (const letra of GRUPO_LETRAS) {
      primeros[letra] = null;
      segundos[letra] = null;
    }
    return { primeros, segundos, terceros: [], tercerosClasificados: [] };
  }

  for (const letra of GRUPO_LETRAS) {
    const tabla = grupoStandings[letra] || [];
    primeros[letra] = tabla[0] || null;
    segundos[letra] = tabla[1] || null;
    if (tabla[2]) terceros.push(tabla[2]);
  }

  const tercerosOrdenados = [...terceros].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;   // más puntos
    if (b.dg !== a.dg) return b.dg - a.dg;       // mejor diferencia de goles
    if (b.gf !== a.gf) return b.gf - a.gf;       // más goles a favor
    if (a.gc !== b.gc) return a.gc - b.gc;       // menos goles en contra
    return a.grupo.localeCompare(b.grupo);        // desempate estable final
  });
  const tercerosClasificados = tercerosOrdenados.slice(0, 8);

  return { primeros, segundos, terceros, tercerosClasificados };
}

/* ============================================================
   Construcción del bracket
   ============================================================ */

/**
 * Asigna los 8 mejores terceros a los 8 slots de dieciseisavos que los
 * requieren, respetando los grupos elegibles de cada slot.
 *
 * Es un emparejamiento bipartito (slot ↔ tercero) que se resuelve con
 * backtracking, probando los terceros en orden de clasificación. El
 * resultado es determinista (mismos grupos → mismo bracket), lo que es
 * imprescindible para que los picks del usuario no se invaliden solos.
 *
 * Si los grupos aún no están decididos y no existe emparejamiento
 * completo (caso del admin con resultados parciales), cae a una
 * asignación voraz que también respeta la elegibilidad.
 *
 * @returns {Object} map matchId → equipo tercero
 */
function asignarTercerosASlots(cl) {
  const slots = DIECISEISAVOS
    .map((s) => {
      const ref = s.local.tipo === '3' ? s.local
        : s.visitante.tipo === '3' ? s.visitante
        : null;
      return ref ? { matchId: s.id, grupos: ref.grupos } : null;
    })
    .filter(Boolean);

  const terceros = cl.tercerosClasificados;
  const asignacion = {};
  const usados = new Set();

  const backtrack = (i) => {
    if (i === slots.length) return true;
    const slot = slots[i];
    for (const t of terceros) {
      if (usados.has(t.code)) continue;
      if (!slot.grupos.includes(t.grupo)) continue;
      asignacion[slot.matchId] = t;
      usados.add(t.code);
      if (backtrack(i + 1)) return true;
      usados.delete(t.code);
      delete asignacion[slot.matchId];
    }
    return false;
  };

  if (backtrack(0)) return asignacion;

  // Sin emparejamiento completo (grupos incompletos): asignación voraz
  // respetando la elegibilidad; los slots sin tercero quedan vacíos.
  const parcial = {};
  const usados2 = new Set();
  for (const slot of slots) {
    const t = terceros.find((x) => !usados2.has(x.code) && slot.grupos.includes(x.grupo));
    if (t) {
      parcial[slot.matchId] = t;
      usados2.add(t.code);
    }
  }
  return parcial;
}

/**
 * Construye los 16 partidos de dieciseisavos resolviendo cada slot a un
 * equipo concreto a partir de la clasificación.
 * Si la fase de grupos no está suficientemente decidida, algún slot
 * puede venir como null.
 */
export function construirDieciseisavos(grupoStandings) {
  const cl = clasificados(grupoStandings);
  const tercerosPorSlot = asignarTercerosASlots(cl);

  const resolveSlot = (ref, matchId) => {
    if (ref.tipo === '1') return cl.primeros[ref.grupo] || null;
    if (ref.tipo === '2') return cl.segundos[ref.grupo] || null;
    if (ref.tipo === '3') return tercerosPorSlot[matchId] || null;
    return null;
  };

  return DIECISEISAVOS.map((slot) => ({
    id: slot.id,
    local: resolveSlot(slot.local, slot.id),
    visitante: resolveSlot(slot.visitante, slot.id),
  }));
}

/**
 * Construye los partidos de una ronda posterior a partir de los
 * ganadores de la ronda previa.
 * @param {Array} estructura - OCTAVOS / CUARTOS / SEMIS
 * @param {Object} matchesAnteriores - map de matchId → { local, visitante }
 * @param {Object} ganadoresPrev - map de matchId → code del ganador
 */
function construirRondaSiguiente(estructura, matchesAnteriores, ganadoresPrev) {
  return estructura.map((slot) => {
    const local = teamWinner(matchesAnteriores[slot.prev1], ganadoresPrev[slot.prev1]);
    const visitante = teamWinner(matchesAnteriores[slot.prev2], ganadoresPrev[slot.prev2]);
    return { id: slot.id, local, visitante };
  });
}

function teamWinner(prevMatch, ganadorCode) {
  if (!prevMatch || !ganadorCode) return null;
  if (prevMatch.local?.code === ganadorCode) return prevMatch.local;
  if (prevMatch.visitante?.code === ganadorCode) return prevMatch.visitante;
  return buscarEquipo(ganadorCode) || null;
}

function teamLoser(prevMatch, ganadorCode) {
  if (!prevMatch || !ganadorCode) return null;
  if (prevMatch.local?.code === ganadorCode) return prevMatch.visitante;
  if (prevMatch.visitante?.code === ganadorCode) return prevMatch.local;
  return null;
}

/**
 * Devuelve el bracket completo a partir de la clasificación y de los
 * ganadores que se vayan apuntando.
 *
 * @param {Object} grupoStandings - clasificacion por grupo
 * @param {Object} ganadores - { [matchId]: codeGanador }
 *   - 73-88: dieciseisavos
 *   - 89-96: octavos
 *   - 97-100: cuartos
 *   - 101-102: semis
 *   - 103: ganador del partido 3.º/4.º puesto (el otro es 4.º)
 *   - 104: campeón
 */
export function bracketCompleto(grupoStandings, ganadores = {}) {
  const d32 = indexById(construirDieciseisavos(grupoStandings));
  const o16 = indexById(construirRondaSiguiente(OCTAVOS, d32, ganadores));
  const qf  = indexById(construirRondaSiguiente(CUARTOS, o16, ganadores));
  const sf  = indexById(construirRondaSiguiente(SEMIS, qf, ganadores));

  // 3.º y 4.º puesto se juega entre los perdedores de las semifinales.
  const semi1 = sf[101];
  const semi2 = sf[102];
  const tercerPuesto = {
    id: TERCER_PUESTO.id,
    local: teamLoser(semi1, ganadores[101]),
    visitante: teamLoser(semi2, ganadores[102]),
  };
  // Final entre los ganadores de las dos semis.
  const final = {
    id: FINAL.id,
    local: teamWinner(semi1, ganadores[101]),
    visitante: teamWinner(semi2, ganadores[102]),
  };

  return { d32, o16, qf, sf, tercerPuesto, final };
}

function indexById(matches) {
  const out = {};
  for (const m of matches) out[m.id] = m;
  return out;
}

/**
 * Aplica un pick de ganador y limpia picks de rondas posteriores que
 * pudieran quedar invalidados por el cambio.
 *
 * Ejemplo: si el usuario escogió MEX como ganador del partido 73 y
 * luego MEX en el 90, y después cambia el 73 a RSA, el pick del 90
 * deja de tener sentido y debe limpiarse.
 *
 * @param {Object} grupoStandings - clasificación de grupos
 * @param {Object} ganadores - estado actual de picks
 * @param {number} matchId
 * @param {string|null} code - code del equipo elegido, o null para limpiar
 * @returns {Object} nuevos ganadores ya limpios
 */
export function aplicarPick(grupoStandings, ganadores, matchId, code) {
  const next = { ...ganadores };
  if (code == null) {
    delete next[matchId];
  } else {
    next[matchId] = code;
  }

  // Reconstrucción iterativa: cada cambio puede invalidar picks corriente
  // abajo, así que repetimos hasta que ningún pick necesite limpiarse.
  let stable = false;
  while (!stable) {
    stable = true;
    const b = bracketCompleto(grupoStandings, next);
    for (const id of Object.keys(next).map(Number)) {
      const m = findMatch(b, id);
      if (!m) continue;
      const c = next[id];
      const ok = m.local?.code === c || m.visitante?.code === c;
      if (!ok) {
        delete next[id];
        stable = false;
      }
    }
  }
  return next;
}

function findMatch(b, id) {
  if (b.d32[id]) return b.d32[id];
  if (b.o16[id]) return b.o16[id];
  if (b.qf[id]) return b.qf[id];
  if (b.sf[id]) return b.sf[id];
  if (b.tercerPuesto?.id === id) return b.tercerPuesto;
  if (b.final?.id === id) return b.final;
  return null;
}

/* ============================================================
   Helpers de progreso
   ============================================================ */

/** Cuenta de partidos por ronda con ganador apuntado. */
export function progresoBracket(bracket, ganadores = {}) {
  const cuentaRonda = (mapMatches) => {
    let total = 0, hechos = 0;
    for (const m of Object.values(mapMatches)) {
      if (m.local && m.visitante) {
        total++;
        if (ganadores[m.id]) hechos++;
      }
    }
    return { total, hechos };
  };
  return {
    d32: cuentaRonda(bracket.d32),
    o16: cuentaRonda(bracket.o16),
    qf: cuentaRonda(bracket.qf),
    sf: cuentaRonda(bracket.sf),
    tercer: bracket.tercerPuesto.local && bracket.tercerPuesto.visitante ? { total: 1, hechos: ganadores[103] ? 1 : 0 } : { total: 0, hechos: 0 },
    final: bracket.final.local && bracket.final.visitante ? { total: 1, hechos: ganadores[104] ? 1 : 0 } : { total: 0, hechos: 0 },
  };
}
