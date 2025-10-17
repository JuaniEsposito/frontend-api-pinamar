import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import ordenesReducer from "./redux/ordenesSlice";
import productosReducer from './productosSlice'; // 👈 AÑADIR
import categoriasReducer from './categoriasSlice'; // 👈 AÑADIR


export const store = configureStore({
  reducer: {
    cart: cartReducer,
    ordenes: ordenesReducer,
    productos: productosReducer,     // 👈 AÑADIR
    categorias: categoriasReducer,   // 👈 AÑADIR
    // ...otros reducers si hay...
  },
});
