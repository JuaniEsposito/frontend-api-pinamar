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

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
    status: "idle", 
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
      })
      .addCase(addProductToCart.rejected, (state, action) => {
          state.error = action.payload;
      });
  },
});

export const { resetCarrito } = cartSlice.actions;
export default cartSlice.reducer;