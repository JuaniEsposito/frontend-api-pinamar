import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";   // ✅ única línea para hooks
import ProductCard from "../components/ProductCard";
import bannerFoto2 from "../assets/harinas-carrusel-2.jpg";
import bannerFoto1 from "../assets/verduras-carrusel-1.jpg";
import bannerFoto3 from "../assets/logo-carrusel-3.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchCarrito, patchCarrito } from "../redux/cartSlice";
import Carousel from "../components/Carousel"; // <--- ¡Asegurate de que esta ruta sea correcta!

const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre-asc", label: "Nombre: A-Z" },
  { value: "nombre-desc", label: "Nombre: Z-A" },
];

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
  const price = product.precio ?? product.price;
  const name = product.nombre ?? product.name;
  const brand = product.marca ?? product.brand;
  const img =
    (product.imagenes &&
      Array.isArray(product.imagenes) &&
      product.imagenes[0]?.imagen) ||
    (product.imagenes &&
      Array.isArray(product.imagenes) &&
      typeof product.imagenes[0] === "string" &&
      product.imagenes[0]) ||
    product.imagenUrl ||
    product.img;

  function handleBgClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const handleAdd = async () => {
    if (!onAddToCart || !product.id) return;
    setLoading(true);
    await onAddToCart(product.id, qty);
    setAdded(true);
    setUnits(units + qty);
    setLoading(false);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={handleBgClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 relative flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 md:p-8">
          {img ? (
            <img
              src={img}
              alt={name}
              className="w-40 h-40 md:w-56 md:h-56 object-cover rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
              draggable={false}
            />
          ) : (
            <div className="w-40 h-40 md:w-56 md:h-56 bg-gray-100 rounded-xl shadow-lg flex items-center justify-center text-5xl">
              🛒
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col p-6 md:p-8">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-primary text-2xl font-bold"
            onClick={onClose}
            aria-label="Cerrar"
            tabIndex={0}
          >
            ×
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-xl text-dark">{name}</span>
            {product.descuento > 0 && (
              <span className="bg-accent text-dark text-xs font-bold px-2 py-0.5 rounded-full shadow">
                {product.descuento}% OFF
              </span>
            )}
          </div>
          <div className="text-sm text-muted mb-1">{brand}</div>
          <div className="text-primary font-bold text-2xl mb-1">${price}</div>
          <div className="text-xs text-gray-400 mb-3">
            Precio sin impuestos nacionales: $
            {price ? Math.round(price / 1.21) : 0}
          </div>
          <div className="text-gray-600 text-sm mb-4">{description}</div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-secondary">En stock</span>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <label htmlFor="qty" className="text-sm text-gray-700">
              Cantidad:
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              max={stock}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, Math.min(stock, Number(e.target.value))))
              }
              className="w-16 px-2 py-1 border border-gray-200 rounded text-center focus:ring-2 focus:ring-primary"
            />
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
              <span className="absolute right-3 bottom-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold pointer-events-none">
                x{units}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function useQueryParam(name) {
  const { search } = useLocation();
  return new URLSearchParams(search).get(name);
}

export default function HomePage() {
  const categoriaIdParam = useQueryParam("categoriaId");
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const searchParam = useQueryParam("search");
  const [query, setQuery] = useState(searchParam);
  const [marcas, setMarcas] = useState([]);
  const [marcasDisponibles, setMarcasDisponibles] = useState([]);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [promo, setPromo] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [sortBy, setSortBy] = useState("relevancia");
  const [quickView, setQuickView] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoriasApi, setCategoriasApi] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (categoriaIdParam && categoriasApi.length > 0) {
      setCategorias([String(categoriaIdParam)]);
      setPage(0);
    }
  }, [categoriaIdParam, categoriasApi]);

  useEffect(() => {
    setBanners([
      {
        img: bannerFoto3,
        // title: "¡Super Ofertas de la Semana!",
        // desc: 'Encontra descuentos exclusivos en cientos de productos filtrando por "En promoción".',
        // cta: "Explorar promociones",
        // to: "/buscar",
      },
      { img: bannerFoto1 },
      { img: bannerFoto2 },
    ]);
  }, []);

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      setError("");
      try {
        let url = "http://localhost:4040/producto";
        const params = [];
        if (query) params.push(`nombre=${encodeURIComponent(query)}`);
        if (marcas.length > 0) params.push(`marca=${marcas.join(",")}`);
        if (categorias.length > 0)
          params.push(`categoriaId=${categorias[0]}`);
        if (subcategorias.length > 0)
          params.push(`subcategoriaId=${subcategorias.join(",")}`);
        if (precioMin) params.push(`precioMin=${precioMin}`);
        if (precioMax) params.push(`precioMax=${precioMax}`);
        params.push(`page=${page}`);
        params.push(`size=${pageSize}`);
        if (params.length > 0) url += "?" + params.join("&");

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();
        const productosArr = Array.isArray(data.content) ? data.content : [];
        setProductos(productosArr);

        const marcasSet = new Set();
        productosArr.forEach((p) => {
          if (p.marca && typeof p.marca === "string" && p.marca.trim() !== "") {
            marcasSet.add(p.marca.trim());
          }
        });
        setMarcasDisponibles(Array.from(marcasSet).sort((a, b) => a.localeCompare(b)));

        setTotalPages(
          data.totalPages ||
            Math.ceil(
              (data.totalElements || data.content?.length || 0) / pageSize
            )
        );
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        setError("No se pudieron cargar los productos.");
        setProductos([]);
        setMarcasDisponibles([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    }
    fetchProductos();
  }, [
    query,
    marcas,
    categorias,
    subcategorias,
    promo,
    precioMin,
    precioMax,
    page,
    pageSize,
    categoriaIdParam,
  ]);

  useEffect(() => {
    setQuery(searchParam);
  }, [searchParam]);

  const subcategoriasDisponibles = categoriasApi
    .filter((cat) => categorias.includes(String(cat.id)))
    .flatMap((cat) => cat.subcategorias || [])
    .map((sub) => ({ id: String(sub.id), nombre: sub.nombre }))
    .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);

  const productosFiltrados = [...productos]
    .filter((p) => Number(p.stock) > 0)
    .filter((p) => !promo || Number(p.descuento) > 0)
    .sort((a, b) => {
      if (sortBy === "precio-asc") return a.precio - b.precio;
      if (sortBy === "precio-desc") return b.precio - a.precio;
      if (sortBy === "nombre-asc")
        return (a.nombre || "").localeCompare(b.nombre || "");
      if (sortBy === "nombre-desc")
        return (b.nombre || "").localeCompare(a.nombre || "");
      return 0;
    });

  function handleMarcaChange(marca) {
    setMarcas((marcas) =>
      marcas.includes(marca)
        ? marcas.filter((m) => m !== marca)
        : [...marcas, marca]
    );
  }

  function handleCategoriaChange(catId) {
    setCategorias((categorias) =>
      categorias.includes(catId)
        ? categorias.filter((c) => c !== catId)
        : [...categorias, catId]
    );
    setSubcategorias((subs) =>
      subs.filter((sub) =>
        subcategoriasDisponibles.map((s) => s.id).includes(sub)
      )
    );
  }

  function handleSubcategoriaChange(subId) {
    setSubcategorias((subcategorias) =>
      subcategorias.includes(subId)
        ? subcategorias.filter((s) => s !== subId)
        : [...subcategorias, subId]
    );
  }

  async function handleAddToCart(id, cantidad) {
    try {
      await dispatch(patchCarrito({ token, productoId: id, cantidad }));
      await dispatch(fetchCarrito(token));
    } catch {}
  }

  const [addedId, setAddedId] = useState(null);
  const [unitsMap, setUnitsMap] = useState({});

  const handleAddToCartWithAnim = async (id, cantidad) => {
    await handleAddToCart(id, cantidad);
    setUnitsMap((prev) => ({ ...prev, [id]: (prev[id] || 0) + cantidad }));
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1200);
  };

    return (
      <ProductCard
        {...props}
        img={props.img}
        onErrorImg={FALLBACK_IMG}
        onQuickView={props.onQuickView}
        showSinImpuestos={true}
        onAddToCart={handleAddToCartLocal}
      />
    );
  }

  // --------- ACÁ VA LA FUNCION CategoryCard ---------
  function CategoryCard({ name, img, to }) {
    const initial = name?.[0]?.toUpperCase() || "?";
    return (
      <Link
        to={to}
        className="flex flex-col items-center bg-white rounded-xl shadow hover:shadow-xl transition group p-3 sm:p-4 border border-gray-100 hover:border-primary"
        style={{
          margin: "0 12px 24px 12px",
          minWidth: 140,
          maxWidth: 180,
        }}
      >
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full mb-2 border-2 border-accent group-hover:scale-105 transition bg-gray-100 text-primary"
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            userSelect: "none",
          }}
        >
          {initial}
        </div>
        <span className="text-base sm:text-lg font-medium text-dark group-hover:text-primary transition text-center">
          {name}
        </span>
      </Link>
    );
  }
  // -------------------------------------------------------------------
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}
  // Carrusel de banners
 
   // Carrusel de banners (fix: usa useRef + classNames definido arriba)
function Carousel({
  items = [],           // [{ img, title?, desc?, cta?, to? }]
  autoPlayMs = 6000,
  showThumbs = true,
  height = { base: 220, sm: 320, md: 420 }, // alto responsivo
  brand = { primary: "#6DB33F", dark: "#4C8C2B" }, // Spring Boot green
}) {
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const len = items.length || 0;
  if (len === 0) return null;

  const go = (n) => {
    setPrevIdx(idx);
    setIdx(((n % len) + len) % len);
  };
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  useEffect(() => {
    if (hover || len < 2) return;
    timerRef.current = setInterval(next, autoPlayMs);
    return () => clearInterval(timerRef.current);
  }, [hover, idx, len, autoPlayMs]);

  useEffect(() => {
    const pre = new Image();
    pre.loading = "eager";
    pre.src = items[(idx + 1) % len]?.img || "";
  }, [idx, len, items]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) (delta < 0 ? next() : prev());
    touchStartX.current = null;
  };

  // OJO con Tailwind: las clases con valores dinámicos no se generan.
  // Por eso, además de className, seteamos height por style inline:
  const hStyle = {
    height: `${height.base}px`,
  };

  const active = items[idx];

  return (
    <div
      className={classNames("relative w-full rounded-2xl overflow-hidden shadow-xl",
        "sm:[height:unset] md:[height:unset]" // evitamos clases dinámicas
      )}
      style={hStyle}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promociones"
      aria-live="polite"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Imagen anterior para efecto slide */}
      <div className="absolute inset-0">
        {items[prevIdx] && prevIdx !== idx && (
          <img
            key={`prev-${prevIdx}`}
            src={items[prevIdx].img}
            alt={items[prevIdx].title || "Anterior"}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 translate-x-0"
            style={{ transform: "translateX(-8%)", filter: "brightness(0.95)" }}
            draggable={false}
          />
        )}
        {/* Imagen activa */}
        <img
          key={`active-${idx}`}
          src={active.img}
          alt={active.title || "Banner"}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
          style={{ opacity: 1 }}
          draggable={false}
        />
        {/* Overlay verde */}
        <div
          className="
          pointer-events-none absolute inset-0 bg-gradient-to-r
          from-[#6DB33F]/28   /* antes ~0.88 -> ahora 0.28 */
          via-[#6DB33F]/14    /* antes ~0.66 -> ahora 0.14 */
          to-transparent" />
      </div>

      {/* Texto */}
      <div className="relative z-10 flex flex-col justify-center h-full pl-6 sm:pl-14 pr-6 text-white max-w-[720px]">
        {active.title && (
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-md">
            {active.title}
          </h2>
        )}
        {active.desc && (
          <p className="mt-2 md:mt-3 text-base sm:text-lg opacity-95">
            {active.desc}
          </p>
        )}
        {active.cta && active.to && (
          <div className="mt-4">
            <Link
              to={active.to}
              className="inline-block font-semibold px-6 py-3 rounded-xl shadow-lg border-2 transition"
              style={{
                backgroundColor: "#ffffffE6",
                color: brand.dark,
                borderColor: brand.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = brand.primary;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffffE6";
                e.currentTarget.style.color = brand.dark;
              }}
            >
              {active.cta}
            </Link>
          </div>
        )}
      </div>

      {/* Flechas */}
      {len > 1 && (
  < >
    <button
      onClick={prev}
      aria-label="Anterior"
      className="
        group absolute top-1/2 -translate-y-1/2 left-3 sm:left-4
        w-11 h-11 sm:w-12 sm:h-12 rounded-full
        bg-white/100 hover:bg-white
        shadow-lg transition focus:outline-none
        flex items-center justify-center z-20
      "
      style={{ backdropFilter: "saturate(120%) blur(2px)" }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-20 h-20 text-[#f8fafc] group-hover:text-[#6DB33F] transition"
        fill="none"
        stroke="currentColor"
        strokeWidth="6.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <button
      onClick={next}
      aria-label="Siguiente"
      className="
        group absolute top-1/2 -translate-y-1/2 right-3 sm:right-4
        w-11 h-11 sm:w-12 sm:h-12 rounded-full
        bg-white/2 hover:bg-white
        shadow-lg transition focus:outline-none
        flex items-center justify-center z-20
      "
      style={{ backdropFilter: "saturate(120%) blur(2px)" }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-20 h-20 text-[#f8fafc] group-hover:text-[#6DB33F] transition"
        fill="none"
        stroke="currentColor"
        strokeWidth="6.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  </>
)}


      {/* Dots */}
      {len > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {items.map((_, i) => {
            const activeDot = i === idx;
            return (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => go(i)}
                className="w-3 h-3 rounded-full transition"
                style={{
                  backgroundColor: activeDot ? brand.primary : "rgba(255,255,255,0.7)",
                  outline: activeDot ? `2px solid ${brand.dark}` : "none",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}


  // Skeleton para categoría (puede quedar igual que tenías)
  function SkeletonCategoryCard() {
    return (
      <div className="animate-pulse bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
      </div>
    );
  }

  return (
          <div className="w-full flex flex-col items-center">
            {/* Carousel */}
            <Carousel
               items={banners}
               autoPlayMs={6000}
               showThumbs={true}
               height={{ base: 220, sm: 320, md: 420 }}
              brand={{ primary: "#6DB33F", dark: "#4C8C2B" }}/>

      {/* Categorías */}
      <div className="w-full max-w-[1400px] px-2 sm:px-6 mb-12">
        <Link to="/categorias">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-dark hover:text-primary transition cursor-pointer">
            Categorías populares
          </h2>
        </Link>
        {loadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-x-6 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCategoryCard key={i} />
            ))}
          </div>
        ) : categoriesMapped.length === 0 ? (
          <div className="text-gray-500">No hay categorías disponibles.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-x-6 gap-y-8">
            {categoriesMapped
              .slice(
                catPage * categoriesPerPage,
                (catPage + 1) * categoriesPerPage
              )
              .map((cat) => (
                <CategoryCard key={cat.name} {...cat} />
              ))}
          </div>
        )}
        {categoriesMapped.length > categoriesPerPage && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="px-3 py-1 rounded bg-accent text-primary font-semibold disabled:opacity-50"
              onClick={() => setCatPage((p) => Math.max(0, p - 1))}
              disabled={catPage === 0}
            >
              ←
            </button>
            <span className="text-sm text-gray-600">
              {catPage + 1} /{" "}
              {Math.ceil(categoriesMapped.length / categoriesPerPage)}
            </span>
            <button
              className="px-3 py-1 rounded bg-accent text-primary font-semibold disabled:opacity-50"
              onClick={() =>
                setCatPage((p) =>
                  Math.min(
                    Math.ceil(categoriesMapped.length / categoriesPerPage) - 1,
                    p + 1
                  )
                )
              }
              disabled={
                catPage >=
                Math.ceil(categoriesMapped.length / categoriesPerPage) - 1
              }
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Promociones destacadas */}
      <div className="w-full max-w-[1400px] px-2 sm:px-6 mb-12">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-dark">
          Promociones destacadas
        </h2>
        {loadingProductos ? null : promosMapped.length === 0 ? (
          <div className="text-gray-500">No hay productos en promoción.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {promosMapped.slice(0, 10).map((prod) => (
              <ProductCardWithFallback key={prod.id} {...prod} />
            ))}
          </div>
        )}
      </div>

      {/* Productos destacados */}
      <div className="w-full max-w-[1400px] px-2 sm:px-6 mb-16">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-dark">
          Productos destacados
        </h2>
        <div className="relative flex flex-col items-center w-full">
          {loadingProductos ? null : <>{/* grillas y sliders de productos*/}</>}
        </div>
      </div>

      {/* Desktop: masonry-like grid */}
      {loadingProductos ? null : (
        <>
          <div className="hidden sm:flex justify-center w-full">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-12 gap-y-14 auto-rows-[1fr] px-2 max-w-[2000px] w-full justify-items-center">
              {productosDestacados
                .slice(
                  prodPage * productsPerPage,
                  (prodPage + 1) * productsPerPage
                )
                .map((prod) => (
                  <div
                    key={prod.id || prod.nombre}
                    className="flex h-full min-h-0 justify-center"
                  >
                    <ProductCardWithFallback
                      id={prod.id}
                      name={prod.nombre}
                      brand={prod.marca}
                      img={
                        (Array.isArray(p.imagenes) && p.imagenes[0]?.imagen) ||
                        (Array.isArray(p.imagenes) &&
                          typeof p.imagenes[0] === "string" &&
                          p.imagenes[0]) ||
                        undefined
                      }
                      price={p.precio}
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
                      {totalElements || productosFiltrados.length} productos
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