import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch }from "react-redux";
import { addProductToCart } from "../redux/cartSlice";
import { toast } from 'react-toastify'; 

// Importaciones de assets (se asume que estas rutas son válidas para los banners)
import bannerFoto1 from "../assets/banner1.png";
import bannerFoto2 from "../assets/banner2.jpg";
import bannerFoto3 from "../assets/banner3.jpg";
import bannerFoto4 from "../assets/banner4.png";
import bannerFoto5 from "../assets/banner5.jpg";

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre-asc", label: "Nombre: A-Z" },
  { value: "nombre-desc", label: "Nombre: Z-A" },
];

const FALLBACK_IMG = "https://placehold.co/100x100/55aaff/ffffff?text=Producto";
const API_BASE_URL = "http://localhost:8080/producto"; 
const SERVER_BASE_URL = "http://localhost:8080/"; 

// ❌ ELIMINADAS: MOCK_PRODUCTS y las importaciones de imágenes mock

// --- COMPONENTES INTEGRADOS ---

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

function ProductCard({ id, name, brand, img, price, weight, offer, stock, description, onQuickView, onAddToCart, added, units }) {
    
    const imageUrl = img && img.startsWith('uploads/') ? `${SERVER_BASE_URL}${img}` : img || FALLBACK_IMG;

    const handleQuickView = () => onQuickView({
        id, name, brand, price, stock, description, imageUrl, descuento: offer ? parseFloat(offer) : 0
    });

    const handleAdd = () => onAddToCart({ id, name, brand, price, stock, description, imageUrl, descuento: offer ? parseFloat(offer) : 0 }, 1);

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col justify-between border border-gray-100 hover:border-primary">
      <Link to={`/producto/id/${id}`} className="flex flex-col items-center text-center">
        <img
          src={imageUrl}
          alt={name}
          className="w-24 h-24 object-contain mb-3"
          onError={(e) => e.target.src = FALLBACK_IMG}
        />
        <div className="font-semibold text-base text-dark mb-1 line-clamp-2">{name}</div>
        <div className="text-xs text-muted mb-1">{brand} {weight && `· ${weight}`}</div>
        <div className="text-primary font-bold text-lg mb-2">${price?.toFixed(2)}</div>
        <div className="text-xs text-gray-400">Stock: {stock || 0}</div>
      </Link>
      <div className="mt-3 flex flex-col gap-1">
        <button
          className="bg-accent text-dark text-sm px-3 py-1 rounded-lg hover:bg-primary/90 hover:text-white transition shadow"
          onClick={handleQuickView}
        >
          Vista Rápida
        </button>
        <button
          className={`bg-primary text-white text-sm px-3 py-1 rounded-lg hover:bg-secondary transition shadow relative ${added ? 'bg-green-600' : ''}`}
          onClick={handleAdd}
        >
          {added ? "¡Agregado!" : "Añadir al carrito"}
          {units > 0 && <span className="absolute right-1 bottom-1 bg-blue-100 text-blue-700 text-xs px-1 rounded-full font-bold">x{units}</span>}
        </button>
      </div>
    </div>
  );
}

function ProductQuickView({ product, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState(0);

  useEffect(() => { setQty(1); setAdded(false); setUnits(0); }, [product]);
  useEffect(() => {
    if (!product) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, product]);

  if (!product) return null;

  const stock = product.stock ?? 0;
  const description = product.description || "";
  const price = product.price ?? 0;
  const name = product.name ?? "Producto";
  const brand = product.brand ?? "Marca";
  const img = product.imageUrl || FALLBACK_IMG;

  const handleAdd = async () => {
    if (!product.id) return; 
    setLoading(true);
    
    onAddToCart(product, qty); 
    
    setAdded(true);
    setUnits(units + qty);
    setLoading(false);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 relative flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 md:p-8"><img src={img} alt={name} className="w-40 h-40 md:w-56 md:h-56 object-contain rounded-xl shadow-lg transition-transform duration-300 hover:scale-105" draggable={false}/></div>
        <div className="flex-1 flex flex-col p-6 md:p-8">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-2xl font-bold" onClick={onClose} aria-label="Cerrar" tabIndex={0}>×</button>
          <div className="flex items-center gap-2 mb-2"><span className="font-bold text-xl text-dark">{name}</span>{product.descuento > 0 && (<span className="bg-accent text-dark text-xs font-bold px-2 py-0.5 rounded-full shadow">{product.descuento}% OFF</span>)}</div>
          <div className="text-sm text-muted mb-1">{brand}</div>
          <div className="text-primary font-bold text-2xl mb-1">${price?.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mb-3">Precio sin impuestos nacionales: ${price ? Math.round(price / 1.21) : 0}</div>
          <div className="text-gray-600 text-sm mb-4">{description}</div>
          <div className="flex items-center gap-3 mb-4"><span className="text-xs font-medium text-secondary">En stock: {stock}</span></div>
          <div className="flex items-center gap-2 mb-6">
            <label htmlFor="qty" className="text-sm text-gray-700">Cantidad:</label>
            <input id="qty" type="number" min={1} max={stock} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(stock, Number(e.target.value))))} className="w-16 px-2 py-1 border border-gray-200 rounded text-center focus:ring-2 focus:ring-primary"/>
          </div>
          <button
            className={`bg-primary text-white font-semibold px-6 py-3 rounded-lg shadow transition text-base w-full flex items-center justify-center gap-2 relative
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
              <span className="absolute right-3 bottom-2 bg-[#6DB33F]-100 text-[#6DB33F]-700 text-xs px-2 py-0.5 rounded-full font-bold pointer-events-none">
                x{units}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Carousel({ items }) {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));
  const prev = () => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
  
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl shadow-2xl mx-auto max-w-[1600px]">
      <div className="flex transition-transform ease-in-out duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item, i) => (
          <div key={i} className="w-full flex-shrink-0 relative h-[300px] sm:h-[400px] flex items-center justify-center bg-gray-200">
            <img 
              src={item.img || "https://placehold.co/1200x400/474bff/ffffff?text=Banner+Simulado"} 
              alt={`Banner ${i + 1}`} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <h2 className="text-4xl sm:text-6xl font-black text-white drop-shadow-xl text-center">{item.text }</h2>
            </div>
          </div>
        ))}
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition z-10">
        &lt;
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition z-10">
        &gt;
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {items.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-2 w-2 rounded-full transition-all ${current === i ? 'bg-white scale-125' : 'bg-white/50'}`} aria-label={`Ir al slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

function useQueryParam(name) {
  const { search } = useLocation();
  return new URLSearchParams(search).get(name);
}

export default function HomePage() {
    
    const dispatch = useDispatch(); 
    // ✅ 1. Leemos el carrito y la autenticación desde Redux
    const cart = useSelector((state) => state.cart.items); 
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    
    // --- ESTADOS DE DATOS ---
    const [apiProducts, setApiProducts] = useState([]); 
    
    // --- ESTADOS LOCALES ---
    const categoriaIdParam = useQueryParam("categoriaId");
    const searchParam = useQueryParam("search");
    const [query, setQuery] = useState(searchParam || "");
    const [marcas, setMarcas] = useState([]);
    const [precioMin, setPrecioMin] = useState("");
    const [precioMax, setPrecioMax] = useState("");
    const [sortBy, setSortBy] = useState("relevancia");
    const [quickView, setQuickView] = useState(null);
  
    // Estados para simular la paginación y la carga
    const [productosPaginados, setProductosPaginados] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(8); 
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [banners] = useState([ 
        { img: bannerFoto1, text: "Frescura Garantizada"},
        { img: bannerFoto2, text: "Mejores Precios"},
        { img: bannerFoto3, text: "Compra Rápida"},
        { img: bannerFoto4, text: "Envíos a Domicilio"},
        { img: bannerFoto5, text: "Stock Asegurado"},
    ]);
  
    // Estado para la animación de agregar al carrito
    const [addedId, setAddedId] = useState(null);
    
    const unitsMap = useMemo(() => {
       const map = {};
       if (cart) {
            for (const item of cart) {
                map[item.id] = item.quantity;
            }
       }
       return map;
    }, [cart]); 
    
    // Nueva función para mapear los productos de la API al formato del frontend
    const mapApiProduct = (p) => ({
        id: p.id,
        name: p.nombre,
        price: p.precio ? parseFloat(p.precio) : 0,
        stock: p.stock || 0,
        brand: p.marca || 'Sin Marca',
        description: p.descripcion || '',
        category: p.categoria || 'N/A',
        imageUrl: (p.imagenes && p.imagenes.length > 0 && p.imagenes[0]?.imagen) 
                ? p.imagenes[0].imagen 
                : FALLBACK_IMG,
        unidad_medida: p.unidad_medida || 'unidad', 
        descuento: p.descuento ? parseFloat(p.descuento) : 0,
        bestSeller: false, 
        categoria_id: p.categoria_id, 
        stock_minimo: p.stock_minimo || 0, 
    });


    // LÓGICA DE CARGA DE PRODUCTOS DESDE LA API
    const fetchApiProducts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            // ✅ CORRECCIÓN: Usamos la URL base corregida a 8080
            const response = await fetch(API_BASE_URL); 
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: El servidor no respondió correctamente.`);
            }
            const data = await response.json();
            
            const productsArray = data.productos; 

            if (!Array.isArray(productsArray)) {
                 throw new Error("Formato de datos inválido: La propiedad 'productos' no es una lista.");
            }
            
            const mappedProducts = productsArray.map(mapApiProduct);
            setApiProducts(mappedProducts); 
            setError(null);

        } catch (err) {
            console.error("Error fetching API products:", err);
            setError(`Error al cargar productos: ${err.message}.`); 
            setApiProducts([]); 
        } finally {
            setLoading(false);
        }
    }, []);

    // LLAMADA INICIAL A LA API
    useEffect(() => {
        fetchApiProducts();
    }, [fetchApiProducts]);


    // COMBINACIÓN DE DATOS (Solo usamos la API, si falla queda vacío)
    const products = apiProducts; 

    // --- LÓGICA PRINCIPAL (Filtro y Paginación LOCAL) ---
    useEffect(() => {
        if (loading) return; 

       let productosFiltrados = products.filter((p) => {
            const nombre = p.name || "";
            const precio = p.price || 0;
            const marca = p.brand || "";

            if (query && !nombre.toLowerCase().includes(query.toLowerCase())) return false;
            if (marcas.length > 0 && !marcas.includes(marca)) return false;
            if (precioMin && precio < Number(precioMin)) return false;
            if (precioMax && precio > Number(precioMax)) return false;

            return true;
       });
    
       productosFiltrados.sort((a, b) => {
            const precioA = a.price || 0;
            const precioB = b.price || 0;
            const nombreA = a.name || "";
            const nombreB = b.name || "";

            if (sortBy === "precio-asc") return precioA - precioB;
            if (sortBy === "precio-desc") return precioB - precioA;
            if (sortBy === "nombre-asc") return nombreA.localeCompare(nombreB);
            if (sortBy === "nombre-desc") return nombreB.localeCompare(nombreA);
            return 0;
       });

       const totalCount = productosFiltrados.length;
       const startIndex = page * pageSize;
       const endIndex = startIndex + pageSize;
    
       setProductosPaginados(productosFiltrados.slice(startIndex, endIndex));
       setTotalElements(totalCount);
       setTotalPages(Math.ceil(totalCount / pageSize) || 1);

    }, [products, query, marcas, precioMin, precioMax, page, pageSize, sortBy, loading]);

    // Sincronización de query con la URL
    useEffect(() => {
       setQuery(searchParam || "");
    }, [searchParam]);

    function handleMarcaChange(marca) {
       setMarcas((marcas) =>
            marcas.includes(marca)
                ? marcas.filter((m) => m !== marca)
                : [...marcas, marca]
       );
       setPage(0); // Resetear a página 0 al cambiar filtros
    }
  
    // ✅ CONEXIÓN A REDUX Y TOASTIFY
    const handleAddToCart = async (product, cantidad) => {
        if (!isAuthenticated) {
            toast.warn("Debes iniciar sesión para agregar productos al carrito.");
            return;
        }
        
        try {
            await dispatch(addProductToCart({ productoId: product.id, cantidad })).unwrap();
            toast.success(`¡${product.name} agregado al carrito!`);
        } catch (e) {
            toast.error(e.payload || "Error al agregar al carrito. Sin stock.");
        }
    };
    
    const handleAddToCartWithAnim = (product, cantidad) => {
       handleAddToCart(product, cantidad); 
       
       // Lógica de animación
       setAddedId(product.id);
       setTimeout(() => setAddedId(null), 1200);
    };

    const marcasDisponibles = useMemo(() => 
        Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort(),
        [products]
    );
  
    // Renderizado del Home Page y el Listado
    return (
       <>
            <Carousel items={banners} />
            <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 py-8">
                <h1 className="text-3xl font-bold mb-6 text-primary">
                    Nuestros Productos
                </h1>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar de filtros */}
                    <aside className="w-full md:w-72 flex-shrink-0 mb-4 md:mb-0">
                        <form className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 sticky top-28">
                            <div className="text-xl font-bold text-dark mb-2">Filtros</div>
                            
                            {/* Filtro por Marca */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Marca</label>
                                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                                    {marcasDisponibles.length === 0 && loading ? (
                                        <span className="text-xs text-gray-400">Cargando marcas...</span>
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
                            
                            {/* Filtro por Precio (se mantiene) */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Precio Mínimo</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={precioMin}
                                        onChange={(e) => setPrecioMin(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Precio Máximo</label>
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
                    {/* Resultados */}
                    <main className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                            <h2 className="text-xl font-semibold text-dark">Resultados ({totalElements})</h2>
                            
                            <div className="flex items-center gap-2">
                                {/* Ordenar por (se mantiene) */}
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
                                
                                {/* Mostrar por página (se mantiene) */}
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
                        ) : error && apiProducts.length === 0 ? (
                            <div className="text-red-500 p-3 bg-red-100 rounded">{error}</div>
                        ) : productosPaginados.length === 0 ? (
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
                                    {productosPaginados.map((p) => (
                                        <ProductCard
                                            key={p.id}
                                            id={p.id}
                                            name={p.name}
                                            brand={p.brand}
                                            img={p.imageUrl} 
                                            price={p.price}
                                            stock={p.stock}
                                            description={p.description}
                                            weight={p.unidad_medida}
                                            offer={p.descuento > 0 ? `${p.descuento}% OFF` : undefined}
                                            bestSeller={p.bestSeller}
                                            onQuickView={setQuickView}
                                            onAddToCart={handleAddToCartWithAnim}
                                            added={addedId === p.id}
                                            units={unitsMap[p.id] || 0}
                                        />
                                    ))}
                                </div>
                                {/* Paginación (se mantiene) */}
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
                                            Mostrando {productosPaginados.length} de{" "}
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
       </>
    );
}