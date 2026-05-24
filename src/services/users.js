/**
 * Servicio CRUD de usuarios.
 *
 * - En modo demo (VITE_DEMO_MODE=true) los usuarios se guardan en localStorage,
 *   bajo la clave "porra:users", como un array.
 * - En modo real se guarda cada usuario como documento en Firestore en la
 *   colección "users".
 *
 * Contratos:
 *  - Las contraseñas se almacenan en texto plano por petición explícita
 *    del usuario. No añadir hashing.
 *  - createUser falla si el nickname ya existe.
 *  - Devuelve siempre el objeto usuario completo (incluido id).
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db, DEMO_MODE } from '../firebase.js';

const STORE_KEY = 'porra:users';

// =====================================================================
//   DEMO STORE (localStorage)
// =====================================================================

function readDemoStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeDemoStore(users) {
  localStorage.setItem(STORE_KEY, JSON.stringify(users));
}

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'u_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

// =====================================================================
//   PUBLIC API
// =====================================================================

/**
 * Crea un usuario nuevo.
 * @param {Object} data - { nombre, apellidos, email, nickname, password }
 * @returns {Promise<Object>} usuario creado con id y campos derivados
 * @throws Error si el nickname ya existe
 */
export async function createUser(data) {
  const existing = await findUserByNickname(data.nickname);
  if (existing) {
    throw new Error('Este nickname ya está en uso. Elige otro.');
  }

  const user = {
    id: genId(),
    nombre: data.nombre.trim(),
    apellidos: data.apellidos.trim(),
    email: data.email.trim().toLowerCase(),
    nickname: data.nickname.trim(),
    password: data.password,
    avatarFoto: null, // se rellena al subir una imagen desde el perfil
    isAdmin: false,
    pagado: false,
    // Estado de plantillas — útil para la pantalla de Perfil
    plantillaGruposCompletada: false,
    plantillaEliminatoriaCompletada: false,
    plantillaOtrasApuestasCompletada: false,
    createdAt: new Date().toISOString(),
  };

  if (DEMO_MODE) {
    const users = readDemoStore();
    users.push(user);
    writeDemoStore(users);
  } else {
    await setDoc(doc(db, 'users', user.id), user);
  }
  return user;
}

export async function findUserByNickname(nickname) {
  const nick = nickname.trim();
  if (DEMO_MODE) {
    return readDemoStore().find((u) => u.nickname === nick) || null;
  }
  const q = query(collection(db, 'users'), where('nickname', '==', nick));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
}

export async function getUserById(id) {
  if (DEMO_MODE) {
    return readDemoStore().find((u) => u.id === id) || null;
  }
  const snap = await getDoc(doc(db, 'users', id));
  return snap.exists() ? snap.data() : null;
}

export async function updateUser(id, updates) {
  if (DEMO_MODE) {
    const users = readDemoStore();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');
    users[idx] = { ...users[idx], ...updates };
    writeDemoStore(users);
    return users[idx];
  }
  await updateDoc(doc(db, 'users', id), updates);
  return getUserById(id);
}

/** Devuelve true si las credenciales son correctas y devuelve el usuario. */
export async function checkCredentials(nickname, password) {
  const user = await findUserByNickname(nickname);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}

export async function getAllUsers() {
  if (DEMO_MODE) return readDemoStore();
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data());
}
