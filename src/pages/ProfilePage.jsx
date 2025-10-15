import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import formatearFecha from "./formatearFecha.jsx"; // Asegúrate de que este helper exista y funcione

export default function ProfilePage() {
  const navigate = useNavigate();
  const { usuario } = useAuth(); // Usamos el usuario de nuestro contexto

  // Si no hay usuario (por ejemplo, si se accede a la URL directamente sin iniciar sesión),
  // podríamos mostrar un mensaje de carga o redirigir.
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

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `conic-gradient(at 50% 25%, #0000 75%, #47d3ff 0),
          conic-gradient(at 50% 25%, #0000 75%, #47d3ff 0) 60px 60px,
          repeating-linear-gradient(135deg, #adafff 0 12.5%, #474bff 0 25%)`,
        backgroundSize: "calc(4 * 60px) calc(4 * 60px)",
      }}
    >
      <div className="max-w-md w-full p-8 bg-white bg-opacity-95 rounded-xl shadow-lg z-10 backdrop-blur-[2px]">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Mi Perfil (Simulado)</h2>
        <div>
          <div className="mb-4">
            <span className="block text-gray-600 font-semibold">
              Usuario:
            </span>
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
            <span className="block text-gray-600 font-semibold">
              Apellido:
            </span>
            <span className="block text-lg">{usuario.apellido}</span>
          </div>
          <div className="mb-4">
            <span className="block text-gray-600 font-semibold">
              Fecha de registro:
            </span>
            <span className="block text-lg">
              {formatearFecha(usuario.fecha_registro)}
            </span>
          </div>
          <button
            className="bg-blue-600 text-white py-2 px-6 rounded font-semibold mt-2 hover:bg-blue-700 transition"
            onClick={() => alert("Funcionalidad de edición no disponible en la demo")}
          >
            Editar perfil
          </button>
        </div>
      </div>
    </div>
  );
}