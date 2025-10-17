// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import CartPage from "./pages/CartPage";
import AdminPanelProductPage from "./pages/AdminPanelProductPage";
import BuscarPage from "./pages/BuscarPage";
import ProfilePage from "./pages/ProfilePage";
import ProductEditPage from "./pages/ProductEditPage";
import CategoryEditPage from "./pages/CategoryEditPage";
import AdminPanelCategoriesPage from "./pages/AdminPanelCategoriesPage";
import AdminPage from "./pages/AdminPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MisPedidosPage from "./pages/MisPedidosPage";
import PedidoDetallePage from "./pages/PedidoDetallePage";
import FinalizarCompraPage from "./pages/FinalizarCompraPage";
import StepPago from "./pages/StepPago";
import MisDireccionesPage from "./pages/MisDireccionesPage";
import DashboardPage from "./pages/DashboardPage";
import Footer from "./components/Footer";
import "./App.css";

// ✅ 1. IMPORTAMOS EL COMPONENTE GUARDIÁN DE RUTAS
import AdminRoute from "./components/AdminRoute";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <Navbar />
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-16 py-8">
        <Routes>
          {/* Rutas públicas y de acceso */}
          <Route path="/" element={<HomePage />} />
          <Route path="/buscar" element={<BuscarPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Rutas de productos */}
          <Route path="/producto/id/:id" element={<ProductDetailPage />} />
          <Route path="/producto/:slug" element={<ProductDetailPage />} />
          
          {/* Rutas de usuario (no admin) */}
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          <Route path="/mis-pedidos/:id" element={<PedidoDetallePage />} />
          <Route path="/mis-direcciones" element={<MisDireccionesPage />} />
          <Route path="/mis-dashboards" element={<DashboardPage />} />

          {/* Rutas de compra */}
          <Route path="/finalizar-compra" element={<FinalizarCompraPage />} />
          <Route path="/step-pago" element={<StepPago />} />

          {/* === RUTAS PROTEGIDAS PARA ADMINISTRADORES === */}
          
          {/* Rutas de Edición/Creación (Admin) - CADA UNA ENVUELTA */}
          <Route
            path="/editar-producto/:id"
            element={<AdminRoute><ProductEditPage modo="editar" /></AdminRoute>}
          />
          <Route
            path="/crear-producto"
            element={<AdminRoute><ProductEditPage modo="crear" /></AdminRoute>}
          />
          <Route
            path="/editar-categoria/:id"
            element={<AdminRoute><CategoryEditPage modo="editar" /></AdminRoute>}
          />
          <Route
            path="/crear-categoria"
            element={<AdminRoute><CategoryEditPage modo="crear" /></AdminRoute>}
          />

          {/* Rutas de Admin con Layout - EL WRAPPER VA EN EL LAYOUT PRINCIPAL */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}>
            <Route path="productos" element={<AdminPanelProductPage />} />
            <Route path="categorias" element={<AdminPanelCategoriesPage />} />
          </Route>

          {/* Ruta catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;