import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./redux/cartSlice";
import categoriesReducer from "./redux/categoriesSlice";
import direccionesReducer from "./redux/direccionesSlice";
import usuarioReducer from "./redux/usuarioSlice";
import authReducer from "./redux/authSlice";
import productosReducer from "./redux/productosSlice";
import ordenesReducer from "./redux/ordenesSlice";
import pedidosReducer from "./redux/pedidosSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    categorias: categoriesReducer,
    direcciones: direccionesReducer,
    usuario: usuarioReducer,
    productos: productosReducer,
    ordenes: ordenesReducer,
    pedidos: pedidosReducer,

  },
});

export default store;