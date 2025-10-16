import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // 👈 Importamos Axios

const API_URL = "http://localhost:8080/usuarios";

// Helper para manejar errores de Axios y devolver un mensaje limpio
const getAxiosErrorMessage = (error) => {
  if (error.response && error.response.data) {
    // Si el backend devuelve un mensaje, úsalo (ej: error.response.data.mensaje o .message)
    return error.response.data.mensaje || error.response.data.message || error.message;
  }
  // Para errores de red o desconocidos
  return error.message || "Error de red o desconocido.";
};

// -----------------------------------------------------------------
// Login
// -----------------------------------------------------------------
export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Usamos axios.post
      const response = await axios.post(`${API_URL}/login`, { username, password });
      const data = response.data;
      
      // Persistir en localStorage
      localStorage.setItem(
        "auth",
        JSON.stringify({ token: data.token, usuario: data.usuario })
      );
      
      return { token: data.token, usuario: data.usuario };
    } catch (e) {
      // Usamos el helper de error
      return rejectWithValue(getAxiosErrorMessage(e) || "Error de autenticación.");
    }
  }
);

// -----------------------------------------------------------------
// Logout (solo limpia el estado)
// -----------------------------------------------------------------
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("auth");
});

// -----------------------------------------------------------------
// Registro de usuario
// -----------------------------------------------------------------
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      // Usamos axios.post
      const response = await axios.post(API_URL, userData);
      // Retorna la respuesta completa del nuevo usuario
      return response.data; 
    } catch (e) {
      // Usamos el helper de error
      return rejectWithValue(getAxiosErrorMessage(e) || "Error al registrar usuario.");
    }
  }
);

// -----------------------------------------------------------------
// Verificar email para reset password
// -----------------------------------------------------------------
export const verificarEmailThunk = createAsyncThunk(
  "auth/verificarEmail",
  async (email, { rejectWithValue }) => {
    try {
      // Usamos axios.get
      const response = await axios.get(`${API_URL}/exists/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (e) {
      // Usamos el helper de error
      return rejectWithValue(getAxiosErrorMessage(e) || "Error al verificar el correo.");
    }
  }
);

// -----------------------------------------------------------------
// Cambiar contraseña (reset por email)
// -----------------------------------------------------------------
export const cambiarPasswordThunk = createAsyncThunk(
  "auth/cambiarPassword",
  async ({ email, nuevaContrasena }, { rejectWithValue }) => {
    try {
      // Usamos axios.put
      const response = await axios.put(
        `${API_URL}/cambiar-password?email=${email}`,
        { nuevaContrasena }
      );
      // Axios parsea la respuesta, si no es JSON, usa response.data.
      return response.data; 
    } catch (e) {
      // Usamos el helper de error
      return rejectWithValue(getAxiosErrorMessage(e) || "Error al cambiar la contraseña.");
    }
  }
);

// -----------------------------------------------------------------
// Cambiar contraseña logueado
// -----------------------------------------------------------------
export const cambiarPasswordLogThunk = createAsyncThunk(
  "auth/cambiarPasswordLog",
  async ({ token, contrasenaActual, nuevaContrasena }, { rejectWithValue }) => {
    try {
      // Usamos axios.put
      const response = await axios.put(`${API_URL}/password`, 
        { contrasenaActual, nuevaContrasena },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Axios parsea la respuesta, si no es JSON, usa response.data.
      return response.data;
    } catch (e) {
      // Usamos el helper de error
      return rejectWithValue(getAxiosErrorMessage(e) || "Error al cambiar la contraseña.");
    }
  }
);

// -----------------------------------------------------------------
// Estado Inicial y Slice (sin cambios en la lógica del slice)
// -----------------------------------------------------------------

const initialState = (() => {
  const persisted = localStorage.getItem("auth");
  if (persisted) {
    try {
      const { token, usuario } = JSON.parse(persisted);
      return {
        token,
        usuario,
        loading: false,
        error: "",
        isAuthenticated: !!token,
      };
    } catch {
      return {
        token: null,
        usuario: null,
        loading: false,
        error: "",
        isAuthenticated: false,
      };
    }
  }
  return {
    token: null,
    usuario: null,
    loading: false,
    error: "",
    isAuthenticated: false,
  };
})();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreAuth(state, action) {
      state.token = action.payload.token;
      state.usuario = action.payload.usuario;
      state.isAuthenticated = !!action.payload.token;
      state.error = "";
    },
    clearAuthError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.usuario = action.payload.usuario;
        state.isAuthenticated = true;
        state.error = "";
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.usuario = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.usuario = null;
        state.isAuthenticated = false;
        state.error = "";
      })
      // Registro
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = "";
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verificar email
      .addCase(verificarEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(verificarEmailThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = "";
      })
      .addCase(verificarEmailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cambiar contraseña (reset)
      .addCase(cambiarPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(cambiarPasswordThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = "";
      })
      .addCase(cambiarPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cambiar contraseña logueado
      .addCase(cambiarPasswordLogThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(cambiarPasswordLogThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = "";
      })
      .addCase(cambiarPasswordLogThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { restoreAuth, clearAuthError } = authSlice.actions;
export default authSlice.reducer;