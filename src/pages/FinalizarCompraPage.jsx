import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
//import { useAuth } from "../auth/AuthProvider";
import { fetchDirecciones } from "../redux/direccionesSlice";
import { checkoutThunk } from "../redux/cartSlice";
import StepPago from "./StepPago";

export default function FinalizarCompraPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // 🔑 OBTENER ESTADO DESDE REDUX
    const { items: cartItems, total: subtotalCarrito, checkoutStatus } = useSelector((state) => state.cart); 
    const { direcciones, loading: loadingDirecciones } = useSelector((state) => state.direcciones);
    const { usuario } = useSelector((state) => state.auth);

    const [direccionId, setDireccionId] = useState("");
    const [envio] = useState(true);
    const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
    // Usamos el estado de loading global del checkout
    const loading = checkoutStatus === 'loading'; 
    const [error, setError] = useState(""); // Errores específicos del formulario
    const [step, setStep] = useState(2);

    // 💡 Costo de Envío Fijo (ajustar si es variable)
    const COSTO_ENVIO = 2000.00; 

    useEffect(() => {
        if (usuario?.id) {
            dispatch(fetchDirecciones(usuario.id));
        }
    }, [dispatch, usuario]);

    useEffect(() => {
        if (direcciones.length > 0 && !direccionId) {
            setDireccionId(direcciones[0].id.toString());
        }
    }, [direcciones, direccionId]);

    // 🔑 CALCULAR EL TOTAL FINAL CON ENVÍO USANDO EL SUBTOTAL DE REDUX
    const calcularTotal = useCallback(() => {
        const subtotal = subtotalCarrito ?? 0;
        // Asume que el costo de envío es fijo
        return envio ? subtotal + COSTO_ENVIO : subtotal;
    }, [subtotalCarrito, envio]); // Depende del subtotal real del store

    const handlePagar = async (e, { totalFinal, totalOriginal, descuento }) => {
        e.preventDefault();
        //setLoading(true);
        setError("");

        const direccionSeleccionada = direcciones.find(d => d.id === parseInt(direccionId));

        if (envio && !direccionSeleccionada) {
            setError("Por favor, selecciona una dirección de envío.");
            //setLoading(false);
            return;
        }

        // 🔑 DISPATCH del Thunk de CHECKOUT
        const resultAction = await dispatch(checkoutThunk({
            direccionId: direccionSeleccionada.id, 
            totalFinal: totalFinal,
            totalOriginal: totalOriginal, // Subtotal
            descuento: descuento,
            items: cartItems.map(item => ({ // Enviamos los items del carrito
                 productoId: item.productoId,
                 cantidad: item.cantidad
            })),
            // ... otros datos del pago si son necesarios en la API (ej. tarjeta)
        }));

        //setLoading(false);
        
        // Manejo del resultado del Thunk
        if (checkoutThunk.fulfilled.match(resultAction)) {
            const ordenConfirmada = resultAction.payload;
            navigate(`/mis-pedidos/${ordenConfirmada.ordenId}`, { 
              state: { orden: 
                {
                  ...ordenConfirmada,
                  totalOriginal: totalOriginal, 
                  descuentoTotal: descuento,
                  metodoPago: "Tarjeta de Crédito",
                }
               } });
        } else {
             // El error está en el store de Redux (state.cart.error), pero lo actualizamos localmente si es necesario
             // Si el thunk devolvió un error específico (ej. stock), se lo pasamos al StepPago
            setError(resultAction.payload || "Ocurrió un error al procesar el pago.");
        }
    };

    // ... (El resto de las validaciones de usuario, loading, y direcciones) ...
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

    if (loadingDirecciones) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
                <p className="text-center text-gray-600">Cargando información...</p>
            </div>
        );
    }
    
    // Si el carrito está vacío, no debería llegar aquí, pero es buena práctica verificar
    if (!cartItems || cartItems.length === 0) {
        navigate("/carrito");
        return null;
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
                        // 🔑 Pasamos los items y el total calculado al StepPago
                        cart={cartItems} 
                        calcularTotal={calcularTotal}
                        handlePagar={handlePagar}
                        direcciones={direcciones}
                        direccionId={direccionId}
                        setDireccionId={setDireccionId}
                        card={card}
                        setCard={setCard}
                        loading={loading} // Usa el loading del checkout
                        error={error} 
                        setStep={setStep}
                        envio={envio}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}