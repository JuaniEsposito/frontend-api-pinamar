import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function SignInPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      login({
        jwt: "este-es-un-token-falso-para-la-demo",
        usuario: {
          id: 1,
          nombre: usuario || "Usuario Demo",
          apellido: usuario || "Demo",
          email: `${usuario || "usuario"}@correo.com`,
          username: usuario || "usuariodemo",
          fecha_registro: new Date().toISOString(),
          rol: "USER",
        },
      });
      
      navigate(from, { replace: true });

    } catch (err) {
      console.error("Error durante el login:", err);
      setError("Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto relative overflow-hidden z-10 bg-white p-8 rounded-lg shadow-md
      before:w-24 before:h-24 before:absolute before:bg-green-100 before:rounded-full before:-z-10 before:blur-2xl
      after:w-32 after:h-32 after:absolute after:bg-green-200 after:rounded-full after:-z-10 after:blur-xl after:top-24 after:-right-12"
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 p-2 rounded-full text-green-500 hover:bg-green-100 transition"
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
      <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
        Iniciar sesión
      </h2>
      <form className="form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="input mt-1 p-2 w-full bg-gray-100 border border-green-300 rounded-md text-green-900 mb-4 focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mt-1 p-2 w-full bg-gray-100 border border-green-300 rounded-md text-green-900 mb-4 focus:ring-2 focus:ring-green-500"
          required
        />
        <button
          type="submit"
          className="login-button bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-bold rounded-md w-full transition mt-2"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mt-3">
            {error}
          </div>
        )}
      </form>

      <div className="flex flex-col mt-6">
        <span className="text-center text-gray-500 mb-2">
          ¿No tenés cuenta?
        </span>
        <Link
          to="/signup"
          className="w-full bg-white border border-green-500 text-green-700 font-bold py-2 rounded-md text-center hover:bg-green-50 transition"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}