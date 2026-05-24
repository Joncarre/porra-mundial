/**
 * Servicio de resultados oficiales del torneo (los que rellena el admin).
 *
 * En modo demo se almacenan en localStorage bajo "porra:resultados".
 * En modo real viven en Firestore en el documento "resultados/grupos".
 *
 * Estructura:
 *   {
 *     partidos: {
 *       'A-MEX-RSA': { golesLocal: 2, golesVisitante: 1 },
 *       ...
 *     }
 *   }
 *
 * El documento crece a medida que el admin va guardando partidos —
 * los que no tienen entrada todavía no se han jugado.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, DEMO_MODE } from '../firebase.js';

const STORE_KEY = 'porra:resultados';
const STORE_KEY_ELIM = 'porra:resultados_eliminatoria';
const FIRESTORE_DOC = ['resultados', 'grupos'];
const FIRESTORE_DOC_ELIM = ['resultados', 'eliminatoria'];

function readDemo() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : { partidos: {} };
  } catch {
    return { partidos: {} };
  }
}

function writeDemo(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export async function getResultadosGrupos() {
  if (DEMO_MODE) {
    return readDemo();
  }
  const snap = await getDoc(doc(db, ...FIRESTORE_DOC));
  return snap.exists() ? snap.data() : { partidos: {} };
}

/* ============================================================
   ELIMINATORIA — resultados oficiales del bracket
   ============================================================ */

/**
 * Resultados oficiales de la fase eliminatoria.
 * Estructura idéntica a las predicciones del usuario:
 *   { ganadores: { 73: 'MEX', ..., 103: 'X', 104: 'Y' } }
 */
export async function getResultadosEliminatoria() {
  if (DEMO_MODE) {
    try {
      const raw = localStorage.getItem(STORE_KEY_ELIM);
      return raw ? JSON.parse(raw) : { ganadores: {} };
    } catch {
      return { ganadores: {} };
    }
  }
  const snap = await getDoc(doc(db, ...FIRESTORE_DOC_ELIM));
  return snap.exists() ? snap.data() : { ganadores: {} };
}

export async function saveResultadosEliminatoria(ganadores) {
  const data = { ganadores };
  if (DEMO_MODE) {
    localStorage.setItem(STORE_KEY_ELIM, JSON.stringify(data));
  } else {
    await setDoc(doc(db, ...FIRESTORE_DOC_ELIM), data, { merge: true });
  }
  return data;
}

/**
 * Guarda (o reemplaza) los resultados de varios partidos de una vez.
 * @param {Object} updates - map de partidoId → { golesLocal, golesVisitante } | null
 *   Pasar `null` para eliminar un resultado previamente guardado.
 */
export async function saveResultadosPartidos(updates) {
  const actual = await getResultadosGrupos();
  const partidos = { ...(actual.partidos || {}) };
  for (const [id, value] of Object.entries(updates)) {
    if (value === null || value === undefined) {
      delete partidos[id];
    } else {
      partidos[id] = {
        golesLocal: Number(value.golesLocal),
        golesVisitante: Number(value.golesVisitante),
      };
    }
  }
  const data = { ...actual, partidos };

  if (DEMO_MODE) {
    writeDemo(data);
  } else {
    await setDoc(doc(db, ...FIRESTORE_DOC), data, { merge: true });
  }
  return data;
}
