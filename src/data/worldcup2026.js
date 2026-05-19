// Grupos del Mundial 2026 (sorteo diciembre 2025)
export const GRUPOS = {
  A: { nombre: 'Grupo A', equipos: ['México', 'Sudáfrica', 'Corea del Sur', 'Chequia'] },
  B: { nombre: 'Grupo B', equipos: ['Canadá', 'Bosnia-Herzegovina', 'Catar', 'Suiza'] },
  C: { nombre: 'Grupo C', equipos: ['Brasil', 'Marruecos', 'Haití', 'Escocia'] },
  D: { nombre: 'Grupo D', equipos: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía'] },
  E: { nombre: 'Grupo E', equipos: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'] },
  F: { nombre: 'Grupo F', equipos: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'] },
  G: { nombre: 'Grupo G', equipos: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'] },
  H: { nombre: 'Grupo H', equipos: ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay'] },
  I: { nombre: 'Grupo I', equipos: ['Francia', 'Senegal', 'Irak', 'Noruega'] },
  J: { nombre: 'Grupo J', equipos: ['Argentina', 'Argelia', 'Austria', 'Jordania'] },
  K: { nombre: 'Grupo K', equipos: ['Portugal', 'Congo DR', 'Uzbekistán', 'Colombia'] },
  L: { nombre: 'Grupo L', equipos: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'] },
};

// Orden de partidos dentro de un grupo (índices sobre el array de equipos)
// J1: T0 vs T1, T2 vs T3 | J2: T0 vs T2, T1 vs T3 | J3: T0 vs T3, T1 vs T2
const MATCHUPS = [
  [0, 1], [2, 3],
  [0, 2], [1, 3],
  [0, 3], [1, 2],
];

function generarPartidosGrupos() {
  const partidos = {};
  Object.entries(GRUPOS).forEach(([letra, grupo]) => {
    MATCHUPS.forEach(([i, j], idx) => {
      const id = `G${letra}_${idx + 1}`;
      partidos[id] = {
        id,
        grupo: letra,
        local: grupo.equipos[i],
        visitante: grupo.equipos[j],
        jornada: Math.floor(idx / 2) + 1,
      };
    });
  });
  return partidos;
}

export const PARTIDOS_GRUPOS = generarPartidosGrupos();

// IDs de partidos por grupo (6 por grupo)
export const PARTIDOS_POR_GRUPO = Object.fromEntries(
  Object.keys(GRUPOS).map((letra) => [
    letra,
    Object.values(PARTIDOS_GRUPOS)
      .filter((p) => p.grupo === letra)
      .sort((a, b) => a.id.localeCompare(b.id)),
  ])
);

// Estructura del bracket de la fase eliminatoria
// El admin configura los 16 enfrentamientos de dieciseisavos
// Cada ronda posterior se genera en cascada a partir de los ganadores
export const RONDAS_ELIMINATORIA = [
  { id: 'd32', nombre: 'Dieciseisavos de Final', numPartidos: 16 },
  { id: 'o16', nombre: 'Octavos de Final', numPartidos: 8 },
  { id: 'qf', nombre: 'Cuartos de Final', numPartidos: 4 },
  { id: 'sf', nombre: 'Semifinales', numPartidos: 2 },
  { id: 'tercerPuesto', nombre: 'Tercer y Cuarto Puesto', numPartidos: 1 },
  { id: 'final', nombre: 'Final', numPartidos: 1 },
];

// Ponderación de puntos
export const PUNTUACION = {
  grupos: { ganador: 1, exacto: 3 },
  d32: { ganador: 2, exacto: 5 },
  o16: { ganador: 3, exacto: 6 },
  qf: { ganador: 4, exacto: 8 },
  sf: { ganador: 5, exacto: 10 },
  tercerPuesto: { ganador: 4, exacto: 8 },
  final: { ganador: 6, exacto: 12 },
  maxGoleador: 4,
  balonOro: 3,
  balonPlata: 2,
  balonBronce: 1,
};

// Banderas emoji por equipo
export const BANDERAS = {
  México: '🇲🇽',
  Sudáfrica: '🇿🇦',
  'Corea del Sur': '🇰🇷',
  Chequia: '🇨🇿',
  Canadá: '🇨🇦',
  'Bosnia-Herzegovina': '🇧🇦',
  Catar: '🇶🇦',
  Suiza: '🇨🇭',
  Brasil: '🇧🇷',
  Marruecos: '🇲🇦',
  Haití: '🇭🇹',
  Escocia: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Estados Unidos': '🇺🇸',
  Paraguay: '🇵🇾',
  Australia: '🇦🇺',
  Turquía: '🇹🇷',
  Alemania: '🇩🇪',
  Curazao: '🇨🇼',
  'Costa de Marfil': '🇨🇮',
  Ecuador: '🇪🇨',
  'Países Bajos': '🇳🇱',
  Japón: '🇯🇵',
  Suecia: '🇸🇪',
  Túnez: '🇹🇳',
  Bélgica: '🇧🇪',
  Egipto: '🇪🇬',
  Irán: '🇮🇷',
  'Nueva Zelanda': '🇳🇿',
  España: '🇪🇸',
  'Cabo Verde': '🇨🇻',
  'Arabia Saudí': '🇸🇦',
  Uruguay: '🇺🇾',
  Francia: '🇫🇷',
  Senegal: '🇸🇳',
  Irak: '🇮🇶',
  Noruega: '🇳🇴',
  Argentina: '🇦🇷',
  Argelia: '🇩🇿',
  Austria: '🇦🇹',
  Jordania: '🇯🇴',
  Portugal: '🇵🇹',
  'Congo DR': '🇨🇩',
  Uzbekistán: '🇺🇿',
  Colombia: '🇨🇴',
  Inglaterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Croacia: '🇭🇷',
  Ghana: '🇬🇭',
  Panamá: '🇵🇦',
};

// Lista de todos los equipos participantes
export const TODOS_LOS_EQUIPOS = Object.values(GRUPOS).flatMap((g) => g.equipos).sort();

export function getBandera(equipo) {
  return BANDERAS[equipo] || '🏳️';
}

// Acrónimos FIFA por equipo
export const ACRONIMOS = {
  México: 'MEX', Sudáfrica: 'RSA', 'Corea del Sur': 'KOR', Chequia: 'CZE',
  Canadá: 'CAN', 'Bosnia-Herzegovina': 'BIH', Catar: 'QAT', Suiza: 'SUI',
  Brasil: 'BRA', Marruecos: 'MAR', Haití: 'HAI', Escocia: 'SCO',
  'Estados Unidos': 'USA', Paraguay: 'PAR', Australia: 'AUS', Turquía: 'TUR',
  Alemania: 'GER', Curazao: 'CUW', 'Costa de Marfil': 'CIV', Ecuador: 'ECU',
  'Países Bajos': 'NED', Japón: 'JPN', Suecia: 'SWE', Túnez: 'TUN',
  Bélgica: 'BEL', Egipto: 'EGY', Irán: 'IRN', 'Nueva Zelanda': 'NZL',
  España: 'ESP', 'Cabo Verde': 'CPV', 'Arabia Saudí': 'KSA', Uruguay: 'URU',
  Francia: 'FRA', Senegal: 'SEN', Irak: 'IRQ', Noruega: 'NOR',
  Argentina: 'ARG', Argelia: 'ALG', Austria: 'AUT', Jordania: 'JOR',
  Portugal: 'POR', 'Congo DR': 'COD', Uzbekistán: 'UZB', Colombia: 'COL',
  Inglaterra: 'ENG', Croacia: 'CRO', Ghana: 'GHA', Panamá: 'PAN',
};

export function getAcronimo(equipo) {
  return ACRONIMOS[equipo] || equipo.substring(0, 3).toUpperCase();
}
