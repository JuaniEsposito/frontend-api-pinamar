import { createContext, useContext, useState } from "react";

// --- 1. DATOS INICIALES MOCK (PRODUCTOS SALUDABLES) ---
const INITIAL_PRODUCTS = [
  { 
    id: 1, name: "Manzanas Rojas Frescas", price: 350.00, stock: 50, brand: "La Huerta", 
    description: "Manzanas crujientes del Alto Valle, ideales para consumo fresco.", 
    category: "Frutas", imageUrl: "https://placehold.co/100x100/FF5733/FFFFFF?text=Manzana",
    unidad_medida: "kg", descuento: 0, bestSeller: true
  },
  { 
    id: 2, name: "Lechuga Morada Orgánica", price: 180.50, stock: 30, brand: "Tierra Viva", 
    description: "Hojas frescas y crujientes, cultivada sin pesticidas.", 
    category: "Vegetales", imageUrl: "https://placehold.co/100x100/3CB371/FFFFFF?text=Lechuga",
    unidad_medida: "unidad", descuento: 15, bestSeller: false
  },
  { 
    id: 3, name: "Agua Mineral sin Gas 1.5L", price: 120.00, stock: 100, brand: "Vida Pura", 
    description: "Agua de manantial, embotellada en origen.", 
    category: "Bebidas", imageUrl: "https://placehold.co/100x100/87CEFA/000000?text=Agua",
    unidad_medida: "litro", descuento: 0, bestSeller: false
  },
  { 
    id: 4, name: "Mix de Frutos Secos Premium", price: 950.00, stock: 20, brand: "NutriMix", 
    description: "Almendras, nueces y castañas de cajú. Fuente de energía.", 
    category: "Snacks", imageUrl: "https://placehold.co/100x100/A0BFFF/000000?text=Frutos+Secos",
    unidad_medida: "250g", descuento: 20, bestSeller: true
  },
  { 
    id: 5, name: "Tomates Cherry", price: 280.00, stock: 45, brand: "El Campo", 
    description: "Pequeños tomates ideales para ensaladas o picadas.", 
    category: "Vegetales", imageUrl: "https://placehold.co/100x100/DC143C/FFFFFF?text=Tomate",
    unidad_medida: "250g", descuento: 5, bestSeller: false
  },
  { 
    id: 6, name: "Jugo de Naranja Orgánico", price: 300.00, stock: 60, brand: "Citrus Fresh", 
    description: "100% exprimido, sin azúcares añadidos.", 
    category: "Bebidas", imageUrl: "https://placehold.co/100x100/FFA500/FFFFFF?text=Jugo",
    unidad_medida: "litro", descuento: 0, bestSeller: true
  },
  { 
    id: 7, name: "Pan Integral", price: 420.00, stock: 15, brand: "La Panera", 
    description: "Rico en fibra y semillas, ideal para tostadas.", 
    category: "Panadería", imageUrl: "https://placehold.co/100x100/D2B48C/000000?text=Pan",
    unidad_medida: "unidad", descuento: 10, bestSeller: false
  },
  { 
    id: 8, name: "Cerveza Artesanal IPA", price: 550.00, stock: 50, brand: "Patagonia", 
    description: "Cerveza artesanal de alta calidad.", 
    category: "Bebidas", imageUrl: "https://placehold.co/100x100/F0F8FF/000000?text=Cerveza",
    unidad_medida: "lata", descuento: 0, bestSeller: false
  },
];

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
  const login = ({ jwt, role }) => { 
    const mockUser = {
      id: role === 'ADMIN' ? 99 : 1,
      username: role === 'ADMIN' ? 'admin_mock' : 'user_mock',
      role: role.toUpperCase(),
    };
    setToken(jwt || "MOCK_TOKEN"); // Token de prueba
    setUsuario(mockUser);
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
  const checkout = () => {
    if (!isAuthenticated || cart.length === 0) return null;

    const newOrder = {
      id: orders.length + 1,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        nombreProducto: item.name,
        cantidad: item.quantity,
        precioUnitario: item.price,
        subtotal: item.price * item.quantity,
        id: item.id
      })),
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'COMPLETADO',
      userId: usuario.id,
      direccion: "Dirección de envío mock",
      metodoPago: "Tarjeta de Crédito (Mock)"
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    clearCart();
    
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
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}
