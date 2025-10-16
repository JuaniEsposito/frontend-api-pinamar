import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();

    // --- NUEVA VALIDACIÓN DE EMAIL ---
    if (!email.includes("@")) {
      alert("Por favor, ingresá un correo electrónico válido.");
      return; // Detiene la ejecución si el email no es válido
    }
    // --- FIN DE LA VALIDACIÓN ---

    setError(null);
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const nuevoUsuario = {
      id: Date.now(),
      nombre: nombre,
      apellido: apellido,
      email: email,
      username: username,
      rol: "USER",
      fecha_registro: new Date().toISOString(),
    };

    /*login({
      jwt: "token-falso-generado-en-registro",
      role: nuevoUsuario.rol, 
    });*/

  login({
    jwt: "token-falso-generado-en-registro",
    userData: nuevoUsuario, // Pasa el objeto completo
  });
    
    alert("¡Usuario registrado con éxito! Sesión iniciada. ¡Bienvenido!");

    navigate("/");

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded relative"
    >
      <button
        onClick={() => navigate("/signin")}
        className="absolute left-4 top-4 p-2 rounded-full text-blue-500 hover:bg-blue-100 transition"
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

      {error && (
        <div className="mb-4 text-red-600 text-center bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

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
        type="text" // Cambiado a 'text' para permitir la validación manual
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
        {loading ? "Registrando..." : "Registrarse"}
      </button>
      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/signin"
          className="text-primary hover:text-secondary font-semibold"
        >
          Iniciá sesión acá
        </Link>
      </p>
    </form>
  );
}