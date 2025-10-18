import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; 

const API_URL = "http://localhost:8080/usuarios"; 

const getAxiosErrorMessage = (error) => {
  if (error.response && error.response.data) {
    return error.response.data.mensaje || error.response.data.message || "Error del servidor.";
  }
  return error.message || "Error de red o desconocido.";
};

// login 
export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      const data = response.data;
      
      localStorage.setItem(
        "auth",
        JSON.stringify({ token: data.token, usuario: data.usuario })
      );
      
      return { token: data.token, usuario: data.usuario };
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e) || "Credenciales inválidas.");
    }
  }
);

// logout
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("auth");
});

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, userData);

      const usuarioCreado = response.data.data;
      const username = usuarioCreado?.username || 'user_sin_nombre';
      const mockToken = `mock_token_for_${username}_${Date.now()}`;

      const authData = {
          token: mockToken, 
          usuario: usuarioCreado 
      };

      localStorage.setItem("auth", JSON.stringify(authData));
      
      return authData; 

    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e) || "Error al registrar usuario.");
    }
  }
);

export const verificarEmailThunk = createAsyncThunk(
  "auth/verificarEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/exists/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e) || "Error al verificar el correo.");
    }
  }
);

export const cambiarPasswordThunk = createAsyncThunk(
  "auth/cambiarPassword",
  async ({ email, nuevaContrasena }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/cambiar-password?email=${email}`,
        { nuevaContrasena }
      );
      return response.data; 
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e) || "Error al cambiar la contraseña.");
    }
  }
);

export const cambiarPasswordLogThunk = createAsyncThunk(
  "auth/cambiarPasswordLog",
  async ({ token, contrasenaActual, nuevaContrasena }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/password`, 
        { contrasenaActual, nuevaContrasena },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e) || "Error al cambiar la contraseña.");
    }
  }
);

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
      localStorage.removeItem("auth"); 
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
      // login
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
      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.usuario = null;
        state.isAuthenticated = false;
        state.error = "";
      })
      // registro
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token; 
        state.usuario = action.payload.usuario;
        state.isAuthenticated = true;
        state.error = "";
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      
      })
       .addCase(verificarEmailThunk.pending, (state) => { state.loading = true; state.error = ""; })
       .addCase(verificarEmailThunk.fulfilled, (state) => { state.loading = false; state.error = ""; })
       .addCase(verificarEmailThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
       .addCase(cambiarPasswordThunk.pending, (state) => { state.loading = true; state.error = ""; })
       .addCase(cambiarPasswordThunk.fulfilled, (state) => { state.loading = false; state.error = ""; })
       .addCase(cambiarPasswordThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
       .addCase(cambiarPasswordLogThunk.pending, (state) => { state.loading = true; state.error = ""; })
       .addCase(cambiarPasswordLogThunk.fulfilled, (state) => { state.loading = false; state.error = ""; })
       .addCase(cambiarPasswordLogThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { restoreAuth, clearAuthError } = authSlice.actions;
export default authSlice.reducer;