// src/auth/AuthProvider.jsx

import { createContext, useContext, useState } from "react";

// --- 1. DATOS INICIALES MOCK (PRODUCTOS SALUDABLES) ---
const INITIAL_PRODUCTS = [];
const INITIAL_CART = []; 
const INITIAL_ORDERS = [];

const AuthContext = createContext();

// Hook para acceder al contexto de autenticación y datos
export function useAuth() {
  return useContext(AuthContext);
}

// Este componente envuelve toda la app y comparte el estado de la aplicación
export function AuthProvider({ children }) {
  // --- ESTADO DE AUTENTICACIÓN (Mock sin JWT) ---
  const [token, setToken] = useState(null); // Usaremos 'token' como flag de autenticación
  const [usuario, setUsuario] = useState(null); // { id: 1, role: 'ADMIN' }
  
  // --- ESTADO DE E-COMMERCE (Simulación de Backend) ---
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState(INITIAL_CART);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // --- FUNCIONES DE AUTENTICACIÓN ---
  // Ahora la función login solo necesita el rol (simula la validación JWT)
  // Nota: userRole debe ser 'ADMIN' o 'USER' (o null/undefined)
  /*const login = ({ jwt, role }) => { 
    const mockUser = {
      id: role === 'ADMIN' ? 99 : 1,
      username: role === 'ADMIN' ? 'admin_mock' : 'user_mock',
      role: role.toUpperCase(),
    };
    setToken(jwt || "MOCK_TOKEN"); // Token de prueba
    setUsuario(mockUser);
  };*/
  const login = ({ jwt, userData }) => { 
  setToken(jwt || "MOCK_TOKEN"); // Token de prueba
  setUsuario(userData); // Guarda directamente el objeto de usuario que viene del formulario
};

   // --- FUNCIÓN NUEVA ---
  // Recibe los nuevos datos y actualiza el estado del usuario
  const updateUser = (nuevosDatos) => {
    setUsuario((usuarioActual) => ({
      ...usuarioActual, // Mantiene los datos que no se cambian (como id, username, etc.)
      ...nuevosDatos,  // Sobreescribe los datos que sí se cambiaron (nombre, apellido, email)
    }));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setCart(INITIAL_CART);
  };

  const isAuthenticated = !!token;
  const isAdmin = usuario?.role === 'ADMIN';

  // --- FUNCIONES DE GESTIÓN DEL CARRITO (USER) ---
  const addProductToCart = (productToAdd, quantity = 1) => {
    const productInStock = products.find(p => p.id === productToAdd.id);
    if (!productInStock || productInStock.stock <= 0) return;
    
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === productToAdd.id);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, productInStock.stock);
        
        return prevCart.map(item =>
          item.id === productToAdd.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        const finalQuantity = Math.min(quantity, productInStock.stock);
        return [...prevCart, { ...productToAdd, quantity: finalQuantity }];
      }
    });
  };
  
  const updateCartItemQuantity = (productId, quantityChange) => {
    const productInStock = products.find(p => p.id === productId);
    
    setCart((prevCart) => {
      const newCart = prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + quantityChange;
          
          const stockLimit = productInStock ? productInStock.stock : item.quantity;
          const finalQuantity = Math.min(newQuantity, stockLimit);
          
          return { ...item, quantity: Math.max(0, finalQuantity) };
        }
        return item;
      }).filter(item => item.quantity > 0); 
      
      return newCart;
    });
  };
  
  const removeProductFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const clearCart = () => setCart(INITIAL_CART);

  // --- FUNCIONES DE ADMINISTRACIÓN (ADMIN) ---
  const saveProduct = (productData) => {
    if (!isAdmin) return;
    
    setProducts(prevProducts => {
      if (productData.id) {
        // Editar Producto existente
        return prevProducts.map(p => p.id === productData.id ? productData : p);
      } else {
        // Crear Nuevo Producto
        const maxId = prevProducts.reduce((max, p) => Math.max(max, p.id), 0);
        return [...prevProducts, { ...productData, id: maxId + 1 }];
      }
    });
  };

  const deleteProduct = (productId) => {
    if (!isAdmin) return;
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // --- FUNCIÓN DE FINALIZAR COMPRA ---
  const checkout = ({ totalFinal, descuento, totalOriginal, direccionSeleccionada }) => {
    if (!isAuthenticated || cart.length === 0) return null;

    // ✅ VERIFICACIÓN DE SEGURIDAD
    // Si no hay dirección, usa un texto predeterminado en lugar de crashear.
    const direccionDeEntrega = direccionSeleccionada 
      ? `${direccionSeleccionada.calle} ${direccionSeleccionada.numero}, ${direccionSeleccionada.ciudad}`
      : "Retiro en el local";

    const newOrder = {
      id: orders.length + 1,
      fechaCreacion: new Date().toISOString(),
      estado: 'COMPLETADO',
      items: cart.map(item => ({
        id: item.id,
        nombreProducto: item.name,
        cantidad: item.quantity,
        precioUnitario: item.price,
        subtotal: item.price * item.quantity,
        imageUrl: item.imageUrl,
      })),
      total: totalFinal,
      totalOriginal: totalOriginal,
      descuento: descuento,
      userId: usuario.id,
      direccion: direccionDeEntrega, // ✅ USA LA VARIABLE SEGURA
      metodoPago: "Tarjeta de Crédito"
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    
    // Descontar stock (simulación)
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const purchasedItem = cart.find(item => item.id === p.id);
        if (purchasedItem) {
          return { ...p, stock: p.stock - purchasedItem.quantity };
        }
        return p;
      });
    });

    clearCart();
    
    return newOrder;
  };
  
  // --- VALORES EXPUESTOS ---
  const contextValue = {
    // Auth
    token,
    usuario,
    isAuthenticated,
    isAdmin, 
    login,
    logout,
    updateUser,
    // E-commerce Data
    products,
    cart,
    orders,
    // E-commerce Actions
    addProductToCart,
    updateCartItemQuantity,
    removeProductFromCart,
    clearCart,
    saveProduct, 
    deleteProduct, 
    checkout,
  };

  return (
    <AuthContext.Provider
      // Agregamos updateUser al valor del contexto
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}
