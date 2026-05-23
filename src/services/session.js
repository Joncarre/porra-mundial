/**
 * Gestión de sesión vía localStorage.
 * La sesión es un simple registro del id del usuario logueado actualmente
 * — no usamos Firebase Auth por petición explícita del usuario.
 */

const SESSION_KEY = 'porra:session';

export function getSessionUserId() {
  try {
    return localStorage.getItem(SESSION_KEY) || null;
  } catch {
    return null;
  }
}

export function setSessionUserId(userId) {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
