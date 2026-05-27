/**
 * Grupos del Mundial 2026 — 48 equipos en 12 grupos (A–L).
 * Cada equipo lleva un código de 3 letras (FIFA) y el nombre en español.
 */

export const GRUPOS = {
  A: [
    { code: 'MEX', name: 'México' },
    { code: 'RSA', name: 'Sudáfrica' },
    { code: 'KOR', name: 'Corea del Sur' },
    { code: 'CZE', name: 'Chequia' },
  ],
  B: [
    { code: 'CAN', name: 'Canadá' },
    { code: 'BIH', name: 'Bosnia y Herzegovina' },
    { code: 'QAT', name: 'Catar' },
    { code: 'SUI', name: 'Suiza' },
  ],
  C: [
    { code: 'BRA', name: 'Brasil' },
    { code: 'MAR', name: 'Marruecos' },
    { code: 'HAI', name: 'Haití' },
    { code: 'SCO', name: 'Escocia' },
  ],
  D: [
    { code: 'USA', name: 'Estados Unidos' },
    { code: 'PAR', name: 'Paraguay' },
    { code: 'AUS', name: 'Australia' },
    { code: 'TUR', name: 'Turquía' },
  ],
  E: [
    { code: 'GER', name: 'Alemania' },
    { code: 'CUW', name: 'Curazao' },
    { code: 'CIV', name: 'Costa de Marfil' },
    { code: 'ECU', name: 'Ecuador' },
  ],
  F: [
    { code: 'NED', name: 'Países Bajos' },
    { code: 'JPN', name: 'Japón' },
    { code: 'SWE', name: 'Suecia' },
    { code: 'TUN', name: 'Túnez' },
  ],
  G: [
    { code: 'BEL', name: 'Bélgica' },
    { code: 'EGY', name: 'Egipto' },
    { code: 'IRN', name: 'Irán' },
    { code: 'NZL', name: 'Nueva Zelanda' },
  ],
  H: [
    { code: 'ESP', name: 'España' },
    { code: 'CPV', name: 'Cabo Verde' },
    { code: 'KSA', name: 'Arabia Saudí' },
    { code: 'URU', name: 'Uruguay' },
  ],
  I: [
    { code: 'FRA', name: 'Francia' },
    { code: 'SEN', name: 'Senegal' },
    { code: 'IRQ', name: 'Irak' },
    { code: 'NOR', name: 'Noruega' },
  ],
  J: [
    { code: 'ARG', name: 'Argentina' },
    { code: 'ALG', name: 'Argelia' },
    { code: 'AUT', name: 'Austria' },
    { code: 'JOR', name: 'Jordania' },
  ],
  K: [
    { code: 'POR', name: 'Portugal' },
    { code: 'COD', name: 'RD Congo' },
    { code: 'UZB', name: 'Uzbekistán' },
    { code: 'COL', name: 'Colombia' },
  ],
  L: [
    { code: 'ENG', name: 'Inglaterra' },
    { code: 'CRO', name: 'Croacia' },
    { code: 'GHA', name: 'Ghana' },
    { code: 'PAN', name: 'Panamá' },
  ],
};

export const GRUPO_LETRAS = Object.keys(GRUPOS);

/** Lista plana de los 48 equipos. */
export const TODOS_LOS_EQUIPOS = GRUPO_LETRAS.flatMap((letra) =>
  GRUPOS[letra].map((equipo) => ({ ...equipo, grupo: letra }))
);

/** Busca un equipo por su código de 3 letras. */
export function buscarEquipo(code) {
  return TODOS_LOS_EQUIPOS.find((e) => e.code === code);
}

/**
 * Calendario oficial de la fase de grupos del Mundial 2026.
 *
 * Cada entrada: [grupo, codeLocal, codeVisitante, jornada, fecha].
 * El orden de la lista es cronológico (jornada → fecha → entrada).
 * El "local" y "visitante" siguen la programación oficial: el equipo
 * mencionado primero en cada partido es el local.
 */
const CALENDARIO = [
  // ------- Jornada 1 -------
  ['A', 'MEX', 'RSA', 1, '11/06 21:00'],
  ['A', 'KOR', 'CZE', 1, '12/06 04:00'],
  ['B', 'CAN', 'BIH', 1, '12/06 21:00'],
  ['D', 'USA', 'PAR', 1, '13/06 03:00'],
  ['B', 'QAT', 'SUI', 1, '13/06 21:00'],
  ['C', 'BRA', 'MAR', 1, '14/06 00:00'],
  ['C', 'HAI', 'SCO', 1, '14/06 03:00'],
  ['D', 'AUS', 'TUR', 1, '14/06 06:00'],
  ['E', 'GER', 'CUW', 1, '14/06 19:00'],
  ['F', 'NED', 'JPN', 1, '14/06 22:00'],
  ['E', 'CIV', 'ECU', 1, '15/06 01:00'],
  ['F', 'SWE', 'TUN', 1, '15/06 04:00'],
  ['H', 'ESP', 'CPV', 1, '15/06 18:00'],
  ['G', 'BEL', 'EGY', 1, '15/06 21:00'],
  ['H', 'KSA', 'URU', 1, '16/06 00:00'],
  ['G', 'IRN', 'NZL', 1, '16/06 03:00'],
  ['I', 'FRA', 'SEN', 1, '16/06 21:00'],
  ['I', 'IRQ', 'NOR', 1, '17/06 00:00'],
  ['J', 'ARG', 'ALG', 1, '17/06 03:00'],
  ['J', 'AUT', 'JOR', 1, '17/06 06:00'],
  ['K', 'POR', 'COD', 1, '17/06 19:00'],
  ['L', 'ENG', 'CRO', 1, '17/06 22:00'],
  ['L', 'GHA', 'PAN', 1, '18/06 01:00'],
  ['K', 'UZB', 'COL', 1, '18/06 04:00'],

  // ------- Jornada 2 -------
  ['A', 'CZE', 'RSA', 2, '18/06 18:00'],
  ['B', 'SUI', 'BIH', 2, '18/06 21:00'],
  ['B', 'CAN', 'QAT', 2, '19/06 00:00'],
  ['A', 'MEX', 'KOR', 2, '19/06 03:00'],
  ['D', 'USA', 'AUS', 2, '19/06 21:00'],
  ['C', 'SCO', 'MAR', 2, '20/06 00:00'],
  ['C', 'BRA', 'HAI', 2, '20/06 02:30'],
  ['D', 'TUR', 'PAR', 2, '20/06 05:00'],
  ['F', 'NED', 'SWE', 2, '20/06 19:00'],
  ['E', 'GER', 'CIV', 2, '20/06 22:00'],
  ['E', 'ECU', 'CUW', 2, '21/06 02:00'],
  ['F', 'TUN', 'JPN', 2, '21/06 06:00'],
  ['H', 'ESP', 'KSA', 2, '21/06 18:00'],
  ['G', 'BEL', 'IRN', 2, '21/06 21:00'],
  ['H', 'URU', 'CPV', 2, '22/06 00:00'],
  ['G', 'NZL', 'EGY', 2, '22/06 03:00'],
  ['J', 'ARG', 'AUT', 2, '22/06 19:00'],
  ['I', 'FRA', 'IRQ', 2, '22/06 23:00'],
  ['I', 'NOR', 'SEN', 2, '23/06 02:00'],
  ['J', 'JOR', 'ALG', 2, '23/06 05:00'],
  ['K', 'POR', 'UZB', 2, '23/06 19:00'],
  ['L', 'ENG', 'GHA', 2, '23/06 22:00'],
  ['L', 'PAN', 'CRO', 2, '24/06 01:00'],
  ['K', 'COL', 'COD', 2, '24/06 04:00'],

  // ------- Jornada 3 -------
  ['B', 'BIH', 'QAT', 3, '24/06 21:00'],
  ['B', 'SUI', 'CAN', 3, '24/06 21:00'],
  ['C', 'MAR', 'HAI', 3, '25/06 00:00'],
  ['C', 'SCO', 'BRA', 3, '25/06 00:00'],
  ['A', 'CZE', 'MEX', 3, '25/06 03:00'],
  ['A', 'RSA', 'KOR', 3, '25/06 03:00'],
  ['E', 'CUW', 'CIV', 3, '25/06 22:00'],
  ['E', 'ECU', 'GER', 3, '25/06 22:00'],
  ['F', 'JPN', 'SWE', 3, '26/06 01:00'],
  ['F', 'TUN', 'NED', 3, '26/06 01:00'],
  ['D', 'PAR', 'AUS', 3, '26/06 04:00'],
  ['D', 'TUR', 'USA', 3, '26/06 04:00'],
  ['I', 'NOR', 'FRA', 3, '26/06 21:00'],
  ['I', 'SEN', 'IRQ', 3, '26/06 21:00'],
  ['H', 'CPV', 'KSA', 3, '27/06 02:00'],
  ['H', 'URU', 'ESP', 3, '27/06 02:00'],
  ['G', 'EGY', 'IRN', 3, '27/06 05:00'],
  ['G', 'NZL', 'BEL', 3, '27/06 05:00'],
  ['L', 'CRO', 'GHA', 3, '27/06 23:00'],
  ['L', 'PAN', 'ENG', 3, '27/06 23:00'],
  ['K', 'COL', 'POR', 3, '28/06 01:30'],
  ['K', 'COD', 'UZB', 3, '28/06 01:30'],
  ['J', 'ALG', 'AUT', 3, '28/06 04:00'],
  ['J', 'JOR', 'ARG', 3, '28/06 04:00'],
];

/**
 * Los 72 partidos de la fase de grupos en orden cronológico, con
 * jornada y fecha. Cada partido lleva su id estable del tipo
 * "<grupo>-<localCode>-<visitanteCode>".
 */
export const TODOS_LOS_PARTIDOS_GRUPOS = CALENDARIO.map(
  ([grupo, localCode, visitanteCode, jornada, fecha]) => ({
    id: `${grupo}-${localCode}-${visitanteCode}`,
    grupo,
    jornada,
    fecha,
    local: buscarEquipo(localCode),
    visitante: buscarEquipo(visitanteCode),
  }),
);

/**
 * Devuelve los 6 partidos del grupo dado, en orden cronológico
 * (jornada 1 → jornada 3, y por fecha dentro de cada jornada).
 */
export function partidosDelGrupo(letra) {
  return TODOS_LOS_PARTIDOS_GRUPOS.filter((p) => p.grupo === letra);
}
