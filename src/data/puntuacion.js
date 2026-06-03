/**
 * Sistema de puntuación de la porra.
 * Las constantes aquí son la única fuente de verdad: tanto la pantalla
 * "Cómo funciona" como la lógica que calcule puntos en la clasificación
 * deben leer estos valores para evitar inconsistencias.
 */

export const PUNTOS = {
  fase_grupos: {
    ganador_o_empate: 1,
    resultado_exacto_extra: 3, // se suma sobre el +1 del ganador → total 4
    total_maximo_por_partido: 4,
  },
  premios_individuales: {
    maximo_goleador: 10,
    balon_oro: 20,
    balon_plata: 20,
    balon_bronce: 20,
  },
  fase_eliminatoria: {
    // +2 por cada equipo del usuario (1.º, 2.º o mejor tercero según su
    // porra) que coincida con los 32 que realmente pasan a dieciseisavos.
    clasifica_dieciseisavos: 2,
    // Puntos por cada equipo que el usuario acierte que avanza a la
    // siguiente ronda en su bracket.
    pasa_a_octavos: 4,         // desde dieciseisavos (32 → 16)
    pasa_a_cuartos: 6,         // 16 → 8
    pasa_a_semis: 8,           // 8 → 4
    tercer_puesto: 10,         // solo el 3.º (el 4.º no puntúa)
    llega_a_la_final: 10,      // por cada uno de los dos finalistas
    gana_el_mundial: 30,       // campeón
  },
};

/** Información presentada al usuario en "Cómo funciona". */
export const PUNTOS_DESCRIPCION_GRUPOS = [
  {
    titulo: 'Acertar ganador / empate / perdedor',
    valor: '+1 punto',
    detalle: 'Si aciertas quién gana, empata o pierde en cada partido de la fase de grupos.',
  },
  {
    titulo: 'Resultado exacto',
    valor: '+3 puntos',
    detalle: 'Si además aciertas el marcador exacto (sumado al punto del ganador, son 4 en total).',
  },
];

export const PUNTOS_DESCRIPCION_EXTRAS = [
  {
    titulo: 'Máximo goleador',
    valor: '+10 puntos',
    detalle: 'Acertar al jugador que termine como Pichichi del torneo.',
  },
  {
    titulo: 'Balón de oro / plata / bronce',
    valor: '+20 puntos cada uno',
    detalle: 'Acertar a los tres mejores jugadores del Mundial.',
  },
];

export const PUNTOS_DESCRIPCION_ELIMINATORIA = [
  {
    titulo: 'Clasificado a dieciseisavos',
    valor: '+2 puntos',
    detalle: 'Por cada equipo que aciertes entre los 32 que pasan a la fase final.',
  },
  {
    titulo: 'Pasa a octavos',
    valor: '+4 puntos',
    detalle: 'Por cada equipo de dieciseisavos que aciertes que pasa a octavos.',
  },
  {
    titulo: 'Pasa a cuartos',
    valor: '+6 puntos',
    detalle: 'Por cada equipo que aciertes que llega a cuartos de final.',
  },
  {
    titulo: 'Pasa a semifinales',
    valor: '+8 puntos',
    detalle: 'Por cada equipo que aciertes en semifinales.',
  },
  {
    titulo: 'Tercer puesto',
    valor: '+10 puntos',
    detalle: 'Por acertar el tercer puesto del Mundial.',
  },
  {
    titulo: 'Llega a la final',
    valor: '+10 puntos',
    detalle: 'Por cada uno de los dos equipos que se planten en la final.',
  },
  {
    titulo: 'Ganador del Mundial',
    valor: '+30 puntos',
    detalle: 'Por acertar al campeón del Mundial 2026.',
  },
];

/** Aportación de cada participante al bote, en euros. */
export const CUOTA_PARTICIPANTE = 10;

/** Datos generales del torneo, usados en pantallas informativas. */
export const TORNEO = {
  nombre: 'Mundial 2026',
  sede: 'Estados Unidos · México · Canadá',
  fechaInicio: '11 de junio de 2026',
  fechaFin: '19 de julio de 2026',
  totalEquipos: 48,
  totalPartidos: 104,
  totalGrupos: 12,
  totalPartidosGrupos: 72,
};
