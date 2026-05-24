/**
 * Fecha tope a partir de la cual las apuestas del usuario quedan
 * congeladas. El Mundial empieza el 11 de junio de 2026; a partir
 * del 10 de junio ya no se permite editar predicciones (Apuestas,
 * Bracket, Extras). Lo que el usuario haya guardado se mantiene.
 *
 * Se evalúa con la hora del cliente. Para una porra entre amigos es
 * suficiente; si en algún momento quieres reforzarlo, se podría
 * mover a un timestamp guardado en torneo/config y leerlo desde
 * Firestore.
 */

export const APUESTAS_DEADLINE = new Date('2026-06-10T00:00:00');

export function apuestasCerradas(now = new Date()) {
  return now.getTime() >= APUESTAS_DEADLINE.getTime();
}

/** Texto humano del cierre, para mostrar en el aviso. */
export const APUESTAS_DEADLINE_LABEL = '10 de junio de 2026';
