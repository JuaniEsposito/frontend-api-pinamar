// StepPago.jsx

import { motion } from "framer-motion";
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ✅ FIX: Uncomment or define COSTO_ENVIO if you use shipping costs
const COSTO_ENVIO = 2000.00;

export default function StepPago({
    envio,
    direcciones,
    direccionId,
    setDireccionId,
    cart,
    card,
    setCard,
    // calcularTotal is no longer needed if calculated locally
    handlePagar,
    loading,
    error,
    setStep,
}) {
    const navigate = useNavigate();
    const subtotalCarrito = useSelector((state) => state.cart.total) ?? 0;

    const [fieldErrors, setFieldErrors] = useState({});
    const [cuponInput, setCuponInput] = useState("");
    const [cuponAplicado, setCuponAplicado] = useState(false);
    const [cuponMsg, setCuponMsg] = useState({ text: "", type: "" });
    const [focus, setFocus] = useState('');
    const [descuento, setDescuento] = useState(0);

    // --- CÁLCULO DE TOTALES ---
    const totalOriginal = subtotalCarrito;
    // ✅ FIX: Correct syntax for adding shipping cost
    const totalConEnvio = useMemo(() => totalOriginal + (envio ? COSTO_ENVIO : 0), [totalOriginal, envio]);
    const totalFinal = totalConEnvio - descuento;

    // --- VALIDACIÓN Y HANDLERS ---
    const validateCard = () => {
        const errors = {};
        const number = card.number.replace(/\s/g, "");
        if (!/^\d{16}$/.test(number)) errors.number = "El número debe tener 16 dígitos.";
        if (!card.name.trim() || !/^[a-zA-Z\s]+$/.test(card.name.trim())) errors.name = "Ingresá un nombre válido.";
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) errors.expiry = "El formato debe ser MM/AA.";
        else {
            const currentYearLastTwoDigits = new Date().getFullYear() % 100;
            const [expMonth, expYear] = card.expiry.split('/');
            const currentMonth = new Date().getMonth() + 1;
            if (parseInt(expYear, 10) < currentYearLastTwoDigits || (parseInt(expYear, 10) === currentYearLastTwoDigits && parseInt(expMonth, 10) < currentMonth)) {
                errors.expiry = "La tarjeta está vencida.";
            }
        }
        // ✅ FIX: Check card.cvv (matches state) instead of card.cvc
        if (!/^\d{3,4}$/.test(card.cvv)) {
            errors.cvv = "Debe tener 3 o 4 dígitos."; // Store error under cvv
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "number") {
            const digitsOnly = value.replace(/\D/g, "").substring(0, 16);
            setCard({ ...card, number: digitsOnly });
        } else if (name === "expiry") {
            let formattedValue = value.replace(/\D/g, "").substring(0, 4);
            // ✅ FIX: Use backticks for template literal
            if (formattedValue.length > 2) formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
            setCard({ ...card, expiry: formattedValue });
        } else if (name === "cvv") { // ✅ FIX: Use 'cvv' to match state and validation
            setCard({ ...card, cvv: value.replace(/\D/g, "").substring(0, 4) });
        } else {
            setCard({ ...card, [name]: value });
        }
    };

    const handleInputFocus = (e) => { setFocus(e.target.name); };

    const handleAplicarCupon = () => {
        if (cuponInput.toLowerCase() === "123") {
            const calculatedDiscount = totalOriginal * 0.10;
            setDescuento(calculatedDiscount);
            setCuponAplicado(true);
            setCuponMsg({ text: "¡Cupón del 10% aplicado!", type: 'success' });
        } else {
            setDescuento(0);
            setCuponAplicado(false);
            setCuponMsg({ text: "Cupón no válido.", type: 'error' });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("StepPago: handleSubmit triggered.");
        setFieldErrors({});
        const isValid = validateCard();
        console.log("StepPago: Card validation result:", isValid, fieldErrors);
        if (!isValid) { console.error("StepPago: Card validation failed."); return; }
        if (!cart || cart.length === 0) { console.warn("StepPago: Cart is empty, navigating back."); navigate("/carrito"); return; }
        console.log("StepPago: Calling handlePagar from parent...");
        // Pass the calculated discount amount from state
        handlePagar(e, { totalFinal, totalOriginal, descuento });
    };

    // --- RENDERIZADO ---
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            {/* General checkout error message */}
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

            {/* Shipping Address */}
            {envio && (
                <div className="mb-6">
                    <label className="font-semibold block mb-2 text-gray-800">Dirección de envío</label>
                    <select
                        className="w-full border rounded p-2 bg-white shadow-sm focus:ring-green-500 focus:border-green-500"
                        value={direccionId}
                        onChange={(e) => setDireccionId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Seleccioná una dirección</option>
                        {direcciones?.map((d) => (
                            <option key={d.id} value={d.id.toString()}>
                                {d.calle} {d.numero}, {d.localidad} ({d.codigoPostal})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Product Summary */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Productos en tu compra</h3>
                <p className="text-gray-600">Total de artículos: <span className="font-semibold">{cart?.length || 0}</span></p>
            </div>

            {/* Payment Form */}
            <form className="mb-6" onSubmit={handleSubmit} autoComplete="off">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Detalles de la Tarjeta</h3>

                {/* Card Display */}
                <div className="mb-5 flex justify-center p-4 bg-gray-100 rounded-lg">
                    <Cards
                        number={card.number}
                        expiry={card.expiry}
                        cvc={card.cvv} // ✅ FIX: Use cvv from state
                        name={card.name}
                        focused={focus}
                    />
                </div>

                {/* Card Inputs */}
                <div className="flex flex-col gap-3 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                        <input type="text" name="number" placeholder="XXXX XXXX XXXX XXXX" value={card.number} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`w-full border rounded p-2 shadow-sm ${fieldErrors.number ? "border-red-400" : "border-gray-300"}`} required disabled={loading} inputMode="numeric" />
                        {fieldErrors.number && <div className="text-xs text-red-600 mt-1">{fieldErrors.number}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
                        <input type="text" name="name" placeholder="Ej: Juan Pérez" value={card.name} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`w-full border rounded p-2 shadow-sm ${fieldErrors.name ? "border-red-400" : "border-gray-300"}`} required disabled={loading} />
                        {fieldErrors.name && <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div>}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                            <input type="text" name="expiry" placeholder="MM/AA" value={card.expiry} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`w-full border rounded p-2 shadow-sm ${fieldErrors.expiry ? "border-red-400" : "border-gray-300"}`} required disabled={loading} inputMode="numeric" />
                            {fieldErrors.expiry && <div className="text-xs text-red-600 mt-1">{fieldErrors.expiry}</div>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label> {/* ✅ FIX: Label matches input name */}
                            <input type="password" name="cvv" placeholder="Ej: 123" maxLength={4} value={card.cvv} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`w-full border rounded p-2 shadow-sm ${fieldErrors.cvv ? "border-red-400" : "border-gray-300"}`} required disabled={loading} inputMode="numeric" /> {/* ✅ FIX: Name="cvv" */}
                            {fieldErrors.cvv && <div className="text-xs text-red-600 mt-1">{fieldErrors.cvv}</div>} {/* ✅ FIX: Check fieldErrors.cvv */}
                        </div>
                    </div>
                </div>

                {/* Discount Coupon */}
                <div className="mt-6 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">¿Tenés un cupón de descuento?</label>
                    <div className="flex gap-2">
                        <input type="text" value={cuponInput} onChange={(e) => setCuponInput(e.target.value)} className="border rounded p-2 flex-grow shadow-sm" disabled={cuponAplicado || loading} />
                        <button type="button" onClick={handleAplicarCupon} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50 transition shadow-sm" disabled={cuponAplicado || !cuponInput || loading}>Aplicar</button>
                    </div>
                    {cuponMsg.text && <p className={`text-sm mt-2 ${cuponMsg.type === 'success' ? 'text-green-600 font-semibold' : 'text-red-600'}`}>{cuponMsg.text}</p>}
                </div>

                {/* Totals Summary */}
                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Subtotal:</span>
                        <span>${totalOriginal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm mb-1">
                        <span>Costo de Envío:</span>
                        <span>${envio ? COSTO_ENVIO.toLocaleString("es-AR", { minimumFractionDigits: 2 }) : (0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {descuento > 0 && (
                        <div className="flex justify-between text-red-600 text-sm mb-1 font-semibold">
                            <span>Descuento Aplicado:</span>
                            <span>-${descuento.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    <div className="font-bold text-xl text-green-700 flex justify-between pt-2 border-t mt-2">
                        <span>Total a Pagar:</span>
                        <span>${totalFinal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8">
                    <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition" onClick={() => navigate("/carrito")} disabled={loading}>Volver</button>
                    <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading || (envio && !direccionId)}>
                        {loading ? "Procesando..." : "Pagar"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}