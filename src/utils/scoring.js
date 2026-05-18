import { PARTIDOS_GRUPOS, PUNTUACION } from '../data/worldcup2026';

// Devuelve 'local', 'visitante' o 'empate'
export function getGanador(g1, g2) {
  const n1 = Number(g1);
  const n2 = Number(g2);
  if (isNaN(n1) || isNaN(n2)) return null;
  if (n1 > n2) return 'local';
  if (n2 > n1) return 'visitante';
  return 'empate';
}

function esResultadoValido(res) {
  return (
    res !== null &&
    res !== undefined &&
    res.g1 !== null &&
    res.g1 !== undefined &&
    res.g2 !== null &&
    res.g2 !== undefined &&
    res.g1 !== '' &&
    res.g2 !== ''
  );
}

// Calcula puntos para un único partido de grupos
function puntuarPartidoGrupos(pred, real) {
  if (!esResultadoValido(pred) || !esResultadoValido(real)) return { puntos: 0, ganador: false, exacto: false };

  const predGanador = getGanador(pred.g1, pred.g2);
  const realGanador = getGanador(real.g1, real.g2);

  let puntos = 0;
  let ganador = false;
  let exacto = false;

  if (predGanador === realGanador) {
    puntos += PUNTUACION.grupos.ganador;
    ganador = true;
  }

  if (Number(pred.g1) === Number(real.g1) && Number(pred.g2) === Number(real.g2)) {
    // Exacto: puntos totales son PUNTUACION.grupos.exacto (3),
    // el ganador (1) ya está incluido, se suma la diferencia
    puntos += PUNTUACION.grupos.exacto - PUNTUACION.grupos.ganador;
    exacto = true;
  }

  return { puntos, ganador, exacto };
}

// Calcula puntos para un partido eliminatorio
function puntuarPartidoEliminatoria(pred, real, ronda) {
  if (!esResultadoValido(pred) || !esResultadoValido(real)) return { puntos: 0, ganador: false, exacto: false };

  const pts = PUNTUACION[ronda];
  if (!pts) return { puntos: 0, ganador: false, exacto: false };

  const predGanador = getGanador(pred.g1, pred.g2);
  const realGanador = getGanador(real.g1, real.g2);

  // Para rondas eliminatorias no hay empate en el resultado final
  // (se decide por penaltis/prórroga, pero el marcador se registra tal cual)
  let puntos = 0;
  let ganador = false;
  let exacto = false;

  if (predGanador !== null && predGanador === realGanador) {
    puntos += pts.ganador;
    ganador = true;
  }

  if (Number(pred.g1) === Number(real.g1) && Number(pred.g2) === Number(real.g2)) {
    puntos += pts.exacto - pts.ganador;
    exacto = true;
  }

  return { puntos, ganador, exacto };
}

/**
 * Calcula la puntuación completa de un usuario.
 *
 * @param {object} predFase1  - predicciones de fase de grupos del usuario
 * @param {object} predFase2  - predicciones de fase eliminatoria del usuario
 * @param {object} resultados - resultados reales { grupos, eliminatoria, premios }
 * @returns {{ totalPuntos, ganadorAcertados, exactosAcertados, desglose }}
 */
export function calcularPuntuacion(predFase1, predFase2, resultados) {
  let totalPuntos = 0;
  let ganadorAcertados = 0;
  let exactosAcertados = 0;

  const desglose = {
    grupos: 0,
    d32: 0,
    o16: 0,
    qf: 0,
    sf: 0,
    tercerPuesto: 0,
    final: 0,
    premios: 0,
  };

  // ── FASE 1: Grupos ────────────────────────────────────────────────────────────
  if (predFase1 && resultados?.grupos?.partidos) {
    const partidosPred = predFase1.partidos || {};
    const partidosReal = resultados.grupos.partidos;

    Object.keys(PARTIDOS_GRUPOS).forEach((id) => {
      const pred = partidosPred[id];
      const real = partidosReal[id];
      if (!pred || !real) return;

      const { puntos, ganador, exacto } = puntuarPartidoGrupos(pred, real);
      totalPuntos += puntos;
      desglose.grupos += puntos;
      if (ganador) ganadorAcertados++;
      if (exacto) exactosAcertados++;
    });

    // Premios individuales
    const premios = resultados.grupos;
    if (predFase1.maxGoleador && premios.maxGoleador &&
        predFase1.maxGoleador.trim().toLowerCase() === premios.maxGoleador.trim().toLowerCase()) {
      totalPuntos += PUNTUACION.maxGoleador;
      desglose.premios += PUNTUACION.maxGoleador;
    }
    if (predFase1.balonOro && premios.balonOro &&
        predFase1.balonOro.trim().toLowerCase() === premios.balonOro.trim().toLowerCase()) {
      totalPuntos += PUNTUACION.balonOro;
      desglose.premios += PUNTUACION.balonOro;
    }
    if (predFase1.balonPlata && premios.balonPlata &&
        predFase1.balonPlata.trim().toLowerCase() === premios.balonPlata.trim().toLowerCase()) {
      totalPuntos += PUNTUACION.balonPlata;
      desglose.premios += PUNTUACION.balonPlata;
    }
    if (predFase1.balonBronce && premios.balonBronce &&
        predFase1.balonBronce.trim().toLowerCase() === premios.balonBronce.trim().toLowerCase()) {
      totalPuntos += PUNTUACION.balonBronce;
      desglose.premios += PUNTUACION.balonBronce;
    }
  }

  // ── FASE 2: Eliminatoria ───────────────────────────────────────────────────────
  if (predFase2 && resultados?.eliminatoria) {
    const elim = resultados.eliminatoria;

    // Rondas con múltiples partidos
    ['d32', 'o16', 'qf', 'sf'].forEach((ronda) => {
      const predsRonda = predFase2[ronda] || [];
      const realesRonda = elim[ronda] || [];

      predsRonda.forEach((pred, idx) => {
        const real = realesRonda[idx];
        if (!pred || !real) return;

        // Para R16+, verificar que los equipos coincidan
        if (ronda !== 'd32') {
          if (pred.team1 !== real.team1 || pred.team2 !== real.team2) return;
        }

        const { puntos, ganador, exacto } = puntuarPartidoEliminatoria(pred, real, ronda);
        totalPuntos += puntos;
        desglose[ronda] += puntos;
        if (ganador) ganadorAcertados++;
        if (exacto) exactosAcertados++;
      });
    });

    // Tercer puesto
    if (predFase2.tercerPuesto && elim.tercerPuesto) {
      const { puntos, ganador, exacto } = puntuarPartidoEliminatoria(
        predFase2.tercerPuesto,
        elim.tercerPuesto,
        'tercerPuesto'
      );
      totalPuntos += puntos;
      desglose.tercerPuesto += puntos;
      if (ganador) ganadorAcertados++;
      if (exacto) exactosAcertados++;
    }

    // Final
    if (predFase2.final && elim.final) {
      const { puntos, ganador, exacto } = puntuarPartidoEliminatoria(
        predFase2.final,
        elim.final,
        'final'
      );
      totalPuntos += puntos;
      desglose.final += puntos;
      if (ganador) ganadorAcertados++;
      if (exacto) exactosAcertados++;
    }
  }

  return { totalPuntos, ganadorAcertados, exactosAcertados, desglose };
}

// Calcula el ganador (equipo) de un partido de bracket a partir del score predicho
export function getGanadorEquipo(partido) {
  if (!partido || !esResultadoValido(partido)) return null;
  const ganador = getGanador(partido.g1, partido.g2);
  if (ganador === 'local') return partido.team1;
  if (ganador === 'visitante') return partido.team2;
  return null; // empate no válido en eliminatoria
}

// Calcula el perdedor de un partido
export function getPerdedorEquipo(partido) {
  if (!partido || !esResultadoValido(partido)) return null;
  const ganador = getGanador(partido.g1, partido.g2);
  if (ganador === 'local') return partido.team2;
  if (ganador === 'visitante') return partido.team1;
  return null;
}
