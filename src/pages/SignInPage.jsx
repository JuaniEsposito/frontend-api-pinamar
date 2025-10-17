import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk, clearAuthError } from "../redux/authSlice"; 
import { toast } from 'react-toastify';

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Si el usuario ya está autenticado, lo redirige al inicio.
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Limpia el mensaje de error cuando el componente se desmonta.
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Limpia cualquier error anterior antes de intentar el login
    dispatch(clearAuthError());

    dispatch(loginThunk({ username, password }))
      .unwrap() // .unwrap() permite usar .then() y .catch() con el resultado del thunk
      .then(() => {
        // Éxito: el usuario se logueó correctamente
        toast.success("¡Sesión iniciada correctamente!");
        navigate("/"); // Redirige a la página principal
      })
      .catch((err) => {
        // Fallo: el error ya se guarda en el estado de Redux,
        // por lo que se mostrará automáticamente en el div de error.
        console.error("Fallo en el login:", err);
      });
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl border"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Iniciar Sesión</h2>

      {/* Muestra el mensaje de error que viene del estado de Redux */}
      {error && (
        <div className="mb-4 text-red-600 text-center bg-red-100 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-primary"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-primary"
        required
      />
      <button
        type="submit"
        className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Iniciando..." : "Ingresar"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tenés cuenta?{" "}
        <Link
          to="/signup"
          className="text-primary hover:text-green-700 font-semibold"
        >
          Registrate acá
        </Link>
      </p>
    </form>
  );
}