// src/pages/ProfilePage.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import formatearFecha from "./formatearFecha.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  // 1. Obtenemos la nueva función 'updateUser' del contexto
  const { usuario, updateUser } = useAuth(); 

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: ""
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        email: usuario.email || "",
      });
    }
  }, [usuario]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Modificamos la función handleSave
  const handleSave = (e) => {
    e.preventDefault();
    updateUser(formData); // <-- Llamamos a la función para actualizar los datos
    setIsEditing(false);  // Ocultamos el formulario
  };

  if (!usuario) {
    return (
      <div className="mt-10 text-center">
        Necesitas iniciar sesión para ver tu perfil.
        <button className="ml-4 underline" onClick={() => navigate("/signin")}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  // El resto del JSX (la parte visual) queda exactamente igual...
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
              <button type="submit" className="bg-green-600 text-white py-2 px-6 rounded font-semibold hover:bg-green-700 transition">
                Guardar
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-800 py-2 px-6 rounded font-semibold hover:bg-gray-400 transition">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Usuario:</span>
              <span className="block text-lg">{usuario.username}</span>
            </div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Email:</span>
              <span className="block text-lg">{usuario.email}</span>
            </div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Nombre:</span>
              <span className="block text-lg">{usuario.nombre}</span>
            </div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Apellido:</span>
              <span className="block text-lg">{usuario.apellido}</span>
            </div>
            <div className="mb-4">
              <span className="block text-gray-600 font-semibold">Fecha de registro:</span>
              <span className="block text-lg">
                {formatearFecha(usuario.fecha_registro)}
              </span>
            </div>
            <button
              className="bg-[#6DB33F]-600 text-white py-2 px-6 rounded font-semibold mt-2 hover:bg-green-700 transition"
              onClick={() => setIsEditing(true)}
            >
              Editar perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}