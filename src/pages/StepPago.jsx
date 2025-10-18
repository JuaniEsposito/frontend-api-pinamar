// StepPago.jsx

import { motion } from "framer-motion";
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Costo de Envío Fijo (ajustar si es variable)
const COSTO_ENVIO = 2000.00;

export default function StepPago({
    envio,
    direcciones,
    direccionId,
    setDireccionId,
    cart, // RECIBE EL CARRITO REAL
    card,
    setCard,
    calcularTotal,
    handlePagar,
    loading,
    error,
    setStep, // Mantener si StepPago es parte de un flujo multipaso
}) {
    const navigate = useNavigate();

    // --- LÓGICA DE ESTADO ---
    const [fieldErrors, setFieldErrors] = useState({});
    const [cuponInput, setCuponInput] = useState("");
    const [cuponAplicado, setCuponAplicado] = useState(false);
    const [cuponMsg, setCuponMsg] = useState({ text: "", type: "" });
    const [focus, setFocus] = useState('');

    // --- LÓGICA DE VALIDACIÓN (Usando card.cvc y errors.cvc) ---
    const validateCard = () => {
        const errors = {};
        const number = card.number.replace(/\s/g, "");
        if (!/^\d{16}$/.test(number)) errors.number = "El número debe tener 16 dígitos.";
        if (!card.name.trim() || !/^[a-zA-Z\s]+$/.test(card.name.trim())) errors.name = "Ingresá un nombre válido.";
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) errors.expiry = "El formato debe ser MM/AA.";
        else {
            const currentYearLastTwoDigits = new Date().getFullYear() % 100;
            const [expMonth, expYear] = card.expiry.split('/');
            if (parseInt(expYear, 10) < currentYearLastTwoDigits || (parseInt(expYear, 10) === currentYearLastTwoDigits && parseInt(expMonth, 10) < new Date().getMonth() + 1)) {
                errors.expiry = "La tarjeta está vencida.";
            }
        }
        // Usa card.cvc Y errors.cvc
        if (!/^\d{3,4}$/.test(card.cvc)) {
            errors.cvc = "Debe tener 3 o 4 dígitos."; // Usa errors.cvc
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // --- HANDLER DE INPUT (Usando cvc) ---
    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "number") {
            const digitsOnly = value.replace(/\D/g, "").substring(0, 16);
            setCard({ ...card, number: digitsOnly });
        } else if (name === "expiry") {
            let formattedValue = value.replace(/\D/g, "").substring(0, 4);
            if (formattedValue.length > 2) formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
            setCard({ ...card, expiry: formattedValue });
        // Usa 'cvc' para actualizar el estado
        } else if (name === "cvc") {
            setCard({ ...card, cvc: value.replace(/\D/g, "").substring(0, 4) });
        } else {
            setCard({ ...card, [name]: value });
        }
    };

    const handleInputFocus = (e) => {
        setFocus(e.target.name);
    };

    const handleAplicarCupon = () => {
        if (cuponInput.toLowerCase() === "descuento2025") {
            setCuponAplicado(true);
            setCuponMsg({ text: "¡Cupón del 10% aplicado!", type: 'success' });
        } else {
            setCuponAplicado(false);
            setCuponMsg({ text: "Cupón no válido.", type: 'error' });
        }
    };

    // --- CÁLCULO DE TOTALES ---
    const totalConEnvio = useMemo(() => (calcularTotal ? calcularTotal() : 0), [calcularTotal]);
    const totalOriginal = totalConEnvio - (envio ? COSTO_ENVIO : 0);
    const [descuento, setDescuento] = useState(0);
    const totalFinal = totalConEnvio - descuento;

    // --- HANDLER DE SUBMIT ---
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("StepPago: handleSubmit triggered.");

        setFieldErrors({}); // Limpia errores antes de validar

        const isValid = validateCard();
        console.log("StepPago: Card validation result:", isValid, fieldErrors);

        if (!isValid) {
             console.error("StepPago: Card validation failed.");
             return;
        }

        if (!cart || cart.length === 0) {
            console.warn("StepPago: Cart is empty, navigating back.");
            navigate("/carrito");
            return;
        }

        console.log("StepPago: Calling handlePagar from parent...");
        // Llama a la función del componente padre
        handlePagar(e, { totalFinal, totalOriginal, descuento });
    };

    // --- RENDERIZADO ---
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            {/* Mensaje de error general de checkout */}
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

            {/* DIRECCIÓN DE ENVÍO */}
            {envio && (
                <div className="mb-6">
                    <label className="font-semibold block mb-2 text-gray-800">Dirección de envío</label>
                    <select
                        className="w-full border rounded p-2 bg-white"
                        value={direccionId}
                        onChange={(e) => setDireccionId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Seleccioná una dirección</option>
                        {direcciones?.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.calle} {d.numero}, {d.localidad} ({d.codigoPostal})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* SECCIÓN DE PRODUCTOS (SIMPLIFICADA) */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Productos en tu compra</h3>
                <p className="text-gray-600">Total de artículos: <span className="font-semibold">{cart?.length || 0}</span></p>
            </div>

            {/* FORMULARIO DE PAGO */}
            <form className="mb-6" onSubmit={handleSubmit} autoComplete="off">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Detalles de la Tarjeta</h3>

                {/* VISUALIZADOR DE TARJETA */}
                <div className="mb-5 flex justify-center">
                    <Cards
                        number={card.number}
                        expiry={card.expiry}
                        cvc={card.cvc} // Usa cvc
                        name={card.name}
                        focused={focus}
                    />
                </div>

                {/* CAMPOS DE LA TARJETA */}
                <div className="flex flex-col gap-2 mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                    <input type="text" name="number" placeholder="1111 1111 1111 1111" value={card.number} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`border rounded p-2 ${fieldErrors.number ? "border-red-400" : ""}`} required disabled={loading} inputMode="numeric" />
                    {fieldErrors.number && <div className="text-xs text-red-600 mt-1">{fieldErrors.number}</div>}

                    <label className="text-sm font-medium text-gray-700 mb-1 mt-2">Nombre en la tarjeta</label>
                    <input type="text" name="name" placeholder="Ej: Juan Pérez" value={card.name} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`border rounded p-2 ${fieldErrors.name ? "border-red-400" : ""}`} required disabled={loading} />
                    {fieldErrors.name && <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div>}

                    <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                            <input type="text" name="expiry" placeholder="MM/AA" value={card.expiry} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`border rounded p-2 w-full ${fieldErrors.expiry ? "border-red-400" : ""}`} required disabled={loading} inputMode="numeric" />
                            {fieldErrors.expiry && <div className="text-xs text-red-600 mt-1">{fieldErrors.expiry}</div>}
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-1">CVC</label>
                            {/* Usa name="cvc" y value={card.cvc} */}
                            <input type="password" name="cvc" placeholder="Ej: 123" maxLength={4} value={card.cvc} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`border rounded p-2 w-full ${fieldErrors.cvc ? "border-red-400" : ""}`} required disabled={loading} inputMode="numeric" />
                            {fieldErrors.cvc && <div className="text-xs text-red-600 mt-1">{fieldErrors.cvc}</div>}
                        </div>
                    </div>
                </div>

                {/* CUPÓN DE DESCUENTO */}
                <div className="mt-6 mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">¿Tenés un cupón de descuento?</label>
                    <div className="flex gap-2">
                        <input type="text" value={cuponInput} onChange={(e) => setCuponInput(e.target.value)} className="border rounded p-2 flex-grow" disabled={cuponAplicado || loading} />
                        <button type="button" onClick={handleAplicarCupon} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50 transition" disabled={cuponAplicado || !cuponInput || loading}>Aplicar</button>
                    </div>
                    {cuponMsg.text && <p className={`text-sm mt-2 ${cuponMsg.type === 'success' ? 'text-green-600 font-semibold' : 'text-red-600'}`}>{cuponMsg.text}</p>}
                </div>

                {/* RESUMEN DE TOTALES */}
                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>${totalOriginal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-1">
                        <span>Costo de Envío:</span>
                        <span>${envio ? COSTO_ENVIO.toLocaleString("es-AR", { minimumFractionDigits: 2 }) : (0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {descuento > 0 && (
                        <div className="flex justify-between text-red-600 mb-1 font-semibold">
                            <span>Descuento Aplicado:</span>
                            <span>-${descuento.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    <div className="font-bold text-2xl text-green-700 flex justify-between pt-2 border-t">
                        <span>Total a Pagar:</span>
                        <span>${totalFinal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex justify-between items-center mt-6">
                    <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => navigate("/carrito")} disabled={loading}>Volver</button>
                    <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg transition disabled:opacity-60" disabled={loading || (envio && !direccionId)}>
                        {loading ? "Procesando..." : "Pagar"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}