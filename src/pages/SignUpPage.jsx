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
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
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

    dispatch(
      registerThunk({
        username,
        email,
        password,
        nombre,
        apellido,
        telefono,
        direccion,
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
        console.error("Error en el registro:", err);
        // El error ya se muestra en el div del formulario, así que no es necesario otro toast aquí.
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