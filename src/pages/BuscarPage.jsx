import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import { addProductToCart } from "../redux/cartSlice";
import { fetchProductos } from "../redux/productosSlice";
import { fetchCategorias } from "../redux/categoriesSlice"; 
import { toast } from 'react-toastify';

const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre-asc", label: "Nombre: A-Z" },
  { value: "nombre-desc", label: "Nombre: Z-A" },
];

const FALLBACK_IMG = "https://placehold.co/100x100/55aaff/ffffff?text=Producto";

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

function ProductQuickView({ product, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState(0);

  useEffect(() => {
    setQty(1);
    setAdded(false);
    setUnits(0);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, product]);

  if (!product) return null;

  const stock = product.stock ?? 0;
  const description = product.descripcion || product.description || "";
  const price = product.precio ?? product.price ?? 0;
  const name = product.nombre ?? product.name ?? "Producto";
  const brand = product.marca ?? product.brand ?? "Marca";
  const img =
    (product.imagenes &&
      Array.isArray(product.imagenes) &&
      product.imagenes[0]?.imagen) ||
    (product.imagenes &&
      Array.isArray(product.imagenes) &&
      typeof product.imagenes[0] === "string" &&
      product.imagenes[0]) ||
    product.imagenUrl ||
    product.img ||
    FALLBACK_IMG;

  function handleBgClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const handleAdd = async () => {
    if (!onAddToCart || !product) return;
    setLoading(true);
    await onAddToCart(product, qty);
    setAdded(true);
    setUnits(units + qty);
    setLoading(false);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBgClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto relative">
        
        {/* BOTÓN DE CERRAR (X) */}
        <button 
          className="absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full shadow-lg text-white text-2xl font-bold transition-all" 
          onClick={onClose} 
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Contenido del Modal */}
        <div className="p-6">
          {/* Título */}
          <h2 className="text-2xl font-bold text-primary mb-4 pr-12">{name}</h2>
          
          <div className="grid md:grid-cols-5 gap-6">
            {/* Imagen - Columna izquierda */}
            <div className="md:col-span-2 flex items-start justify-center bg-gray-50 rounded-xl p-6">
              <img 
                src={img} 
                alt={name} 
                className="w-full max-w-[200px] h-auto object-contain rounded-lg shadow-lg" 
                draggable={false}
              />
            </div>

            {/* Información - Columna derecha */}
            <div className="md:col-span-3 flex flex-col gap-4">
              <div>
                <span className="text-sm text-gray-500">{brand}</span>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-bold text-primary">${typeof price === 'number' ? price.toFixed(2) : price}</span>
                {product.descuento > 0 && (
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                    {product.descuento}% OFF
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500">
                Precio sin IVA: ${price ? Math.round(price / 1.21) : 0}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-lg mb-2 text-primary">Descripción</h3>
                <p className="text-gray-600">{description || 'Sin descripción disponible'}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Stock disponible:</span>
                  <span className={`text-sm font-bold ${stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {stock} unidades
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <label htmlFor="qty" className="text-sm text-gray-700">Cantidad:</label>
                <input 
                  id="qty" 
                  type="number" 
                  min={1} 
                  max={stock} 
                  value={qty} 
                  onChange={(e) => setQty(Math.max(1, Math.min(stock, Number(e.target.value))))} 
                  className="w-16 px-2 py-1 border border-gray-200 rounded text-center focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Botón Agregar al Carrito */}
              <div className="mt-4">
                <button
                  className={`w-full bg-primary text-white font-semibold px-6 py-3 rounded-lg shadow-md transition text-lg flex items-center justify-center gap-2 relative
                    ${added ? "bg-green-600" : "hover:bg-secondary"}
                    ${loading ? "opacity-70 cursor-not-allowed" : ""}
                  `}
                  onClick={handleAdd}
                  disabled={loading}
                >
                  {added ? (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      ¡Agregado!
                    </span>
                  ) : loading ? (
                    "Agregando..."
                  ) : (
                    <>
                      <span>Agregar al carrito</span>
                      <span className="font-bold">×{qty}</span>
                    </>
                  )}
                  {units > 0 && (
                    <span className="absolute right-3 bottom-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold pointer-events-none">
                      x{units}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function useQueryParam(name) {
  const { search } = useLocation();
  return new URLSearchParams(search).get(name);
}

export default function BuscarPage() {
  const dispatch = useDispatch();
  
  // LEER DESDE REDUX
  const { productos: productosRedux, loading: loadingProductos, error: errorProductos } = useSelector((state) => state.productos);
  const { categoriasParent, loading: loadingCategorias } = useSelector((state) => state.categorias); // ✅ NUEVO
  const cart = useSelector((state) => state.cart.items);
  
  // PARÁMETROS DE URL
  const categoriaIdParam = useQueryParam("categoriaId");
  const searchParam = useQueryParam("search");
  const qParam = useQueryParam("q");
  
  // ESTADOS LOCALES
  const [query, setQuery] = useState(searchParam || "");
  const [marcas, setMarcas] = useState([]);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [promo, setPromo] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [sortBy, setSortBy] = useState("relevancia");
  const [quickView, setQuickView] = useState(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [addedId, setAddedId] = useState(null);

  // Unidades en el carrito
  const unitsMap = useMemo(() => {
    const map = {};
    if (cart) {
      for (const item of cart) {
        map[item.id] = item.quantity;
      }
    }
    return map;
  }, [cart]);

  //  Cargar categorías al montar (USANDO REDUX)
  useEffect(() => {
    dispatch(fetchCategorias());
  }, [dispatch]);

  // Si viene categoriaId por URL, seleccionarla automáticamente
  useEffect(() => {
    if (categoriaIdParam && categoriasParent.length > 0) {
      setCategorias([String(categoriaIdParam)]);
      setPage(0);
    }
  }, [categoriaIdParam, categoriasParent]);

  //  FETCH DE PRODUCTOS USANDO REDUX
  useEffect(() => {
    const params = { page: 0, size: 200 };
    
    if (marcas.length > 0) {
      params.marca = marcas.join(',');
    }
    
    if (categorias.length > 0) {
      const categoriaId = parseInt(categorias[0], 10);
      if (!isNaN(categoriaId) && categoriaId > 0) {
        params.categoriaId = categoriaId;
      }
    }
    
    if (subcategorias.length > 0) {
      params.subcategoriaId = subcategorias.join(',');
    }
    
    if (precioMin && precioMin.trim()) {
      params.precioMin = precioMin;
    }
    
    if (precioMax && precioMax.trim()) {
      params.precioMax = precioMax;
    }
    
    dispatch(fetchProductos(params));
  }, [dispatch, marcas, categorias, subcategorias, precioMin, precioMax]);

  //  Sincronizar query con parámetros de URL
  useEffect(() => {
    setQuery(searchParam || "");
  }, [searchParam]);

  //  FILTRAR Y ORDENAR PRODUCTOS
  const { productosFiltrados, totalElements, totalPages } = useMemo(() => {
    if (loadingProductos) return { productosFiltrados: [], totalElements: 0, totalPages: 1 };

    let productos = Array.isArray(productosRedux) ? [...productosRedux] : [];
    
    const searchTerm = qParam?.trim() || query?.trim();
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      productos = productos.filter(p => {
        const nombreMatch = p.nombre && p.nombre.toLowerCase().includes(searchLower);
        const marcaMatch = p.marca && p.marca.toLowerCase().includes(searchLower);
        const categoriaMatch = p.categoria && p.categoria.toLowerCase().includes(searchLower);
        return nombreMatch || marcaMatch || categoriaMatch;
      });
    }
    
    productos = productos.filter((p) => Number(p.stock) > 0);
    
    if (promo) {
      productos = productos.filter((p) => Number(p.descuento) > 0);
    }
    
    productos.sort((a, b) => {
      if (sortBy === "precio-asc") return a.precio - b.precio;
      if (sortBy === "precio-desc") return b.precio - a.precio;
      if (sortBy === "nombre-asc") return (a.nombre || "").localeCompare(b.nombre || "");
      if (sortBy === "nombre-desc") return (b.nombre || "").localeCompare(a.nombre || "");
      return 0;
    });

    const totalCount = productos.length;
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      productosFiltrados: productos.slice(startIndex, endIndex),
      totalElements: totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1
    };
  }, [productosRedux, qParam, query, promo, sortBy, page, pageSize, loadingProductos]);

  //  Marcas disponibles
  const marcasDisponibles = useMemo(() => {
    if (!productosRedux) return [];
    const marcasSet = new Set();
    productosRedux.forEach((p) => {
      if (p.marca && typeof p.marca === "string" && p.marca.trim() !== "") {
        marcasSet.add(p.marca.trim());
      }
    });
    return Array.from(marcasSet).sort((a, b) => a.localeCompare(b));
  }, [productosRedux]);

  // HANDLERS
  function handleMarcaChange(marca) {
    setMarcas((marcas) =>
      marcas.includes(marca)
        ? marcas.filter((m) => m !== marca)
        : [...marcas, marca]
    );
    setPage(0);
  }

  function handleCategoriaChange(catId) {
    setCategorias((prevCategorias) => {
      const isAlreadySelected = prevCategorias.includes(catId);
      return isAlreadySelected ? [] : [catId];
    });
    setPage(0);
  }

  function handleSubcategoriaChange(subId) {
    setSubcategorias((subcategorias) =>
      subcategorias.includes(subId)
        ? subcategorias.filter((s) => s !== subId)
        : [...subcategorias, subId]
    );
    setPage(0);
  }

  async function handleAddToCart(producto, cantidad) {
    try {
      await dispatch(
        addProductToCart({ productoId: producto.id, cantidad })
      ).unwrap();
      
      toast.success(`¡${producto.nombre} agregado al carrito!`);
      
    } catch (err) {
      toast.error(err.message || "No se pudo agregar el producto.");
    }
  }

  const handleAddToCartWithAnim = async (producto, cantidad) => {
    if (!producto) return;
    await handleAddToCart(producto, cantidad);
    setAddedId(producto.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const loading = loadingProductos || loadingCategorias;
  const error = errorProductos;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Buscar productos</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72 flex-shrink-0 mb-4 md:mb-0">
          <form className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 sticky top-28">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar</label>
              <input
                type="text"
                value={query || ""}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, marca, etc."
                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marca</label>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {marcasDisponibles.length === 0 ? (
                  <span className="text-xs text-gray-400">
                    {loadingProductos ? "Cargando..." : "No hay marcas"}
                  </span>
                ) : (
                  marcasDisponibles.map((m) => (
                    <label key={m} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={marcas.includes(m)}
                        onChange={() => handleMarcaChange(m)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {m}
                    </label>
                  ))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoría
              </label>
              <div>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {categoriasParent.length === 0 ? (
                    <span className="text-xs text-gray-400">
                      {loadingCategorias ? "Cargando..." : "No hay categorías"}
                    </span>
                  ) : (
                    categoriasParent.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={categorias.includes(String(c.id))}
                          onChange={() => handleCategoriaChange(String(c.id))}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        {c.nombre}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Precio mínimo
                </label>
                <input
                  type="number"
                  min={0}
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Precio máximo
                </label>
                <input
                  type="number"
                  min={0}
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </form>
        </aside>
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-xl font-semibold text-dark">Resultados ({totalElements})</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-sm text-gray-700">
                Ordenar por:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary text-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <label htmlFor="pageSize" className="ml-4 text-sm text-gray-700">
                Mostrar:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-primary text-sm"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "2rem 2.5rem",
              }}
            >
              {Array.from({ length: pageSize }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 p-3 bg-red-100 rounded">{error}</div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-gray-500">
              No se encontraron productos con esos filtros.
            </div>
          ) : (
            <>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "2rem 2.5rem",
                }}
              >
                {productosFiltrados.map((p, i) => (
                  <ProductCard
                    key={p.id || i}
                    id={p.id}
                    name={p.nombre}
                    brand={p.marca}
                    img={
                      (Array.isArray(p.imagenes) && p.imagenes.length > 0 && p.imagenes[0]?.imagen) ||
                      undefined
                    }
                    price={p.precio}
                    weight={p.unidad_medida}
                    offer={p.descuento > 0 ? `${p.descuento}% OFF` : undefined}
                    bestSeller={p.bestSeller}
                    onQuickView={() => setQuickView(p)}
                    onAddToCart={(cantidad) => handleAddToCartWithAnim(p, cantidad)}
                    added={addedId === p.id}
                    units={unitsMap[p.id] || 0}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    className="px-3 py-1 rounded bg-accent text-primary font-semibold disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    ←
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {page + 1} de {totalPages}
                  </span>
                  <button
                    className="px-3 py-1 rounded bg-accent text-primary font-semibold disabled:opacity-50"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    →
                  </button>
                  <span className="ml-4 text-xs text-gray-500">
                    Mostrando {productosFiltrados.length} de{" "}
                    {totalElements} productos
                  </span>
                </div>
              )}
            </>
          )}
          <ProductQuickView
            product={quickView}
            onClose={() => setQuickView(null)}
            onAddToCart={handleAddToCartWithAnim}
          />
        </main>
      </div>
    </div>
  );
}