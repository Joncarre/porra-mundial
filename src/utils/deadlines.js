/**
 * Fecha tope a partir de la cual las apuestas del usuario quedan
 * congeladas. El Mundial empieza el 11 de junio de 2026 a las 00:00
 * hora de España (CEST, UTC+2). En ese momento las plantillas de
 * Apuestas, Bracket y Extras dejan de ser editables.
 *
 * Se evalúa con la hora del cliente. Para una porra entre amigos es
 * suficiente; si en algún momento quieres reforzarlo, se podría mover
 * a un timestamp guardado en torneo/config y leerlo desde Firestore.
 */

export const APUESTAS_DEADLINE = new Date('2026-06-11T00:00:00+02:00');

export function apuestasCerradas(now = new Date()) {
  return now.getTime() >= APUESTAS_DEADLINE.getTime();
}

/** Texto humano completo del cierre, para mostrar en los avisos. */
export const APUESTAS_DEADLINE_LABEL = '11 de junio a las 00:00';
