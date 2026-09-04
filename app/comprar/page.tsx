'use client';

// PUENTE DE CHECKOUT — "Confirmando tu compra" (02C-PRICING-Y-MODELO-DE-NEGOCIO.md → "EL PUENTE
// DE CHECKOUT"). El usuario sale de la app a pagar en Hotmart y VUELVE aquí — esta pantalla nunca
// lo deja perdido: confirma con una animación honesta (nunca "activo al instante": el webhook
// puede tardar) y si tarda demasiado, ofrece el reclamo "Ya pagué y no se activa".
//
// HOY (pre-Sesión 6, sin Hotmart/Supabase reales todavía): no hay webhook real que consultar, así
// que esta pantalla corre en un MODO DEMO — simula la confirmación con un timer corto en vez de
// hacer polling real contra el perfil del usuario. El estado 'confirmando'/'exito'/'fallback' y
// sus transiciones YA quedan completos: conectar el webhook real en la Sesión 6 es reemplazar el
// timer por polling real (ver TODO abajo), sin rediseñar la pantalla.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Mail } from 'lucide-react';
import { LogoMark } from '@/components/landing/Logo';

type Estado = 'confirmando' | 'exito' | 'fallback';

export default function Comprar() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [estado, setEstado] = useState<Estado>('confirmando');

  useEffect(() => {
    // TODO (Sesión 6): reemplazar por polling real cada 2-3s contra el perfil
    // (status 'trialing'/'active' que el webhook de Hotmart activa) durante 60-90s
    // antes de caer a 'fallback'. Hoy: demo cronometrado, mismo resultado visual.
    const t = setTimeout(() => setEstado((prev) => (prev === 'confirmando' ? 'exito' : prev)), reduce ? 400 : 3200);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-5 text-center text-[var(--text-primary)] [font-family:var(--font-body)]">
      <a href="/" className="mb-10 flex items-center gap-2 text-[14px] font-semibold">
        <LogoMark size={26} />
        Leval Ungate
      </a>

      {estado === 'confirmando' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <div className="relative mb-6 size-16">
            <svg viewBox="0 0 100 100" className="size-16 animate-spin" style={{ animationDuration: '1.1s' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="9" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * 0.72}
              />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold [font-family:var(--font-display)]">Confirmando tu compra…</h1>
          <p className="mt-2 max-w-[300px] text-[14px] text-[var(--text-secondary)]">
            Puede tardar unos segundos. No cierres esta pantalla.
          </p>
          <button
            type="button"
            onClick={() => setEstado('fallback')}
            className="mt-8 min-h-11 text-[13px] font-medium text-[var(--text-tertiary)] underline underline-offset-4 [touch-action:manipulation]"
          >
            ¿Está tardando mucho?
          </button>
        </motion.div>
      )}

      {estado === 'exito' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <span
            className="mb-5 flex size-16 items-center justify-center rounded-full"
            style={{ background: 'var(--success-bg)' }}
          >
            <Check size={30} strokeWidth={3} color="var(--success)" />
          </span>
          <h1 className="text-[24px] font-bold [font-family:var(--font-display)]">¡Listo! Tu cuenta está activa</h1>
          <p className="mt-2 max-w-[320px] text-[14px] text-[var(--text-secondary)]">
            Ahora entra con el correo con el que compraste para ver tu Sello de Cuenta.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="mt-8 flex h-14 w-full max-w-[300px] items-center justify-center rounded-[var(--radius-button)] text-[16px] font-semibold [touch-action:manipulation]"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            Entrar a mi cuenta
          </button>
        </motion.div>
      )}

      {estado === 'fallback' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <span
            className="mb-5 flex size-16 items-center justify-center rounded-full"
            style={{ background: 'var(--chip-bg)' }}
          >
            <Mail size={26} color="var(--accent)" />
          </span>
          <h1 className="text-[22px] font-bold [font-family:var(--font-display)]">
            El pago puede tardar unos minutos
          </h1>
          <p className="mt-2 max-w-[320px] text-[14px] text-[var(--text-secondary)]">
            En cuanto se confirme, te avisamos por correo. Si ya pagaste y no ves el acceso, dinos y
            lo revisamos.
          </p>
          <button
            type="button"
            className="mt-8 flex h-14 w-full max-w-[300px] items-center justify-center rounded-[var(--radius-button)] text-[15px] font-semibold [touch-action:manipulation]"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            Ya pagué y no se activa
          </button>
          <a href="/login" className="mt-4 min-h-11 text-[13px] font-medium text-[var(--text-tertiary)] underline underline-offset-4">
            Ya tengo acceso, entrar
          </a>
        </motion.div>
      )}
    </div>
  );
}
