import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMisPedidos = createAsyncThunk(
  "pedidos/fetchMisPedidos",
  async (_, { getState }) => {
    const { auth } = getState();
    const usuarioId = auth.usuario?.id;

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

const initialState = {
  pedidos: [],
  status: "idle",
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