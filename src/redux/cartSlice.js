import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken } from "../utils/auth";
import api from "../api"; // ✅ Usamos la instancia de Axios configurada (apunta a :8080)

// Thunk para OBTENER el carrito del usuario logueado
export const fetchCarrito = createAsyncThunk(
  "cart/fetchCarrito",
  async (_, { rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getState().auth.usuario?.id; // Obtenemos el ID del store
    if (!token || !userId) return rejectWithValue("Usuario no autenticado");

    try {
        // ✅ Endpoint corregido para usar el ID del usuario
        const response = await api.get(`/carritos/usuario/${userId}`, { 
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = response.data;
        
        return {
            items: data.items || [],
            total: data.total || 0,
        };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "No se pudo cargar el carrito");
    }
  }
);

// Thunk para AGREGAR un producto (o sumar cantidad)
export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ productoId, cantidad }, { dispatch, rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getState().auth.usuario?.id;
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión.");

    try {
        // ✅ Endpoint corregido para usar el ID del usuario en la ruta
        await api.patch(
            `/carritos/usuario/${userId}/producto/${productoId}?cantidad=${cantidad}`,
            {}, // Enviamos un objeto vacío para el body, evitando errores de Spring
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error) {
        // Rechazamos con el mensaje de error del backend (Stock insuficiente, etc.)
        const errorMessage = error.response?.data?.message || "Error al agregar al carrito.";
        return rejectWithValue(errorMessage);
    }
    
    dispatch(fetchCarrito());
  }
);

// Thunk para ELIMINAR un producto (o restar cantidad)
export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async ({ productoId, cantidad }, { dispatch, rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getState().auth.usuario?.id;
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión.");

    try {
        // ✅ Endpoint corregido para usar el ID del usuario en la ruta
        await api.delete(
            `/carritos/usuario/${userId}/producto/${productoId}?cantidad=${cantidad}`,
            { 
                data: {}, // Necesario para DELETE en Axios cuando se envían headers/body
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error) {
        return rejectWithValue("Error al eliminar del carrito.");
    }

    dispatch(fetchCarrito());
  }
);

export const checkoutThunk = createAsyncThunk(
  "cart/checkout",
  async (orderData, { dispatch, rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getState().auth.usuario?.id;
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión para finalizar la compra.");

    try {
      // 1. Endpoint para crear la orden (asumo /ordenes/usuario/{userId})
      // orderData debe contener { direccionId, totalFinal, descuento, etc. }
      const response = await api.post(`/ordenes/usuario/${userId}`, orderData, { 
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      // 2. Si es exitoso, reiniciamos el estado del carrito localmente
      dispatch(resetCarrito());
      
      // 3. Devolvemos la orden confirmada desde el backend (puede venir envuelta en 'data')
      const ordenConfirmada = response.data.data || response.data;

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
    status: "idle", 
    error: null,
    checkoutStatus: "idle",
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
      .addCase(addProductToCart.rejected, (state, action) => {
          state.error = action.payload;
      })
     .addCase(checkoutThunk.pending, (state) => {
        state.checkoutStatus = "loading";
        state.error = null;
      })
      .addCase(checkoutThunk.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        state.ordenConfirmada = action.payload;
      })
      .addCase(checkoutThunk.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCarrito } = cartSlice.actions;
export default cartSlice.reducer;