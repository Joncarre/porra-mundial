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
 *  - los 8 mejores terceros (puntos → DG → GF → orden de grupo)
 */
export function clasificados(grupoStandings) {
  const primeros = {};
  const segundos = {};
  const terceros = [];

  for (const letra of GRUPO_LETRAS) {
    const tabla = grupoStandings[letra] || [];
    primeros[letra] = tabla[0] || null;
    segundos[letra] = tabla[1] || null;
    if (tabla[2]) terceros.push(tabla[2]);
  }

  // Mejores 8 terceros usando el mismo criterio que dentro de un grupo,
  // con desempate final por orden alfabético del grupo (estable).
  const tercerosOrdenados = [...terceros].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.grupo.localeCompare(b.grupo);
  });
  const tercerosClasificados = tercerosOrdenados.slice(0, 8);

  return { primeros, segundos, terceros, tercerosClasificados };
}

/* ============================================================
   Construcción del bracket
   ============================================================ */

/**
 * Construye los 16 partidos de dieciseisavos resolviendo cada slot a un
 * equipo concreto a partir de la clasificación.
 * Si la fase de grupos no está suficientemente decidida (puestos no
 * resueltos, terceros desempatados), algún slot puede venir como null.
 */
export function construirDieciseisavos(grupoStandings) {
  const cl = clasificados(grupoStandings);
  const tercerosUsados = new Set();

  const resolveSlot = (ref) => {
    if (ref.tipo === '1') return cl.primeros[ref.grupo];
    if (ref.tipo === '2') return cl.segundos[ref.grupo];
    if (ref.tipo === '3') {
      // Asigna el mejor tercero todavía disponible cuyo grupo esté entre
      // los elegibles del slot.
      for (const t of cl.tercerosClasificados) {
        if (tercerosUsados.has(t.code)) continue;
        if (ref.grupos.includes(t.grupo)) {
          tercerosUsados.add(t.code);
          return t;
        }
      }
      // Fallback: el mejor tercero restante aunque no esté en la lista
      // elegible (puede pasar con simplificación frente a la tabla FIFA).
      for (const t of cl.tercerosClasificados) {
        if (!tercerosUsados.has(t.code)) {
          tercerosUsados.add(t.code);
          return t;
        }
      }
      return null;
    }
    return null;
  };

  return DIECISEISAVOS.map((slot) => ({
    id: slot.id,
    local: resolveSlot(slot.local),
    visitante: resolveSlot(slot.visitante),
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
