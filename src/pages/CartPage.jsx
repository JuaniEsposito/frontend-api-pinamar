import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import carritoVacio from "../assets/carritovacio.png";
// ELIMINADAS: useSelector, useDispatch, y todos los imports de Redux/Slices

// --- DATOS MOCK/PRUEBA (Simulan la API) ---
const MOCK_CARRITO_INICIAL = {
  // Simulación de la estructura del carrito que vendría del backend
  total: 4500.0,
  items: [
    {
      productoId: 101,
      nombreProducto: "Tomates",
      cantidad: 2,
      precioUnitario: 200.0,
      subtotal: 400.0,
    },
    {
      productoId: 102,
      nombreProducto: "Bife",
      cantidad: 5,
      precioUnitario: 1000.0,
      subtotal: 5000.0,
    },
  ],
};

const MOCK_PRODUCTOS_INICIAL = [
  // Simulación de la lista de productos (para obtener la imagen)
  {
    id: 101,
    imagenes: ["https://picsum.photos/id/11/200/200"],
    nombre: "Laptop Gaming X1",
  },
  {
    id: 102,
    imagenes: ["https://picsum.photos/id/12/200/200"],
    nombre: "Mouse Óptico Z",
  },
];
// ---------------------------------------------

// Muestra un mensaje y la imagen del dino cuando el carrito está vacío
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
          alt="Carrito vacío Rex"
          width={230}
          height={200}
          className="mx-auto drop-shadow-lg"
          draggable={false}
          style={{
            maxWidth: 280,
            maxHeight: 220,
            objectFit: "contain",
            background: "none",
          }}
        />
      </motion.div>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-bold text-blue-700 mb-2"
      >
        ¡Tu carrito está vacío!
      </motion.h2>
      <motion.p className="text-base text-gray-600 mb-8">
        Agregá productos y viví la mejor experiencia de compra :)
      </motion.p>
      <Link
        to="/buscar"
        className="inline-block px-6 py-3 rounded-full font-bold bg-blue-600 hover:bg-blue-700 shadow-lg transition-all text-lg text-white"
        style={{ color: "#fff" }}
      >
        Buscar productos
      </Link>
    </div>
  );
}

export default function CartPage() {
  // Reemplazo de useSelector por useState
  const [carrito, setCarrito] = useState(null); // Usaremos 'null' para simular la carga inicial
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productos, setProductos] = useState([]);
  const [imagenesProductos, setImagenesProductos] = useState({});
  const navigate = useNavigate();

  // --- Lógica de cálculo de totales ---
  const calcularTotalCarrito = (currentItems) => {
    return currentItems.reduce((sum, item) => {
      const subtotal = Number(item.precioUnitario) * Number(item.cantidad);
      return sum + subtotal;
    }, 0);
  };

  // --- Simulación de Carga de Datos (Reemplazo de fetchCarrito/fetchProductos) ---
  useEffect(() => {
    // Simula una llamada a la API con un retraso
    setLoading(true);
    setError(null);
    
    // Simula la carga de productos y carrito
    setTimeout(() => {
      // **Asignamos los datos MOCK al estado local**
      setProductos(MOCK_PRODUCTOS_INICIAL); 
      setCarrito({
        ...MOCK_CARRITO_INICIAL,
        // Recalcular total si el mock no lo trae, o usar el del mock
        total: calcularTotalCarrito(MOCK_CARRITO_INICIAL.items) 
      });
      setLoading(false);
    }, 1000); // 1 segundo de simulación de carga
  }, []); // Se ejecuta solo al montar el componente

  // --- Mapea imágenes (Esta lógica se mantiene igual, pero usa el estado local) ---
  useEffect(() => {
    if (!carrito || !carrito.items) return;

    const imagenesMap = {};
    carrito.items.forEach((item) => {
      const prod = productos?.find((p) => p.id === item.productoId);
      if (prod && prod.imagenes && prod.imagenes.length > 0) {
        imagenesMap[item.productoId] =
          typeof prod.imagenes[0] === "string"
            ? prod.imagenes[0]
            : prod.imagenes[0].imagen;
      }
    });
    setImagenesProductos(imagenesMap);
  }, [carrito, productos]);

  // --- Lógica de Modificación del Carrito (Reemplazo de patch/deleteCarrito) ---

  const actualizarCarritoLocal = (newItems) => {
    const newTotal = calcularTotalCarrito(newItems);
    setCarrito({
        ...carrito,
        items: newItems,
        total: newTotal
    });
  };
  
  // Cambia la cantidad de un producto en el carrito (+/- 1)
  const handleChangeCantidad = (productoId, change) => {
    const newItems = carrito.items.map((item) => {
      if (item.productoId === productoId) {
        const nuevaCantidad = item.cantidad + change;
        // La lógica de eliminación está separada en handleDecrement/handleEliminar
        if (nuevaCantidad < 1) return item; 
        
        return {
          ...item,
          cantidad: nuevaCantidad,
        };
      }
      return item;
    });

    actualizarCarritoLocal(newItems);
  };
  
  // Disminuye cantidad o elimina si queda solo uno
  const handleDecrement = (item) => {
    if (item.cantidad <= 1) {
      handleEliminar(item.productoId);
    } else {
      handleChangeCantidad(item.productoId, -1);
    }
  };


  // Elimina un producto completamente del carrito
  const handleEliminar = (productoId) => {
    const newItems = carrito.items.filter(
      (item) => item.productoId !== productoId
    );
    
    // Simulación de espera de API (puedes quitarlo si es solo local)
    setLoading(true);
    setTimeout(() => {
        actualizarCarritoLocal(newItems);
        setLoading(false);
    }, 300); 
  };
  
  // --- Funciones de navegación (Se mantienen igual) ---

  // Va a la página de pago
  const irAPago = () => {
    navigate("/finalizar-compra");
  };

  // --- Renderizado ---
  
  // Carga inicial y errores
  if (loading)
    return <div className="mt-10 text-center">Cargando carrito...</div>;
  if (error)
    return <div className="mt-10 text-center text-red-600">{error}</div>;

  // Si el carrito está vacío, muestra el mensaje con el dino
  if (!carrito || !carrito.items || carrito.items.length === 0)
    return <CarritoVacio />;

  // Carrito con productos (tabla y controles)
  return (
    <div className="max-w-5xl mx-auto mt-12 flex flex-col md:flex-row gap-8">
      {/* Lista de productos */}
      <div className="flex-1">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
          <FaShoppingCart className="inline mr-2" />
          Mi Carrito
        </h1>
        <div className="bg-white rounded-xl shadow border border-blue-200 overflow-hidden">
          <AnimatePresence>
            {carrito.items.map((item) => (
              <motion.div
                key={item.productoId}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="flex flex-col sm:flex-row items-center gap-4 px-6 py-5 border-b border-blue-100 last:border-b-0 hover:bg-blue-50 transition"
              >
                {/* Imagen producto */}
                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden border border-blue-200">
                  <img
                    src={imagenesProductos[item.productoId] || ""}
                    alt={item.nombreProducto}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Info principal */}
                <div className="flex-1 w-full sm:w-auto">
                  <div className="font-bold text-lg text-gray-800">
                    {item.nombreProducto}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Cantidad:{" "}
                    <span className="font-semibold">{item.cantidad}</span>
                  </div>
                </div>
                {/* Controles de cantidad */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 bg-blue-200 rounded-full hover:bg-blue-300 transition"
                    onClick={() => handleDecrement(item)}
                  >
                    <FaMinus size={14} />
                  </button>
                  <button
                    className="p-2 bg-blue-200 rounded-full hover:bg-blue-300 transition"
                    onClick={() => handleChangeCantidad(item.productoId, 1)}
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                {/* Precio unitario and subtotal */}
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <div className="text-sm text-gray-500">Precio c/u</div>
                  <div className="font-semibold text-base text-blue-700">
                    {item.precioUnitario !== undefined &&
                    item.precioUnitario !== null
                      ? `$${Number(item.precioUnitario).toFixed(2)}`
                      : "-"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.precioUnitario !== undefined &&
                    item.precioUnitario !== null
                      ? `Sin IVA: $${Math.round(
                          Number(item.precioUnitario) / 1.21
                        )}`
                      : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <div className="text-sm text-gray-500">Subtotal</div>
                  <div className="font-bold text-lg text-green-700">
                    {/* Se usa el cálculo del subtotal en base a cantidad * precio unitario */}
                    {`$${(Number(item.precioUnitario) * Number(item.cantidad)).toFixed(2)}`}
                  </div>
                  <div className="text-xs text-gray-400 font-normal">
                    {`Sin IVA: $${Math.round(
                      (Number(item.precioUnitario) * Number(item.cantidad)) / 1.21
                    )}`}
                  </div>
                </div>
                {/* Eliminar producto */}
                <button
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                  onClick={() => handleEliminar(item.productoId)}
                  title="Eliminar producto"
                >
                  <FaTrash />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Total del carrito */}
          <div className="flex flex-col gap-1 justify-end items-end px-6 py-4 border-t border-blue-100 bg-blue-50">
            <div className="flex gap-4 items-center">
              <span className="font-semibold text-gray-700 text-lg">
                Total:
              </span>
              <span className="font-bold text-2xl text-green-700">
                {`$${Number(carrito.total).toFixed(2)}`}
              </span>
            </div>
            <div className="flex gap-4 items-center text-[14px] text-gray-500">
              <span>Sin IVA (21%):</span>
              <span>
                {`$${Math.round(Number(carrito.total) / 1.21)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del pedido y botón de pago */}
      <aside className="md:w-80 w-full">
        <motion.div
          className="bg-white rounded-xl shadow border border-blue-200 p-6 sticky top-24"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-xl font-bold mb-3 text-blue-700">Resumen</h2>
          <div className="flex justify-between text-gray-700 text-base mb-1">
            <span>Cantidad de ítems</span>
            <span>
              {carrito.items.reduce((sum, item) => sum + item.cantidad, 0)}
            </span>
          </div>
          <div className="flex justify-between text-gray-700 text-base mb-1">
            <span>Total</span>
            <span className="font-bold text-green-700">
              {`$${Number(carrito.total).toFixed(2)}`}
            </span>
          </div>
          {/* Ir a pagar */}
          <button
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            onClick={irAPago}
          >
            <FaShoppingCart />
            Finalizar compra
          </button>
          <div className="mt-4 text-xs text-gray-400 text-center">
            * No incluye envío.
          </div>
        </motion.div>
      </aside>
    </div>
  );
}