import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchDirecciones = createAsyncThunk(
  "direcciones/fetchDirecciones",
  async (usuarioId, { rejectWithValue }) => { 
    try {
      const res = await fetch(`http://localhost:8080/direcciones/usuario/${usuarioId}`);
      if (!res.ok) throw new Error("No se pudieron cargar las direcciones.");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return rejectWithValue(e.message || "Error al cargar direcciones.");
    }
  }
);

export const saveDireccion = createAsyncThunk(
  "direcciones/saveDireccion",
  async ({ direccion, editId }, { rejectWithValue }) => {
    try {
      const url = editId
        ? `http://localhost:8080/direcciones/${editId}`
        : "http://localhost:8080/direcciones";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(direccion),
      });
      if (!res.ok) throw new Error(editId ? "No se pudo modificar la dirección." : "No se pudo crear la dirección.");
      const data = await res.json();
      return data;
    } catch (e) {
      return rejectWithValue(e.message || "Error al guardar dirección.");
    }
  }
);

export const deleteDireccion = createAsyncThunk(
  "direcciones/deleteDireccion",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8080/direcciones/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo eliminar la dirección.");
      return id;
    } catch (e) {
      return rejectWithValue(e.message || "Error al eliminar dirección.");
    }
  }
);

const direccionesSlice = createSlice({
  name: "direcciones",
  initialState: {
    direcciones: [],
    loading: false,
    error: "",
    success: "",
  },
  reducers: {
    clearDireccionesMsg(state) {
      state.error = "";
      state.success = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDirecciones.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDirecciones.fulfilled, (state, action) => {
        state.loading = false;
        state.direcciones = action.payload;
      })
      .addCase(fetchDirecciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveDireccion.fulfilled, (state, action) => {
        const idx = state.direcciones.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) {
          state.direcciones[idx] = action.payload;
          state.success = "Dirección modificada correctamente.";
        } else {
          state.direcciones.push(action.payload);
          state.success = "Dirección agregada correctamente.";
        }
      })
      .addCase(saveDireccion.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteDireccion.fulfilled, (state, action) => {
        state.direcciones = state.direcciones.filter((d) => d.id !== action.payload);
        state.success = "Dirección eliminada correctamente.";
      })
      .addCase(deleteDireccion.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearDireccionesMsg } = direccionesSlice.actions;
export default direccionesSlice.reducer;