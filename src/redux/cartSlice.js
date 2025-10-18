import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getToken } from "../utils/auth";
import api from "../api"; 

const getUserId = (getState) => getState().auth.usuario?.id;

export const fetchCarrito = createAsyncThunk(
  "cart/fetchCarrito",
  async (_, { rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getUserId(getState);
    if (!token || !userId) return rejectWithValue("Usuario no autenticado");

    try {
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

export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ productoId, cantidad }, { dispatch, rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getUserId(getState);
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión.");

    try {
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
    
    //actualiza el carrito despues del cambio
    dispatch(fetchCarrito());
  }
);

export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async ({ productoId, cantidad }, { dispatch, rejectWithValue, getState }) => {
    const token = getToken();
    const userId = getUserId(getState);
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión.");

    try {
      await api.delete(
        `/carritos/usuario/${userId}/producto/${productoId}?cantidad=${cantidad}`,
        { 
          data: {}, 
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
    const userId = getUserId(getState);
    
    if (!token || !userId) return rejectWithValue("Debe iniciar sesión para finalizar la compra.");

    const requestBody = {
        usuarioId: userId, 
        direccionId: orderData.direccionId, 
        descuento: orderData.descuento, 
        items: orderData.items 
    };

    try {
      const response = await api.post(`/ordenes`, requestBody, { 
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      const ordenConfirmada = response.data;
      
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

export const { resetCarrito } = cartSlice
export default cartSlice.reducer;