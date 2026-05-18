import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';
import Header from './components/Header';
import Footer from './components/Footer';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import GroupResults from './pages/GroupResults';
import Brackets from './pages/Brackets';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas privadas (requieren login) */}
          <Route
            path="/perfil"
            element={<PrivateRoute><Profile /></PrivateRoute>}
          />
          <Route
            path="/clasificacion"
            element={<PrivateRoute><Leaderboard /></PrivateRoute>}
          />
          <Route
            path="/grupos"
            element={<PrivateRoute><GroupResults /></PrivateRoute>}
          />
          <Route
            path="/eliminatoria"
            element={<PrivateRoute><Brackets /></PrivateRoute>}
          />

          {/* Ruta de administrador */}
          <Route
            path="/admin"
            element={<AdminRoute><Admin /></AdminRoute>}
          />

          {/* Redirección para rutas desconocidas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
