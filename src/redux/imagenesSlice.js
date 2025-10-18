import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

export const uploadImage = createAsyncThunk(
    'imagenes/uploadImage',
    async ({ productId, file, token }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('archivo', file);

            const response = await api.post(
                `/producto/${productId}/imagen`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data; 

        } catch (error) {
            const errorMsg = error.response?.data?.message || "Fallo al subir la imagen.";
            return rejectWithValue(errorMsg);
        }
    }
);

export const deleteImage = createAsyncThunk(
  'imagenes/deleteImage',
  async ({ imageId, token }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/producto/imagen/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
            .addCase(deleteImage.pending, (state) => {
                state.loading = true;
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