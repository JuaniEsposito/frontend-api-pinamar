import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080/categorias";

const getAxiosErrorMessage = (error) => {
  if (error.response && error.response.data) {
    return error.response.data.mensaje || error.response.data.message || error.message;
  }
  return error.message || "Error de red o desconocido.";
};

// --- THUNKS ASÍNCRONOS ---

// OBTENER todas las categorias
export const fetchCategorias = createAsyncThunk(
  "categorias/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e));
    }
  }
);

// 👈 NUEVO: CREAR una categoria (protegido)
export const createCategoriaThunk = createAsyncThunk(
  "categorias/create",
  async (categoriaData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(API_URL, categoriaData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Retorna la nueva categoría creada
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e));
    }
  }
);

// 👈 NUEVO: ACTUALIZAR una categoria (protegido)
export const updateCategoriaThunk = createAsyncThunk(
  "categorias/update",
  async ({ id, categoriaData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/${id}`, categoriaData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Retorna la categoría actualizada
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e));
    }
  }
);


// ELIMINAR una categoria
export const deleteCategoria = createAsyncThunk(
  "categorias/delete",
  async (categoriaId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/${categoriaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return categoriaId;
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e));
    }
  }
);

// --- ESTADO INICIAL Y SLICE ---

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const categoriasSlice = createSlice({
  name: "categorias",
  initialState,
  reducers: {
    // Opcional: un reducer para limpiar errores si es necesario
    clearCategoriasError(state) {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categorias
      .addCase(fetchCategorias.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // 👈 NUEVO: Create Categoria
      .addCase(createCategoriaThunk.fulfilled, (state, action) => {
        state.items.push(action.payload); // Agrega la nueva categoría a la lista
        state.status = 'succeeded';
      })
      .addCase(createCategoriaThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
       // 👈 NUEVO: Update Categoria
      .addCase(updateCategoriaThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload; // Reemplaza la categoría vieja por la actualizada
        }
        state.status = 'succeeded';
      })
      .addCase(updateCategoriaThunk.rejected, (state, action) => {
          state.error = action.payload;
      })
      // Delete Categoria
      .addCase(deleteCategoria.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
        state.status = 'succeeded';
      });
  },
});

export const { clearCategoriasError } = categoriasSlice.actions;
export default categoriasSlice.reducer;