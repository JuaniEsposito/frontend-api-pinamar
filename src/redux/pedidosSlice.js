import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// El Thunk (sin cambios)
export const fetchMisPedidos = createAsyncThunk(
  "pedidos/fetchMisPedidos",
  async (_, { getState }) => {
    const { auth } = getState();
    const usuarioId = auth.usuario?.id; // Ajusta esto a tu estado de auth

    if (!usuarioId) {
      throw new Error("Usuario no autenticado");
    }

    const response = await fetch(
      `http://localhost:8080/ordenes/usuarios/${usuarioId}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener los pedidos");
    }

    const data = await response.json();
    return data;
  }
);

// El Slice
const initialState = {
  pedidos: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const pedidosSlice = createSlice({
  name: "pedidos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisPedidos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMisPedidos.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // --- INICIO DE LA MODIFICACIÓN ---
        // Manejamos la estructura [[...]] que devuelve tu API.
        // Asumimos que la lista real de pedidos está en el primer elemento.
        if (Array.isArray(action.payload) && action.payload.length > 0 && Array.isArray(action.payload[0])) {
          state.pedidos = action.payload[0]; // Asignamos la lista interna
        } else {
          // Fallback por si la API cambia a una lista simple [...]
          state.pedidos = action.payload;
        }
        // --- FIN DE LA MODIFICACIÓN ---
      })
      .addCase(fetchMisPedidos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default pedidosSlice.reducer;