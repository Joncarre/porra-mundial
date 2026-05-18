import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('porra_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('porra_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (nickname, password) => {
    const q = query(
      collection(db, 'users'),
      where('nickname', '==', nickname.trim()),
      where('password', '==', password)
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Usuario o contraseña incorrectos');

    const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };
    setUser(userData);
    localStorage.setItem('porra_user', JSON.stringify(userData));
    return userData;
  };

  const register = async ({ nombre, apellidos, email, nickname, password }) => {
    // Verificar que el nickname no esté en uso
    const q = query(collection(db, 'users'), where('nickname', '==', nickname.trim()));
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error('Ese nickname ya está en uso');

    const docRef = await addDoc(collection(db, 'users'), {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      nickname: nickname.trim(),
      password,
      isAdmin: false,
      pagado: false,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('porra_user');
  };

  // Refresca los datos del usuario desde localStorage
  // (útil si el admin actualiza datos)
  const refreshUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('porra_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
