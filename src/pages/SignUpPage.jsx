import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// Importa el thunk de registro y la acción para limpiar errores del authSlice
import { registerThunk, clearAuthError } from "../redux/authSlice"; 

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  // 🆕 Nuevos campos requeridos por el backend (vistos en la imagen de Postman)
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState(""); 
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔄 Usa useSelector para obtener el estado de loading y error desde Redux
  const { loading, error } = useSelector((state) => state.auth); 

  // Limpia el mensaje de error de Redux al salir de la página
  useEffect(() => {
    // Si tienes una propiedad `isAuthenticated` en authSlice y quieres redirigir
    // inmediatamente después de un registro exitoso, la lógica iría aquí.
    // Por ahora, solo limpiamos el error:
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validación de email básico
    if (!email.includes("@")) {
      alert("Por favor, ingresá un correo electrónico válido.");
      return; 
    }

    // Limpia errores anteriores antes de la nueva llamada
    dispatch(clearAuthError()); 

    // 🚀 Llama al thunk de registro de Redux/Axios
    dispatch(
      registerThunk({
        username,
        email,
        password,
        nombre,
        apellido,
        telefono, // Incluido
        direccion, // Incluido
        rol: "USER", // Rol por defecto
      })
    )
      .unwrap() // Desenvuelve la Promise para manejar el éxito/fracaso
      .then(() => {
        // En caso de éxito (status 2xx)
        alert("Cuenta creada con éxito. Ahora podés iniciar sesión.");
        navigate("/signin"); // Redirige a Iniciar Sesión
      })
      .catch((err) => {
        // En caso de fallo, el error ya está seteado en el estado de Redux
        // por rejectWithValue en el thunk.
        console.error("Error en el registro:", err);
      });
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded relative"
    >
      <button
        onClick={() => navigate("/signin")}
        className="absolute left-4 top-4 p-2 rounded-full text-[#6DB33F] hover:bg-gray-100 transition"
        title="Volver"
        type="button"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h2 className="text-xl font-bold mb-4 text-center">Crear cuenta</h2>

      {/* Muestra el error obtenido desde el estado de Redux */}
      {error && (
        <div className="mb-4 text-red-600 text-center bg-red-100 p-2 rounded">
          {error} 
        </div>
      )}

      {/* Inputs existentes */}
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      <input
        type="text"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      <input
        type="email" // ⬅️ Vuelto a 'email' para validación nativa más simple
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      
      {/* 🆕 Nuevos Inputs para Teléfono y Dirección */}
      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        required
      />
      <input
        type="text"
        placeholder="Dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        disabled={loading} // 🔄 Usa el loading de Redux
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
      
      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/signin"
          className="text-primary hover:text-[#6DB33F] font-semibold"
        >
          Iniciá sesión acá
        </Link>
      </p>
    </form>
  );
}