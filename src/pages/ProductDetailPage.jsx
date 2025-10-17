import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductoById, fetchRelatedProducts } from "../redux/productosSlice";
import { addProductToCart } from "../redux/cartSlice";
import { toast } from 'react-toastify'; // ✅ IMPORTAMOS TOASTIFY

const FALLBACK_IMG = "https://cdn-icons-png.flaticon.com/512/1046/1046857.png";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [addCartLoading, setAddCartLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [units, setUnits] = useState(0);

  const product = useSelector((state) => state.productos.productoDetalle);
  const loading = useSelector((state) => state.productos.loading);
  const error = useSelector((state) => state.productos.error);
  const relacionados = useSelector((state) => state.productos.relacionados);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductoById(id))
        .unwrap()
        .then((productoPrincipal) => {
          if (productoPrincipal?.id) {
            dispatch(fetchRelatedProducts(productoPrincipal.id));
          }
        })
        .catch(err => {
          console.error("Fallo al cargar el producto principal:", err)
        });
    }
  }, [id, dispatch]);

  const [mainImgIdx, setMainImgIdx] = useState(0);
  useEffect(() => setMainImgIdx(0), [product]);

  const images = product?.imagenes?.map(img => img.imagen) || [];
  const mainImg = images[mainImgIdx] || FALLBACK_IMG;

  // ✅ LÓGICA DE AGREGAR AL CARRITO CON NOTIFICACIONES TOAST
  async function handleAddToCart() {
    if (!product?.id || !qty) return;
    setAddCartLoading(true);
    try {
      // Usamos .unwrap() para poder usar try/catch con el thunk
      await dispatch(
        addProductToCart({ productoId: product.id, cantidad: qty })
      ).unwrap();

      // Si el dispatch tiene éxito, mostramos el toast de éxito
      toast.success(`¡${product.nombre} agregado al carrito!`);
      
      // Lógica de UI para la animación
      setUnits(units + qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);

    } catch (err) {
      // Si el dispatch falla, mostramos el toast de error
      toast.error(err.message || "No se pudo agregar al carrito.");
    }
    setAddCartLoading(false);
  }

  if (loading) {
    return <div className="text-center mt-20">Cargando producto...</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">
          Producto no encontrado
        </h2>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
          onClick={() => navigate(-1)}
        >
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 flex flex-col gap-8 px-2 sm:px-6">
      {/* ... (Tu JSX para la galería y detalles del producto principal no cambia) ... */}
      {/* Este es un ejemplo de cómo se vería el botón */}
      <div className="flex items-center gap-3 mb-4 relative">
        <label htmlFor="qty">Cantidad:</label>
        <input id="qty" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1} max={product.stock} />
        <button onClick={handleAddToCart} disabled={addCartLoading}>
          {addCartLoading ? "Agregando..." : "Agregar al carrito"}
        </button>
      </div>

      {/* SECCIÓN DE RELACIONADOS (dinámica) */}
      {relacionados.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-dark">
            Productos relacionados
          </h2>
          <div className="flex gap-6 flex-wrap">
            {relacionados.map((prod) => (
              <Link
                key={prod.id}
                to={`/producto/id/${prod.id}`}
                className="flex flex-col items-center bg-white rounded-xl shadow hover:shadow-xl transition p-4 border border-gray-100 hover:border-primary w-48"
              >
                <img
                  src={prod.imagenes?.[0]?.imagen || FALLBACK_IMG}
                  alt={prod.nombre}
                  className="w-20 h-20 object-cover rounded-lg mb-2"
                />
                <div className="font-semibold text-base text-dark mb-1 text-center line-clamp-2">
                  {prod.nombre}
                </div>
                <div className="text-primary font-bold text-lg mb-2 text-center">
                  ${prod.precio}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="mt-8 mb-8">
        <Link to="/" className="text-primary hover:underline text-sm">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}