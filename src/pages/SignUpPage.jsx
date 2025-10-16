import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simula una llamada al backend con un retraso
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simula un registro exitoso y redirige al login
    alert("¡Cuenta creada con éxito! Ahora podés iniciar sesión.");
    navigate("/signin");
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded relative"
    >
      {/* Link a login arriba */}
      <button
        onClick={() => navigate("/signin")}
        className="absolute left-4 top-4 p-2 rounded-full text-[#6DB33F] hover:bg-[#6DB33F] transition"
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
        type="text"
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
          className="text-primary hover:text-[#6DB33F] font-semibold"
        >
          Iniciá sesión acá
        </Link>
      </p>
    </form>
  );
}