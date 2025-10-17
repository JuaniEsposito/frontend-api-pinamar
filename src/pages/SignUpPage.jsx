import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk, clearAuthError } from "../redux/authSlice";
import { toast } from 'react-toastify'; // ✅ IMPORTAMOS TOASTIFY

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Obtiene el estado de Redux
  const { loading, error } = useSelector((state) => state.auth); 

  useEffect(() => {
    // Limpia el error de Redux al montar/desmontar
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      // ✅ ALERT REEMPLAZADO
      toast.error("Por favor, ingresá un correo electrónico válido.");
      return;
    }

    dispatch(clearAuthError()); 

    // 🚀 Llama al thunk de registro (crea usuario y simula login)
    dispatch(
      registerThunk({
        username,
        email,
        password, 
        nombre,
        apellido,
        rol: "USER", 
      })
    )
      .unwrap() 
      .then(() => {
        // ✅ ALERT REEMPLAZADO
        toast.success("Cuenta creada con éxito. Ahora podés iniciar sesión.");
        navigate("/signin");
      })
      .catch((err) => {
        // Fallo: El error se muestra en el UI desde el estado 'error'
        console.error("Fallo en el registro:", err);
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

      {/* Muestra el error de Redux */}
      {error && (
        <div className="mb-4 text-red-600 text-center bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      {/* Inputs */}
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
        type="email"
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

      <button
        type="submit"
        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Registrando e Iniciando Sesión..." : "Registrarse"}
      </button>
      
      {/* Link a Iniciar Sesión */}
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