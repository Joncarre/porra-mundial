/**
 * Configuración general del torneo: bote total y máximo goleador
 * actual (durante el torneo, antes de saberse el oficial). Ambos los
 * gestiona el admin en su panel.
 *
 * Documento: torneo/config
 *   { boteTotal: number, maxGoleadorActual: string }
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, DEMO_MODE } from '../firebase.js';

const STORE_KEY = 'porra:torneo_config';
const FIRESTORE_DOC = ['torneo', 'config'];

const DEFAULT_CONFIG = {
  boteTotal: 0,
  maxGoleadorActual: '',
};

export async function getTorneoConfig() {
  if (DEMO_MODE) {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }
  const snap = await getDoc(doc(db, ...FIRESTORE_DOC));
  return snap.exists() ? { ...DEFAULT_CONFIG, ...snap.data() } : { ...DEFAULT_CONFIG };
}

export async function saveTorneoConfig(config) {
  const data = {
    boteTotal: Number(config.boteTotal) || 0,
    maxGoleadorActual: config.maxGoleadorActual?.trim() || '',
  };
  if (DEMO_MODE) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } else {
    await setDoc(doc(db, ...FIRESTORE_DOC), data, { merge: true });
  }
  return data;
}
