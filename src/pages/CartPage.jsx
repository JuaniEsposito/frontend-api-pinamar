import { useEffect, useState, useMemo } from "react"; // Se añade useMemo
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import carritoVacio from "../assets/carritovacio.png";
import { useAuth } from "../auth/AuthProvider"; // Se usa el contexto global

// ❌ ELIMINADOS: Todos los MOCKS (MOCK_CARRITO_INICIAL, MOCK_PRODUCTOS_INICIAL)

// Componente para mostrar cuando el carrito está vacío (sin cambios)
function CarritoVacio() {
  return (
    <div className="flex flex-col items-center justify-center mt-16 mb-16">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180 }}
        className="mb-4"
      >
        <img
          src={carritoVacio}
          alt="Carrito vacío"
          width={230}
          height={200}
          className="mx-auto drop-shadow-lg"
          draggable={false}
        />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-bold text-green-700 mb-2" // Corregido: sintaxis de color
      >
        ¡Tu carrito está vacío!
      </motion.h2>
      <motion.p className="text-base text-gray-600 mb-8">
        Agregá productos y viví la mejor experiencia de compra :)
      </motion.p>
      <Link
        to="/" // Enlace al Home para buscar productos
        className="inline-block px-6 py-3 rounded-full font-bold bg-green-600 hover:bg-green-700 shadow-lg transition-all text-lg text-white"
      >
        Buscar productos
      </Link>
    </div>
  );
}

export default function CartPage() {
  // ✅ 1. OBTENER DATOS Y FUNCIONES REALES DEL CONTEXTO GLOBAL
  const { cart, updateCartItemQuantity, removeProductFromCart } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Simula un pequeño retraso de carga, se activa si el carrito cambia
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [cart]);

  // ✅ 2. CALCULAR EL TOTAL DE FORMA DINÁMICA CON useMemo
  // Se recalcula solo cuando el 'cart' cambia, es más eficiente.
  const totalCarrito = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // ✅ 3. FUNCIONES QUE LLAMAN AL CONTEXTO
  const handleIncrement = (item) => {
    updateCartItemQuantity(item.id, 1);
  };
  
  const handleDecrement = (item) => {
    updateCartItemQuantity(item.id, -1);
  };

  const handleEliminar = (productoId) => {
    removeProductFromCart(productoId);
  };

  const irAPago = () => {
    navigate("/finalizar-compra");
  };

  // ❌ ELIMINADAS: Todas las funciones locales que manejaban un estado falso
  // (actualizarCarritoLocal, handleChangeCantidad, etc.)

  // --- RENDERIZADO ---
  if (loading) {
    return <div className="mt-10 text-center text-xl">Cargando carrito...</div>;
  }
  
  // ✅ Usa el 'cart' real para verificar si está vacío
  if (!cart || cart.length === 0) {
    return <CarritoVacio />;
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 p-4 flex flex-col md:flex-row gap-8">
      {/* Lista de productos */}
      <div className="flex-1">
        <h1 className="text-3xl font-extrabold mb-6 text-green-800 flex items-center gap-2">
          <FaShoppingCart className="inline mr-2" />
          Mi Carrito
        </h1>
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id} // ✅ Usa item.id
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="flex flex-col sm:flex-row items-center gap-4 px-6 py-5 border-b last:border-b-0 hover:bg-gray-50 transition"
              >
                {/* Imagen producto */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                  <img
                    src={item.imageUrl || ""} // ✅ Usa item.imageUrl
                    alt={item.name} // ✅ Usa item.name
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Info principal */}
                <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                  <div className="font-bold text-lg text-gray-800">
                    {item.name} {/* ✅ Usa item.name */}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Cantidad: <span className="font-semibold">{item.quantity}</span> {/* ✅ Usa item.quantity */}
                  </div>
                </div>
                {/* Controles de cantidad */}
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition" onClick={() => handleDecrement(item)}>
                    <FaMinus size={14} />
                  </button>
                  <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition" onClick={() => handleIncrement(item)}>
                    <FaPlus size={14} />
                  </button>
                </div>
                {/* Precio y Subtotal */}
                <div className="flex flex-col items-end gap-1 min-w-[120px]">
                  <div className="font-bold text-lg text-green-700">
                    {`$${(item.price * item.quantity).toFixed(2)}`} {/* ✅ Calcula subtotal */}
                  </div>
                  <div className="text-sm text-gray-500">
                    {`$${item.price.toFixed(2)} c/u`} {/* ✅ Muestra precio unitario */}
                  </div>
                </div>
                {/* Eliminar producto */}
                <button
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                  onClick={() => handleEliminar(item.id)} // ✅ Llama a la función correcta
                  title="Eliminar producto"
                >
                  <FaTrash />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Resumen del pedido y botón de pago */}
      <aside className="md:w-80 w-full">
        <motion.div
          className="bg-white rounded-xl shadow border border-gray-200 p-6 sticky top-24"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-xl font-bold mb-4 text-green-800">Resumen</h2>
          <div className="flex justify-between text-gray-700 text-base mb-2">
            <span>Subtotal</span>
            <span>{`$${totalCarrito.toFixed(2)}`}</span> {/* ✅ Usa el total calculado */}
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-gray-900 font-bold text-xl mb-1">
              <span>Total</span>
              <span>{`$${totalCarrito.toFixed(2)}`}</span> {/* ✅ Usa el total calculado */}
            </div>
          </div>
          <button
            className="mt-6 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            onClick={irAPago}
          >
            <FaShoppingCart />
            Finalizar compra
          </button>
          <div className="mt-4 text-xs text-gray-400 text-center">
            * No incluye costo de envío.
          </div>
        </motion.div>
      </aside>
    </div>
  );
}