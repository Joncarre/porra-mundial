import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';
import Header from './components/Header';
import Footer from './components/Footer';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import HowItWorks from './pages/HowItWorks';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import GroupResults from './pages/GroupResults';
import Brackets from './pages/Brackets';
import Admin from './pages/Admin';

const PUBLIC_PATHS = ['/', '/login', '/register', '/como-funciona'];

function Layout() {
  const { pathname } = useLocation();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  return (
    <>
      {!isPublic && <Header />}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/como-funciona" element={<HowItWorks />} />

        <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/clasificacion" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/grupos" element={<PrivateRoute><GroupResults /></PrivateRoute>} />
        <Route path="/eliminatoria" element={<PrivateRoute><Brackets /></PrivateRoute>} />

        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isPublic && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
