// src/components/Carousel.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG = "https://cdn-icons-png.flaticon.com/512/1046/1046857.png";

export default function Carousel({ items = [] }) { // Acepta 'items' como prop
  const [idx, setIdx] = useState(0);
  const [imgSrc, setImgSrc] = useState(null);

  // Ya no se definen los banners aquí, se reciben de HomePage.jsx

  // Actualiza la imagen cuando cambia el índice o los items
  useEffect(() => {
    if (items.length > 0) {
      setImgSrc(items[idx]?.img || FALLBACK_IMG);
    }
  }, [idx, items]);

  const next = () => {
    if (items.length > 0) {
      setIdx((currentIdx) => (currentIdx + 1) % items.length);
    }
  };

  const prev = () => {
    if (items.length > 0) {
      setIdx((currentIdx) => (currentIdx - 1 + items.length) % items.length);
    }
  };

  // Rotación automática
  useEffect(() => {
    if (items.length < 2) return; // No rotar si hay 0 o 1 item
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [items, idx]); // Se reinicia si cambia el índice o los items

  if (items.length === 0) {
    return null; // No renderizar nada si no hay banners
  }

  const { title, desc, cta, to } = items[idx] || {};

  return (
    <div className="w-full max-w-[1400px] px-2 sm:px-6 mx-auto">
        <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg mb-10">
            <img
                src={imgSrc}
                alt={title || ""}
                onError={() => setImgSrc(FALLBACK_IMG)}
                className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />

            <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full w-9 h-9 flex items-center justify-center shadow transition z-20"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
                aria-label="Anterior"
            >
                <span className="text-2xl">&#8592;</span>
            </button>
            <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full w-9 h-9 flex items-center justify-center shadow transition z-20"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
                aria-label="Siguiente"
            >
                <span className="text-2xl">&#8594;</span>
            </button>

            <div className="relative z-10 flex flex-col justify-center h-full pl-6 sm:pl-16 text-white max-w-[600px]">
                {title && <h2 className="text-2xl sm:text-4xl font-bold mb-2 drop-shadow">{title}</h2>}
                {desc && <p className="mb-4 text-base sm:text-lg">{desc}</p>}
                {to && cta && (
                <Link
                    to={to}
                    className="inline-block font-semibold px-6 py-3 rounded-lg shadow-lg bg-white/90 text-primary border-2 border-primary hover:bg-primary hover:text-white hover:border-white transition text-lg"
                    style={{
                        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                    }}
                >
                    {cta}
                </Link>
                )}
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {items.map((_, i) => (
                <span
                    key={i}
                    className={`block w-3 h-3 rounded-full cursor-pointer ${
                    i === idx ? "bg-accent" : "bg-white/60"
                    }`}
                    onClick={() => setIdx(i)}
                    aria-label={`Ir al slide ${i + 1}`}
                ></span>
                ))}
            </div>
        </div>
    </div>
  );
}