import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../redux/authSlice"; 
import { addProductToCart } from "../redux/cartSlice";
import logoMarket from "../assets/logo.png";
import { toast } from 'react-toastify';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  
  // ✅ ESTADOS PARA LA BÚSQUEDA
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // ✅ ESTADOS PARA EL MODAL DE PRODUCTO
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  
  const userDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, usuario } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart); 
  const categoriasRedux = [];

  const totalItems = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((sum, item) => sum + item.cantidad, 0);
  }, [cartItems]);

  const handleLogout = () => {
    dispatch(logoutThunk());
    toast.success("¡Sesión cerrada, hasta luego!");
    setUserDropdown(false);
    navigate("/");
  };

  const isAdmin = usuario?.rol === 'ADMIN';

  // ✅ BÚSQUEDA EN TIEMPO REAL
  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/producto?page=0&size=200`);
        const data = await response.json();
        
        let productos = Array.isArray(data.productos) ? data.productos : [];
        
        const searchLower = search.trim().toLowerCase();
        productos = productos.filter(p => 
          (p.nombre && p.nombre.toLowerCase().includes(searchLower)) ||
          (p.marca && p.marca.toLowerCase().includes(searchLower)) ||
          (p.categoria && p.categoria.toLowerCase().includes(searchLower))
        );
        
        setSearchResults(productos.slice(0, 5));
        setShowSearchDropdown(true);
      } catch (error) {
        console.error("Error al buscar:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // ✅ CERRAR DROPDOWN AL HACER CLICK FUERA
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    }
    if (showSearchDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearchDropdown]);

  // ✅ NO hace nada, solo previene el comportamiento por defecto
  function handleSearchSubmit(e) {
    e.preventDefault();
    // No redirige - la búsqueda es en tiempo real
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    }
    if (userDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdown]);

  const categoriesDropdown = useMemo(() => {
    const cats = Array.isArray(categoriasRedux)
      ? categoriasRedux.filter((cat) => cat.parentId === null)
      : [];
    return [{ name: "Ver todos", to: "/buscar" }].concat(
      cats.map((cat) => ({
        name: cat.nombre,
        to: `/buscar?categoriaId=${cat.id}`,
      }))
    );
  }, [categoriasRedux]);

  const navLinks = [{ label: "Categorías", dropdown: categoriesDropdown }];

  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!dropdown) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdown]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100">
      <nav
        className="max-w-[1600px] mx-auto flex items-center justify-between px-6 sm:px-14 h-[76px] gap-2"
        style={{ width: "100%" }}
      >
        <Link
          to="/"
          className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-primary hover:opacity-90 transition-opacity select-none"
        >
          <span className="">
            <img
              src={logoMarket}
              alt="Logo Spring Market"
              style={{
                width: 55,
                height: 55,
                objectFit: "contain",
                display: "block",
                margin: "auto",
                transform: "scale(1.25)",
              }}
              draggable={false}
            />
          </span>
          <span
            className="hidden sm:inline font-black text-dark tracking-tight text-2xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Spring Market
          </span>
        </Link>

        {/* ✅ SEARCH BAR CON DROPDOWN */}
        <div className="hidden md:flex flex-1 mx-6 max-w-xl relative" ref={searchDropdownRef}>
          <form onSubmit={handleSearchSubmit} className="flex flex-1 relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos, marcas, categorías..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search.trim().length >= 2 && setShowSearchDropdown(true)}
              className="flex-1 pl-10 pr-10 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-primary text-gray-900 text-base outline-none bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            )}
          </form>
          
          {/* ✅ DROPDOWN DE RESULTADOS */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
              {searchLoading ? (
                <div className="p-4 text-center text-gray-500">Buscando...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron resultados
                </div>
              ) : (
                <>
                  {searchResults.map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 text-left"
                      onClick={() => {
                        setSelectedProduct(producto);
                        setShowProductModal(true);
                        setSearch("");
                        setShowSearchDropdown(false);
                      }}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                        {producto.imagenes && producto.imagenes.length > 0 && producto.imagenes[0]?.imagen ? (
                          <img 
                            src={producto.imagenes[0].imagen} 
                            alt={producto.nombre}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-2xl">🛒</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-dark truncate">{producto.nombre}</div>
                        <div className="text-sm text-gray-500">{producto.marca} · {producto.categoria}</div>
                        <div className="text-primary font-bold">${producto.precio}</div>
                      </div>
                    </button>
                  ))}
                  <div className="p-3 text-center text-gray-400 text-sm border-t border-gray-100">
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        

        {/* ✅ CARRITO Y USUARIO */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="md:hidden p-2 rounded-full hover:bg-accent/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setShowMobileSearch(true)}
            aria-label="Buscar"
          >
            <svg
              className="w-7 h-7 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line
                x1="21" y1="21" x2="16.65" y2="16.65"
                strokeLinecap="round"
              />
            </svg>
          </button>
          
          {/* ✅ CARRITO */}
          <div className="relative group">
            <button
              className="relative p-2"
              onClick={() => navigate("/carrito")}
              aria-label="Ver carrito"
            >
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="9" cy="21" r="1.5" />
                <circle cx="18" cy="21" r="1.5" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-2 4h13"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          
          {/* ✅ MENÚ DE USUARIO */}
          {isAuthenticated ? (
            <div
              className="hidden sm:flex items-center gap-2 relative"
              ref={userDropdownRef}
            >
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-gray-50 hover:bg-accent/40 text-dark hover:text-primary transition shadow"
                onClick={() => setUserDropdown((v) => !v)}
                aria-haspopup="true"
                aria-expanded={userDropdown}
                type="button"
              >
                <span className="truncate max-w-[120px]">
                  {usuario?.nombre || usuario?.username || 'Mi Cuenta'}
                </span>
                <svg
                  className={`w-4 h-4 ml-1 transition-transform ${
                    userDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {userDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                  <span className="block px-4 py-2 text-xs text-muted mb-1">
                    Mi cuenta
                  </span>
                  <Link
                    to="/perfil"
                    className="block px-4 py-2 text-dark hover:bg-accent/40 hover:text-primary rounded transition"
                    onClick={() => setUserDropdown(false)}
                  >
                    Mis datos
                  </Link>
                  <Link
                    to="/mis-direcciones"
                    className="block px-4 py-2 text-dark hover:bg-accent/40 hover:text-primary rounded transition"
                    onClick={() => setUserDropdown(false)}
                  >
                    Mis direcciones
                  </Link>
                  <Link
                    to="/mis-pedidos"
                    className="block px-4 py-2 text-dark hover:bg-accent/40 hover:text-primary rounded transition"
                    onClick={() => setUserDropdown(false)}
                  >
                    Mis Pedidos
                  </Link>
                  
                  {usuario?.rol === "ADMIN" && (
                      <Link
                          to="/mis-dashboards"
                          className="block px-4 py-2 font-semibold text-dark bg-blue-100 hover:bg-blue-200 rounded transition"
                          onClick={() => setUserDropdown(false)}
                      >
                          Mis Paneles
                      </Link>
                  )}
                  
                  
                    
                  
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition font-semibold"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/signin"
              className="hidden sm:inline-flex bg-primary hover:bg-[#ffff] text-white font-semibold px-5 py-2 rounded-r-md transition border-2"
            >
              Ingresar
            </NavLink>
          )}
          
          {/* ✅ MENÚ MÓVIL */}
          <button
            className="md:hidden ml-2 p-2 rounded-full hover:bg-accent/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8h16M4 16h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* BÚSQUEDA MÓVIL */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowMobileSearch(false);
            }}
            className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-md p-6 flex gap-2"
          >
            <input
              type="text"
              placeholder="Buscar productos, marcas, categorías..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-md border border-gray-200 focus:ring-2 focus:ring-primary text-gray-900 text-base outline-none bg-white"
              autoFocus
            />
            <button
              type="button"
              className="ml-2 text-gray-400 hover:text-primary text-2xl font-bold"
              onClick={() => setShowMobileSearch(false)}
              aria-label="Cerrar búsqueda"
            >
              ×
            </button>
          </form>
        </div>
      )}

      {/* MENÚ MÓVIL LATERAL */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <div
        className={`fixed top-0 right-0 z-50 w-4/5 max-w-xs h-full bg-white/95 shadow-2xl transform transition-transform duration-300 rounded-l-3xl border-l border-accent flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-full text-primary hover:bg-accent/40"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex flex-col gap-2 px-8 mt-16">
          {isAuthenticated ? (
            <div className="py-3 px-4 mb-2 bg-gray-50 rounded-full">
              <span className="font-bold text-dark">Hola, {usuario?.nombre || usuario?.username || 'Usuario'}</span>
            </div>
          ) : (
            <NavLink
              to="/signin"
              className="py-3 px-4 rounded-full font-semibold text-lg bg-primary text-white hover:bg-secondary transition-all duration-200 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setOpen(false)}
            >
              Ingresar
            </NavLink>
          )}

          {navLinks.map((link) => (
            <div key={link.label} className="flex flex-col">
              <button
                className="py-3 px-4 rounded-full font-semibold text-lg flex items-center justify-between bg-gray-50 hover:bg-accent/40 hover:text-primary transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() =>
                  setMobileDropdown(
                    mobileDropdown === link.label ? null : link.label
                  )
                }
                aria-haspopup="true"
                aria-expanded={mobileDropdown === link.label}
                type="button"
              >
                {link.label}
                <svg
                  className={`w-4 h-4 ml-2 transition-transform ${
                    mobileDropdown === link.label ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {mobileDropdown === link.label && (
                <div className="flex flex-col pl-4 border-l border-accent/40 bg-white/90 rounded-b-xl">
                  {link.dropdown.map((item) => (
                    <Link
                      key={item.name}
                      to={item.to}
                      className="py-2 px-2 text-dark hover:bg-accent/40 hover:text-primary rounded transition"
                      onClick={() => {
                        setOpen(false);
                        setMobileDropdown(null);
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isAuthenticated && (
              <>
              <NavLink
                  to="/perfil"
                  className="py-3 px-4 rounded-full font-semibold text-lg flex items-center gap-2 hover:bg-accent/60 hover:text-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setOpen(false)}
              >
                  Mis datos
              </NavLink>
              <NavLink
                  to="/mis-pedidos"
                  className="py-3 px-4 rounded-full font-semibold text-lg flex items-center gap-2 hover:bg-accent/60 hover:text-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setOpen(false)}
              >
                  Mis Pedidos
              </NavLink>

              {usuario?.rol === "ADMIN" && (
                  <NavLink
                      to="/mis-dashboards"
                      className="py-3 px-4 rounded-full font-semibold text-lg flex items-center gap-2 bg-blue-100 text-dark hover:bg-blue-200 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setOpen(false)}
                  >
                      Mis Paneles
                  </NavLink>
              )}
              
              {usuario?.rol === "ADMIN" && (
                  <NavLink
                      to="/admin/productos"
                      className="py-3 px-4 rounded-full font-semibold text-lg flex items-center gap-2 bg-yellow-100 text-dark hover:bg-yellow-200 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setOpen(false)}
                  >
                      Panel de Administración
                  </NavLink>
              )}
              
              <button
                  onClick={() => { handleLogout(); setOpen(false); }}
                  className="py-3 px-4 rounded-full font-semibold text-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-4"
              >
                  Cerrar sesión
              </button>
              </>
          )}

          <NavLink
            to="/carrito"
            className="py-3 px-4 rounded-full font-semibold text-lg flex items-center gap-2 hover:bg-accent/60 hover:text-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setOpen(false)}
          >
            <span className="text-xl text-secondary">🛒</span> Carrito
          </NavLink>
        </div>
      </div>
{/* ✅ MODAL DE PRODUCTO - CENTRADO Y CON BOTÓN DE CERRAR */}
{showProductModal && selectedProduct && (
  <div 
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={() => setShowProductModal(false)}
    style={{ margin: 0 }}
  >
    <div 
      className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto relative"
      onClick={(e) => e.stopPropagation()}
      style={{ marginTop: 'auto', marginBottom: 'auto' }}
    >
      {/* ✅ BOTÓN DE CERRAR (X) - Arriba a la derecha */}
      <button
        onClick={() => setShowProductModal(false)}
        className="absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full shadow-lg text-white text-2xl font-bold transition-all"
        aria-label="Cerrar"
      >
        ×
      </button>

      {/* Contenido del Modal */}
      <div className="p-6">
        {/* Título */}
        <h2 className="text-2xl font-bold text-primary mb-4 pr-12">{selectedProduct.nombre}</h2>
        
        <div className="grid md:grid-cols-5 gap-6">
          {/* Imagen - Columna izquierda */}
          <div className="md:col-span-2 flex items-start justify-center bg-gray-50 rounded-xl p-6">
            {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 && selectedProduct.imagenes[0]?.imagen ? (
              <img 
                src={selectedProduct.imagenes[0].imagen} 
                alt={selectedProduct.nombre}
                className="w-full max-w-[200px] h-auto object-contain rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-5xl">
                🛒
              </div>
            )}
          </div>

          {/* Información - Columna derecha */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <div>
              <span className="text-sm text-gray-500">{selectedProduct.marca}</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-sm text-gray-500">{selectedProduct.categoria}</span>
            </div>

            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl font-bold text-primary">${selectedProduct.precio}</span>
              {selectedProduct.descuento > 0 && (
                <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                  {selectedProduct.descuento}% OFF
                </span>
              )}
            </div>

            <div className="text-sm text-gray-500">
              Precio sin IVA: ${(selectedProduct.precio / 1.21).toFixed(2)}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-lg mb-2 text-primary">Descripción</h3>
              <p className="text-gray-600">{selectedProduct.descripcion || 'Sin descripción disponible'}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Stock disponible:</span>
                <span className={`text-sm font-bold ${selectedProduct.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                  {selectedProduct.stock} unidades
                </span>
              </div>
            </div>

            {/* Botón Agregar al Carrito */}
            <div className="mt-4">
              <button
                onClick={async () => {
                  try {
                    await dispatch(
                      addProductToCart({ productoId: selectedProduct.id, cantidad: 1 })
                    ).unwrap();
                    toast.success(`¡${selectedProduct.nombre} agregado al carrito!`);
                    setShowProductModal(false);
                  } catch (err) {
                    toast.error(err.message || "No se pudo agregar el producto.");
                  }
                }}
                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-lg transition shadow-md text-lg"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}  
    </header>
  );
} 