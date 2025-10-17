import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken } from "../utils/auth"; // Suponiendo que tienes una función para obtener el token

// Thunk para OBTENER el carrito del usuario logueado
export const fetchCarrito = createAsyncThunk(
  "cart/fetchCarrito",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No hay token");

    const response = await fetch("http://localhost:4040/carritos/mi-carrito", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return rejectWithValue("No se pudo cargar el carrito");
    }
    const data = await response.json();
    // Tu backend devuelve un CarritoResponse, que puede no tener `items`.
    // Asegurémonos de que el estado siempre tenga una estructura consistente.
    return {
      items: data.items || [],
      total: data.total || 0,
    };
  }
);

// Thunk para AGREGAR un producto (o sumar cantidad)
export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ productoId, cantidad }, { dispatch, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No hay token");

    await fetch(
      `http://localhost:4040/carritos/mi-carrito/producto/${productoId}?cantidad=${cantidad}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Después de agregar, volvemos a pedir el carrito completo para actualizar el estado
    dispatch(fetchCarrito());
  }
);

// Thunk para ELIMINAR un producto (o restar cantidad)
export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async ({ productoId, cantidad }, { dispatch, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No hay token");

    await fetch(
      `http://localhost:4040/carritos/mi-carrito/producto/${productoId}?cantidad=${cantidad}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Después de eliminar, volvemos a pedir el carrito completo para actualizar el estado
    dispatch(fetchCarrito());
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    resetCarrito(state) {
      state.items = [];
      state.total = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrito.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCarrito } = cartSlice.actions;
export default cartSlice.reducer;