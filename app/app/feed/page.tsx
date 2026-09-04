// FEED — protagonista: productos ya autorizados para la cuenta, encontrados sin
// que el usuario busque nada (el valor pasivo del "feed diario" prometido en la
// landing y el onboarding). Datos semilla realistas — 5 productos, nunca vacío.

import { Check, TrendingUp } from 'lucide-react';

const PRODUCTOS = [
  { nombre: 'Organizador de escritorio de bambú', asin: 'B09F2K3LQ2', ganancia: '+$6.10', roi: '28%', velocidad: 'Media' },
  { nombre: 'Auriculares Bluetooth deportivos', ganancia: '+$9.30', asin: 'B0BXW4T1YZ', roi: '31%', velocidad: 'Rápida' },
  { nombre: 'Lámpara LED de escritorio regulable', asin: 'B07QJ8K9MN', ganancia: '+$7.85', roi: '26%', velocidad: 'Rápida' },
  { nombre: 'Funda para laptop 14 pulgadas', asin: 'B08T6XW3RF', ganancia: '+$5.40', roi: '22%', velocidad: 'Media' },
  { nombre: 'Set de brochas de maquillaje (12 pzs)', asin: 'B09KX7L2QW', ganancia: '+$4.95', roi: '24%', velocidad: 'Media' },
];

export default function Feed() {
  return (
    <div className="mx-auto w-full max-w-[480px] px-5 pb-8 pt-6">
      <h1 className="text-[22px] font-bold [font-family:var(--font-body)]">Feed diario</h1>
      <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
        Productos ya autorizados para tu cuenta hoy — no tienes que buscarlos.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {PRODUCTOS.map((p) => (
          <div
            key={p.asin}
            className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold leading-snug">{p.nombre}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] tabular-nums">ASIN {p.asin}</p>
              </div>
              <span
                className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
              >
                <Check size={11} strokeWidth={3} /> OK
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[19px] font-bold tabular-nums [font-family:var(--font-display)]" style={{ color: 'var(--success)' }}>
                {p.ganancia}
              </span>
              <div className="flex items-center gap-3 text-[11.5px] text-[var(--text-tertiary)]">
                <span>ROI {p.roi}</span>
                <span className="flex items-center gap-1">
                  <TrendingUp size={12} /> {p.velocidad}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
