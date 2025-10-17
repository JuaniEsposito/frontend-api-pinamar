import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import { addProductToCart } from "../redux/cartSlice";
// 🟢 CORRECCIÓN: Se cambió al nombre de archivo correcto: "categoriesSlice.js"
import { fetchCategorias } from "../redux/categoriesSlice"; 
import { toast } from 'react-toastify';

// ... (El componente SkeletonCard no necesita cambios, puedes dejarlo como estaba) ...
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100">
      <div className="w-24 h-24 bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-100 rounded mb-1" />
      <div className="h-5 w-1/3 bg-gray-200 rounded mb-2" />
    </div>
  );
}

// ... (El componente ProductQuickView no necesita cambios, puedes dejarlo como estaba) ...
// Nota: Asegúrate de que este componente realmente exista y esté completo en tu archivo.
function ProductQuickView({ product, onClose, onAddToCart }) { 
    // Tu código original para la vista rápida va aquí...
    // Esto es solo un placeholder para que el archivo no dé error si lo borraste.
    if (!product) return null;
    return ( <div> {product.nombre} </div> )
}


function useQueryParam(name) {
  const { search } = useLocation();
  return new URLSearchParams(search).get(name);
}

export default function BuscarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Se obtiene el estado de 'categorias' que configuraste en tu store.js
  const { data: categoriasApi, loading: loadingCategorias } = useSelector((state) => state.categorias);

  const searchParam = useQueryParam("search");
  const categoriaIdParam = useQueryParam("categoriaId");

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [query, setQuery] = useState(searchParam || "");
  const [marcas, setMarcas] = useState([]);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [categorias, setCategorias] = useState(categoriaIdParam ? [categoriaIdParam] : []);
  
  const [marcasDisponibles, setMarcasDisponibles] = useState([]);
  const [sortBy, setSortBy] = useState("relevancia");
  const [quickView, setQuickView] = useState(null);
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    // Solo dispara la acción si las categorías no se han cargado
    if (categoriasApi.length === 0) {
      // 🟢 CORRECCIÓN: Asegúrate que la función exportada en "categoriesSlice.js" se llame 'fetchCategorias'
      dispatch(fetchCategorias());
    }
  }, [dispatch, categoriasApi.length]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.append('nombre', query);
    if (marcas.length > 0) params.append('marca', marcas.join(','));
    if (categorias.length > 0) params.append('categoriaId', categorias.join(','));
    if (precioMin) params.append('precioMin', precioMin);
    if (precioMax) params.append('precioMax', precioMax);
    params.append('page', page);
    params.append('size', pageSize);

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });

    async function fetchProductos() {
      setLoading(true);
      setError("");
      try {
        const url = `http://localhost:8080/producto?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al cargar productos");
        
        const data = await res.json();
        const productosArr = Array.isArray(data.content) ? data.content : [];
        setProductos(productosArr);

        if (page === 0) {
            const marcasSet = new Set(productosArr.map(p => p.marca).filter(Boolean));
            setMarcasDisponibles(Array.from(marcasSet).sort());
        }

        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        setError("No se pudieron cargar los productos.");
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, [query, marcas, categorias, precioMin, precioMax, page, pageSize, navigate]);

  const productosFiltrados = [...productos].sort((a, b) => {
    if (sortBy === "precio-asc") return a.precio - b.precio;
    if (sortBy === "precio-desc") return b.precio - a.precio;
    if (sortBy === "nombre-asc") return a.nombre.localeCompare(b.nombre);
    if (sortBy === "nombre-desc") return b.nombre.localeCompare(a.nombre);
    return 0;
  });

  function handleMarcaChange(marca) {
    setMarcas(prev => prev.includes(marca) ? prev.filter(m => m !== marca) : [...prev, marca]);
    setPage(0);
  }

  function handleCategoriaChange(catId) {
    setCategorias(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
    setPage(0);
  }
  
  async function handleAddToCart(producto, cantidad) {
    try {
      await dispatch(addProductToCart({ productoId: producto.id, cantidad })).unwrap();
      toast.success(`¡${producto.nombre} agregado al carrito!`);
    } catch (err) {
      toast.error(err || "No se pudo agregar el producto.");
    }
  }

  const handleAddToCartWithAnim = async (producto, cantidad) => {
    if (!producto) return;
    await handleAddToCart(producto, cantidad);
    setAddedId(producto.id);
    setTimeout(() => setAddedId(null), 1200);
  };
  
  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Resultados de Búsqueda</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72 flex-shrink-0 mb-4 md:mb-0">
          <form className="bg-white rounded-xl shadow p-6 flex flex-col gap-6 sticky top-28">
            <h2 className="text-xl font-bold">Filtros</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                value={query || ""}
                onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                placeholder="Nombre del producto..."
                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {loadingCategorias === 'pending' && <span className="text-xs text-gray-400">Cargando...</span>}
                {categoriasApi.length > 0 ? (
                  categoriasApi.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categorias.includes(String(c.id))}
                        onChange={() => handleCategoriaChange(String(c.id))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {c.nombre}
                    </label>
                  ))
                ) : (
                    loadingCategorias !== 'pending' && <span className="text-xs text-gray-400">No hay categorías</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Marca</label>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {marcasDisponibles.length > 0 ? (
                  marcasDisponibles.map((m) => (
                    <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marcas.includes(m)}
                        onChange={() => handleMarcaChange(m)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {m}
                    </label>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Sin filtros de marca</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Precio Mínimo</label>
                <input
                  type="number"
                  min={0}
                  value={precioMin}
                  onChange={(e) => { setPrecioMin(e.target.value); setPage(0); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Precio Máximo</label>
                <input
                  type="number"
                  min={0}
                  value={precioMax}
                  onChange={(e) => { setPrecioMax(e.target.value); setPage(0); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <button
                type="button"
                onClick={() => {
                    setCategorias([]);
                    setMarcas([]);
                    setPrecioMin("");
                    setPrecioMax("");
                    setQuery("");
                    setPage(0);
                }}
                className="mt-2 w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
                Limpiar Filtros
            </button>

          </form>
        </aside>

        <main className="flex-1">
          {/* ... (El resto de tu JSX para mostrar los productos no necesita cambios) ... */}
        </main>
      </div>
    </div>
  );
}