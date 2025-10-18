// src/components/AdminRoute.jsx

import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

// Este componente actúa como un "guardián" para las rutas de administrador
export default function AdminRoute({ children }) {
  const { isAuthenticated, usuario } = useSelector((state) => state.auth);
  const location = useLocation();

  const isAdmin = usuario?.rol === 'ADMIN';

  // Si el usuario está logueado Y es admin, le damos acceso.
  if (isAuthenticated && isAdmin) {
    return children;
  }

  // Si no cumple las condiciones, lo redirigimos a la página de inicio.'replace' evita que el usuario pueda volver a la página de admin con el botón "atrás".
  return <Navigate to="/" state={{ from: location }} replace />;
}