// src/auth/AuthProvider.jsx

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const login = ({ jwt, usuario }) => {
    setToken(jwt);
    setUsuario(usuario);
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
  };

  // --- FUNCIÓN NUEVA ---
  // Recibe los nuevos datos y actualiza el estado del usuario
  const updateUser = (nuevosDatos) => {
    setUsuario((usuarioActual) => ({
      ...usuarioActual, // Mantiene los datos que no se cambian (como id, username, etc.)
      ...nuevosDatos,  // Sobreescribe los datos que sí se cambiaron (nombre, apellido, email)
    }));
  };

  const isAuthenticated = !!token;
  return (
    <AuthContext.Provider
      // Agregamos updateUser al valor del contexto
      value={{ token, usuario, isAuthenticated, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}