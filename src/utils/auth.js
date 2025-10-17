// src/utils/auth.js

export const getToken = () => {
  try {
    // 1. Buscamos el item 'auth' que guarda tu authSlice.
    const authDataString = localStorage.getItem("auth");

    // 2. Si no existe, no hay token.
    if (!authDataString) {
      return null;
    }

    // 3. Convertimos el string de vuelta a un objeto.
    const authData = JSON.parse(authDataString);

    // 4. Devolvemos únicamente el token que está dentro de ese objeto.
    return authData?.token; // El '?' es por seguridad si el objeto no tiene la propiedad 'token'

  } catch (error) {
    // Si hay algún error (ej: JSON mal formado), devolvemos null.
    console.error("Error al obtener el token desde localStorage:", error);
    return null;
  }
};