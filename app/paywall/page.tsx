'use client';

// PAYWALL — Leval Ungate (50-DISENO-ONBOARDING-PAYWALL.md, bloque C1/C2)
// Modelo 1 (hard paywall, ESTADO.md): el CTA lleva directo al checkout (/comprar,
// placeholder hasta el link real de Hotmart en Sesión 6). Headline con la META real
// del usuario (el producto que escribió en el onboarding) — nunca "Elige tu plan".
// 7 preguntas del paywall (02B) respondidas: qué desbloqueo, por qué ahora, qué
// pierdo, qué gano, puedo cancelar, cuál plan, salida limpia.

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { X, Check, Lock, ShieldCheck, ScanLine, Calculator, Rss } from 'lucide-react';
import { Accent } from '@/components/landing/ui';
import { LogoMark } from '@/components/landing/Logo';

const BENEFICIOS = [
  { icon: ScanLine, texto: 'Sello de Cuenta ilimitado', resultado: 'en cualquier producto, sin límite de escaneos' },
  { icon: Calculator, texto: 'Calculadora de ganancia neta', resultado: 'sin gastos ocultos, tarifas ya descontadas' },
  { icon: Rss, texto: 'Feed diario de productos', resultado: 'ya autorizados para tu cuenta, sin buscar' },
];

function PaywallContent() {
  const router = useRouter();
  const params = useSearchParams();
  const producto = params.get('producto')?.trim() || 'este producto';
  const productoCorto = producto.length > 34 ? `${producto.slice(0, 34)}…` : producto;
  const [plan, setPlan] = useState<'anual' | 'mensual'>('anual');

  const precio = plan === 'anual' ? '$16.58' : '$24.00';

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="mx-auto w-full max-w-[480px] px-5 pb-10">
        {/* (1) Marca (52 §6: toda pantalla de venta lleva logo arriba) + Cierre visible desde el frame 1 */}
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-[14px] font-semibold">
            <LogoMark size={26} />
            Leval Ungate
          </a>
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            aria-label="Cerrar"
            className="flex size-11 items-center justify-center [touch-action:manipulation]"
          >
            <X size={22} color="var(--text-secondary)" />
          </button>
        </div>

        {/* (2) Headline con la META real (el producto que escribió) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-balance text-[26px] font-bold leading-[1.15] [font-family:var(--font-display)]">
            Tu Sello de Cuenta para <Accent>“{productoCorto}”</Accent> está listo
          </h1>
          <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
            Desbloquéalo para revisar productos ilimitados, sin gastos ocultos.
          </p>
        </motion.div>

        {/* (3) Value stack visual (52 §3: "muestra lo que se desbloquea", no solo texto) */}
        <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--surface)]">
          <p className="border-b border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            Esto se desbloquea hoy
          </p>
          <ul className="flex flex-col">
            {BENEFICIOS.map((b, i) => (
              <li
                key={b.texto}
                className={`flex items-center gap-3 px-5 py-3.5 ${i < BENEFICIOS.length - 1 ? 'border-b border-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)]' : ''}`}
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)]"
                  style={{ background: 'var(--chip-bg)' }}
                >
                  <b.icon size={18} color="var(--accent)" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-snug">{b.texto}</p>
                  <p className="text-[12px] text-[var(--text-tertiary)] leading-snug">{b.resultado}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* (4)+(5) Planes — anual recomendado y pre-seleccionado, mensual el ancla */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setPlan('anual')}
            className="relative w-full rounded-[var(--radius-card)] p-5 text-left [touch-action:manipulation]"
            style={{
              border: plan === 'anual' ? '2px solid var(--accent)' : '1px solid color-mix(in oklab, var(--text-tertiary) 25%, transparent)',
              background: plan === 'anual' ? 'color-mix(in oklab, var(--accent) 7%, transparent)' : 'var(--surface)',
            }}
          >
            <span className="absolute -top-3 left-4 rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-bold text-[var(--bg)]">
              MÁS POPULAR
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Anual</span>
              <span className="flex size-5 items-center justify-center rounded-full border-2" style={{ borderColor: plan === 'anual' ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                {plan === 'anual' && <span className="size-2.5 rounded-full bg-[var(--accent)]" />}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[26px] font-bold tabular-nums [font-family:var(--font-display)]">$16.58</span>
              <span className="text-[13px] text-[var(--text-secondary)]">/mes</span>
            </div>
            <p className="mt-0.5 text-[12.5px] text-[var(--text-secondary)]">
              Se cobra $199.00/año · 4 meses gratis
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPlan('mensual')}
            className="w-full rounded-[var(--radius-card)] p-5 text-left [touch-action:manipulation]"
            style={{
              border: plan === 'mensual' ? '2px solid var(--accent)' : '1px solid color-mix(in oklab, var(--text-tertiary) 25%, transparent)',
              background: plan === 'mensual' ? 'color-mix(in oklab, var(--accent) 7%, transparent)' : 'var(--surface)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Mensual</span>
              <span className="flex size-5 items-center justify-center rounded-full border-2" style={{ borderColor: plan === 'mensual' ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                {plan === 'mensual' && <span className="size-2.5 rounded-full bg-[var(--accent)]" />}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[26px] font-bold tabular-nums [font-family:var(--font-display)]">$24.00</span>
              <span className="text-[13px] text-[var(--text-secondary)]">/mes</span>
            </div>
          </button>
        </div>

        {/* (6) CTA héroe — 1ª persona, MISMO verbo del hero/landing */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/comprar')}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[16px] font-semibold text-[var(--bg)] shadow-[0_10px_28px_-8px_color-mix(in_oklab,var(--accent)_45%,transparent)] [touch-action:manipulation]"
        >
          Empezar mis 7 días gratis
        </motion.button>

        {/* (7) Reversibilidad + puente de confianza (C4bis) */}
        <p className="mt-3 text-center text-[13px] text-[var(--text-secondary)]">
          Cancela cuando quieras · precio de {plan === 'anual' ? 'Anual' : 'Mensual'} ({precio}/mes)
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          {['Hoy no pagas nada', 'Te avisamos 1 día antes del cobro', 'Cancela en 1 tap'].map((t) => (
            <div key={t} className="flex items-center gap-2 text-[12.5px] text-[var(--text-secondary)]">
              <Check size={13} color="var(--accent)" strokeWidth={3} />
              {t}
            </div>
          ))}
        </div>

        {/* (8) Salida limpia — sin confirmshaming */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="min-h-11 px-2 text-[14px] font-medium text-[var(--text-tertiary)] [touch-action:manipulation]"
          >
            Ahora no
          </button>
        </div>

        {/* (9) Trust row */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[12px] text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <Lock size={14} /> Pago seguro
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} /> Garantía Hotmart de 7 días
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Paywall() {
  return (
    <Suspense fallback={null}>
      <PaywallContent />
    </Suspense>
  );
}
