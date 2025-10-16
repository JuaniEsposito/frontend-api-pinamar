import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider"; // ✅ 1. IMPORTAR EL CONTEXTO
import StepPago from "./StepPago";
import StepEntrega from "./StepEntrega";

// ❌ ELIMINADO: MOCK_CARRITO_INICIAL ya no es necesario.

// (Mantenemos el mock de direcciones por ahora, ya que no se gestiona en el AuthProvider)
const MOCK_DIRECCIONES_INICIAL = [
  {
    id: 1,
    calle: "Av. Corrientes",
    numero: 1234,
    pisoDepto: "Piso 5, Depto. C",
    ciudad: "CABA",
    provincia: "Buenos Aires",
    codigoPostal: "1001",
  },
  {
    id: 2,
    calle: "Av. Santa Fe",
    numero: 4321,
    pisoDepto: "",
    ciudad: "CABA",
    provincia: "Buenos Aires",
    codigoPostal: "1123",
  },
];

export default function FinalizarCompraPage() {
  const navigate = useNavigate();
  // ✅ 2. OBTENER LOS DATOS REALES DEL AuthProvider
  const { cart, checkout } = useAuth(); 

  // ❌ ELIMINADO: El estado local del carrito ya no se usa.
  // const [carrito, setCarrito] = useState(MOCK_CARRITO_INICIAL);
  
  const [direcciones, setDirecciones] = useState(MOCK_DIRECCIONES_INICIAL);
  const [direccionId, setDireccionId] = useState(1);
  const [envio, setEnvio] = useState(true);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(2); // Inicia directamente en el paso de pago

  // ✅ 3. CALCULAR TOTAL USANDO EL CARRITO REAL Y useMemo
  const totalCarrito = useMemo(() => {
    if (!cart) return 0;
    // La lógica de envío se puede agregar aquí o en el componente StepPago
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return envio ? subtotal + 2000 : subtotal; // Asumiendo un costo de envío fijo
  }, [cart, envio]);

  // ✅ 4. SIMPLIFICAR handlePagar PARA USAR LA FUNCIÓN checkout()
  const handlePagar = async (e) => {
    e.preventDefault();
    if (!cart || cart.length === 0) {
        setError("Tu carrito está vacío.");
        return;
    }
    
    setLoading(true);
    setError("");

    // La función checkout() del AuthProvider hace todo el trabajo:
    // - Crea la orden
    // - Descuenta el stock
    // - Limpia el carrito
    // - Devuelve la orden creada
    const ordenConfirmada = checkout(); 

    // Simulamos una pequeña espera para la "pasarela de pago"
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLoading(false);

    if (ordenConfirmada) {
      // Redirigimos a una página de confirmación con los datos de la orden
      navigate(`/mis-pedidos/${ordenConfirmada.id}`, { state: { orden: ordenConfirmada } });
    } else {
      setError("Hubo un error al procesar tu pedido.");
    }
  };

  // El resto de las funciones (handleSeleccionMetodo, etc.) se mantienen igual si son necesarias.

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-green-700 tracking-tight">
        Finalizar compra
      </h2>
      <AnimatePresence mode="wait">
        {step === 1 && (
            <StepEntrega
                key="step-entrega"
                // ... props para StepEntrega
            />
        )}
        {step === 2 && (
          <StepPago
            key="step-pago"
            // ✅ 5. PASAR EL CARRITO REAL Y LA FUNCIÓN DE PAGO ACTUALIZADA
            cart={cart} // Se pasa el carrito del contexto
            totalCarrito={totalCarrito} // Se pasa el total ya calculado
            handlePagar={handlePagar} // Se pasa la nueva función de pago
            
            // --- El resto de props se mantienen ---
            envio={envio}
            direcciones={direcciones}
            direccionId={direccionId}
            setDireccionId={setDireccionId}
            card={card}
            setCard={setCard}
            loading={loading}
            error={error}
            setStep={setStep}
          />
        )}
      </AnimatePresence>
    </div>
  );
}