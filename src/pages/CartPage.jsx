import { useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCarrito,
  addProductToCart,
  removeProductFromCart,
} from "../redux/cartSlice";
import carritoVacio from "../assets/carritovacio.png";
import { toast } from 'react-toastify';

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
        className="text-2xl font-bold text-green-700 mb-2"
      >
        ¡Tu carrito está vacío!
      </motion.h2>
      <motion.p className="text-base text-gray-600 mb-8">
        Agregá productos y viví la mejor experiencia de compra :)
      </motion.p>
      <Link
        to="/"
        className="inline-block px-6 py-3 rounded-full font-bold bg-green-600 hover:bg-green-700 shadow-lg transition-all text-lg text-white"
      >
        Buscar productos
      </Link>
    </div>
  );
}

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Leemos el estado del carrito y la autenticación desde el store de Redux
  const { items: cart, status, total } = useSelector((state) => state.cart);
  const totalCarrito = total ?? 0; // Usamos el total que viene del store, con valor seguro
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchCarrito());
    }
  }, [status, isAuthenticated, dispatch]);

  // Usamos item.productoId, que viene del DTO
  const handleIncrement = (item) => {
    dispatch(addProductToCart({ productoId: item.productoId, cantidad: 1 }));
  };

  const handleDecrement = (item) => {
    dispatch(removeProductFromCart({ productoId: item.productoId, cantidad: 1 }));
  };

  const handleEliminar = (productoId) => {
    const item = cart.find((p) => p.productoId === productoId);
    if (item) {
      dispatch(removeProductFromCart({ productoId: item.productoId, cantidad: item.cantidad }));
    }
  };

  const irAPago = () => {
    if (isAuthenticated) {
      navigate("/finalizar-compra");
    } else {
      toast.warn("Necesitás iniciar sesión para continuar con la compra.");
      navigate("/signin", { state: { from: location } });
    }
  };

  if (status === "loading") {
    return <div className="mt-10 text-center text-xl">Cargando carrito...</div>;
  }

  if (!cart || cart.length === 0) {
    return <CarritoVacio />;
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 p-4 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <h1 className="text-3xl font-extrabold mb-6 text-green-800 flex items-center gap-2">
          <FaShoppingCart className="inline mr-2" />
          Mi Carrito
        </h1>
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <AnimatePresence>
            {cart.map((item) => {
               // ✅ CORRECCIÓN: Definir valores seguros y usar los nombres correctos del DTO
               const safePrice = item.precioUnitario ?? 0; 
               const safeQuantity = item.cantidad ?? 0;
               const subtotal = safePrice * safeQuantity;
               const itemId = item.productoId ?? Math.random(); // Usar productoId como clave

               return (
              <motion.div
                key={itemId} // Usamos productoId como clave única
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="flex flex-col sm:flex-row items-center gap-4 px-6 py-5 border-b last:border-b-0 hover:bg-gray-50 transition"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
    {/* ✅ CORRECCIÓN: Si item.imageUrl es "" o null, usamos FALLBACK_IMG */}
    <img 
    src={item.imageUrl ? `http://localhost:8080/${item.imageUrl}` : "https://placehold.co/100x100/f3f4f6/333333?text=Sin+Imagen"} 
    alt={item.nombreProducto} 
    className="w-full h-full object-contain" 
/>
</div>
                <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                  <div className="font-bold text-lg text-gray-800">{item.nombreProducto}</div>
                  <div className="text-gray-500 text-sm">Cantidad: <span className="font-semibold">{safeQuantity}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition" onClick={() => handleDecrement(item)}>
                    <FaMinus size={14} />
                  </button>
                  <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition" onClick={() => handleIncrement(item)}>
                    <FaPlus size={14} />
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[120px]">
                  {/* CORRECCIÓN DE TOTALES DE ITEM */}
                  <div className="font-bold text-lg text-green-700">{`$${subtotal.toFixed(2)}`}</div>
                  <div className="text-sm text-gray-500">{`$${safePrice.toFixed(2)} c/u`}</div>
                </div>
                <button
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                  onClick={() => handleEliminar(item.productoId)} // Usamos item.productoId para eliminar
                  title="Eliminar producto"
                >
                  <FaTrash />
                </button>
              </motion.div>
            )}) }{/* ✅ CORRECCIÓN DE SINTAXIS */}
          </AnimatePresence>
        </div>
      </div>

      <aside className="md:w-80 w-full">
        <motion.div
          className="bg-white rounded-xl shadow border border-gray-200 p-6 sticky top-24"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-xl font-bold mb-4 text-green-800">Resumen</h2>
          <div className="flex justify-between text-gray-700 text-base mb-2">
            <span>Subtotal</span>
            <span>{`$${totalCarrito.toFixed(2)}`}</span>
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-gray-900 font-bold text-xl mb-1">
              <span>Total</span>
              <span>{`$${totalCarrito.toFixed(2)}`}</span>
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