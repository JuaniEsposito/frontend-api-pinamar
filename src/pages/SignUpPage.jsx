import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk, clearAuthError } from "../redux/authSlice";
import { toast } from 'react-toastify';

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  //const [telefono, setTelefono] = useState("");
  //const [direccion, setDireccion] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth); 

  useEffect(() => {
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Por favor, ingresá un correo electrónico válido.");
      return;
    }

    dispatch(clearAuthError()); 

    dispatch(
      registerThunk({
        username,
        email,
        password,
        nombre,
        apellido,
        //telefono,
        //direccion,
        rol: "USER",
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Cuenta creada con éxito. Ahora podés iniciar sesión.");
        navigate("/signin");
      })
      .catch((err) => {
        console.error("Error en el registro:", err);
      });
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl border relative"
    >
      <button
        onClick={() => navigate("/signin")}
        className="absolute left-4 top-4 p-2 rounded-full text-green-600 hover:bg-gray-100 transition"
        title="Volver a Iniciar Sesión"
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
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Crear cuenta</h2>

      {error && (
        <div className="mb-4 text-red-600 text-center bg-red-100 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-primary"
        required
      />
      <input
        type="text"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
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
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-primary"
        required
      />
      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border p-3 mb-4 rounded-lg focus:ring-2 focus:ring-primary"
        required
      />
      

      <button
        type="submit"
        className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/signin"
          className="text-primary hover:text-green-700 font-semibold"
        >
          Iniciá sesión acá
        </Link>
      </p>
    </form>
  );
}