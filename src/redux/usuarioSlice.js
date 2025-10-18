import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080/usuarios"; 

const getAxiosErrorMessage = (error, defaultMsg) => {
  if (error.response && error.response.data) {
    return error.response.data.mensaje || error.response.data.message || defaultMsg;
  }
  return error.message || defaultMsg;
};

export const fetchPerfil = createAsyncThunk(
  "usuario/fetchPerfil",
  async ({ token, id }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8080/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar el perfil.");
       
      const responseJson = await res.json();
      
      return responseJson.data;
      
    } catch (e) {
      return rejectWithValue(e.message || "Error al cargar perfil.");
    }
  }
);

export const fetchUsuarios = createAsyncThunk(
  "usuario/fetchUsuarios",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e, "Error al cargar lista de usuarios."));
    }
  }
);

export const updatePerfil = createAsyncThunk(
  "usuario/updatePerfil",
  async ({ token, formData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth?.usuario?.id;
      
      if (!userId) {
        throw new Error("No se encontró el ID del usuario autenticado para actualizar.");
      }

      const response = await axios.patch(`http://localhost:8080/usuarios/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data; 

    } catch (e) {
      if (e.message.includes("ID del usuario")) {
          return rejectWithValue(e.message);
      }
      return rejectWithValue(getAxiosErrorMessage(e, "Error al actualizar perfil."));
    }
  }
);

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
        state.perfil = null;
        state.error = action.payload;
      })
      
      .addCase(updatePerfil.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = "";
      })
      .addCase(updatePerfil.fulfilled, (state, action) => {
        state.loading = false;
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