/**
 * Cálculo de puntos de un participante.
 *
 * Cruza las predicciones del usuario con los resultados oficiales y
 * aplica la tabla de puntos definida en src/data/puntuacion.js.
 *
 * Devuelve, para mostrar en la clasificación:
 *   { puntos, aciertosGanador, aciertosExacto, aciertosBracket, aciertosPremios }
 */

import { PUNTOS } from '../data/puntuacion.js';
import { TODOS_LOS_PARTIDOS_GRUPOS } from '../data/grupos.js';
import {
  DIECISEISAVOS,
  OCTAVOS,
  CUARTOS,
  SEMIS,
} from '../data/bracketStructure.js';
import { clasificados, clasificacionTodosLosGrupos } from './bracket.js';

const resultadoTipo = (gl, gv) => (gl > gv ? 'L' : gl < gv ? 'V' : 'E');

const compararPremio = (a, b) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * @param {Object} predGrupos    - map partidoId → { golesLocal, golesVisitante }
 * @param {Object} predBracket   - map matchId → codeGanador
 * @param {Object} predExtras    - { maxGoleador, balonOro, balonPlata, balonBronce }
 * @param {Object} resGrupos     - mismo shape que predGrupos
 * @param {Object} resBracket    - mismo shape que predBracket
 * @param {Object} resPremios    - mismo shape que predExtras
 */
export function calcularPuntos({
  predGrupos = {},
  predBracket = {},
  predExtras = {},
  resGrupos = {},
  resBracket = {},
  resPremios = {},
} = {}) {
  let puntos = 0;
  let aciertosGanador = 0;
  let aciertosExacto = 0;
  let aciertosBracket = 0;
  let aciertosPremios = 0;

  // ----------------- Fase de grupos -----------------
  for (const partido of TODOS_LOS_PARTIDOS_GRUPOS) {
    const pred = predGrupos[partido.id];
    const real = resGrupos[partido.id];
    if (!pred || !real) continue;
    if (
      typeof pred.golesLocal !== 'number' ||
      typeof pred.golesVisitante !== 'number' ||
      typeof real.golesLocal !== 'number' ||
      typeof real.golesVisitante !== 'number'
    ) continue;

    const tipoPred = resultadoTipo(pred.golesLocal, pred.golesVisitante);
    const tipoReal = resultadoTipo(real.golesLocal, real.golesVisitante);

    if (tipoPred === tipoReal) {
      puntos += PUNTOS.fase_grupos.ganador_o_empate;
      aciertosGanador += 1;
      if (
        pred.golesLocal === real.golesLocal &&
        pred.golesVisitante === real.golesVisitante
      ) {
        puntos += PUNTOS.fase_grupos.resultado_exacto_extra;
        aciertosExacto += 1;
      }
    }
  }

  // ----------------- Eliminatoria -----------------
  // Cada ronda da puntos por equipo acertado que "pasa" a la siguiente.
  const sumarRonda = (slots, ptsPorAcierto) => {
    for (const slot of slots) {
      const p = predBracket[slot.id];
      const r = resBracket[slot.id];
      if (p && r && p === r) {
        puntos += ptsPorAcierto;
        aciertosBracket += 1;
      }
    }
  };
  sumarRonda(DIECISEISAVOS, PUNTOS.fase_eliminatoria.pasa_a_octavos);   // +4
  sumarRonda(OCTAVOS,       PUNTOS.fase_eliminatoria.pasa_a_cuartos);   // +6
  sumarRonda(CUARTOS,       PUNTOS.fase_eliminatoria.pasa_a_semis);     // +8
  sumarRonda(SEMIS,         PUNTOS.fase_eliminatoria.llega_a_la_final); // +10

  // ----------------- 3.º puesto (el 4.º no puntúa) -----------------
  if (predBracket[103] && resBracket[103] && predBracket[103] === resBracket[103]) {
    puntos += PUNTOS.fase_eliminatoria.tercer_puesto; // +10
    aciertosBracket += 1;
  }

  // ----------------- Campeón -----------------
  if (predBracket[104] && resBracket[104] && predBracket[104] === resBracket[104]) {
    puntos += PUNTOS.fase_eliminatoria.gana_el_mundial; // +20
    aciertosBracket += 1;
  }

  // ----------------- Clasificados a dieciseisavos (+2 cada uno) -----------------
  // Por cada equipo de los 32 del usuario (1.º, 2.º o mejor tercero según
  // su porra de grupos) que coincida con los 32 reales que pasan a la
  // fase final.
  const codesClasificados = (clasif) =>
    new Set([
      ...Object.values(clasif.primeros).filter(Boolean).map((t) => t.code),
      ...Object.values(clasif.segundos).filter(Boolean).map((t) => t.code),
      ...clasif.tercerosClasificados.map((t) => t.code),
    ]);
  const realClasificados = codesClasificados(clasificados(clasificacionTodosLosGrupos(resGrupos)));
  const predClasificados = codesClasificados(clasificados(clasificacionTodosLosGrupos(predGrupos)));
  for (const code of predClasificados) {
    if (realClasificados.has(code)) {
      puntos += PUNTOS.fase_eliminatoria.clasifica_dieciseisavos; // +2
    }
  }

  // ----------------- Premios individuales -----------------
  if (compararPremio(predExtras.maxGoleador, resPremios.maxGoleador)) {
    puntos += PUNTOS.premios_individuales.maximo_goleador; // +10
    aciertosPremios += 1;
  }
  if (compararPremio(predExtras.balonOro, resPremios.balonOro)) {
    puntos += PUNTOS.premios_individuales.balon_oro; // +20
    aciertosPremios += 1;
  }
  if (compararPremio(predExtras.balonPlata, resPremios.balonPlata)) {
    puntos += PUNTOS.premios_individuales.balon_plata; // +20
    aciertosPremios += 1;
  }
  if (compararPremio(predExtras.balonBronce, resPremios.balonBronce)) {
    puntos += PUNTOS.premios_individuales.balon_bronce; // +20
    aciertosPremios += 1;
  }

  return { puntos, aciertosGanador, aciertosExacto, aciertosBracket, aciertosPremios };
}
