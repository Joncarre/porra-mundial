/**
 * Estructura oficial del bracket eliminatorio del Mundial 2026.
 *
 * - Dieciseisavos (partidos 73-88): cada slot se llena con un equipo
 *   fijo del primer/segundo puesto de un grupo, o con uno de los 8
 *   mejores terceros (constraint por grupos elegibles).
 * - Octavos / cuartos / semis / 3.º-4.º puesto / final: cada partido
 *   se forma con los ganadores de las rondas previas.
 *
 * NOTA sobre el partido 76:
 *   El enunciado original lo describía como "1.º E vs 2.º F", pero 1.º E
 *   ya juega el partido 74. Para que aparezcan los 12 primeros de grupo
 *   en dieciseisavos lo corregimos a "1.º C vs 2.º F" (el único primero
 *   que faltaba era C).
 */

const ref1 = (grupo) => ({ tipo: '1', grupo });
const ref2 = (grupo) => ({ tipo: '2', grupo });
const ref3 = (...grupos) => ({ tipo: '3', grupos });

export const DIECISEISAVOS = [
  { id: 73, local: ref2('A'), visitante: ref2('B') },
  { id: 74, local: ref1('E'), visitante: ref3('A', 'B', 'C', 'D', 'F') },
  { id: 75, local: ref1('F'), visitante: ref2('C') },
  { id: 76, local: ref1('C'), visitante: ref2('F') },
  { id: 77, local: ref1('I'), visitante: ref3('C', 'D', 'F', 'G', 'H') },
  { id: 78, local: ref2('E'), visitante: ref2('I') },
  { id: 79, local: ref1('A'), visitante: ref3('C', 'E', 'F', 'H', 'I') },
  { id: 80, local: ref1('L'), visitante: ref3('E', 'H', 'I', 'J', 'K') },
  { id: 81, local: ref1('D'), visitante: ref3('B', 'E', 'F', 'I', 'J') },
  { id: 82, local: ref1('G'), visitante: ref3('A', 'E', 'H', 'I', 'J') },
  { id: 83, local: ref2('K'), visitante: ref2('L') },
  { id: 84, local: ref1('H'), visitante: ref2('J') },
  { id: 85, local: ref1('B'), visitante: ref3('E', 'F', 'G', 'I', 'J') },
  { id: 86, local: ref1('J'), visitante: ref2('H') },
  { id: 87, local: ref1('K'), visitante: ref3('D', 'E', 'I', 'J', 'L') },
  { id: 88, local: ref2('D'), visitante: ref2('G') },
];

export const OCTAVOS = [
  { id: 89, prev1: 74, prev2: 77 },
  { id: 90, prev1: 73, prev2: 75 },
  { id: 91, prev1: 76, prev2: 78 },
  { id: 92, prev1: 79, prev2: 80 },
  { id: 93, prev1: 83, prev2: 84 },
  { id: 94, prev1: 81, prev2: 82 },
  { id: 95, prev1: 86, prev2: 88 },
  { id: 96, prev1: 85, prev2: 87 },
];

export const CUARTOS = [
  { id: 97, prev1: 89, prev2: 90 },
  { id: 98, prev1: 93, prev2: 94 },
  { id: 99, prev1: 91, prev2: 92 },
  { id: 100, prev1: 95, prev2: 96 },
];

export const SEMIS = [
  { id: 101, prev1: 97, prev2: 98 },
  { id: 102, prev1: 99, prev2: 100 },
];

/** Tercer puesto: lo juegan los perdedores de las dos semifinales. */
export const TERCER_PUESTO = { id: 103, prev1: 101, prev2: 102 };

/** Final: la juegan los ganadores de las dos semifinales. */
export const FINAL = { id: 104, prev1: 101, prev2: 102 };

/** Ronda → puntos por acierto de cada equipo que avanza (fuente: data/puntuacion.js). */
export const RONDAS = [
  { key: 'd32',     label: 'Dieciseisavos', matches: DIECISEISAVOS, prevMatchIds: null },
  { key: 'o16',     label: 'Octavos',       matches: OCTAVOS,       prevMatchIds: 'd32' },
  { key: 'qf',      label: 'Cuartos',       matches: CUARTOS,       prevMatchIds: 'o16' },
  { key: 'sf',      label: 'Semifinales',   matches: SEMIS,         prevMatchIds: 'qf' },
];
