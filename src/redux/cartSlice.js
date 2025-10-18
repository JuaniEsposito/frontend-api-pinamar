import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken } from "../utils/auth";
import api from "../api"; // ✅ Usamos la instancia de Axios configurada

// Helper para obtener el ID del usuario de forma segura
const getUserId = (getState) => getState().auth.usuario?.id;

// -----------------------------------------------------------------
// Thunk para OBTENER el carrito del usuario logueado
// -----------------------------------------------------------------
export const fetchCarrito = createAsyncThunk(
  "cart/fetchCarrito",
  async (_, { rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getUserId(getState);
    if (!token || !userId) return rejectWithValue("Usuario no autenticado");

    try {
      // ✅ Endpoint: GET /carritos/usuario/{userId}
      const response = await api.get(`/carritos/usuario/${userId}`, { 
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      const data = response.data;
      
      // Asumimos que la respuesta es directa o que 'data' contiene 'items' y 'total'
      return {
          items: data.items || [],
          total: data.total || 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "No se pudo cargar el carrito");
    }
  }
);

// -----------------------------------------------------------------
// Thunk para AGREGAR un producto (o sumar cantidad)
// -----------------------------------------------------------------
export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ productoId, cantidad }, { dispatch, rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getUserId(getState);
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión.");

    try {
      // ✅ Endpoint: PATCH /carritos/usuario/{userId}/producto/{productoId}?cantidad={cantidad}
      await api.patch(
        `/carritos/usuario/${userId}/producto/${productoId}?cantidad=${cantidad}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al agregar al carrito.";
      return rejectWithValue(errorMessage);
    }
    
    // 💡 Actualiza el carrito después del cambio
    dispatch(fetchCarrito());
  }
);

// -----------------------------------------------------------------
// Thunk para ELIMINAR un producto (o restar cantidad/eliminar item)
// -----------------------------------------------------------------
export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async ({ productoId, cantidad }, { dispatch, rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getUserId(getState);
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión.");

    try {
      // ✅ Endpoint: DELETE /carritos/usuario/{userId}/producto/{productoId}?cantidad={cantidad}
      await api.delete(
        `/carritos/usuario/${userId}/producto/${productoId}?cantidad=${cantidad}`,
        { 
          // Necesario para DELETE en Axios cuando se envían headers
          data: {}, 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      return rejectWithValue("Error al eliminar del carrito.");
    }

    // 💡 Actualiza el carrito después del cambio
    dispatch(fetchCarrito());
  }
);

// -----------------------------------------------------------------
// Thunk para FINALIZAR LA COMPRA (CHECKOUT)
// -----------------------------------------------------------------
export const checkoutThunk = createAsyncThunk(
  "cart/checkout",
  async (orderData, { dispatch, rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getUserId(getState);
    
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión para finalizar la compra.");

    // 🔑 Construimos el body de la petición (UsuarioId es necesario según el backend)
    const requestBody = {
        usuarioId: userId, 
        direccionId: orderData.direccionId, 
        descuento: orderData.descuento, 
        items: orderData.items 
    };

    try {
      // ✅ Endpoint: POST /ordenes
      const response = await api.post(`/ordenes`, requestBody, { 
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      // 🚨 La respuesta del backend es el objeto de la orden directamente (no anidado)
      const ordenConfirmada = response.data;
      
      // Limpiamos el carrito localmente al éxito
      dispatch(resetCarrito());

      return ordenConfirmada;
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al procesar el pago y crear la orden.";
      return rejectWithValue(errorMessage);
    }
  }
);


const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
    status: "idle", // 'idle', 'loading', 'succeeded', 'failed'
    error: null,
    checkoutStatus: "idle", // 'idle', 'loading', 'succeeded', 'failed'
    ordenConfirmada: null,
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
      // Fetch Carrito
      .addCase(fetchCarrito.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.items = [];
        state.total = 0;
      })
      // Add Product (solo maneja errores, fetchCarrito hace la actualización)
      .addCase(addProductToCart.rejected, (state, action) => {
          state.error = action.payload;
      })
      // Checkout
      .addCase(checkoutThunk.pending, (state) => {
        state.checkoutStatus = "loading";
        state.error = null;
      })
      .addCase(checkoutThunk.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        state.ordenConfirmada = action.payload;
        // El carrito se reseteó por el dispatch de resetCarrito en el thunk
      })
      .addCase(checkoutThunk.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCarrito } = cartSlice.actions;

// Exportamos todos los thunks y el reducer
export default cartSlice.reducer;