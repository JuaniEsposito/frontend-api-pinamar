import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunks
export const fetchCategorias = createAsyncThunk(
  "categorias/fetchCategorias",
  async (_, { rejectWithValue }) => {
    try {
      // 👇 Cambié el puerto y el endpoint
      const res = await fetch("http://localhost:8080/categorias/all");
      if (!res.ok) throw new Error("Error al cargar categorías");
      const data = await res.json();
      // El endpoint /all devuelve directamente un array
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return rejectWithValue(e.message || "No se pudieron cargar las categorías.");
    }
  }
);

export const addCategoria = createAsyncThunk(
  "categorias/addCategoria",
  async ({ nombre, parentId, token }, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8080/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, parentId: parentId || null }),
      });
      if (!res.ok) throw new Error("Error al crear categoría");
      const data = await res.json();
      return data;
    } catch (e) {
      return rejectWithValue(e.message || "No se pudo crear la categoría.");
    }
  }
);

export const editCategoria = createAsyncThunk(
  "categorias/editCategoria",
  async ({ id, nombre, parentId, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8080/categorias/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, parentId: parentId || null }),
      });
      if (!res.ok) throw new Error("Error al editar categoría");
      const data = await res.json();
      return data;
    } catch (e) {
      return rejectWithValue(e.message || "No se pudo editar la categoría.");
    }
  }
);

export const deleteCategoria = createAsyncThunk(
  "categorias/deleteCategoria",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8080/categorias/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al eliminar categoría");
      return id;
    } catch (e) {
      return rejectWithValue(e.message || "No se pudo eliminar la categoría.");
    }
  }
);

const categoriesSlice = createSlice({
  name: "categorias",
  initialState: {
    categorias: [],
    loading: false,
    error: "",
    success: "",
  },
  reducers: {
    clearCategoriasMsg(state) {
      state.error = "";
      state.success = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategorias.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.loading = false;
        state.categorias = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCategoria.fulfilled, (state, action) => {
        state.categorias.push(action.payload);
        state.success = "Categoría creada correctamente.";
      })
      .addCase(addCategoria.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(editCategoria.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = "";
      })
      .addCase(editCategoria.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.categorias.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.categorias[idx] = action.payload;
        state.success = "Categoría actualizada correctamente.";
      })
      .addCase(editCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategoria.fulfilled, (state, action) => {
        state.categorias = state.categorias.filter((c) => c.id !== action.payload);
        state.success = "Categoría eliminada correctamente.";
      })
      .addCase(deleteCategoria.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCategoriasMsg } = categoriesSlice.actions;
export default categoriesSlice.reducer;
