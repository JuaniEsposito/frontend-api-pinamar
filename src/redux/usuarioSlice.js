import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // 👈 Importamos Axios

const API_URL = "http://localhost:8080/usuarios"; // 👈 URL Base ajustada a 8080

// Helper para manejar errores de Axios y devolver un mensaje limpio
const getAxiosErrorMessage = (error, defaultMsg) => {
  if (error.response && error.response.data) {
    // Si el backend devuelve un mensaje (propiedad 'mensaje' o 'message'), úsalo
    return error.response.data.mensaje || error.response.data.message || defaultMsg;
  }
  return error.message || defaultMsg;
};

// -----------------------------------------------------------------
// Traer perfil de usuario
// -----------------------------------------------------------------
export const fetchPerfil = createAsyncThunk(
  "usuario/fetchPerfil",
  async ({ token, id }, { rejectWithValue }) => {
    try {
      // Usamos axios.get (o fetch adaptado, lo haré con fetch para compatibilidad con tu código actual)
      const res = await fetch(`http://localhost:8080/usuarios/${id}`, { // 🚨 Usar 8080 si corresponde
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar el perfil.");
       
      const responseJson = await res.json();
      
      // 🔑 CAMBIO CLAVE: Devolver solo la propiedad 'data'
      return responseJson.data; // <--- Devolvemos el objeto de perfil limpio
      
    } catch (e) {
      return rejectWithValue(e.message || "Error al cargar perfil.");
    }
  }
);

// -----------------------------------------------------------------
// Traer lista de usuarios
// -----------------------------------------------------------------
export const fetchUsuarios = createAsyncThunk(
  "usuario/fetchUsuarios",
  async (token, { rejectWithValue }) => {
    try {
      // Usamos axios.get
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // Ajustá según lo que devuelva tu backend
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e, "Error al cargar lista de usuarios."));
    }
  }
);

// -----------------------------------------------------------------
// Editar perfil de usuario
// -----------------------------------------------------------------
export const updatePerfil = createAsyncThunk(
  "usuario/updatePerfil",
  async ({ token, formData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth?.usuario?.id;
      
      if (!userId) {
        throw new Error("No se encontró el ID del usuario autenticado para actualizar.");
      }

      // 1. Llamada a la API (asumiendo que usas Axios y puerto 8080)
      const response = await axios.patch(`http://localhost:8080/usuarios/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔑 CAMBIO CLAVE AQUÍ: Devolver solo la propiedad 'data'
      // El backend responde: {"mensaje": "...", "data": {datos_actualizados}}
      return response.data.data; 

    } catch (e) {
      if (e.message.includes("ID del usuario")) {
          return rejectWithValue(e.message);
      }
      return rejectWithValue(getAxiosErrorMessage(e, "Error al actualizar perfil."));
    }
  }
);

// -----------------------------------------------------------------
// Slice y Reducers (Sin cambios funcionales en la lógica)
// -----------------------------------------------------------------

const usuarioSlice = createSlice({
  name: "usuario",
  initialState: {
    perfil: null,
    loading: false,
    error: "",
    success: "",
  },
  reducers: {
    clearUsuarioMsg(state) {
      state.error = "";
      state.success = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPerfil
      .addCase(fetchPerfil.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchPerfil.fulfilled, (state, action) => {
        state.loading = false;
        state.perfil = action.payload;
      })
      .addCase(fetchPerfil.rejected, (state, action) => {
        state.loading = false;
        state.perfil = null; // Limpiar perfil si la carga falla
        state.error = action.payload;
      })
      // updatePerfil
      .addCase(updatePerfil.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = "";
      })
      .addCase(updatePerfil.fulfilled, (state, action) => {
        state.loading = false;
        // El perfil se actualiza con los nuevos datos devueltos por la API
        state.perfil = action.payload; 
        state.success = "Perfil actualizado correctamente.";
      })
      .addCase(updatePerfil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUsuarioMsg } = usuarioSlice.actions;
export default usuarioSlice.reducer;