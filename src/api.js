// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // La URL de tu backend de Spring
});

// Esta función "intercepta" cada llamada para agregar el token de autenticación.
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;