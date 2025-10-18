// src/redux/imagenesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api"; // Asume que api.js está en el nivel superior

// ✅ THUNK PARA SUBIR UN ARCHIVO DE IMAGEN
export const uploadImage = createAsyncThunk(
    'imagenes/uploadImage',
    async ({ productId, file, token }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('archivo', file); // 'archivo' es el parámetro esperado por el backend

            const response = await api.post(
                `/producto/${productId}/imagen`, // Endpoint: /producto/{id}/imagen
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // No necesitamos Content-Type: 'multipart/form-data', Axios lo pone solo.
                    },
                }
            );
            
            // Retorna la respuesta de tu backend: { mensaje, idImagen, path }
            return response.data; 

        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fallo al subir la imagen.";
            return rejectWithValue(errorMsg);
        }
    }
);

// ✅ THUNK PARA BORRAR UNA IMAGEN
export const deleteImage = createAsyncThunk(
  'imagenes/deleteImage',
  async ({ imageId, token }, { rejectWithValue }) => {
    try {
      // Endpoint: /producto/imagen/{imagenId}
      const response = await api.delete(`/producto/imagen/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Devolvemos el ID de la imagen borrada y el mensaje
      return { id: imageId, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Fallo al eliminar la imagen.";
      return rejectWithValue(errorMsg);
    }
  }
);


const imagenesSlice = createSlice({
    name: 'imagenes',
    initialState: {
        loading: false,
        error: null,
    },
    reducers: {
        clearImageError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Cases para uploadImage
            .addCase(uploadImage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadImage.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(uploadImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ✅ Cases para deleteImage
            .addCase(deleteImage.pending, (state) => {
                state.loading = true; // Reusamos el loading
                state.error = null;
            })
            .addCase(deleteImage.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearImageError } = imagenesSlice.actions;
export default imagenesSlice.reducer;