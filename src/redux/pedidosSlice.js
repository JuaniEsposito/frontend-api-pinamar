import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// El Thunk: Va a tu backend a buscar los pedidos del usuario logueado.
export const fetchMisPedidos = createAsyncThunk(
  "pedidos/fetchMisPedidos",
  async (_, { getState }) => {
    // Asume que la info del usuario está en el slice de 'auth'
    const { auth } = getState();
    const usuarioId = auth.usuario?.id;

    if (!usuarioId) {
      throw new Error("Usuario no autenticado");
    }

    // Llama a tu endpoint del backend
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

// Define el estado inicial para este slice
const initialState = {
  pedidos: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Crea el slice que maneja los estados de la llamada
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
        // Maneja la estructura de array anidado [[...]] que devuelve tu API
        if (Array.isArray(action.payload) && action.payload.length > 0 && Array.isArray(action.payload[0])) {
          state.pedidos = action.payload[0];
        } else {
          state.pedidos = action.payload;
        }
      })
      .addCase(fetchMisPedidos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default pedidosSlice.reducer;