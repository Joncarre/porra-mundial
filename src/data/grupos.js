/**
 * Grupos del Mundial 2026 — 48 equipos en 12 grupos (A–L).
 * Cada equipo lleva un código de 3 letras (FIFA), el nombre en español
 * y la bandera en emoji para una visualización rápida.
 */

export const GRUPOS = {
  A: [
    { code: 'MEX', name: 'México', flag: '🇲🇽' },
    { code: 'RSA', name: 'Sudáfrica', flag: '🇿🇦' },
    { code: 'KOR', name: 'Corea del Sur', flag: '🇰🇷' },
    { code: 'CZE', name: 'Chequia', flag: '🇨🇿' },
  ],
  B: [
    { code: 'CAN', name: 'Canadá', flag: '🇨🇦' },
    { code: 'BIH', name: 'Bosnia y Herzegovina', flag: '🇧🇦' },
    { code: 'QAT', name: 'Catar', flag: '🇶🇦' },
    { code: 'SUI', name: 'Suiza', flag: '🇨🇭' },
  ],
  C: [
    { code: 'BRA', name: 'Brasil', flag: '🇧🇷' },
    { code: 'MAR', name: 'Marruecos', flag: '🇲🇦' },
    { code: 'HAI', name: 'Haití', flag: '🇭🇹' },
    { code: 'SCO', name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
  D: [
    { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'PAR', name: 'Paraguay', flag: '🇵🇾' },
    { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
    { code: 'TUR', name: 'Turquía', flag: '🇹🇷' },
  ],
  E: [
    { code: 'GER', name: 'Alemania', flag: '🇩🇪' },
    { code: 'CUW', name: 'Curazao', flag: '🇨🇼' },
    { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮' },
    { code: 'ECU', name: 'Ecuador', flag: '🇪🇨' },
  ],
  F: [
    { code: 'NED', name: 'Países Bajos', flag: '🇳🇱' },
    { code: 'JPN', name: 'Japón', flag: '🇯🇵' },
    { code: 'SWE', name: 'Suecia', flag: '🇸🇪' },
    { code: 'TUN', name: 'Túnez', flag: '🇹🇳' },
  ],
  G: [
    { code: 'BEL', name: 'Bélgica', flag: '🇧🇪' },
    { code: 'EGY', name: 'Egipto', flag: '🇪🇬' },
    { code: 'IRN', name: 'Irán', flag: '🇮🇷' },
    { code: 'NZL', name: 'Nueva Zelanda', flag: '🇳🇿' },
  ],
  H: [
    { code: 'ESP', name: 'España', flag: '🇪🇸' },
    { code: 'CPV', name: 'Cabo Verde', flag: '🇨🇻' },
    { code: 'KSA', name: 'Arabia Saudí', flag: '🇸🇦' },
    { code: 'URU', name: 'Uruguay', flag: '🇺🇾' },
  ],
  I: [
    { code: 'FRA', name: 'Francia', flag: '🇫🇷' },
    { code: 'SEN', name: 'Senegal', flag: '🇸🇳' },
    { code: 'IRQ', name: 'Irak', flag: '🇮🇶' },
    { code: 'NOR', name: 'Noruega', flag: '🇳🇴' },
  ],
  J: [
    { code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
    { code: 'ALG', name: 'Argelia', flag: '🇩🇿' },
    { code: 'AUT', name: 'Austria', flag: '🇦🇹' },
    { code: 'JOR', name: 'Jordania', flag: '🇯🇴' },
  ],
  K: [
    { code: 'POR', name: 'Portugal', flag: '🇵🇹' },
    { code: 'COD', name: 'RD Congo', flag: '🇨🇩' },
    { code: 'UZB', name: 'Uzbekistán', flag: '🇺🇿' },
    { code: 'COL', name: 'Colombia', flag: '🇨🇴' },
  ],
  L: [
    { code: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { code: 'CRO', name: 'Croacia', flag: '🇭🇷' },
    { code: 'GHA', name: 'Ghana', flag: '🇬🇭' },
    { code: 'PAN', name: 'Panamá', flag: '🇵🇦' },
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
 * Genera los 6 enfrentamientos de la fase de grupos para un grupo dado
 * (combinaciones de 4 equipos = 6 partidos).
 */
export function partidosDelGrupo(letra) {
  const equipos = GRUPOS[letra];
  const partidos = [];
  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      partidos.push({
        id: `${letra}-${equipos[i].code}-${equipos[j].code}`,
        grupo: letra,
        local: equipos[i],
        visitante: equipos[j],
      });
    }
  }
  return partidos;
}

/** Total de partidos de la fase de grupos: 12 grupos × 6 = 72. */
export const TODOS_LOS_PARTIDOS_GRUPOS = GRUPO_LETRAS.flatMap(partidosDelGrupo);
