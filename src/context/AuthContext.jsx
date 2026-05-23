import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSessionUserId, setSessionUserId, clearSession } from '../services/session.js';
import { getUserById, checkCredentials, updateUser } from '../services/users.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recupera la sesión al cargar la app.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = getSessionUserId();
      if (id) {
        const u = await getUserById(id);
        if (!cancelled) setUser(u);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (nickname, password) => {
    const u = await checkCredentials(nickname, password);
    if (!u) throw new Error('Nickname o contraseña incorrectos');
    setSessionUserId(u.id);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  /** Refresca al usuario actual desde el store (útil tras editar el perfil). */
  const refreshUser = useCallback(async () => {
    if (!user) return null;
    const fresh = await getUserById(user.id);
    setUser(fresh);
    return fresh;
  }, [user]);

  /** Atajo para actualizar campos del usuario actual. */
  const patchUser = useCallback(async (updates) => {
    if (!user) return null;
    const fresh = await updateUser(user.id, updates);
    setUser(fresh);
    return fresh;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, patchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
