import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";
import StepPago from "./StepPago";

const MOCK_DIRECCIONES_INICIAL = [
  { id: 1, calle: "Av. Corrientes", numero: 1234, pisoDepto: "Piso 5, Depto. C", ciudad: "CABA", provincia: "Buenos Aires", codigoPostal: "1001" },
  { id: 2, calle: "Av. Santa Fe", numero: 4321, pisoDepto: "", ciudad: "CABA", provincia: "Buenos Aires", codigoPostal: "1123" },
];

export default function FinalizarCompraPage() {
  const navigate = useNavigate();
  const { cart, checkout } = useAuth();

  const [direcciones] = useState(MOCK_DIRECCIONES_INICIAL);
  const [direccionId, setDireccionId] = useState(1);
  const [envio] = useState(true);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(2);

 const calcularTotal = useMemo(() => {
  if (!cart) return 0;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return envio ? subtotal + 2000 : subtotal;
}, [cart, envio]);

  // ✅ ESTA FUNCIÓN RECIBE LOS TOTALES DESDE StepPago
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
            ccalcularTotal={calcularTotal}
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