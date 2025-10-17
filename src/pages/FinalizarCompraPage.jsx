import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../auth/AuthProvider";
import { fetchDirecciones } from "../redux/direccionesSlice";
import StepPago from "./StepPago";

export default function FinalizarCompraPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, checkout } = useAuth();
  
  // 👇 Obtener direcciones Y usuario desde Redux
  const { direcciones, loading: loadingDirecciones } = useSelector((state) => state.direcciones);
  const { usuario } = useSelector((state) => state.auth);

  const [direccionId, setDireccionId] = useState("");
  const [envio] = useState(true);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(2);

  // 👇 CAMBIO AQUÍ: Cargar direcciones solo si hay usuario
  useEffect(() => {
    if (usuario?.id) {
      dispatch(fetchDirecciones(usuario.id)); // 👈 Pasá el ID del usuario
    }
  }, [dispatch, usuario]);

  // 👇 Setear la primera dirección por defecto cuando carguen
  useEffect(() => {
    if (direcciones.length > 0 && !direccionId) {
      setDireccionId(direcciones[0].id.toString());
    }
  }, [direcciones, direccionId]);

  const calcularTotal = useCallback(() => {
    if (!cart) return 0;
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return envio ? subtotal + 2000 : subtotal;
  }, [cart, envio]);

  const handlePagar = async (e, { totalFinal, totalOriginal, descuento }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const direccionSeleccionada = direcciones.find(d => d.id === parseInt(direccionId));

    if (envio && !direccionSeleccionada) {
      setError("Por favor, selecciona una dirección de envío.");
      setLoading(false);
      return;
    }

    const ordenConfirmada = checkout({
      totalFinal,
      descuento,
      totalOriginal,
      direccionSeleccionada,
    });
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    
    if (ordenConfirmada) {
      navigate(`/mis-pedidos/${ordenConfirmada.id}`, { state: { orden: ordenConfirmada } });
    } else {
      setError("No se pudo procesar el pedido.");
    }
  };

  // 👇 Mostrar mensaje si no hay usuario
  if (!usuario) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-green-700 tracking-tight">
          Finalizar compra
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Debes iniciar sesión para finalizar tu compra.</p>
        </div>
      </div>
    );
  }

  // 👇 Mostrar loading mientras cargan las direcciones
  if (loadingDirecciones) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
        <p className="text-center text-gray-600">Cargando información...</p>
      </div>
    );
  }

  // 👇 Mostrar mensaje si no hay direcciones
  if (direcciones.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-green-700 tracking-tight">
          Finalizar compra
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No tenés direcciones registradas.</p>
          <button
            onClick={() => navigate("/mis-direcciones")}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Agregar dirección
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-green-700 tracking-tight">
        Finalizar compra
      </h2>
      <AnimatePresence mode="wait">
        {step === 2 && (
          <StepPago
            key="step-pago"
            cart={cart}
            calcularTotal={calcularTotal}
            handlePagar={handlePagar}
            direcciones={direcciones}
            direccionId={direccionId}
            setDireccionId={setDireccionId}
            card={card}
            setCard={setCard}
            loading={loading}
            error={error}
            setStep={setStep}
            envio={envio}
          />
        )}
      </AnimatePresence>
    </div>
  );
}