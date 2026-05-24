/**
 * Servicio de predicciones de los participantes.
 *
 * predicciones_fase1: pronósticos de los 72 partidos de la fase de grupos.
 * predicciones_fase2: bracket eliminatorio + 3.º y 4.º puesto + ganador (fase 5).
 * predicciones_extras: máx goleador y balones (fase 6).
 *
 * En modo demo se guardan en localStorage; en modo real, en Firestore en
 * la colección correspondiente, con el id del usuario como id del documento.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, DEMO_MODE } from '../firebase.js';

const STORE_KEY_FASE1 = 'porra:predicciones_fase1';
const STORE_KEY_FASE2 = 'porra:predicciones_fase2';
const STORE_KEY_EXTRAS = 'porra:predicciones_extras';

function readDemoStore(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDemoStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ============================================================
   FASE 1 — predicciones de partidos de la fase de grupos
   ============================================================ */

export async function getPrediccionesFase1(userId) {
  if (DEMO_MODE) {
    const store = readDemoStore(STORE_KEY_FASE1);
    return store[userId] || { partidos: {} };
  }
  const snap = await getDoc(doc(db, 'predicciones_fase1', userId));
  return snap.exists() ? snap.data() : { partidos: {} };
}

/**
 * Reemplaza el conjunto de partidos pronosticados por el usuario.
 * @param {string} userId
 * @param {Object} partidos - map de partidoId → { golesLocal, golesVisitante }
 */
export async function savePrediccionesFase1(userId, partidos) {
  const data = { partidos };
  if (DEMO_MODE) {
    const store = readDemoStore(STORE_KEY_FASE1);
    store[userId] = data;
    writeDemoStore(STORE_KEY_FASE1, store);
  } else {
    await setDoc(doc(db, 'predicciones_fase1', userId), data, { merge: true });
  }
  return data;
}

/* ============================================================
   FASE 2 — bracket eliminatorio
   ============================================================ */

/**
 * Pronóstico del bracket del usuario. Estructura:
 *   {
 *     ganadores: {
 *       73: 'MEX', 74: 'GER', ... 88: '...',  // dieciseisavos
 *       89..96: '...',                          // octavos
 *       97..100: '...',                         // cuartos
 *       101..102: '...',                        // semifinales
 *       103: '...',  // ganador del tercer puesto (el otro semi-perdedor es 4.º)
 *       104: '...',  // campeón del mundial
 *     }
 *   }
 */
export async function getPrediccionesFase2(userId) {
  if (DEMO_MODE) {
    const store = readDemoStore(STORE_KEY_FASE2);
    return store[userId] || { ganadores: {} };
  }
  const snap = await getDoc(doc(db, 'predicciones_fase2', userId));
  return snap.exists() ? snap.data() : { ganadores: {} };
}

export async function savePrediccionesFase2(userId, ganadores) {
  const data = { ganadores };
  if (DEMO_MODE) {
    const store = readDemoStore(STORE_KEY_FASE2);
    store[userId] = data;
    writeDemoStore(STORE_KEY_FASE2, store);
  } else {
    await setDoc(doc(db, 'predicciones_fase2', userId), data, { merge: true });
  }
  return data;
}

/* ============================================================
   EXTRAS — máximo goleador y balones (oro / plata / bronce)
   ============================================================ */

const EXTRAS_DEFAULT = {
  maxGoleador: '',
  balonOro: '',
  balonPlata: '',
  balonBronce: '',
};

export async function getPrediccionesExtras(userId) {
  if (DEMO_MODE) {
    const store = readDemoStore(STORE_KEY_EXTRAS);
    return { ...EXTRAS_DEFAULT, ...(store[userId] || {}) };
  }
  const snap = await getDoc(doc(db, 'predicciones_extras', userId));
  return snap.exists() ? { ...EXTRAS_DEFAULT, ...snap.data() } : { ...EXTRAS_DEFAULT };
}

export async function savePrediccionesExtras(userId, extras) {
  const data = {
    maxGoleador: extras.maxGoleador?.trim() || '',
    balonOro: extras.balonOro?.trim() || '',
    balonPlata: extras.balonPlata?.trim() || '',
    balonBronce: extras.balonBronce?.trim() || '',
  };
  if (DEMO_MODE) {
    const store = readDemoStore(STORE_KEY_EXTRAS);
    store[userId] = data;
    writeDemoStore(STORE_KEY_EXTRAS, store);
  } else {
    await setDoc(doc(db, 'predicciones_extras', userId), data, { merge: true });
  }
  return data;
}
