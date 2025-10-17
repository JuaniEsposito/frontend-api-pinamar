import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:8080/productos";

// Helper para manejar errores (puedes importarlo desde un archivo común si lo tienes)
const getAxiosErrorMessage = (error) => {
  if (error.response && error.response.data) {
    return error.response.data.mensaje || error.response.data.message || error.message;
  }
  return error.message || "Error de red o desconocido.";
};

// --- THUNKS ASÍNCRONOS ---

// OBTENER todos los productos (público)
export const fetchProductos = createAsyncThunk(
  "productos/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e));
    }
  }
);

// ELIMINAR un producto (protegido, requiere token)
export const deleteProducto = createAsyncThunk(
  "productos/delete",
  async (productoId, { getState, rejectWithValue }) => {
    try {
      // Obtenemos el token del estado de autenticación
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/${productoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return productoId; // Retornamos el ID para quitarlo del estado
    } catch (e) {
      return rejectWithValue(getAxiosErrorMessage(e));
    }
  }
);

// NOTA: Los thunks para CREAR y ACTUALIZAR los crearemos cuando hagamos los formularios.
// Por ahora, con fetch y delete es suficiente para el dashboard.

// --- ESTADO INICIAL Y SLICE ---

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const productosSlice = createSlice({
  name: "productos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Productos
      .addCase(fetchProductos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete Producto
      .addCase(deleteProducto.pending, (state) => {
        state.status = 'loading'; // Opcional: mostrar un loading general
      })
      .addCase(deleteProducto.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Filtramos el producto eliminado del array
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProducto.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Podrías guardar este error para mostrar un toast/alerta
      });
  },
});

export default productosSlice.reducer;