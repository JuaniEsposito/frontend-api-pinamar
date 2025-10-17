// src/pages/ProfilePage.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // 🆕 Reemplaza useAuth
import { useNavigate } from "react-router-dom";
import formatearFecha from "./formatearFecha.jsx"; // Asumo que este path es correcto

// 🆕 Importamos los thunks y acciones del usuarioSlice
import { fetchPerfil, updatePerfil, clearUsuarioMsg } from "../redux/usuarioSlice"; 


export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. 🔑 OBTENER ESTADO DE REDUX
  // Datos básicos (token y usuario simple del registro/login)
  const { token, usuario: authUsuario } = useSelector(state => state.auth);
  // Datos detallados del perfil y estado de carga/error del usuarioSlice
  const { perfil, loading, error, success } = useSelector(state => state.usuario); 

  // Usamos el perfil detallado si está cargado, si no, usamos el objeto simple del authSlice
  const usuarioMostrar = perfil || authUsuario; 

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: ""
  });
  const [updateError, setUpdateError] = useState(null);

  // 2. useEffect: Disparar la carga del perfil si solo tenemos el usuario simple
  useEffect(() => {
    // Si tenemos un token y un usuario simple (con id), pero no el perfil detallado, lo cargamos.
    if (token && authUsuario && authUsuario.id && !perfil && !loading) {
        dispatch(fetchPerfil({ token, id: authUsuario.id })); 
    }
    
    // Limpiar mensajes de éxito/error del usuarioSlice al salir
    return () => {
        dispatch(clearUsuarioMsg()); 
        setUpdateError(null);
    }
  }, [token, authUsuario, perfil, loading, dispatch]);

  // 3. useEffect: Sincronizar datos de Redux con el formulario
  useEffect(() => {
    if (usuarioMostrar) {
      setFormData({
        nombre: usuarioMostrar.nombre || "",
        apellido: usuarioMostrar.apellido || "",
        email: usuarioMostrar.email || "", 
      });
    }
  }, [usuarioMostrar]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. Función handleSave usando Redux Thunk
  const handleSave = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    dispatch(clearUsuarioMsg());

    try {
        await dispatch(updatePerfil({ 
            token, 
            formData: formData, 
        })).unwrap();

        setIsEditing(false); 
        // El mensaje de éxito lo maneja el estado de Redux (success)
    } catch (e) {
        // El error ya fue capturado en el estado 'error' de Redux
        setUpdateError("Error al guardar: " + e.message);
    }
  };

  // 5. Validación de usuario logeado
  // Si no hay token, el usuario no está logeado.
  if (!token) { 
    return (
      <div className="mt-10 text-center">
        Necesitas iniciar sesión para ver tu perfil.
        <button className="ml-4 underline" onClick={() => navigate("/signin")}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  // Muestra "Cargando" mientras se obtienen los datos detallados por primera vez
  if (loading && !perfil) {
      return <div className="mt-10 text-center text-lg">Cargando perfil...</div>;
  }
  
  // Si estamos logeados pero la carga falló (solo debería suceder si el fetchPerfil falla)
  if (!usuarioMostrar) {
       return <div className="mt-10 text-center text-red-600">Error: No se pudieron cargar los datos del usuario. Por favor, intenta recargar.</div>;
  }
  
  // 6. Renderizado de la página
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `conic-gradient(at 50% 25%, #0000 75%, #6DB33F 0),
          conic-gradient(at 50% 25%, #0000 75%, #secondary 0) 60px 60px,
          repeating-linear-gradient(135deg, secondary 0 12.5%, #6DB33F 0 25%)`,
        backgroundSize: "calc(4 * 60px) calc(4 * 60px)",
      }}
    >
      <div className="max-w-md w-full p-8 bg-white bg-opacity-95 rounded-xl shadow-lg z-10 backdrop-blur-[2px]">
        <h2 className="text-2xl font-bold mb-6 text-green-700">Mi Perfil</h2>
        
        {/* Muestra mensajes de Redux/Error */}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        {updateError && <div className="mb-4 text-red-600">{updateError}</div>}


        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="block text-gray-600 font-semibold mb-1">Nombre:</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 font-semibold mb-1">Apellido:</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 font-semibold mb-1">Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>
            <div className="flex gap-4">
              <button type="submit" 
                      className="bg-green-600 text-white py-2 px-6 rounded font-semibold hover:bg-green-700 transition"
                      disabled={loading} // Deshabilita si está cargando
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-800 py-2 px-6 rounded font-semibold hover:bg-gray-400 transition">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* Mostrar datos */}
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Usuario:</span>
              <span className="block text-lg">{usuarioMostrar.username}</span>
            </div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Email:</span>
              <span className="block text-lg">{usuarioMostrar.email}</span>
            </div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Nombre:</span>
              <span className="block text-lg">{usuarioMostrar.nombre}</span>
            </div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Apellido:</span>
              <span className="block text-lg">{usuarioMostrar.apellido}</span>
            </div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Fecha de registro:</span>
              <span className="block text-lg">
                {formatearFecha(usuarioMostrar.fecha_registro)}
              </span>
            </div>
            <button
              className="bg-green-600 text-white py-2 px-6 rounded font-semibold mt-2 hover:bg-green-700 transition"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              Editar perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}