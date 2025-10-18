import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../redux/authSlice"; 
import logoMarket from "../assets/logo.png";
import { toast } from 'react-toastify';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, usuario } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart); 
  const categoriasRedux = []; // Placeholder

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

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/buscar?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setShowMobileSearch(false);
    }
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

        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 mx-6 max-w-xl"
        >
          <input
            type="text"
            placeholder="Buscar productos, marcas, categorías..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-l-md border border-gray-200 focus:ring-2 focus:ring-primary text-gray-900 text-base outline-none bg-white"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-secondary text-white font-semibold px-5 py-2 rounded-r-md transition"
          >
            Buscar
          </button>
        </form>

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
                  
                  {/* ✅ CORRECCIÓN ESCRITORIO: Mis Paneles (Dashboard) - SOLO visible para ADMIN */}
                  {usuario?.rol === "ADMIN" && (
                      <Link
                          to="/mis-dashboards"
                          className="block px-4 py-2 font-semibold text-dark bg-blue-100 hover:bg-blue-200 rounded transition"
                          onClick={() => setUserDropdown(false)}
                      >
                          Mi Panel
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

      {/* Mobile Menus */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleSearchSubmit}
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
              type="submit"
              className="bg-primary hover:bg-secondary text-white font-semibold px-5 py-2 rounded-r-md transition"
            >
              Buscar
            </button>
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
        <div className="flex flex-col gap-2 px-8 mt-4">
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
              {/* Rutas de Usuario Móvil */}
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

              {/* Mis Paneles (Dashboard) - SOLO visible para ADMIN */}
              {usuario?.rol === "ADMIN" && (
                  <NavLink
                      to="/mis-dashboards"
                      className="py-3 px-4 rounded-full font-semibold text-lg flex items-center gap-2 bg-blue-100 text-dark hover:bg-blue-200 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setOpen(false)}
                  >
                      Mis Paneles
                  </NavLink>
              )}
              
              {/*  Panel de Admin general */}
              {usuario?.rol === "ADMIN" && (
                  <NavLink
                      to="/admin/productos"
                      className="py-3 px-4 rounded-full font-semibold text-lg flex items-center gap-2 bg-yellow-100 text-dark hover:bg-yellow-200 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setOpen(false)}
                  >
                      Panel de Administración
                  </NavLink>
              )}
              
              {/* Botón Cerrar Sesión Móvil */}
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
    </header>
  );
}